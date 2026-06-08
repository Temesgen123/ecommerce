import type { Metadata } from 'next';
import Link from 'next/link';
import { Heart, Shield, Truck, Users, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about MyStore — our story, mission, and values.',
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl px-8 py-16 text-center mb-12"
        style={{
          background:
            'linear-gradient(135deg, var(--navy-700) 0%, var(--navy-900) 100%)',
        }}
      >
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'radial-gradient(circle at 70% 50%, var(--accent) 0%, transparent 60%)',
          }}
        />
        <div className="relative">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl mb-4">
            About <span style={{ color: 'var(--accent)' }}>MyStore</span>
          </h1>
          <p
            className="text-base max-w-xl mx-auto"
            style={{ color: 'var(--navy-100)' }}
          >
            Your trusted marketplace for quality products delivered to your
            door. We're on a mission to make online shopping simple, affordable,
            and enjoyable.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Our Story
        </h2>
        <div
          className="space-y-4 text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>
            MyStore was founded with a simple idea — that shopping online should
            be easy, transparent, and enjoyable. We started as a small team with
            a big vision: to create a marketplace where customers could find
            everything they need in one place, without the complexity or
            confusion of other platforms.
          </p>
          <p>
            Since our launch, we have grown to offer thousands of products
            across dozens of categories — from electronics and apparel to home
            goods and beyond. Every product on our platform is carefully
            selected to ensure quality and value for our customers.
          </p>
          <p>
            We believe shopping should feel good. That's why we've built a
            platform that's fast, secure, and designed with our customers in
            mind — from the moment you browse to the moment your order arrives
            at your door.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-6"
          style={{ color: 'var(--text-primary)' }}
        >
          Our Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: <Heart className="h-5 w-5" />,
              title: 'Customer First',
              desc: 'Everything we do is designed with our customers in mind. Your satisfaction is our top priority.',
            },
            {
              icon: <Shield className="h-5 w-5" />,
              title: 'Trust & Safety',
              desc: 'We take security seriously. All transactions are encrypted and your data is always protected.',
            },
            {
              icon: <Truck className="h-5 w-5" />,
              title: 'Fast Delivery',
              desc: 'We work with reliable carriers to ensure your orders arrive quickly and in perfect condition.',
            },
            {
              icon: <Users className="h-5 w-5" />,
              title: 'Community',
              desc: "We're more than a store — we're a community of shoppers who value quality and great deals.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              className="flex items-start gap-4 rounded-xl p-5"
              style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                className="flex-shrink-0 rounded-lg p-2.5"
                style={{
                  background: 'var(--navy-50)',
                  color: 'var(--navy-700)',
                }}
              >
                {icon}
              </div>
              <div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </p>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="mb-12">
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 rounded-2xl p-6"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {[
            { number: '10,000+', label: 'Products' },
            { number: '50,000+', label: 'Happy Customers' },
            { number: '20+', label: 'Categories' },
            { number: '4.8★', label: 'Average Rating' },
          ].map(({ number, label }) => (
            <div key={label} className="text-center">
              <p
                className="text-2xl font-extrabold"
                style={{ color: 'var(--navy-900)' }}
              >
                {number}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{ color: 'var(--text-muted)' }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="mb-12">
        <h2
          className="text-2xl font-bold mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          Our Team
        </h2>
        <p
          className="text-sm leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Behind MyStore is a passionate team of developers, designers, and
          customer service specialists who work tirelessly to bring you the best
          shopping experience possible. We are a remote-first team spread across
          the globe, united by our shared mission to make e-commerce better for
          everyone.
        </p>
      </section>

      {/* CTA */}
      <section>
        <div
          className="rounded-2xl p-8 text-center"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h2
            className="text-xl font-bold mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Ready to start shopping?
          </h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            Browse thousands of products across 20+ categories.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/products"
              className="btn-primary rounded-lg px-6 py-2.5 text-sm font-bold inline-flex items-center gap-2"
            >
              Shop Now <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="rounded-lg px-6 py-2.5 text-sm font-semibold"
              style={{
                border: '1px solid var(--border-base)',
                color: 'var(--text-primary)',
              }}
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
