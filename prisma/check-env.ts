// prisma/check-env.ts
// Quick diagnostic — run with: npx tsx prisma/check-env.ts
// Prints whether each expected env var is present (without leaking secrets).

import 'dotenv/config';

const vars = [
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'DATABASE_URL',
];

console.log('Environment variable check:\n');

for (const name of vars) {
  const value = process.env[name];
  if (!value) {
    console.log(`✗ ${name} — MISSING or empty`);
  } else {
    // Show just enough to confirm it's right, without exposing secrets
    const preview =
      value.length > 8
        ? `${value.slice(0, 4)}...${value.slice(-4)}`
        : '(short value)';
    console.log(`✓ ${name} — present (${preview})`);
  }
}
