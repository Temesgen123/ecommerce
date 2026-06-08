import type { Metadata } from 'next';
import { Shield, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how MyStore collects, uses, and protects your personal information.',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="rounded-lg p-2"
            style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
          >
            <Shield className="h-6 w-6" />
          </div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            Privacy Policy
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Last updated: January 1, 2026
        </p>
        <p
          className="text-sm mt-3 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          At MyStore, we are committed to protecting your personal information
          and your right to privacy. This policy explains how we collect, use,
          and safeguard your information when you visit our website or make a
          purchase.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            1. Information We Collect
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            We collect information you provide directly to us when you:
          </p>
          <ul
            className="space-y-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {[
              'Create an account (name, email address, password)',
              'Place an order (billing/shipping address, payment information)',
              'Contact us via the contact form or email',
              'Subscribe to our newsletter (email address)',
              'Submit a product review (name, email, review content)',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--navy-600)' }}
                />
                {item}
              </li>
            ))}
          </ul>
          <p
            className="text-sm leading-relaxed mt-3"
            style={{ color: 'var(--text-muted)' }}
          >
            We also automatically collect certain information when you visit our
            site, including your IP address, browser type, referring URLs, and
            pages visited.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            2. How We Use Your Information
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            We use the information we collect to:
          </p>
          <ul
            className="space-y-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {[
              'Process and fulfill your orders',
              'Send order confirmations and shipping updates',
              'Respond to your comments, questions, and requests',
              'Send promotional communications if you have opted in',
              'Improve our website, products, and services',
              'Detect and prevent fraudulent transactions',
              'Comply with legal obligations',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--navy-600)' }}
                />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            3. Sharing Your Information
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            We do not sell or rent your personal information to third parties.
            We may share your information with:
          </p>
          <div className="space-y-3">
            {[
              {
                title: 'Payment Processors',
                desc: 'Stripe processes your payment information. We do not store your full card details on our servers.',
              },
              {
                title: 'Shipping Carriers',
                desc: 'We share your name and address with carriers to fulfill your orders.',
              },
              {
                title: 'Email Service Providers',
                desc: 'We use Resend to send transactional and marketing emails on our behalf.',
              },
              {
                title: 'Legal Requirements',
                desc: 'We may disclose your information if required by law or to protect the rights and safety of our customers.',
              },
            ].map(({ title, desc }) => (
              <div
                key={title}
                className="rounded-xl p-4"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
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
            ))}
          </div>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            4. Cookies
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We use cookies and similar tracking technologies to improve your
            browsing experience, analyze site traffic, and understand where our
            visitors come from. You can instruct your browser to refuse all
            cookies or to indicate when a cookie is being sent. However, some
            features of our site may not function properly without cookies.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            5. Data Security
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction. All data is transmitted via
            SSL encryption. However, no method of transmission over the internet
            is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            6. Data Retention
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We retain your personal information for as long as necessary to
            fulfill the purposes outlined in this policy, unless a longer
            retention period is required by law. Order information is retained
            for a minimum of 7 years for accounting and legal compliance
            purposes.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            7. Your Rights
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            Depending on your location, you may have the following rights
            regarding your personal data:
          </p>
          <ul
            className="space-y-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {[
              'Right to access — request a copy of the data we hold about you',
              'Right to rectification — request correction of inaccurate data',
              'Right to erasure — request deletion of your personal data',
              'Right to restrict processing — request we limit how we use your data',
              'Right to data portability — request your data in a portable format',
              'Right to object — object to our processing of your personal data',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                  style={{ background: 'var(--navy-600)' }}
                />
                {item}
              </li>
            ))}
          </ul>
          <p className="text-sm mt-3" style={{ color: 'var(--text-muted)' }}>
            To exercise any of these rights, please contact us at{' '}
            <a
              href="/contact"
              className="font-semibold hover:underline"
              style={{ color: 'var(--navy-600)' }}
            >
              support@mystore.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            8. Children's Privacy
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            Our website is not intended for children under the age of 13. We do
            not knowingly collect personal information from children under 13.
            If you believe we have inadvertently collected such information,
            please contact us immediately and we will delete it.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            9. Changes to This Policy
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We may update this privacy policy from time to time. We will notify
            you of any significant changes by posting the new policy on this
            page and updating the "Last updated" date. We encourage you to
            review this policy periodically to stay informed about how we
            protect your information.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            10. Contact Us
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at:
          </p>
          <div
            className="mt-3 rounded-xl p-4 text-sm"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <p
              className="font-semibold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              MyStore
            </p>
            <p>123 Store Street, New York, NY 10001</p>
            <p>
              Email:{' '}
              <a
                href="mailto:support@mystore.com"
                className="hover:underline"
                style={{ color: 'var(--navy-600)' }}
              >
                support@mystore.com
              </a>
            </p>
            <p>Phone: +1 (123) 456-7890</p>
          </div>
        </section>

        {/* Notice */}
        <div
          className="flex gap-3 rounded-xl p-4"
          style={{
            background: 'var(--navy-50)',
            border: '1px solid var(--navy-100)',
          }}
        >
          <AlertCircle
            className="h-5 w-5 flex-shrink-0 mt-0.5"
            style={{ color: 'var(--navy-700)' }}
          />
          <p className="text-sm" style={{ color: 'var(--navy-700)' }}>
            This is a placeholder privacy policy. Please review it with a legal
            professional and update it to reflect your actual data practices
            before going live.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-10 pt-6"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Have questions about your privacy?{' '}
          <a
            href="/contact"
            className="font-semibold hover:underline"
            style={{ color: 'var(--navy-600)' }}
          >
            Contact our support team
          </a>
          .
        </p>
      </div>
    </div>
  );
}
