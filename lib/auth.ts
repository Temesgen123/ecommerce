// ============================================================
// lib/auth.ts
// ============================================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { authLimiter } from '@/lib/ratelimit';
import { headers } from 'next/headers';

export const authOptions: NextAuthOptions = {
  // ── Session ──────────────────────────────────────────────
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours
  },

  // ── Pages ────────────────────────────────────────────────
  pages: {
    signIn: '/admin/login',
    error: '/api/auth/error',
  },

  // ── Providers ────────────────────────────────────────────
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'admin@example.com',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },

      async authorize(credentials) {
        // ── Rate limit check ──────────────────────────────────
        try {
          const headersList = await headers();
          const forwarded = headersList.get('x-forwarded-for');
          const realIp = headersList.get('x-real-ip');
          const ip = forwarded?.split(',')[0].trim() ?? realIp ?? '127.0.0.1';

          const { success } = await authLimiter.limit(ip);

          if (!success) {
            // NextAuth passes this string as ?error= in the redirect URL
            // so the login page can show a specific message
            throw new Error('TooManyRequests');
          }
        } catch (error) {
          if (error instanceof Error && error.message === 'TooManyRequests') {
            throw error; // re-throw — must reach NextAuth
          }
          // Redis down — fail open so admins aren't locked out
          console.error('Rate limit check failed:', error);
        }
        // ─────────────────────────────────────────────────────

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        const passwordMatches = user
          ? await compare(credentials.password, user.password)
          : await compare(
              credentials.password,
              '$2a$12$placeholderHashForTiming',
            );

        if (!user || !passwordMatches) {
          throw new Error('Invalid email or password.');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],

  // ── Callbacks ────────────────────────────────────────────
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // signIn callback no longer needed for rate limiting
    // but kept here if you need it for other purposes
  },

  // ── Security ─────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,
};
