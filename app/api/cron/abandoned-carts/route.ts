// app/api/cron/abandoned-carts/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const ABANDONED_AFTER_HOURS = 2;
const GIVE_UP_AFTER_HOURS = 72; // don't email carts older than 3 days — likely dead/test data

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function GET(request: Request) {
  // ── Secure the cron endpoint ────────────────────────────
  // Vercel Cron sends this header automatically; this stops
  // randoms from hitting the route and spamming your customers.
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const abandonedCutoff = new Date(
    now - ABANDONED_AFTER_HOURS * 60 * 60 * 1000,
  );
  const giveUpCutoff = new Date(now - GIVE_UP_AFTER_HOURS * 60 * 60 * 1000);

  // Find carts that:
  // - have items
  // - haven't been touched in ABANDONED_AFTER_HOURS
  // - aren't older than GIVE_UP_AFTER_HOURS (avoid emailing ancient/dead carts)
  // - haven't already received a reminder
  const abandonedCarts = await prisma.cart.findMany({
    where: {
      updatedAt: { lte: abandonedCutoff, gte: giveUpCutoff },
      reminderSentAt: null,
      items: { some: {} },
    },
    include: {
      customer: { select: { email: true, name: true } },
      items: { include: { product: true } },
    },
  });

  let sent = 0;
  let skipped = 0;

  for (const cart of abandonedCarts) {
    // Skip empty product references (e.g. product was deleted)
    const validItems = cart.items.filter((item) => item.product);
    if (validItems.length === 0) {
      skipped++;
      continue;
    }

    const subtotal = validItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );

    const itemRows = validItems
      .map((item) => {
        const name = escapeHtml(item.product.name);
        const imageUrl = item.product.images[0] ?? '';
        return `
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
              <table>
                <tr>
                  ${
                    imageUrl
                      ? `<td style="padding-right: 12px;"><img src="${escapeHtml(imageUrl)}" width="56" height="56" style="border-radius: 8px; object-fit: cover;" /></td>`
                      : ''
                  }
                  <td>
                    <p style="margin: 0; font-weight: 600; color: #1e3a5f;">${name}</p>
                    <p style="margin: 4px 0 0; font-size: 13px; color: #888;">Qty: ${item.quantity} × ${formatPrice(item.product.price)}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `;
      })
      .join('');

    const customerName = cart.customer.name
      ? escapeHtml(cart.customer.name.split(' ')[0])
      : 'there';

    const storeUrl = process.env.NEXTAUTH_URL ?? 'https://example.com';

    try {
      await resend.emails.send({
        from: 'MyStore <onboarding@resend.dev>',
        to: cart.customer.email,
        subject: 'You left something in your cart',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e3a5f;">Hi ${customerName}, your cart is waiting</h2>
            <p style="color: #444; line-height: 1.6;">
              You left a few items in your cart. They're still here whenever you're ready to check out.
            </p>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              ${itemRows}
            </table>
            <p style="font-weight: 600; color: #1e3a5f;">
              Subtotal: ${formatPrice(subtotal)}
            </p>
            <a href="${storeUrl}/cart" style="display: inline-block; margin-top: 16px; padding: 12px 24px; background: #1e3a5f; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 600;">
              Return to cart
            </a>
            <hr style="margin: 24px 0; border: none; border-top: 1px solid #eee;" />
            <p style="font-size: 12px; color: #999;">
              If you've already checked out, you can ignore this email.
            </p>
          </div>
        `,
      });

      await prisma.cart.update({
        where: { id: cart.id },
        data: { reminderSentAt: new Date() },
      });

      sent++;
    } catch (error) {
      console.error(
        `Failed to send abandoned cart email for cart ${cart.id}:`,
        error,
      );
      skipped++;
    }
  }

  return NextResponse.json({
    checked: abandonedCarts.length,
    sent,
    skipped,
  });
}
