import { getCustomer } from '@/lib/customer-auth';
import { prisma } from '@/lib/prisma';
import AddressesClient from '@/components/store/AddressesClient';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My Addresses' };
export default async function AccountAddressesPage() {
  const customer = await getCustomer();
  if (!customer) return null;
  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: customer.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  return <AddressesClient addresses={addresses} />;
}
