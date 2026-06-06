'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

interface Props {
  categories: Category[];
  category?: string;
  searchTerm?: string;
  sort?: string;
}

export default function CategorySidebar({
  categories,
  category,
  searchTerm,
  sort,
}: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = () => setIsOpen(false);

  return (
    <>
      {/* Mobile hamburger button */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold border"
          style={{ background: 'var(--navy-900)', color: '#fff' }}
        >
          {isOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          {isOpen ? 'Close' : 'Categories'}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          w-full sm:w-48 flex-shrink-0 
          sm:block
          ${isOpen ? 'block' : 'hidden'}
        `}
      >
        <p
          className="mb-3 text-xs font-bold uppercase tracking-widest"
          style={{ color: 'var(--text-muted)' }}
        >
          Category
        </p>
        <ul className="space-y-1">
          <li>
            <Link
              href={
                searchTerm
                  ? `/products?q=${encodeURIComponent(searchTerm)}`
                  : '/products'
              }
              onClick={handleSelect}
              className="block rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              style={
                !category
                  ? { background: 'var(--navy-900)', color: '#fff' }
                  : { color: 'var(--text-secondary)' }
              }
            >
              All Products
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}${searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''}${sort ? `&sort=${sort}` : ''}`}
                onClick={handleSelect}
                className="block rounded-lg px-3 py-2 text-sm transition-colors"
                style={
                  category === cat.slug
                    ? {
                        background: 'var(--navy-900)',
                        color: '#fff',
                        fontWeight: 600,
                      }
                    : { color: 'var(--text-secondary)' }
                }
              >
                {cat.name}
                <span className="ml-1.5 text-xs opacity-60">
                  ({cat._count.products})
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
