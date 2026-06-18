// ============================================================
// prisma/fix-broken-images.ts
// ============================================================
// Reads prisma/broken-images-report.json and replaces each
// broken URL with a fresh image uploaded to Cloudinary.
//
// Run with: npx tsx prisma/fix-broken-images.ts
//
// Fix applied: reconnects to Prisma right before each DB write
// instead of holding one connection open across all the slow
// network calls (Unsplash search + Cloudinary upload), which is
// what was causing Neon to drop the connection.
// ============================================================

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { readFileSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface BrokenImage {
  productId: string;
  productSlug: string;
  imageIndex: number;
  url: string;
  status: number | 'timeout' | 'error';
}

function freshClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

async function findReplacementUrl(productSlug: string): Promise<string | null> {
  const query = productSlug.replace(/-/g, ' ');
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    console.warn(
      '  ⚠ No UNSPLASH_ACCESS_KEY set — skipping search, using fallback',
    );
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );
    const data = await res.json();
    const photo = data.results?.[0];
    return photo ? `${photo.urls.raw}&w=800&q=80` : null;
  } catch (err) {
    console.error(`  ⚠ Unsplash search failed for "${query}":`, err);
    return null;
  }
}

async function uploadToCloudinary(
  sourceUrl: string,
  publicId: string,
): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(sourceUrl, {
      public_id: publicId,
      folder: 'products',
      overwrite: true,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    console.error(`  ✗ Cloudinary upload failed for ${publicId}:`, err);
    return null;
  }
}

async function main() {
  let report: BrokenImage[];
  try {
    report = JSON.parse(
      readFileSync('prisma/broken-images-report.json', 'utf-8'),
    );
  } catch {
    console.error(
      'Could not read prisma/broken-images-report.json. Run check-images.ts first.',
    );
    process.exit(1);
  }

  if (report.length === 0) {
    console.log('No broken images to fix. 🎉');
    return;
  }

  console.log(`Fixing ${report.length} broken image(s)...\n`);

  const byProduct = new Map<string, BrokenImage[]>();
  for (const item of report) {
    const list = byProduct.get(item.productId) ?? [];
    list.push(item);
    byProduct.set(item.productId, list);
  }

  let fixed = 0;
  let failed = 0;

  for (const [productId, items] of byProduct) {
    // Fresh, short-lived Prisma client just for this product's read+write.
    // Connection opens, does its job, closes — never sits idle during
    // the slow Unsplash/Cloudinary network calls below.
    const prisma = freshClient();
    let images: string[];

    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });
      if (!product) {
        await prisma.$disconnect();
        continue;
      }
      images = [...product.images];
    } finally {
      await prisma.$disconnect();
    }

    // ── Slow part: no DB connection open during this ──
    for (const item of items) {
      console.log(`Fixing [${item.productSlug}] image[${item.imageIndex}]...`);

      const replacementSource = await findReplacementUrl(item.productSlug);
      const sourceToUpload = replacementSource ?? item.url;

      const publicId = `${item.productSlug}-${item.imageIndex}`;
      const cloudinaryUrl = await uploadToCloudinary(sourceToUpload, publicId);

      if (cloudinaryUrl) {
        images[item.imageIndex] = cloudinaryUrl;
        fixed++;
        console.log(`  ✓ Uploaded → ${cloudinaryUrl}`);
      } else {
        failed++;
        console.log(`  ✗ Failed — leaving original URL in place`);
      }
    }

    // ── Reconnect briefly just to write the result ──
    const writeClient = freshClient();
    try {
      await writeClient.product.update({
        where: { id: productId },
        data: { images },
      });
    } finally {
      await writeClient.$disconnect();
    }
  }

  console.log(`\n✅ Done. Fixed: ${fixed}, Failed: ${failed}`);
  if (failed > 0) {
    console.log(
      'Some images could not be fixed automatically — check the log above and consider manual upload for those.',
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
