// ============================================================
// middleware.ts   (project root)
// ============================================================
// Runs on every request that matches `config.matcher`.
// Redirects unauthenticated visitors away from /admin pages
// before the page even renders — no server component or layout
// guard needed for the redirect itself (though the layout
// guard in app/admin/layout.tsx adds defence-in-depth).
//
// Uses the lightweight JWT helper from next-auth so this can
// run at the Edge without a database round-trip.
// ============================================================

import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/admin/login',
  },
});

export const config = {
  matcher: [
    '/admin/((?!login).*)', // match /admin/* but NOT /admin/login
  ],
};
