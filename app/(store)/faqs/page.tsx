import type { Metadata } from 'next';
import { getFaqs } from '@/app/actions/faqs';
import FaqList from '@/components/store/FaqList';

export const metadata: Metadata = {
  title: 'FAQs',
  description: 'Frequently asked questions about MyStore.',
};

export default async function FaqsPage() {
  const faqs = await getFaqs();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center mb-10">
        <h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Frequently Asked Questions
        </h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Can't find the answer you're looking for?{' '}
          <a
            href="/contact"
            className="font-semibold hover:underline"
            style={{ color: 'var(--navy-600)' }}
          >
            Contact us
          </a>
        </p>
      </div>

      {faqs.length === 0 ? (
        <div className="text-center py-16">
          <p style={{ color: 'var(--text-muted)' }}>
            No FAQs available yet. Check back soon!
          </p>
        </div>
      ) : (
        <FaqList faqs={faqs} />
      )}
    </div>
  );
}
