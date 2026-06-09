'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { exportOrdersToCSV } from '@/app/actions/export-orders';

interface Props {
  status?: string;
  count: number;
}

export default function ExportOrdersButton({ status, count }: Props) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    if (count === 0) return;
    setLoading(true);

    try {
      const csv = await exportOrdersToCSV(status);

      // Create a blob and trigger download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      const filename = status
        ? `orders-${status.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
        : `orders-all-${new Date().toISOString().slice(0, 10)}.csv`;

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading || count === 0}
      className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        border: '1px solid #e5e7eb',
        background: '#fff',
        color: '#374151',
      }}
      title={
        count === 0
          ? 'No orders to export'
          : `Export ${count} order${count !== 1 ? 's' : ''} to CSV`
      }
    >
      <Download className="h-4 w-4" />
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  );
}
