'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { hash, compare } from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createCustomerSession, deleteCustomerSession, getCustomer } from '@/lib/customer-auth';

export type AuthFormState = { errors?: Record<string, string[]>; message?: string; };

const RegisterSchema = z.object({
  name:     z.string().min(1, 'Name is required').max(64),
  email:    z.string().email('Valid email required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export async function registerCustomer(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = RegisterSchema.safeParse({ name: formData.get('name'), email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const existing = await prisma.customer.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (existing) return { errors: { email: ['An account with this email already exists.'] } };
  const hashedPassword = await hash(parsed.data.password, 12);
  const customer = await prisma.customer.create({ data: { name: parsed.data.name, email: parsed.data.email.toLowerCase(), password: hashedPassword } });
  await createCustomerSession(customer.id);
  redirect('/account');
}

const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

export async function loginCustomer(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const parsed = LoginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const customer = await prisma.customer.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  const passwordMatches = customer ? await compare(parsed.data.password, customer.password) : await compare(parsed.data.password, '$2a$12$placeholderHashForTiming');
  if (!customer || !passwordMatches) return { errors: { email: ['Invalid email or password.'] } };
  await createCustomerSession(customer.id);
  redirect('/account');
}

export async function logoutCustomer(): Promise<void> {
  await deleteCustomerSession();
  redirect('/');
}

export async function updateProfile(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const customer = await getCustomer();
  if (!customer) return { message: 'Not authenticated.' };
  const parsed = z.object({ name: z.string().min(1, 'Name is required').max(64), phone: z.string().max(20).optional() }).safeParse({ name: formData.get('name'), phone: formData.get('phone') || undefined });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  await prisma.customer.update({ where: { id: customer.id }, data: parsed.data });
  revalidatePath('/account');
  return { message: 'ok' };
}

export async function changePassword(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const customer = await getCustomer();
  if (!customer) return { message: 'Not authenticated.' };
  const parsed = z.object({ current: z.string().min(1), password: z.string().min(8, 'New password must be at least 8 characters'), confirm: z.string().min(1) }).refine((d) => d.password === d.confirm, { message: 'Passwords do not match.', path: ['confirm'] }).safeParse({ current: formData.get('current'), password: formData.get('password'), confirm: formData.get('confirm') });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const valid = await compare(parsed.data.current, customer.password);
  if (!valid) return { errors: { current: ['Current password is incorrect.'] } };
  const hashed = await hash(parsed.data.password, 12);
  await prisma.customer.update({ where: { id: customer.id }, data: { password: hashed } });
  return { message: 'ok' };
}

const AddressSchema = z.object({
  name: z.string().min(1, 'Full name is required'), line1: z.string().min(1, 'Address is required'), line2: z.string().optional(),
  city: z.string().min(1, 'City is required'), state: z.string().min(1, 'State is required'), postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'), isDefault: z.coerce.boolean().optional(),
});

export async function addAddress(_prev: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const customer = await getCustomer();
  if (!customer) return { message: 'Not authenticated.' };
  const parsed = AddressSchema.safeParse({ name: formData.get('name'), line1: formData.get('line1'), line2: formData.get('line2') || undefined, city: formData.get('city'), state: formData.get('state'), postalCode: formData.get('postalCode'), country: formData.get('country'), isDefault: formData.get('isDefault') === 'on' });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  if (parsed.data.isDefault) await prisma.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
  await prisma.customerAddress.create({ data: { customerId: customer.id, ...parsed.data } });
  revalidatePath('/account/addresses');
  return { message: 'ok' };
}

export async function deleteAddress(id: string): Promise<void> {
  const customer = await getCustomer();
  if (!customer) return;
  await prisma.customerAddress.deleteMany({ where: { id, customerId: customer.id } });
  revalidatePath('/account/addresses');
}

export async function setDefaultAddress(id: string): Promise<void> {
  const customer = await getCustomer();
  if (!customer) return;
  await prisma.customerAddress.updateMany({ where: { customerId: customer.id }, data: { isDefault: false } });
  await prisma.customerAddress.update({ where: { id }, data: { isDefault: true } });
  revalidatePath('/account/addresses');
}
