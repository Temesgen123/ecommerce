// ============================================================
// lib/auth.ts
// ============================================================
// Central NextAuth configuration.
// Import `authOptions` here and pass it to NextAuth() in the
// route handler, and to getServerSession() in server components
// or server actions.
// ============================================================

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  // ── Session ──────────────────────────────────────────────
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours — reasonable for an admin session
  },

  // ── Pages ────────────────────────────────────────────────
  pages: {
    signIn: '/admin/login',
    error: '/admin/login', // error query param is appended automatically
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
        // 1. Validate that both fields were supplied
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required.');
        }

        // 2. Look up the user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase().trim() },
        });

        // 3. Use a constant-time comparison to avoid timing attacks.
        //    Even if the user doesn't exist we run compare() so the
        //    response time doesn't leak whether the email exists.
        const passwordMatches = user
          ? await compare(credentials.password, user.password)
          : await compare(
              credentials.password,
              '$2a$12$placeholderHashForTiming',
            );

        if (!user || !passwordMatches) {
          // Generic message — don't reveal whether email or password was wrong
          throw new Error('Invalid email or password.');
        }

        // 4. Return the fields that will be encoded into the JWT
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
    // Persist custom fields (id, role) into the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },

    // Expose custom fields on the client-accessible session object
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },

  // ── Security ─────────────────────────────────────────────
  secret: process.env.NEXTAUTH_SECRET,

  // Uncomment to enable debug logs in development
  // debug: process.env.NODE_ENV === "development",
};
