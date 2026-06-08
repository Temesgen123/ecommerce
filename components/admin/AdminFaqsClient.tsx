'use client';

import { useState, useTransition } from 'react';
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react';
import { createFaq, updateFaq, deleteFaq } from '@/app/actions/faqs';

interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  order: number;
  published: boolean;
}

const emptyForm = {
  question: '',
  answer: '',
  category: '',
  order: 0,
  published: true,
};

export default function AdminFaqsClient({ faqs: initial }: { faqs: Faq[] }) {
  const [faqs, setFaqs] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (faq: Faq) => {
    setEditId(faq.id);
    setForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category ?? '',
      order: faq.order,
      published: faq.published,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      if (editId) {
        await updateFaq(editId, {
          ...form,
          category: form.category || undefined,
        });
        setFaqs((prev) =>
          prev.map((f) =>
            f.id === editId
              ? { ...f, ...form, category: form.category || null }
              : f,
          ),
        );
      } else {
        await createFaq({
          ...form,
          category: form.category || undefined,
        });
        // Refresh by reloading
        window.location.reload();
      }
      setShowForm(false);
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this FAQ?')) return;
    startTransition(async () => {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">FAQs</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white"
          style={{ background: 'var(--navy-900)' }}
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">
                {editId ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Question */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500">
                  Question
                </label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) =>
                    setForm({ ...form, question: e.target.value })
                  }
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  placeholder="What is your return policy?"
                />
              </div>

              {/* Answer */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500">
                  Answer
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none"
                  placeholder="We offer a 30-day return policy..."
                />
              </div>

              {/* Category + Order row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500">
                    Category (optional)
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                    placeholder="Shipping"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wide mb-1.5 text-gray-500">
                    Order
                  </label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) =>
                      setForm({ ...form, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Published toggle */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm({ ...form, published: e.target.checked })
                  }
                  className="rounded"
                />
                <span className="text-sm font-medium">Published</span>
              </label>

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 rounded-lg py-2.5 text-sm font-bold text-white disabled:opacity-60"
                  style={{ background: 'var(--navy-900)' }}
                >
                  {isPending
                    ? 'Saving...'
                    : editId
                      ? 'Save Changes'
                      : 'Create FAQ'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-4 py-2.5 text-sm font-semibold border"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ list */}
      {faqs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          No FAQs yet. Click "Add FAQ" to create your first one.
        </div>
      ) : (
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="rounded-xl border p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {faq.category && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {faq.category}
                    </span>
                  )}
                  {!faq.published && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      Draft
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {faq.question}
                </p>
                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                  {faq.answer}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(faq)}
                  className="rounded-lg p-1.5 hover:bg-gray-100 transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(faq.id)}
                  disabled={isPending}
                  className="rounded-lg p-1.5 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
