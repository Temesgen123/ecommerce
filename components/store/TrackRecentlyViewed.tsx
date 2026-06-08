'use client';

import { useEffect } from 'react';
import {
  useRecentlyViewedStore,
  type RecentlyViewedItem,
} from '@/lib/recently-viewed-store';

export default function TrackRecentlyViewed({
  item,
}: {
  item: RecentlyViewedItem;
}) {
  const addItem = useRecentlyViewedStore((s) => s.addItem);

  useEffect(() => {
    addItem(item);
  }, [item.id]);

  return null;
}
