import type { Metadata } from 'next';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import CartProvider from '@/components/store/CartProvider';
import { getCustomer } from '@/lib/customer-auth';

import TawkTo from '@/components/store/TawkTo';

export const metadata: Metadata = {
  title: { template: '%s | MyStore', default: 'MyStore' },
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar customerName={customer?.name ?? null} />
        <main className="flex-1">
          {children}
          <TawkTo />
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
