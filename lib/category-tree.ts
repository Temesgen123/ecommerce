// lib/category-tree.ts
// Plain server-side data helper — NOT a 'use server' action file.
// Import this in server components and layouts to get the category tree.

import { prisma } from '@/lib/prisma';

export interface SubCategory {
  id: string;
  name: string;
  slug: string;
}

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  children: SubCategory[];
}

/**
 * Returns top-level categories with their children nested inside.
 * Used by the store layout to feed CategoryNavBar.
 *
 * Example result:
 * [
 *   { id: '...', name: 'Shoes', slug: 'shoes', children: [
 *       { id: '...', name: 'Men',   slug: 'shoes-men' },
 *       { id: '...', name: 'Women', slug: 'shoes-women' },
 *       { id: '...', name: 'Kids',  slug: 'shoes-kids' },
 *   ]},
 *   { id: '...', name: 'Clothes', slug: 'clothes', children: [] },
 * ]
 */
export async function getCategoryTree(): Promise<NavCategory[]> {
  const rows = await prisma.category.findMany({
    where: { parentId: null }, // top-level only
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      slug: true,
      children: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return rows;
}
