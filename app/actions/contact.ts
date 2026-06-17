'use server';

import { Resend } from 'resend';
import { headers } from 'next/headers';
import { z } from 'zod';
import { contactLimiter } from '@/lib/ratelimit';

const resend = new Resend(process.env.RESEND_API_KEY);

const ContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Please enter a valid email address.'),
  message: z.string().min(1, 'Message is required').max(5000),
});

/**
 * Escapes HTML special characters so user input can never break out
 * of the surrounding markup or inject tags/scripts/attributes.
 */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwarded?.split(',')[0].trim() ?? realIp ?? '127.0.0.1';
}

export async function sendContactEmail(formData: {
  name: string;
  email: string;
  message: string;
}) {
  // ── Rate limit check ────────────────────────────────────
  try {
    const ip = await getClientIP();
    const { success } = await contactLimiter.limit(ip);
    if (!success) {
      return {
        success: false,
        error: 'Too many messages sent. Please try again in an hour.',
      };
    }
  } catch (error) {
    // Redis down — fail open so the contact form still works
    console.error('Rate limit check failed:', error);
  }
  // ─────────────────────────────────────────────────────────

  // ── Validate ─────────────────────────────────────────────
  const parsed = ContactSchema.safeParse(formData);
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Invalid input.';
    return { success: false, error: firstError };
  }

  const { name, email, message } = parsed.data;

  // ── Escape for safe HTML rendering ──────────────────────
  // Critical: without this, a message containing HTML/script tags
  // would render live in the email client.
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

  try {
    await resend.emails.send({
      from: 'MyStore Contact <onboarding@resend.dev>',
      to: process.env.STORE_OWNER_EMAIL!,
      replyTo: email, // raw email is fine here — this is a header field, not HTML
      subject: `New Contact Message from ${safeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1e3a5f;">New Contact Form Submission</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 80px;">Name:</td>
              <td style="padding: 8px 0;">${safeName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;">
                <a href="mailto:${safeEmail}" style="color: #f97316;">${safeEmail}</a>
              </td>
            </tr>
          </table>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <h3 style="color: #1e3a5f;">Message:</h3>
          <p style="line-height: 1.6; color: #444;">${safeMessage}</p>
          <hr style="margin: 16px 0; border: none; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">
            Sent from MyStore contact form. Reply directly to this email to respond to ${safeName}.
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Contact email error:', error);
    return {
      success: false,
      error: 'Failed to send message. Please try again.',
    };
  }
}
