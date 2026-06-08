'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, GitCompare, ArrowRight } from 'lucide-react';
import { useCompareStore } from '@/lib/compare-store';

function formatPrice(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100);
}

export default function CompareDrawer() {
  const { items, removeItem, clear } = useCompareStore();
  const [mounted, setMounted] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted || items.length === 0) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 shadow-2xl transition-transform"
      style={{
        background: 'var(--navy-900)',
        borderTop: '1px solid var(--navy-700)',
      }}
    >
      {/* Toggle bar */}
      <div
        className="flex items-center justify-between px-4 py-2 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">
            Compare ({items.length}/3)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            className="text-xs hover:underline"
            style={{ color: 'var(--navy-300)' }}
          >
            Clear all
          </button>
          <span className="text-white text-xs">{collapsed ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Items + compare button */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-end gap-3 overflow-x-auto">
            {/* Product slots */}
            {[0, 1, 2].map((i) => {
              const item = items[i];
              return (
                <div
                  key={i}
                  className="flex-shrink-0 w-28 rounded-lg overflow-hidden"
                  style={{
                    border: '1px solid var(--navy-700)',
                    background: 'var(--navy-800)',
                  }}
                >
                  {item ? (
                    <>
                      <div className="relative">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-20 object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-20"
                            style={{ background: 'var(--navy-700)' }}
                          />
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="absolute top-1 right-1 rounded-full p-0.5"
                          style={{ background: 'rgba(0,0,0,0.6)' }}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                      <div className="p-2">
                        <p className="text-xs font-medium text-white line-clamp-2 leading-tight">
                          {item.name}
                        </p>
                        <p
                          className="text-xs mt-1 font-bold"
                          style={{ color: 'var(--accent)' }}
                        >
                          {formatPrice(item.price)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div
                      className="h-32 flex items-center justify-center text-xs"
                      style={{ color: 'var(--navy-400)' }}
                    >
                      + Add product
                    </div>
                  )}
                </div>
              );
            })}

            {/* Compare button */}
            {items.length >= 2 && (
              <Link
                href={`/compare?ids=${items.map((i) => i.id).join(',')}`}
                className="flex-shrink-0 rounded-lg px-4 py-3 text-sm font-bold inline-flex flex-col items-center gap-1"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <ArrowRight className="h-4 w-4" />
                <span>Compare</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
