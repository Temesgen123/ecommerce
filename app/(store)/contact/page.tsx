import type { Metadata } from 'next';
import ContactForm from '@/components/store/ContactForm';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with MyStore. We are here to help.',
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="text-center mb-12">
        <h1
          className="text-3xl font-extrabold mb-3"
          style={{ color: 'var(--text-primary)' }}
        >
          Contact Us
        </h1>
        <p
          className="text-base max-w-lg mx-auto"
          style={{ color: 'var(--text-muted)' }}
        >
          Have a question or need help? We'd love to hear from you. Send us a
          message and we'll get back to you as soon as possible.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact info */}
        <div className="space-y-4">
          {/* Email */}
          <div
            className="flex items-start gap-4 rounded-xl p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex-shrink-0 rounded-lg p-2.5"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Email
              </p>
              <a
                href="mailto:support@mystore.com"
                className="text-sm hover:underline"
                style={{ color: 'var(--navy-600)' }}
              >
                {/* support@mystore.com */}
                birechis@gmail.com
              </a>
            </div>
          </div>

          {/* Phone */}
          <div
            className="flex items-start gap-4 rounded-xl p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex-shrink-0 rounded-lg p-2.5"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Phone
              </p>

              <a
                href="tel:+11234567890"
                className="text-sm hover:underline"
                style={{ color: 'var(--navy-600)' }}
              >
                +1 (123) 456-7890
              </a>
            </div>
          </div>

          {/* Address */}
          <div
            className="flex items-start gap-4 rounded-xl p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex-shrink-0 rounded-lg p-2.5"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Address
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                123 Store Street
                <br />
                New York, NY 10001
                <br />
                United States
              </p>
            </div>
          </div>

          {/* Hours */}
          <div
            className="flex items-start gap-4 rounded-xl p-5"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              className="flex-shrink-0 rounded-lg p-2.5"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-0.5"
                style={{ color: 'var(--text-primary)' }}
              >
                Business Hours
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Mon – Fri: 9am – 6pm
                <br />
                Saturday: 10am – 4pm
                <br />
                Sunday: Closed
              </p>
            </div>
          </div>
        </div>

        {/* Contact form */}
        <div
          className="lg:col-span-2 rounded-xl p-6 sm:p-8"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <h2
            className="text-lg font-bold mb-6"
            style={{ color: 'var(--text-primary)' }}
          >
            Send us a message
          </h2>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
