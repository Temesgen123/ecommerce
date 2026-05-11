// ============================================================
// app/admin/layout.tsx
// ============================================================
// Server component layout for the /admin section.
// Acts as a second layer of auth protection (middleware is first).
// Also renders the AdminSidebar shared across all admin pages.
// ============================================================

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdminSidebar from '@/components/admin/AdminSidebar';

export const metadata = {
  title: { template: '%s | Admin', default: 'Admin' },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  );
}
