'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { useWishlistStore, type WishlistItem } from '@/lib/wishlist-store';

interface WishlistButtonProps {
  item: WishlistItem;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function WishlistButton({
  item,
  size = 'md',
  showLabel = false,
}: WishlistButtonProps) {
  const toggle = useWishlistStore((s) => s.toggle);
  const hasItem = useWishlistStore((s) => s.hasItem);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — localStorage only exists client-side
  useEffect(() => setMounted(true), []);

  const saved = mounted && hasItem(item.id);

  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <button
      onClick={(e) => {
        e.preventDefault(); // don't navigate if inside a link
        e.stopPropagation();
        toggle(item);
      }}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className="flex items-center gap-1.5 rounded-lg transition-all"
      style={{ color: saved ? '#EF4444' : 'var(--text-muted)' }}
      onMouseEnter={(e) =>
        ((e.currentTarget as HTMLElement).style.color = saved
          ? '#DC2626'
          : '#EF4444')
      }
      onMouseLeave={(e) =>
        ((e.currentTarget as HTMLElement).style.color = saved
          ? '#EF4444'
          : 'var(--text-muted)')
      }
    >
      <Heart
        className={iconSize}
        style={{ fill: saved ? '#EF4444' : 'none', stroke: 'currentColor' }}
      />
      {showLabel && (
        <span className="text-xs font-medium">{saved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  );
}
