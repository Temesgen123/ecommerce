import { prisma } from '@/lib/prisma';
import DriversClient from '@/components/admin/DriversClient';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Drivers' };

export default async function AdminDriversPage() {
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { deliveries: true }, // relation name from schema: deliveries Order[] @relation("DriverOrders")
      },
    },
  });

  return <DriversClient drivers={drivers} />;
}
