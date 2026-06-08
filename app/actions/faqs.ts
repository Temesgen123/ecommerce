'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getFaqs() {
  return prisma.faq.findMany({
    where: { published: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function getAllFaqs() {
  return prisma.faq.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
}

export async function createFaq(data: {
  question: string;
  answer: string;
  category?: string;
  order?: number;
  published?: boolean;
}) {
  await prisma.faq.create({ data });
  revalidatePath('/faqs');
  revalidatePath('/admin/faqs');
}

export async function updateFaq(
  id: string,
  data: {
    question?: string;
    answer?: string;
    category?: string;
    order?: number;
    published?: boolean;
  },
) {
  await prisma.faq.update({ where: { id }, data });
  revalidatePath('/faqs');
  revalidatePath('/admin/faqs');
}

export async function deleteFaq(id: string) {
  await prisma.faq.delete({ where: { id } });
  revalidatePath('/faqs');
  revalidatePath('/admin/faqs');
}
