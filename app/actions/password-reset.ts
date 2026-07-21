'use server';

import { z } from 'zod';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcryptjs';
import { Resend } from 'resend';
import { authLimiter } from '@/lib/ratelimit';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ResetFormState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
};

async function getClientIP(): Promise<string> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  return forwarded?.split(',')[0].trim() ?? realIp ?? '127.0.0.1';
}

// ─── Step 1: Request reset link ───────────────────────────────
export async function requestPasswordReset(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  // ── Rate limit by IP ──────────────────────────────────────
  try {
    const ip = await getClientIP();
    const { success } = await authLimiter.limit(ip);
    if (!success) {
      return {
        message: 'Too many attempts. Please wait 15 minutes and try again.',
      };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
  }

  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email || !z.string().email().safeParse(email).success) {
    return { errors: { email: ['Please enter a valid email address.'] } };
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  // Always return success — don't reveal whether email exists
  if (!customer) {
    return { success: true };
  }

  // ── Per-email cooldown (2 minutes) ────────────────────────
  const recentToken = await prisma.passwordResetToken.findFirst({
    where: {
      customerId: customer.id,
      createdAt: { gt: new Date(Date.now() - 1000 * 60 * 2) },
    },
  });

  if (recentToken) {
    // Silent success — don't reveal cooldown to potential attacker
    return { success: true };
  }

  // Invalidate any existing unused tokens
  await prisma.passwordResetToken.deleteMany({
    where: { customerId: customer.id, usedAt: null },
  });

  const token = await prisma.passwordResetToken.create({
    data: {
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/account/reset-password?token=${token.token}`;
  const toEmail =
    process.env.NODE_ENV === 'production'
      ? email
      : process.env.EMAIL_TEST_ADDRESS!;

  try {
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Reset your password',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;">
          <h2>Reset your password</h2>
          <p>We received a request to reset the password for your account.</p>
          <p>Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e3a5f;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <p style="color:#6b7280;font-size:12px;">Link: ${resetUrl}</p>
        </div>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return { message: `Email failed to send: ${error.message}` };
    }
  } catch (err) {
    console.error('Resend exception:', err);
    return { message: 'Failed to send reset email. Please try again.' };
  }

  return { success: true };
}

// ─── Step 2: Set new password ──────────────────────────────────
export async function resetPassword(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  // ── Rate limit by IP ──────────────────────────────────────
  try {
    const ip = await getClientIP();
    const { success } = await authLimiter.limit(ip);
    if (!success) {
      return {
        message: 'Too many attempts. Please wait 15 minutes and try again.',
      };
    }
  } catch (error) {
    console.error('Rate limit check failed:', error);
  }

  const token = (formData.get('token') as string)?.trim();
  const password = (formData.get('password') as string) ?? '';
  const confirm = (formData.get('confirm') as string) ?? '';

  if (!token) return { message: 'Invalid or missing reset token.' };

  if (password.length < 8) {
    return {
      errors: { password: ['Password must be at least 8 characters.'] },
    };
  }
  if (password !== confirm) {
    return { errors: { confirm: ['Passwords do not match.'] } };
  }

  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      message:
        'This reset link is invalid or has expired. Please request a new one.',
    };
  }

  const hashed = await hash(password, 12);

  await prisma.customer.update({
    where: { id: record.customerId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.update({
    where: { token },
    data: { usedAt: new Date() },
  });

  await prisma.customerSession.deleteMany({
    where: { customerId: record.customerId },
  });

  return { success: true };
}
