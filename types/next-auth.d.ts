// ============================================================
// types/next-auth.d.ts
// ============================================================
// Augments NextAuth's built-in types to include the custom
// fields (id, role) we add in the jwt + session callbacks.
// Without this, accessing session.user.id or session.user.role
// in TypeScript will produce type errors.
// ============================================================

import NextAuth, { DefaultSession, DefaultUser } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
  }
}
