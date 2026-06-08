'use client';

import { useState, useEffect } from 'react';
import { GitCompare } from 'lucide-react';
import { useCompareStore, type CompareItem } from '@/lib/compare-store';

interface Props {
  item: CompareItem;
}

export default function CompareButton({ item }: Props) {
  const { addItem, removeItem, hasItem, items } = useCompareStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const added = hasItem(item.id);
  const isFull = items.length >= 3 && !added;

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        added ? removeItem(item.id) : addItem(item);
      }}
      disabled={isFull}
      className="flex items-center gap-1.5 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      style={{ color: added ? 'var(--navy-700)' : 'var(--text-muted)' }}
      title={
        isFull
          ? 'Max 3 products'
          : added
            ? 'Remove from compare'
            : 'Add to compare'
      }
    >
      <GitCompare className="h-3.5 w-3.5" />
      {added ? 'Added' : 'Compare'}
    </button>
  );
}
