// ============================================================
// app/(store)/products/[slug]/opengraph-image.tsx
// ============================================================
// Generates dynamic Open Graph images for product pages.
// Shown when links are shared on social media.
// ============================================================

import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: { category: { select: { name: true } } },
  });

  const price = product
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(product.price / 100)
    : '';

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        background: '#1E3A5F',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* Left — product info */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#fff' }}>
            My
          </span>
          <span style={{ fontSize: '28px', fontWeight: 900, color: '#F97316' }}>
            Store
          </span>
        </div>

        {product?.category && (
          <span
            style={{
              fontSize: '14px',
              fontWeight: 700,
              color: '#F97316',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            {product.category.name}
          </span>
        )}

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 900,
            color: '#fff',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          {product?.name ?? 'Product'}
        </h1>

        {price && (
          <span
            style={{
              fontSize: '36px',
              fontWeight: 800,
              color: '#F97316',
            }}
          >
            {price}
          </span>
        )}

        {product?.description && (
          <p
            style={{
              fontSize: '18px',
              color: '#BDD4EE',
              lineHeight: 1.4,
              margin: 0,
              maxWidth: '480px',
              display: '-webkit-box',
              overflow: 'hidden',
            }}
          >
            {product.description.slice(0, 120)}
            {product.description.length > 120 ? '…' : ''}
          </p>
        )}
      </div>

      {/* Right — product image */}
      {product?.images[0] && (
        <div
          style={{
            width: '420px',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <img
            src={product.images[0]}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt={product.name}
          />
        </div>
      )}
    </div>,
    { ...size },
  );
}
