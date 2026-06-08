import type { Metadata } from 'next';
import { FileText, AlertCircle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'Read the terms and conditions for using MyStore.',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="rounded-lg p-2"
            style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
          >
            <FileText className="h-6 w-6" />
          </div>
          <h1
            className="text-3xl font-extrabold"
            style={{ color: 'var(--text-primary)' }}
          >
            Terms & Conditions
          </h1>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Last updated: January 1, 2026
        </p>
        <p
          className="text-sm mt-3 leading-relaxed"
          style={{ color: 'var(--text-muted)' }}
        >
          Please read these terms and conditions carefully before using MyStore.
          By accessing or using our website, you agree to be bound by these
          terms.
        </p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            1. Acceptance of Terms
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            By accessing and using this website, you accept and agree to be
            bound by these Terms and Conditions and our Privacy Policy. If you
            do not agree to these terms, please do not use our website or
            services.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            2. Use of the Website
          </h2>
          <p
            className="text-sm leading-relaxed mb-3"
            style={{ color: 'var(--text-muted)' }}
          >
            You agree to use this website only for lawful purposes. You must
            not:
          </p>
          <ul
            className="space-y-2 text-sm"
            style={{ color: 'var(--text-muted)' }}
          >
            {[
              'Use the site in any way that violates applicable local, national, or international laws',
              'Transmit any unsolicited or unauthorized advertising or promotional material',
              'Attempt to gain unauthorized access to any part of the website',
              'Use automated tools to scrape, crawl, or extract data from the website',
              'Impersonate any person or entity or misrepresent your affiliation',
              "Engage in any conduct that restricts or inhibits anyone's use of the website",
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
            3. Account Registration
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            To access certain features of our website, you may be required to
            create an account. You are responsible for maintaining the
            confidentiality of your account credentials and for all activities
            that occur under your account. You agree to notify us immediately of
            any unauthorized use of your account. We reserve the right to
            terminate accounts at our discretion.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            4. Products & Pricing
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We reserve the right to modify or discontinue any product at any
            time without notice. Prices for products are subject to change
            without notice. We shall not be liable to you or any third party for
            any modification, price change, or discontinuance of products. We
            reserve the right to refuse any order placed with us.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            5. Orders & Payment
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            By placing an order, you warrant that you are legally capable of
            entering into binding contracts and that the payment information you
            provide is accurate and complete. All payments are processed
            securely through Stripe. We reserve the right to cancel any order at
            any time for reasons including product unavailability, errors in
            pricing, or suspected fraud.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            6. Intellectual Property
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            All content on this website, including text, graphics, logos,
            images, and software, is the property of MyStore and is protected by
            applicable intellectual property laws. You may not reproduce,
            distribute, or create derivative works from any content on this
            website without our express written permission.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            7. Disclaimer of Warranties
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            This website and its content are provided on an "as is" and "as
            available" basis without any warranties of any kind, either express
            or implied. We do not warrant that the website will be
            uninterrupted, error-free, or free of viruses or other harmful
            components.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            8. Limitation of Liability
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            To the fullest extent permitted by law, MyStore shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of the website or purchase of
            products, even if we have been advised of the possibility of such
            damages. Our total liability to you shall not exceed the amount paid
            by you for the product giving rise to the claim.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            9. Governing Law
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            These terms and conditions are governed by and construed in
            accordance with the laws of the State of New York, United States.
            Any disputes arising under these terms shall be subject to the
            exclusive jurisdiction of the courts located in New York County, New
            York.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            10. Changes to Terms
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting to the website. Your continued
            use of the website after any changes constitutes your acceptance of
            the new terms. We encourage you to review these terms periodically.
          </p>
        </section>

        <section>
          <h2
            className="text-lg font-bold mb-3"
            style={{ color: 'var(--text-primary)' }}
          >
            11. Contact Us
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-muted)' }}
          >
            If you have any questions about these terms, please contact us:
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
            This is a placeholder terms & conditions page. Please review it with
            a legal professional and update it to reflect your actual business
            terms before going live.
          </p>
        </div>
      </div>

      {/* Footer note */}
      <div
        className="mt-10 pt-6"
        style={{ borderTop: '1px solid var(--border-subtle)' }}
      >
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Have questions about our terms?{' '}
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
