import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'customer_session';
const SESSION_DAYS   = 30;

export async function getCustomer() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.customerSession.findUnique({
    where: { token },
    include: { customer: true },
  });
  if (!session || session.expiresAt < new Date()) return null;
  return session.customer;
}

export async function createCustomerSession(customerId: string) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);
  const session = await prisma.customerSession.create({
    data: { customerId, expiresAt },
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, session.token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires:  expiresAt,
    path:     '/',
  });
}

export async function deleteCustomerSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.customerSession.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE);
  }
}