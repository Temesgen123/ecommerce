import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getCustomer } from '@/lib/customer-auth';
import { getWishlistItems } from '@/app/actions/wishlist';
import WishlistPage from '@/components/store/WishlistPage';

export const metadata: Metadata = { title: 'My Wishlist' };

export default async function Page() {
  const customer = await getCustomer();
  if (!customer) {
    redirect('/account/login?redirect=/account/wishlist');
  }
  const items = await getWishlistItems();
  return <WishlistPage items={items as any} />;
}
