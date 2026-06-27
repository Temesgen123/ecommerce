// ============================================================
// prisma/fetch-hero-images.ts
// ============================================================
// For each hero carousel slide, searches Unsplash for a relevant
// product photo and uploads it to Cloudinary (folder: hero-slides).
// Outputs a JSON map of slideKey -> Cloudinary URL you can paste
// directly into HERO_IMAGES in components/store/HeroCarousel.tsx.
//
// Run with: npx tsx prisma/fetch-hero-images.ts
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

// One search term per slide, chosen to return a clean product/lifestyle
// photo that reads well on a colored gradient background, landscape-ish
// crop since these sit beside text rather than as a square thumbnail.
const SLIDE_SEARCH_TERMS: Record<string, string> = {
  electronics: 'wireless headphones smartphone flat lay',
  'new-arrivals': 'fashion clothing flat lay new',
  'free-shipping': 'shipping box package delivery',
  'top-rated': 'five star product review shopping bag',
};

async function findUnsplashUrl(query: string): Promise<string | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.error('Missing UNSPLASH_ACCESS_KEY in .env');
    return null;
  }

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } },
    );
    const data = await res.json();
    const photo = data.results?.[0];
    return photo ? `${photo.urls.raw}&w=900&h=900&fit=crop&q=80` : null;
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
      folder: 'hero-slides',
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
  const keys = Object.keys(SLIDE_SEARCH_TERMS);
  console.log(`Fetching images for ${keys.length} hero slides...\n`);

  const results: Record<string, string> = {};
  let succeeded = 0;
  let failed = 0;

  for (const key of keys) {
    const query = SLIDE_SEARCH_TERMS[key];
    console.log(`[${key}] searching: "${query}"`);

    const unsplashUrl = await findUnsplashUrl(query);
    if (!unsplashUrl) {
      console.log(`  ✗ No Unsplash result found`);
      failed++;
      continue;
    }

    const cloudinaryUrl = await uploadToCloudinary(unsplashUrl, key);
    if (cloudinaryUrl) {
      results[key] = cloudinaryUrl;
      console.log(`  ✓ ${cloudinaryUrl}`);
      succeeded++;
    } else {
      console.log(`  ✗ Cloudinary upload failed`);
      failed++;
    }
  }

  writeFileSync('prisma/hero-images.json', JSON.stringify(results, null, 2));

  console.log(`\n✅ Done. Succeeded: ${succeeded}, Failed: ${failed}`);
  console.log('Results saved to prisma/hero-images.json');
  console.log(
    '\nCopy the contents into HERO_IMAGES in components/store/HeroCarousel.tsx',
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
