import { redirect } from 'next/navigation';
import { getCustomer } from '@/lib/customer-auth';
import AccountSidebar from '@/components/store/AccountSidebar';

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const customer = await getCustomer();
  if (!customer) redirect('/account/login');
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-8 sm:flex-row">
        <AccountSidebar customer={customer} />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}