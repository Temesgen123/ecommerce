import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=google_failed`,
    );
  }

  try {
    // Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    const tokens = await tokenRes.json();
    if (!tokens.access_token) {
      throw new Error(`No access token: ${JSON.stringify(tokens)}`);
    }

    // Fetch Google profile
    const profileRes = await fetch(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      },
    );
    const profile = await profileRes.json();

    if (!profile.email) {
      throw new Error('No email from Google');
    }

    // Find or create customer
    let customer = await prisma.customer.findUnique({
      where: { email: profile.email },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          email: profile.email,
          name: profile.name ?? profile.email.split('@')[0],
          password: '',
        },
      });
    }

    // Create session
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await prisma.customerSession.create({
      data: {
        customerId: customer.id,
        expiresAt,
      },
    });

    // Set cookie on the redirect response directly
    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/account`,
    );

    response.cookies.set('customer_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    return response;
  } catch (err) {
    console.error('[Google OAuth] Error:', err);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/auth/login?error=google_failed`,
    );
  }
}
