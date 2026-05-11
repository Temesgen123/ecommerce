// ============================================================
// prisma/seed.ts
// ============================================================
// Creates an initial admin user and sample data for development.
// Run with:  npx prisma db seed
//
// Requires in package.json:
//   "prisma": { "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts" }
// Or with tsx:
//   "prisma": { "seed": "tsx prisma/seed.ts" }
// ============================================================

// import { PrismaClient } from '@prisma/client';
// import { hash } from 'bcryptjs';

// const prisma = new PrismaClient();

// async function main() {
//   // ── Admin user ──────────────────────────────────────────
//   const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
//   const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

//   const hashedPassword = await hash(adminPassword, 12);

//   const admin = await prisma.user.upsert({
//     where: { email: adminEmail },
//     update: {},
//     create: {
//       email: adminEmail,
//       password: hashedPassword,
//       name: 'Admin',
//       role: 'ADMIN',
//     },
//   });

//   console.log(`✓ Admin user ready: ${admin.email}`);

//   // ── Sample categories ───────────────────────────────────
//   const categories = await Promise.all([
//     prisma.category.upsert({
//       where: { slug: 'apparel' },
//       update: {},
//       create: { name: 'Apparel', slug: 'apparel' },
//     }),
//     prisma.category.upsert({
//       where: { slug: 'accessories' },
//       update: {},
//       create: { name: 'Accessories', slug: 'accessories' },
//     }),
//     prisma.category.upsert({
//       where: { slug: 'home-goods' },
//       update: {},
//       create: { name: 'Home Goods', slug: 'home-goods' },
//     }),
//   ]);

//   console.log(`✓ ${categories.length} categories seeded`);

//   // ── Sample products ─────────────────────────────────────
//   const products = await Promise.all([
//     prisma.product.upsert({
//       where: { slug: 'classic-tee' },
//       update: {},
//       create: {
//         name: 'Classic Tee',
//         slug: 'classic-tee',
//         description: 'A timeless crew-neck tee in 100% organic cotton.',
//         price: 2999, // $29.99
//         compareAt: 3999, // $39.99 (sale)
//         stock: 50,
//         images: [],
//         published: true,
//         featured: true,
//         categoryId: categories[0].id,
//       },
//     }),
//     prisma.product.upsert({
//       where: { slug: 'canvas-tote' },
//       update: {},
//       create: {
//         name: 'Canvas Tote',
//         slug: 'canvas-tote',
//         description: 'Heavy-duty canvas tote with interior pocket.',
//         price: 1999,
//         stock: 80,
//         images: [],
//         published: true,
//         featured: false,
//         categoryId: categories[1].id,
//       },
//     }),
//     prisma.product.upsert({
//       where: { slug: 'ceramic-mug' },
//       update: {},
//       create: {
//         name: 'Ceramic Mug',
//         slug: 'ceramic-mug',
//         description: 'Hand-thrown ceramic mug, holds 12 oz.',
//         price: 2499,
//         stock: 30,
//         images: [],
//         published: true,
//         featured: true,
//         categoryId: categories[2].id,
//       },
//     }),
//   ]);

//   console.log(`✓ ${products.length} products seeded`);
//   console.log(
//     '\n⚠️  Change the default admin password before going to production!',
//   );
// }

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

//
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // ── Admin user ──────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@example.com';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'changeme123';

  const hashedPassword = await hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  });

  console.log(`✓ Admin user ready: ${admin.email}`);

  // ── Sample categories ───────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'apparel' },
      update: {},
      create: { name: 'Apparel', slug: 'apparel' },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: {},
      create: { name: 'Accessories', slug: 'accessories' },
    }),
    prisma.category.upsert({
      where: { slug: 'home-goods' },
      update: {},
      create: { name: 'Home Goods', slug: 'home-goods' },
    }),
  ]);

  console.log(`✓ ${categories.length} categories seeded`);

  // ── Sample products ─────────────────────────────────────
  const products = await Promise.all([
    prisma.product.upsert({
      where: { slug: 'classic-tee' },
      update: {},
      create: {
        name: 'Classic Tee',
        slug: 'classic-tee',
        description: 'A timeless crew-neck tee in 100% organic cotton.',
        price: 2999,
        compareAt: 3999,
        stock: 50,
        images: [],
        published: true,
        featured: true,
        categoryId: categories[0].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'canvas-tote' },
      update: {},
      create: {
        name: 'Canvas Tote',
        slug: 'canvas-tote',
        description: 'Heavy-duty canvas tote with interior pocket.',
        price: 1999,
        stock: 80,
        images: [],
        published: true,
        featured: false,
        categoryId: categories[1].id,
      },
    }),
    prisma.product.upsert({
      where: { slug: 'ceramic-mug' },
      update: {},
      create: {
        name: 'Ceramic Mug',
        slug: 'ceramic-mug',
        description: 'Hand-thrown ceramic mug, holds 12 oz.',
        price: 2499,
        stock: 30,
        images: [],
        published: true,
        featured: true,
        categoryId: categories[2].id,
      },
    }),
  ]);

  console.log(`✓ ${products.length} products seeded`);
  console.log(
    '\n⚠️  Change the default admin password before going to production!',
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
