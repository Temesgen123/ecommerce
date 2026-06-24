'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { hash } from 'bcryptjs';
import { z } from 'zod';
import { sanitizedString } from '@/lib/sanitize';

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'ADMIN') {
    throw new Error('Unauthorized — admin account required.');
  }

  // Fresh DB check — same reasoning as requireDriver() in
  // app/actions/driver.ts. Closes the window where a demoted or
  // deleted admin could keep acting on a still-valid JWT.
  const freshUser = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { id: true, role: true },
  });

  if (!freshUser || freshUser.role !== 'ADMIN') {
    throw new Error('Unauthorized — admin account required.');
  }
}

export type DriverFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

const DriverSchema = z.object({
  name: sanitizedString({ min: 1, max: 64, message: 'Name is required' }),
  email: z
    .string()
    .email('Valid email required')
    .transform((v) => v.toLowerCase().trim()),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .optional()
    .or(z.literal('')),
});

// ─── Create ───────────────────────────────────────────────────
export async function createDriver(
  _prev: DriverFormState,
  formData: FormData,
): Promise<DriverFormState> {
  await requireAdmin();

  const parsed = DriverSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  if (!parsed.data.password) {
    return { errors: { password: ['Password is required for a new driver.'] } };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return {
      errors: { email: ['An account with this email already exists.'] },
    };
  }

  const hashedPassword = await hash(parsed.data.password, 12);

  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      password: hashedPassword,
      role: 'DRIVER',
    },
  });

  revalidatePath('/admin/drivers');
  return { message: 'ok' };
}

// ─── Update ───────────────────────────────────────────────────
export async function updateDriver(
  id: string,
  _prev: DriverFormState,
  formData: FormData,
): Promise<DriverFormState> {
  await requireAdmin();

  const parsed = DriverSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findFirst({
    where: { email: parsed.data.email, NOT: { id } },
  });
  if (existing) {
    return {
      errors: { email: ['This email is already used by another account.'] },
    };
  }

  const data: { name: string; email: string; password?: string } = {
    name: parsed.data.name,
    email: parsed.data.email,
  };

  if (parsed.data.password) {
    data.password = await hash(parsed.data.password, 12);
  }

  await prisma.user.update({ where: { id }, data });

  revalidatePath('/admin/drivers');
  return { message: 'ok' };
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteDriver(id: string): Promise<void> {
  await requireAdmin();
  await prisma.user.delete({ where: { id } });
  revalidatePath('/admin/drivers');
}

// ─── Shipping assignment helpers ───────────────────────────────
export async function getAllDrivers() {
  await requireAdmin();
  return prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  });
}
