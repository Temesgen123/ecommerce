'use server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function bulkPublish(ids: string[]): Promise<void> {
  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { published: true },
  });
  revalidatePath('/admin/products');
}

export async function bulkUnpublish(ids: string[]): Promise<void> {
  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { published: false },
  });
  revalidatePath('/admin/products');
}

export async function bulkDelete(ids: string[]): Promise<void> {
  await prisma.product.deleteMany({ where: { id: { in: ids } } });
  revalidatePath('/admin/products');
}

export async function bulkFeature(ids: string[]): Promise<void> {
  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { featured: true },
  });
  revalidatePath('/admin/products');
}

export async function bulkUnfeature(ids: string[]): Promise<void> {
  await prisma.product.updateMany({
    where: { id: { in: ids } },
    data: { featured: false },
  });
  revalidatePath('/admin/products');
}
