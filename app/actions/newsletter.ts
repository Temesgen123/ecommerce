'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Sync to Brevo using direct HTTP API
async function syncToBrevo(email: string) {
  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY ?? '',
      },
      body: JSON.stringify({
        email,
        listIds: [2], // ← replace with your Brevo list ID
        updateEnabled: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo sync error:', error);
    } else {
      console.log(`✅ Synced ${email} to Brevo`);
    }
  } catch (error) {
    console.error('Brevo sync failed:', error);
  }
}

async function removeFromBrevo(email: string) {
  try {
    const response = await fetch(
      `https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}/lists/remove`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY ?? '',
        },
        body: JSON.stringify({
          ids: [2], // ← replace with your Brevo list ID
        }),
      },
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('Brevo remove error:', error);
    } else {
      console.log(`✅ Removed ${email} from Brevo`);
    }
  } catch (error) {
    console.error('Brevo remove failed:', error);
  }
}

export async function subscribeToNewsletter(email: string) {
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  try {
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.active) {
        return { success: false, error: 'You are already subscribed.' };
      }
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { active: true },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email },
      });
    }

    // Sync to Brevo
    await syncToBrevo(email);

    // Send welcome email
    await resend.emails.send({
      from: 'MyStore <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to our newsletter!',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Thanks for subscribing! 🎉</h2>
          <p>You're now on our list and will be the first to hear about:</p>
          <ul>
            <li>New product launches</li>
            <li>Exclusive deals and discounts</li>
            <li>Store updates</li>
          </ul>
          <p>Stay tuned!</p>
        </div>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error('Newsletter signup error:', error);
    return { success: false, error: 'Something went wrong. Please try again.' };
  }
}

export async function unsubscribeFromNewsletter(email: string) {
  try {
    await prisma.newsletterSubscriber.update({
      where: { email },
      data: { active: false },
    });
    await removeFromBrevo(email);
    return { success: true };
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return { success: false, error: 'Something went wrong.' };
  }
}
