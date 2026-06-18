// ============================================================
// prisma/check-images.ts
// ============================================================
// Checks every product's image URLs against the live database
// and reports which ones are broken (404, timeout, etc).
//
// Run with: npx tsx prisma/check-images.ts
//
// Does NOT modify anything — read-only diagnostic.
// Outputs a JSON report you can hand to the fix script.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { writeFileSync } from 'fs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

interface BrokenImage {
  productId: string;
  productSlug: string;
  imageIndex: number;
  url: string;
  status: number | 'timeout' | 'error';
}

async function checkUrl(
  url: string,
  timeoutMs = 8000,
): Promise<number | 'timeout' | 'error'> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timeout);
    return res.status;
  } catch (err: unknown) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') return 'timeout';
    return 'error';
  }
}

async function main() {
  const products = await prisma.product.findMany({
    select: { id: true, slug: true, images: true },
  });

  console.log(`Checking images for ${products.length} products...\n`);

  const broken: BrokenImage[] = [];
  let checked = 0;
  let total = 0;
  for (const p of products) total += p.images.length;

  for (const product of products) {
    for (let i = 0; i < product.images.length; i++) {
      const url = product.images[i];
      const status = await checkUrl(url);
      checked++;

      const ok = typeof status === 'number' && status >= 200 && status < 400;
      if (!ok) {
        broken.push({
          productId: product.id,
          productSlug: product.slug,
          imageIndex: i,
          url,
          status,
        });
        console.log(`  ✗ [${product.slug}] image[${i}] → ${status}`);
      }

      process.stdout.write(`\rChecked ${checked}/${total}`);
    }
  }

  console.log(
    `\n\n${broken.length} broken image(s) found out of ${total} checked.`,
  );

  writeFileSync(
    'prisma/broken-images-report.json',
    JSON.stringify(broken, null, 2),
  );

  console.log('Report saved to prisma/broken-images-report.json');
  console.log('Next: run `npx tsx prisma/fix-broken-images.ts`');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
