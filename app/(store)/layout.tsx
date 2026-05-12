import type { Metadata } from 'next';
import Navbar from '@/components/store/Navbar';
import Footer from '@/components/store/Footer';
import CartProvider from '@/components/store/CartProvider';

export const metadata: Metadata = {
  title: { template: '%s | Store', default: 'Store' },
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col bg-white">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </CartProvider>
  );
}
