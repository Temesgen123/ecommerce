// ============================================================
// prisma/fetch-category-images.ts
// ============================================================
// For each category slug, searches Unsplash for a relevant
// product photo and uploads it to Cloudinary (folder: categories).
// Outputs a JSON map of slug -> Cloudinary URL you can paste
// directly into CATEGORY_IMAGES in app/(store)/page.tsx.
//
// Run with: npx tsx prisma/fetch-category-images.ts
//
// Requires in .env:
//   CLOUDINARY_CLOUD_NAME
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
//   UNSPLASH_ACCESS_KEY
// ============================================================

import 'dotenv/config';
import { writeFileSync } from 'fs';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// One curated search term per category — chosen to return a
// single representative product photo rather than a lifestyle
// scene, so it reads well as a small square thumbnail.
const CATEGORY_SEARCH_TERMS: Record<string, string> = {
  electronics: 'wireless headphones product photo',
  computers: 'laptop computer product photo',
  smartphones: 'smartphone product photo',
  apparel: 'folded clothing apparel product photo',
  shoes: 'sneakers shoes product photo',
  accessories: 'leather handbag product photo',
  'home-goods': 'home decor cushions product photo',
  kitchen: 'kitchenware pots pans product photo',
  books: 'stack of books product photo',
  'sports-outdoors': 'sports equipment outdoor gear photo',
  'toys-games': 'board game toys product photo',
  beauty: 'skincare cosmetics product photo',
  'tools-diy': 'hand tools toolbox product photo',
  'pet-supplies': 'dog leash pet accessories photo',
  gaming: 'gaming controller product photo',
  garden: 'garden tools plant pots photo',
  'health-pharmacy': 'vitamins supplements bottle photo',
  'health-wellness': 'yoga mat wellness product photo',
  'musical-instruments': 'acoustic guitar product photo',
  'travel-luggage': 'suitcase luggage product photo',
  'office-supplies': 'desk office supplies notebook photo',
  'baby-kids': 'baby toys nursery product photo',
  'auto-parts-accessories': 'car accessories dashboard product photo',
};

async function findUnsplashUrl(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY in .env');
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=squarish`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );
    const data = await res.json();
    const photo = data.results?.[0];
    return photo ? `${photo.urls.raw}&w=600&h=600&fit=crop&q=80` : null;
  } catch (err) {
    console.error(`Unsplash search failed for "${query}":`, err);
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
      folder: 'categories',
      overwrite: true,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch (err) {
    console.error(`Cloudinary upload failed for ${publicId}:`, err);
    return null;
  }
}

async function main() {
  const slugs = Object.keys(CATEGORY_SEARCH_TERMS);
  console.log(`Fetching images for ${slugs.length} categories...\n`);

  const results: Record<string, string> = {};
  let succeeded = 0;
  let failed = 0;

  for (const slug of slugs) {
    const query = CATEGORY_SEARCH_TERMS[slug];
    console.log(`[${slug}] searching: "${query}"`);

    const unsplashUrl = await findUnsplashUrl(query);
    if (!unsplashUrl) {
      console.log(`  ✗ No Unsplash result found`);
      failed++;
      continue;
    }

    const cloudinaryUrl = await uploadToCloudinary(unsplashUrl, slug);
    if (cloudinaryUrl) {
      results[slug] = cloudinaryUrl;
      console.log(`  ✓ ${cloudinaryUrl}`);
      succeeded++;
    } else {
      console.log(`  ✗ Cloudinary upload failed`);
      failed++;
    }
  }

  writeFileSync(
    'prisma/category-images.json',
    JSON.stringify(results, null, 2),
  );

  console.log(`\n✅ Done. Succeeded: ${succeeded}, Failed: ${failed}`);
  console.log('Results saved to prisma/category-images.json');
  console.log(
    '\nCopy the contents into CATEGORY_IMAGES in app/(store)/page.tsx',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
