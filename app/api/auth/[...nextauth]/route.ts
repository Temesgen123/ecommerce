// ============================================================
// app/api/auth/[...nextauth]/route.ts
// ============================================================
// Thin route handler — all logic lives in lib/auth.ts so it can
// be imported by server components and server actions without
// pulling in the route-handler layer.
// ============================================================

import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
