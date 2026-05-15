// ============================================================
// prisma/new-categories-seed.ts
// ============================================================
// Adds new categories to the database.
// Run with: npx tsx prisma/new-categories-seed.ts
// Safe to run multiple times — uses upsert.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const newCategories = [
    {
      name: 'Smartphones',
      slug: 'smartphones',
      description:
        'Latest smartphones, flagship phones, and budget options from top brands.',
    },
    {
      name: 'Auto Parts & Accessories',
      slug: 'auto-parts-accessories',
      description:
        'Car parts, tyres, oils, tools, and interior/exterior accessories.',
    },
    {
      name: 'Musical Instruments',
      slug: 'musical-instruments',
      description:
        'Guitars, keyboards, drums, and accessories for every musician.',
    },
    {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description:
        'Fitness trackers, massage tools, supplements, and wellness products.',
    },
    {
      name: 'Travel & Luggage',
      slug: 'travel-luggage',
      description:
        'Suitcases, carry-ons, travel accessories, and packing essentials.',
    },
    {
      name: 'Office Supplies',
      slug: 'office-supplies',
      description:
        'Stationery, desk accessories, printers, and everything for your workspace.',
    },
    {
      name: 'Baby & Kids',
      slug: 'baby-kids',
      description:
        'Baby gear, clothing, feeding essentials, and toys for young children.',
    },
  ];

  let created = 0;
  let skipped = 0;

  for (const cat of newCategories) {
    const result = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });

    const isNew = result.createdAt.getTime() === result.updatedAt.getTime();
    if (isNew) {
      console.log(`✓ Created: ${cat.name}`);
      created++;
    } else {
      console.log(`↩ Skipped (already exists): ${cat.name}`);
      skipped++;
    }
  }

  console.log(`\n✅ Done — ${created} created, ${skipped} skipped.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
