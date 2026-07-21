'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hash, compare } from 'bcryptjs';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export type ResetFormState = {
  message?: string;
  success?: boolean;
  errors?: Record<string, string[]>;
};

// ─── Step 1: Request reset link ───────────────────────────────
export async function requestPasswordReset(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();

  if (!email || !z.string().email().safeParse(email).success) {
    return { errors: { email: ['Please enter a valid email address.'] } };
  }

  const customer = await prisma.customer.findUnique({ where: { email } });

  // Always return success — don't reveal whether email exists
  if (!customer) {
    return { success: true };
  }

  // Invalidate any existing unused tokens for this customer
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

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev',
    to:
      process.env.NODE_ENV === 'production'
        ? email
        : process.env.EMAIL_TEST_ADDRESS!,
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

  return { success: true };
}

// ─── Step 2: Set new password ──────────────────────────────────
export async function resetPassword(
  _prev: ResetFormState,
  formData: FormData,
): Promise<ResetFormState> {
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
    include: { customer: true },
  });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return {
      message:
        'This reset link is invalid or has expired. Please request a new one.',
    };
  }

  const hashed = await hash(password, 12);

  await prisma.$transaction([
    prisma.customer.update({
      where: { id: record.customerId },
      data: { password: hashed },
    }),
    prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    }),
    // Invalidate all sessions so old password can't be reused
    prisma.customerSession.deleteMany({
      where: { customerId: record.customerId },
    }),
  ]);

  return { success: true };
}
