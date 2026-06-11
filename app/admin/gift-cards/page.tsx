import { adminGetGiftCards } from '@/app/actions/gift-cards';
import AdminGiftCardsClient from '@/components/admin/AdminGiftCardsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Gift Cards' };

export default async function AdminGiftCardsPage() {
  const giftCards = await adminGetGiftCards();
  return (
    <AdminGiftCardsClient
      giftCards={giftCards.map((g: any) => ({
        id: g.id,
        code: g.code,
        initialValue: g.initialValue,
        balance: g.balance,
        isActive: g.isActive,
        expiresAt: g.expiresAt.toISOString(),
        purchaserEmail: g.purchaserEmail,
        recipientEmail: g.recipientEmail,
        note: g.note,
        usageCount: g._count.usages,
        createdAt: g.createdAt.toISOString(),
      }))}
    />
  );
}
