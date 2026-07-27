import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
  preload: false, // ← prevents fetching at build time
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
  preload: false, // ← prevents fetching at build time
});

const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    template: '%s | MyStore',
    default: 'MyStore — Quality Products, Simply Delivered',
  },
  description:
    'Shop thousands of products across electronics, apparel, home goods, and more. Free shipping on orders over $50. Fast delivery, easy returns.',
  keywords: [
    'online store',
    'ecommerce',
    'electronics',
    'apparel',
    'home goods',
    'free shipping',
    'best prices',
  ],
  authors: [{ name: 'MyStore' }],
  creator: 'MyStore',
  openGraph: {
    type: 'website',
    siteName: 'MyStore',
    title: 'MyStore — Quality Products, Simply Delivered',
    description:
      'Shop thousands of products across electronics, apparel, home goods, and more.',
    url: baseUrl,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: 'MyStore',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MyStore — Quality Products, Simply Delivered',
    description:
      'Shop thousands of products across electronics, apparel, home goods, and more.',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
