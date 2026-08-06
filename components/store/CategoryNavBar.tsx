'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import type { NavCategory } from '@/lib/category-tree';

export type { NavCategory } from '@/lib/category-tree';

interface Props {
  categories: NavCategory[];
  activeCategory?: string;
}

interface DropdownPos {
  top: number;
  left: number;
}

export default function CategoryNavBar({ categories, activeCategory }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState<DropdownPos | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // Portal requires document — only available client-side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      // Check if click is inside any button or the dropdown portal
      const clickedPortal = (
        document.getElementById('category-dropdown-portal') as HTMLElement
      )?.contains(target);
      const clickedBtn = Object.values(btnRefs.current).some((b) =>
        b?.contains(target),
      );
      if (!clickedPortal && !clickedBtn) setOpenSlug(null);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Reposition dropdown if window resizes or scrolls
  useEffect(() => {
    if (!openSlug) return;
    function reposition() {
      const btn = btnRefs.current[openSlug!];
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      setDropPos({ top: rect.bottom + 6, left: rect.left });
    }
    window.addEventListener('resize', reposition);
    window.addEventListener('scroll', reposition, true);
    return () => {
      window.removeEventListener('resize', reposition);
      window.removeEventListener('scroll', reposition, true);
    };
  }, [openSlug]);

  function openDropdown(slug: string) {
    if (openSlug === slug) {
      setOpenSlug(null);
      setDropPos(null);
      return;
    }
    const btn = btnRefs.current[slug];
    if (!btn) return;
    const rect = btn.getBoundingClientRect();
    setDropPos({ top: rect.bottom + 6, left: rect.left });
    setOpenSlug(slug);
  }

  function isCatActive(cat: NavCategory) {
    return (
      activeCategory === cat.slug ||
      cat.children.some((c) => c.slug === activeCategory)
    );
  }

  // Find the open category's data for rendering the portal dropdown
  const openCat = categories.find((c) => c.slug === openSlug);

  return (
    <>
      <div
        className="w-full border-t"
        style={{ borderColor: 'var(--navy-800)' }}
      >
        <div className="w-full overflow-x-auto scrollbar-hide">
          <div className="mx-auto flex max-w-6xl gap-2 px-4 py-2 sm:px-6">
            {/* All Products */}
            <Link
              href="/products"
              className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors hover:opacity-80"
              style={
                !activeCategory
                  ? { background: 'var(--accent)', color: '#fff' }
                  : { color: 'var(--navy-100)' }
              }
              onMouseEnter={(e) => {
                if (activeCategory)
                  (e.currentTarget as HTMLElement).style.color = '#fff';
              }}
              onMouseLeave={(e) => {
                if (activeCategory)
                  (e.currentTarget as HTMLElement).style.color =
                    'var(--navy-100)';
              }}
            >
              All Products
            </Link>

            {categories.map((cat) => {
              const hasChildren = cat.children.length > 0;
              const active = isCatActive(cat);
              const isOpen = openSlug === cat.slug;

              if (!hasChildren) {
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${cat.slug}`}
                    className="flex-shrink-0 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors hover:opacity-80"
                    style={
                      active
                        ? {
                            background: 'var(--accent)',
                            color: '#fff',
                            fontWeight: 600,
                          }
                        : { color: 'var(--navy-100)' }
                    }
                    onMouseEnter={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      if (!active)
                        (e.currentTarget as HTMLElement).style.color =
                          'var(--navy-100)';
                    }}
                  >
                    {cat.name}
                  </Link>
                );
              }

              return (
                <div key={cat.id} className="relative flex-shrink-0">
                  <button
                    ref={(el) => {
                      btnRefs.current[cat.slug] = el;
                    }}
                    onClick={() => openDropdown(cat.slug)}
                    className="flex items-center gap-1 whitespace-nowrap rounded-full px-4 py-1.5 text-sm transition-colors hover:opacity-80"
                    style={
                      active
                        ? {
                            background: 'var(--accent)',
                            color: '#fff',
                            fontWeight: 600,
                          }
                        : { color: 'var(--navy-100)' }
                    }
                  >
                    {cat.name}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Dropdown rendered in a portal at document.body level ──────────
          This completely escapes overflow:hidden / clip on any ancestor.  */}
      {mounted &&
        openCat &&
        dropPos &&
        createPortal(
          <div
            id="category-dropdown-portal"
            style={{
              position: 'fixed',
              top: dropPos.top,
              left: dropPos.left,
              zIndex: 9999,
              minWidth: '160px',
              background: 'var(--navy-900)',
              border: '1px solid var(--navy-700)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden',
            }}
          >
            {/* All → parent */}
            <Link
              href={`/products?category=${openCat.slug}`}
              onClick={() => setOpenSlug(null)}
              style={{
                display: 'block',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 500,
                color:
                  activeCategory === openCat.slug ? 'var(--accent)' : '#ffffff',
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'var(--navy-700)';
                (e.currentTarget as HTMLElement).style.color = 'var(--accent)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  'transparent';
                (e.currentTarget as HTMLElement).style.color =
                  activeCategory === openCat.slug ? 'var(--accent)' : '#ffffff';
              }}
            >
              All {openCat.name}
            </Link>

            <div
              style={{
                margin: '4px 12px',
                borderTop: '1px solid var(--navy-700)',
              }}
            />

            {/* Children */}
            {openCat.children.map((child) => {
              const isActive = activeCategory === child.slug;
              return (
                <Link
                  key={child.id}
                  href={`/products?category=${child.slug}`}
                  onClick={() => setOpenSlug(null)}
                  style={{
                    display: 'block',
                    padding: '5px 16px',
                    fontSize: '14px',
                    color: isActive ? 'var(--accent)' : '#ffffff',
                    fontWeight: isActive ? 600 : 400,
                    textDecoration: 'none',
                    borderRadius: '6px',
                    margin: '2px 6px',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'var(--navy-700)';
                    (e.currentTarget as HTMLElement).style.color =
                      'var(--accent)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.background =
                      'transparent';
                    (e.currentTarget as HTMLElement).style.color = isActive
                      ? 'var(--accent)'
                      : '#ffffff';
                  }}
                >
                  {child.name}
                </Link>
              );
            })}
          </div>,
          document.body,
        )}
    </>
  );
}
