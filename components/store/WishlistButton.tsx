'use client';

import { useEffect, useState, useTransition } from 'react';
import { Heart } from 'lucide-react';
import { toggleWishlistItem } from '@/app/actions/wishlist';

interface WishlistButtonProps {
  productId: string;
  initialSaved?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export default function WishlistButton({
  productId,
  initialSaved = false,
  size = 'md',
  showLabel = false,
}: WishlistButtonProps) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const iconSize = size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    startTransition(async () => {
      const result = await toggleWishlistItem(productId);
      if (result && 'saved' in result) {
        setSaved(!!result.saved);
      }
    });
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
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
        className={`${iconSize} ${isPending ? 'opacity-50' : ''}`}
        style={{ fill: saved ? '#EF4444' : 'none', stroke: 'currentColor' }}
      />
      {showLabel && (
        <span className="text-xs font-medium">{saved ? 'Saved' : 'Save'}</span>
      )}
    </button>
  );
}
