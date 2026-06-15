'use client';

import { Download } from 'lucide-react';

interface Subscriber {
  email: string;
  subscribedAt: Date;
  active: boolean;
}

export default function ExportNewsletterButton({
  subscribers,
}: {
  subscribers: Subscriber[];
}) {
  const handleExport = () => {
    const activeOnly = subscribers.filter((s) => s.active);

    const csv = [
      'Email,Subscribed Date',
      ...activeOnly.map(
        (s) =>
          `${s.email},${new Date(s.subscribedAt).toISOString().slice(0, 10)}`,
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `newsletter-subscribers-${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
      style={{ background: 'var(--navy-900)' }}
    >
      <Download className="w-4 h-4" />
      Export CSV
    </button>
  );
}
