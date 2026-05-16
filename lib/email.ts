// ============================================================
// lib/email.ts
// ============================================================
// Sends order confirmation emails via Resend.
//
// WITHOUT A DOMAIN (local dev):
//   - FROM: onboarding@resend.dev  (Resend's shared domain)
//   - TO:   your verified Resend account email only
//   Set EMAIL_TEST_ADDRESS=your@email.com in .env
//
// WITH A DOMAIN (production):
//   - FROM: orders@yourdomain.com
//   - TO:   customer's actual email
//   Set EMAIL_FROM_DOMAIN=yourdomain.com in .env
// ============================================================

import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  console.warn('⚠️  RESEND_API_KEY is not set — emails will not be sent.');
}

export const resend = new Resend(process.env.RESEND_API_KEY ?? '');

// ─── Types ────────────────────────────────────────────────────
export interface OrderEmailData {
  orderId: string;
  customerEmail: string;
  customerName: string | null;
  items: {
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  } | null;
}

// ─── Helpers ──────────────────────────────────────────────────
function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

function getFromAddress(): string {
  // Use custom domain in production, Resend's shared domain locally
  if (process.env.EMAIL_FROM_DOMAIN) {
    return `MyStore <orders@${process.env.EMAIL_FROM_DOMAIN}>`;
  }
  return 'MyStore <onboarding@resend.dev>';
}

function getToAddress(customerEmail: string): string {
  // Without a domain, Resend only allows sending to your own verified email.
  // Set EMAIL_TEST_ADDRESS in .env to redirect all emails there during dev.
  if (process.env.EMAIL_TEST_ADDRESS) {
    console.log(
      `📧 Dev mode: redirecting email from ${customerEmail} to ${process.env.EMAIL_TEST_ADDRESS}`,
    );
    return process.env.EMAIL_TEST_ADDRESS;
  }
  return customerEmail;
}

// ─── Email HTML template ──────────────────────────────────────
function buildOrderEmailHtml(data: OrderEmailData): string {
  const {
    orderId,
    customerName,
    items,
    subtotal,
    shippingCost,
    tax,
    total,
    shippingAddress,
  } = data;

  const greeting = customerName ? `Hi ${customerName},` : 'Hi there,';
  const orderRef = orderId.slice(0, 8).toUpperCase();

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#374151;">
          ${item.productName}
          <span style="color:#9CA3AF;font-size:12px;"> × ${item.quantity}</span>
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #E2E8F0;font-size:14px;color:#374151;text-align:right;">
          ${formatPrice(item.total)}
        </td>
      </tr>`,
    )
    .join('');

  const addressHtml = shippingAddress
    ? `
      <div style="margin-top:0;padding:16px;background:#F8FAFC;border-radius:8px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">
          Shipping Address
        </p>
        <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;">
          ${shippingAddress.line1}${shippingAddress.line2 ? '<br>' + shippingAddress.line2 : ''}<br>
          ${[shippingAddress.city, shippingAddress.state, shippingAddress.postal_code].filter(Boolean).join(', ')}<br>
          ${shippingAddress.country}
        </p>
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Order Confirmation #${orderRef}</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F1F5F9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="background:#1E3A5F;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:24px;font-weight:800;color:#FFFFFF;">
                My<span style="color:#F97316;">Store</span>
              </p>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding:40px 40px 24px;text-align:center;">
              <div style="display:inline-block;background:#DCFCE7;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:28px;margin-bottom:16px;">✓</div>
              <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;color:#0F172A;">Order Confirmed!</h1>
              <p style="margin:0;font-size:15px;color:#64748B;">${greeting} Thank you for your order.</p>
            </td>
          </tr>

          <!-- Order ref -->
          <tr>
            <td style="padding:0 40px 24px;">
              <div style="background:#EEF5FC;border-radius:8px;padding:12px 16px;text-align:center;">
                <p style="margin:0;font-size:12px;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">Order Reference</p>
                <p style="margin:4px 0 0;font-size:20px;font-weight:700;color:#1E3A5F;font-family:monospace;">#${orderRef}</p>
              </div>
            </td>
          </tr>

          <!-- Items -->
          <tr>
            <td style="padding:0 40px 24px;">
              <p style="margin:0 0 12px;font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.05em;">Items Ordered</p>
              <table width="100%" cellpadding="0" cellspacing="0">${itemRows}</table>
            </td>
          </tr>

          <!-- Totals -->
          <tr>
            <td style="padding:0 40px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;border-radius:8px;">
                <tr>
                  <td style="padding:8px 16px;font-size:14px;color:#64748B;">Subtotal</td>
                  <td style="padding:8px 16px;font-size:14px;color:#374151;text-align:right;">${formatPrice(subtotal)}</td>
                </tr>
                <tr>
                  <td style="padding:4px 16px;font-size:14px;color:#64748B;">Shipping</td>
                  <td style="padding:4px 16px;font-size:14px;text-align:right;${shippingCost === 0 ? 'color:#15803D;font-weight:600;' : 'color:#374151;'}">
                    ${shippingCost === 0 ? 'Free' : formatPrice(shippingCost)}
                  </td>
                </tr>
                ${
                  tax > 0
                    ? `
                <tr>
                  <td style="padding:4px 16px;font-size:14px;color:#64748B;">Tax</td>
                  <td style="padding:4px 16px;font-size:14px;color:#374151;text-align:right;">${formatPrice(tax)}</td>
                </tr>`
                    : ''
                }
                <tr>
                  <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#0F172A;border-top:2px solid #E2E8F0;">Total</td>
                  <td style="padding:12px 16px;font-size:15px;font-weight:700;color:#F97316;text-align:right;border-top:2px solid #E2E8F0;">${formatPrice(total)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Address -->
          ${addressHtml ? `<tr><td style="padding:0 40px 24px;">${addressHtml}</td></tr>` : ''}

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 40px;text-align:center;">
              <p style="margin:0 0 20px;font-size:14px;color:#64748B;">We'll notify you once your order ships.</p>
              <a href="${process.env.NEXTAUTH_URL ?? 'http://localhost:3000'}/products"
                style="display:inline-block;background:#1E3A5F;color:#FFFFFF;padding:14px 32px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
                Continue Shopping
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;padding:24px 40px;text-align:center;border-top:1px solid #E2E8F0;">
              <p style="margin:0;font-size:12px;color:#9CA3AF;">© ${new Date().getFullYear()} MyStore. All rights reserved.</p>
              <p style="margin:6px 0 0;font-size:12px;color:#9CA3AF;">Questions? Reply to this email and we'll help you out.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send function ────────────────────────────────────────────
export async function sendOrderConfirmationEmail(
  data: OrderEmailData,
): Promise<void> {
  if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️  Skipping email — RESEND_API_KEY not set.');
    return;
  }

  const orderRef = data.orderId.slice(0, 8).toUpperCase();
  //   const to = getToAddress(data.customerEmail);
  const to = getToAddress('birechis@gmail.com');
  const from = getFromAddress();

  try {
    const { data: result, error } = await resend.emails.send({
      from,
      to,
      subject: `Order confirmed #${orderRef} — MyStore`,
      html: buildOrderEmailHtml(data),
    });

    if (error) {
      console.error('❌ Resend error:', error);
    } else {
      console.log(`✅ Order confirmation sent → ${to} (id: ${result?.id})`);
    }
  } catch (err) {
    // Never let email failure break the webhook
    console.error('❌ Failed to send email:', err);
  }
}
