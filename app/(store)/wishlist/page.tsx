import type { Metadata } from 'next';
import WishlistPage from '@/components/store/WishlistPage';

export const metadata: Metadata = { title: 'My Wishlist' };

export default function Page() {
  return <WishlistPage />;
}
