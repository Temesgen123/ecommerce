// prisma/seed-admin.ts

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL_SECOND;
  const password = process.env.ADMIN_PASSWORD_SECOND;
  const name = process.env.ADMIN_NAME_SECOND;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`⚠️  User "${email}" already exists — skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  const admin = await prisma.user.create({
    data: { email, password: hashed, name: name ?? null, role: 'ADMIN' },
  });

  console.log(`✅ Admin created: ${admin.email} (id: ${admin.id})`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
/*
Run the following on Bash
$ npx tsx prisma/seed-admin.ts

Note: Replace ADMIN_EMAIL, ADMIN_PASSWORD and ADMIN_NAME values with your own values.
 */
