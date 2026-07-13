import { getAllFaqs } from '@/app/actions/faqs';
import AdminFaqsClient from '@/components/admin/AdminFaqsClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Manage FAQs' };

export default async function AdminFaqsPage() {
  const faqs = await getAllFaqs();
  return <AdminFaqsClient faqs={faqs} />;
}
