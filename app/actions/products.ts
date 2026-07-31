'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sanitizedString } from '@/lib/sanitize';

const ProductSchema = z.object({
  name: sanitizedString({ min: 1, max: 200, message: 'Name is required' }),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Slug must be lowercase with hyphens only',
    ),
  brand: sanitizedString({ min: 0, max: 100 }).optional(),
  description: sanitizedString({ min: 0, max: 5000 }).optional(),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  compareAt: z.coerce.number().min(0).optional().nullable(),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().optional().nullable(),
  published: z.coerce.boolean().optional(),
  featured: z.coerce.boolean().optional(),
});

export type ProductFormState = {
  errors?: Record<string, string[]>;
  message?: string;
};

function toCents(dollars: number) {
  return Math.round(dollars * 100);
}

function extractImages(formData: FormData): string[] {
  const images: string[] = [];
  let i = 0;
  while (formData.has(`images[${i}]`)) {
    const url = formData.get(`images[${i}]`) as string;
    if (url) images.push(url);
    i++;
  }
  return images;
}

// ─── Create ───────────────────────────────────────────────────
export async function createProduct(
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    brand: formData.get('brand') || undefined,
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const images = extractImages(formData);
  const { price, compareAt, ...rest } = parsed.data;

  let createdProduct;
  try {
    createdProduct = await prisma.product.create({
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
        images,
      },
    });

    // Every product needs at least one variant to be purchasable —
    // create a default (no color/size options) variant automatically,
    // mirroring the product's own price/stock. Admins can later add
    // real color/size variants on the edit page, which replaces or
    // supplements this default as needed.
    await prisma.productVariant.create({
      data: {
        productId: createdProduct.id,
        color: null,
        size: null,
        price: null,
        stock: parsed.data.stock,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint') && msg.includes('slug')) {
      return { errors: { slug: ['This slug is already taken.'] } };
    }
    return { message: 'Database error: failed to create product.' };
  }

  revalidatePath('/admin/products');
  redirect(`/admin/products/${createdProduct.id}/edit`);
}

// ─── Update ───────────────────────────────────────────────────
export async function updateProduct(
  id: string,
  _prev: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const raw = {
    name: formData.get('name'),
    slug: formData.get('slug'),
    brand: formData.get('brand') || undefined,
    description: formData.get('description'),
    price: formData.get('price'),
    compareAt: formData.get('compareAt') || null,
    stock: formData.get('stock'),
    categoryId: formData.get('categoryId') || null,
    published: formData.get('published') === 'on',
    featured: formData.get('featured') === 'on',
  };

  const parsed = ProductSchema.safeParse(raw);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors };
  }

  const images = extractImages(formData);
  const { price, compareAt, ...rest } = parsed.data;

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...rest,
        price: toCents(price),
        compareAt: compareAt ? toCents(compareAt) : null,
        images,
      },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint') && msg.includes('slug')) {
      return { errors: { slug: ['This slug is already taken.'] } };
    }
    return { message: 'Database error: failed to update product.' };
  }

  revalidatePath('/admin/products');
  revalidatePath(`/admin/products/${id}`);
  redirect('/admin/products');
}

// ─── Delete ───────────────────────────────────────────────────
export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}

export async function checkSlugAvailable(
  slug: string,
  excludeId?: string,
): Promise<boolean> {
  const existing = await prisma.product.findUnique({ where: { slug } });
  if (!existing) return true;
  if (excludeId && existing.id === excludeId) return true;
  return false;
}

// ─── Update Stock ─────────────────────────────────────────────
export async function updateStock(
  productId: string,
  stock: number,
  variantId?: string,
): Promise<void> {
  if (variantId) {
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { stock },
    });
  } else {
    await prisma.product.update({
      where: { id: productId },
      data: { stock },
    });
  }
  revalidatePath('/admin/products');
}

// ─── Bundles ──────────────────────────────────────────────────
export async function addBundleProduct(
  productId: string,
  bundledProductId: string,
): Promise<{ error?: string }> {
  if (productId === bundledProductId) {
    return { error: 'A product cannot be bundled with itself.' };
  }
  try {
    await prisma.productBundle.create({
      data: { productId, bundledProductId },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('Unique constraint')) {
      return { error: 'This product is already in the bundle.' };
    }
    return { error: 'Failed to add bundle product.' };
  }
  revalidatePath(`/admin/products/${productId}/edit`);
  return {};
}

export async function removeBundleProduct(
  productId: string,
  bundledProductId: string,
): Promise<void> {
  await prisma.productBundle.deleteMany({
    where: { productId, bundledProductId },
  });
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function searchProductsForBundle(
  productId: string,
  query: string,
): Promise<{ id: string; name: string; price: number; images: string[] }[]> {
  if (!query || query.trim().length < 2) return [];

  const existing = await prisma.productBundle.findMany({
    where: { productId },
    select: { bundledProductId: true },
  });
  const excludeIds = [productId, ...existing.map((b) => b.bundledProductId)];

  return prisma.product.findMany({
    where: {
      id: { notIn: excludeIds },
      published: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { brand: { contains: query, mode: 'insensitive' } },
      ],
    },
    select: { id: true, name: true, price: true, images: true },
    take: 6,
  });
}

// ─── Storefront product listing ───────────────────────────────
//
// Called from app/(store)/products/page.tsx.
// When browsing a top-level category (e.g. "Shoes") it automatically
// includes products from all subcategories (Men / Women / Kids).
// When browsing a subcategory it returns only that subcategory's products.

const PAGE_SIZE = 12;

export type SortOption = 'newest' | 'price-asc' | 'price-desc';

interface ProductListParams {
  categorySlug?: string;
  page?: number;
  sort?: SortOption;
  minPrice?: number;
  maxPrice?: number;
}

export async function getProducts({
  categorySlug,
  page = 1,
  sort = 'newest',
  minPrice,
  maxPrice,
}: ProductListParams) {
  // ── Category filter ─────────────────────────────────────────
  let categoryFilter: object | undefined;

  if (categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
      select: {
        id: true,
        parentId: true,
        children: { select: { id: true } },
      },
    });

    if (category) {
      const isTopLevel = category.parentId === null;
      const hasChildren = category.children.length > 0;

      if (isTopLevel && hasChildren) {
        // Parent category — pull products from the parent AND all children.
        // e.g. browsing "Shoes" returns Men's + Women's + Kids' Shoes.
        categoryFilter = {
          category: {
            OR: [
              { id: category.id }, // assigned directly to "Shoes"
              { parentId: category.id }, // assigned to Men/Women/Kids
            ],
          },
        };
      } else {
        // Subcategory or top-level with no children — exact match only.
        categoryFilter = { categoryId: category.id };
      }
    }
  }

  // ── Price filter ────────────────────────────────────────────
  const priceFilter =
    minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {};

  // ── Sort ────────────────────────────────────────────────────
  const orderBy =
    sort === 'price-asc'
      ? { price: 'asc' as const }
      : sort === 'price-desc'
        ? { price: 'desc' as const }
        : { createdAt: 'desc' as const };

  // ── Query ───────────────────────────────────────────────────
  const where = { published: true, ...priceFilter, ...categoryFilter };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            parentId: true,
            // Include parent so breadcrumbs can show  Shoes › Men
            parent: { select: { id: true, name: true, slug: true } },
          },
        },
        variants: {
          select: {
            id: true,
            color: true,
            size: true,
            price: true,
            stock: true,
            image: true,
          },
        },
        _count: {
          select: { reviews: { where: { approved: true } } },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    pageCount: Math.ceil(total / PAGE_SIZE),
  };
}

// ─── Category tree for storefront nav ─────────────────────────
//
// Returns top-level categories with their children nested inside.
// Used by Navbar / CategoryNavBar to render dropdowns:
//   Shoes ▾  →  Men | Women | Kids
//
// Call this in your server layout or page and pass the result
// down to <CategoryNavBar categories={tree} />.

export async function getCategoryTree() {
  return prisma.category.findMany({
    where: { parentId: null }, // top-level only
    orderBy: { name: 'asc' },
    include: {
      children: {
        orderBy: { name: 'asc' },
        select: { id: true, name: true, slug: true },
      },
    },
  });
}
