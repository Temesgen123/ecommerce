import type { Metadata } from 'next';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import CartProvider from '@/components/store/CartProvider';
import { getCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import CrispChat from '@/components/Crisp';
import CompareDrawer from '@/components/store/CompareDrawer';
import { getCategoryTree } from '@/lib/category-tree';

export const metadata: Metadata = {
  title: { template: '%s | NextShop', default: 'NextShop' },
};

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const customer = await getCustomer();
  const [wishlistCount, categories] = await Promise.all([
    customer
      ? prisma.wishlist.count({ where: { customerId: customer.id } })
      : Promise.resolve(0),
    getCategoryTree(),
  ]);

  console.log('TREE:', JSON.stringify(categories, null, 2));

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar
          customerName={customer?.name ?? null}
          wishlistCount={wishlistCount}
          categories={categories}
        />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
      <div className="flex gap-5">
        <CrispChat />
        <CompareDrawer />
      </div>
    </CartProvider>
  );
}
