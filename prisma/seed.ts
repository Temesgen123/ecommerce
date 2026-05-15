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

  // ── Categories ──────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'apparel' },
      update: { description: "Men's, women's and kids' clothing." },
      create: {
        name: 'Apparel',
        slug: 'apparel',
        description: "Men's, women's and kids' clothing.",
      },
    }),
    prisma.category.upsert({
      where: { slug: 'accessories' },
      update: { description: 'Bags, jewellery, watches and more.' },
      create: {
        name: 'Accessories',
        slug: 'accessories',
        description: 'Bags, jewellery, watches and more.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'home-goods' },
      update: { description: 'Kitchen, bedding, furniture and decor.' },
      create: {
        name: 'Home Goods',
        slug: 'home-goods',
        description: 'Kitchen, bedding, furniture and decor.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'shoes' },
      update: {},
      create: {
        name: 'Shoes',
        slug: 'shoes',
        description: 'Sneakers, boots, sandals and formal shoes.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'computers' },
      update: {},
      create: {
        name: 'Computers',
        slug: 'computers',
        description: 'Laptops, desktops, monitors and components.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'electronics' },
      update: {},
      create: {
        name: 'Electronics',
        slug: 'electronics',
        description: 'Phones, tablets, audio and cameras.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'books' },
      update: {},
      create: {
        name: 'Books',
        slug: 'books',
        description: 'Fiction, non-fiction, textbooks and more.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'sports-outdoors' },
      update: {},
      create: {
        name: 'Sports & Outdoors',
        slug: 'sports-outdoors',
        description: 'Exercise, camping, team sports and cycling.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'toys-games' },
      update: {},
      create: {
        name: 'Toys & Games',
        slug: 'toys-games',
        description: 'Board games, action figures, building sets and puzzles.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'beauty' },
      update: {},
      create: {
        name: 'Beauty',
        slug: 'beauty',
        description: 'Skincare, makeup, hair care and fragrances.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'kitchen' },
      update: {},
      create: {
        name: 'Kitchen',
        slug: 'kitchen',
        description: 'Cookware, appliances, utensils and storage.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tools-diy' },
      update: {},
      create: {
        name: 'Tools & DIY',
        slug: 'tools-diy',
        description: 'Hand tools, power tools, hardware and safety gear.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'pet-supplies' },
      update: {},
      create: {
        name: 'Pet Supplies',
        slug: 'pet-supplies',
        description: 'Food, toys and accessories for your pets.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: {
        name: 'Gaming',
        slug: 'gaming',
        description: 'Consoles, games, controllers and headsets.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'garden' },
      update: {},
      create: {
        name: 'Garden',
        slug: 'garden',
        description: 'Plants, tools, pots and seeds.',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'health-pharmacy' },
      update: {},
      create: {
        name: 'Health & Pharmacy',
        slug: 'health-pharmacy',
        description: 'Vitamins, first aid, medical devices and personal care.',
      },
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
