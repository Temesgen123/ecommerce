'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
}

export default function FaqList({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  // Group by category
  const grouped = faqs.reduce(
    (acc, faq) => {
      const cat = faq.category || 'General';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(faq);
      return acc;
    },
    {} as Record<string, Faq[]>,
  );

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          {/* Category heading */}
          {Object.keys(grouped).length > 1 && (
            <h2
              className="text-xs font-bold uppercase tracking-widest mb-4"
              style={{ color: 'var(--navy-600)' }}
            >
              {category}
            </h2>
          )}

          {/* FAQ items */}
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border-subtle)' }}
          >
            {items.map((faq, i) => (
              <div
                key={faq.id}
                style={{
                  borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                }}
              >
                {/* Question */}
                <button
                  onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
                  style={{
                    background:
                      openId === faq.id
                        ? 'var(--navy-50)'
                        : 'var(--bg-elevated)',
                  }}
                >
                  <span
                    className="text-sm font-semibold pr-4"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {faq.question}
                  </span>
                  <ChevronDown
                    className="flex-shrink-0 h-4 w-4 transition-transform duration-200"
                    style={{
                      color: 'var(--text-muted)',
                      transform:
                        openId === faq.id ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Answer */}
                {openId === faq.id && (
                  <div
                    className="px-5 py-4"
                    style={{
                      background: 'var(--bg-surface)',
                      borderTop: '1px solid var(--border-subtle)',
                    }}
                  >
                    <p
                      className="text-sm leading-relaxed whitespace-pre-line"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
