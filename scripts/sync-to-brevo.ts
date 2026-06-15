import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env') });

import { prisma } from '../lib/prisma';

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function syncToBrevo(email: string) {
  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY ?? '',
    },
    body: JSON.stringify({
      email,
      listIds: [2], // ← replace with your list ID
      updateEnabled: true,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(JSON.stringify(error));
  }
}

async function syncAllToBrevo() {
  let subscribers: any[] = [];

  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      console.log(`Connecting to database (attempt ${attempt})...`);
      await prisma.$queryRaw`SELECT 1`;
      subscribers = await prisma.newsletterSubscriber.findMany({
        where: { active: true },
      });
      console.log(`✅ Connected! Found ${subscribers.length} subscribers`);
      break;
    } catch (error) {
      if (attempt < 5) {
        console.log(`⏳ Retrying in 8 seconds...`);
        await wait(8000);
      } else {
        console.error('❌ Could not connect after 5 attempts');
        throw error;
      }
    }
  }

  if (subscribers.length === 0) {
    console.log('No active subscribers to sync.');
    await prisma.$disconnect();
    return;
  }

  console.log(`Syncing ${subscribers.length} subscribers to Brevo...`);

  for (const sub of subscribers) {
    try {
      await syncToBrevo(sub.email);
      console.log(`✅ Synced: ${sub.email}`);
    } catch (error: any) {
      console.error(`❌ Failed: ${sub.email}`, error.message);
    }
  }

  console.log('✅ Sync complete!');
  await prisma.$disconnect();
}

syncAllToBrevo();
