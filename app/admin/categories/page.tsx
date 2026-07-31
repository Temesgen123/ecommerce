import { prisma } from '@/lib/prisma';
import CategoriesClient from '@/components/admin/CategoriesClient';

export const metadata = { title: 'Categories — Admin' };

export default async function CategoriesPage() {
  /**
   * Fetch only TOP-LEVEL categories (parentId: null) and nest their children
   * one level deep. We don't need grandchildren — the UI supports one level
   * of subcategories (e.g. Shoes → Men / Women / Kids).
   */
  const categories = await prisma.category.findMany({
    where: { parentId: null }, // only root categories
    include: {
      _count: { select: { products: true } },
      children: {
        // subcategories
        include: {
          _count: { select: { products: true } },
          children: {
            // safety: include grandchildren so
            include: {
              // we can warn if they exist, though
              _count: { select: { products: true } }, // the UI only shows 1 level
            },
          },
        },
        orderBy: { name: 'asc' },
      },
    },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="p-6">
      <CategoriesClient categories={categories} />
    </div>
  );
}
