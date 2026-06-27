'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

// Replace each URL below with the corresponding value from
// prisma/hero-images.json after running fetch-hero-images.ts.
const HERO_IMAGES: Record<string, string> = {
  electronics:
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1782562618/hero-slides/electronics.jpg',
  'new-arrivals':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1782562620/hero-slides/new-arrivals.jpg',
  'free-shipping':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1782562621/hero-slides/free-shipping.jpg',
  'top-rated':
    'https://res.cloudinary.com/deiqvcg5b/image/upload/v1782562624/hero-slides/top-rated.jpg',
};

const slides = [
  {
    key: 'electronics',
    badge: '🔥 Hot Deal',
    title: 'Up to 40% Off Electronics',
    sub: 'Latest gadgets at unbeatable prices. Limited time only.',
    cta: 'Shop Electronics',
    href: '/products?category=electronics',
    gradient: 'from-orange-500/20 to-orange-600/5',
    accent: '#f97316',
  },
  {
    key: 'new-arrivals',
    badge: '🆕 New Arrivals',
    title: 'Fresh Styles Just Landed',
    sub: 'Be the first to get the newest products added to our store.',
    cta: 'See New Arrivals',
    href: '/products?sort=newest',
    gradient: 'from-blue-500/20 to-blue-600/5',
    accent: '#3b82f6',
  },
  {
    key: 'free-shipping',
    badge: '🚚 Free Shipping',
    title: 'Orders Over $50 Ship Free',
    sub: 'No promo code needed. Free standard shipping on qualifying orders.',
    cta: 'Start Shopping',
    href: '/products',
    gradient: 'from-green-500/20 to-green-600/5',
    accent: '#22c55e',
  },
  {
    key: 'top-rated',
    badge: '⭐ Top Rated',
    title: 'Customer Favourite Picks',
    sub: 'Thousands of 5-star reviews. Shop what everyone is loving.',
    cta: 'View Top Picks',
    href: '/products',
    gradient: 'from-purple-500/20 to-purple-600/5',
    accent: '#a855f7',
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = (index: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent((index + slides.length) % slides.length);
      setAnimating(false);
    }, 400);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setAnimating(true);
      setTimeout(() => {
        setCurrent((prev) => (prev + 1) % slides.length);
        setAnimating(false);
      }, 400);
    }, 4000);
    return () => clearInterval(timer);
  }, []); // ← empty dependency array, no stale closure

  const slide = slides[current];
  const imageUrl = HERO_IMAGES[slide.key];

  return (
    <div
      className="relative h-full w-full flex items-center rounded-2xl overflow-hidden p-8"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} transition-all duration-700`}
      />

      {/* Decorative circle */}
      <div
        className="absolute -right-8 -top-8 w-48 h-48 rounded-full blur-3xl opacity-20 transition-all duration-700"
        style={{ background: slide.accent }}
      />
      <div
        className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full blur-2xl opacity-10 transition-all duration-700"
        style={{ background: slide.accent }}
      />

      {/* Content row — text left, image right (Amazon-style split) */}
      <div className="relative z-10 flex w-full items-center gap-6">
        {/* Text */}
        <div
          className="flex-1 min-w-0 transition-all duration-400"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'translateY(8px)' : 'translateY(0)',
          }}
        >
          <span
            className="inline-block rounded-full px-3 py-1 text-xs font-bold mb-4"
            style={{ background: 'rgba(255,255,255,0.1)', color: '#fff' }}
          >
            {slide.badge}
          </span>
          <h3 className="text-2xl font-extrabold text-white leading-tight mb-3">
            {slide.title}
          </h3>
          <p
            className="text-sm mb-6"
            style={{ color: 'rgba(255,255,255,0.7)' }}
          >
            {slide.sub}
          </p>
          <Link
            href={slide.href}
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
            style={{ background: slide.accent, color: '#fff' }}
          >
            {slide.cta} <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Image — right side, matches Amazon's product-photo-beside-text layout */}
        <div
          className="relative hidden h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl sm:block transition-all duration-400"
          style={{
            opacity: animating ? 0 : 1,
            transform: animating ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          <Image
            src={imageUrl}
            alt={slide.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Navigation arrows */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
        <button
          onClick={() => go(current - 1)}
          className="rounded-full p-1.5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
        <button
          onClick={() => go(current + 1)}
          className="rounded-full p-1.5 transition-colors"
          style={{ background: 'rgba(255,255,255,0.1)' }}
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Dots */}
      <div className="absolute bottom-4 left-8 flex items-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === current ? '20px' : '6px',
              height: '6px',
              background:
                i === current ? slide.accent : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
