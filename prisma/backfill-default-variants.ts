// ============================================================
// prisma/backfill-default-variants.ts
// ============================================================
// Run AFTER the variants migration. Every existing product needs
// at least one ProductVariant to remain purchasable, since price
// and stock now live there. This creates a single "default"
// variant per product (color: null, size: null) carrying over
// that product's current price and stock — i.e. "no options to
// choose," same as before variants existed.
//
// Safe to run multiple times — skips products that already have
// at least one variant.
//
// Run with: npx tsx prisma/backfill-default-variants.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany({
    include: { _count: { select: { variants: true } } },
  });

  const needsBackfill = products.filter((p) => p._count.variants === 0);

  console.log(
    `${products.length} total products, ${needsBackfill.length} need a default variant.\n`,
  );

  let created = 0;
  for (const product of needsBackfill) {
    await prisma.productVariant.create({
      data: {
        productId: product.id,
        color: null,
        size: null,
        price: null,
        stock: product.stock,
      },
    });
    created++;
    process.stdout.write(
      `\r✓ ${created}/${needsBackfill.length} default variants created`,
    );
  }

  console.log(`\n\n✅ Done. Created ${created} default variants.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
