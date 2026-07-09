// ============================================================
// prisma/clear-carts.ts
// ============================================================
// One-time cleanup before the variants migration. Deletes all
// existing Cart/CartItem rows, since the new schema requires
// every CartItem to reference a variantId, which old rows don't
// have. Confirmed safe to run — test data only.
//
// Run with: npx tsx prisma/clear-carts.ts
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const deletedItems = await prisma.cartItem.deleteMany({});
  console.log(`Deleted ${deletedItems.count} cart items.`);

  const deletedCarts = await prisma.cart.deleteMany({});
  console.log(`Deleted ${deletedCarts.count} carts.`);

  console.log('✅ Carts cleared. Safe to run the migration now.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
