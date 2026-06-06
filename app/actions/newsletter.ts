'use server';

import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
      // Re-activate if they previously unsubscribed
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: { active: true },
      });
    } else {
      await prisma.newsletterSubscriber.create({
        data: { email },
      });
    }

    // Send welcome email
    await resend.emails.send({
      from: 'Your Store <hello@yourdomain.com>',
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
