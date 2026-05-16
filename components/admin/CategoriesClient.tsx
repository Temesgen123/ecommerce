'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
// import CategoryForm from './CategoryForm';
// import {
//   createCategory,
//   updateCategory,
//   deleteCategory,
// } from '@/app/actions/categories';
// import type { Category } from '@prisma/client';
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface CategoriesClientProps {
  categories: (Category & { _count: { products: number } })[];
}

interface CategoriesClientProps {
  categories: (Category & { _count: { products: number } })[];
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string) {
    if (
      !confirm(
        `Delete "${name}"? Products in this category will become uncategorised.`,
      )
    )
      return;
    startTransition(async () => {
      await deleteCategory(id);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowCreate((v) => !v)}
          className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors"
        >
          {showCreate ? (
            <>
              <X className="h-4 w-4" /> Cancel
            </>
          ) : (
            <>
              <span className="text-base leading-none">+</span> New Category
            </>
          )}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-gray-700">New Category</p>
          <CategoryForm
            action={createCategory}
            submitLabel="Create Category"
            onSuccess={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {categories.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No categories yet. Create one above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Slug</th>
                <th className="px-6 py-3 font-medium">Description</th>
                <th className="px-6 py-3 font-medium">Products</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {categories.map((cat) => (
                <>
                  {/* Normal row */}
                  <tr key={cat.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="px-6 py-3 font-mono text-xs text-gray-500">
                      {cat.slug}
                    </td>
                    <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
                      {cat.description ?? (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {cat._count.products}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingId(editingId === cat.id ? null : cat.id)
                          }
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          disabled={isPending}
                          className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Inline edit row */}
                  {editingId === cat.id && (
                    <tr key={`${cat.id}-edit`} className="bg-gray-50">
                      <td colSpan={5} className="px-6 py-4">
                        <CategoryForm
                          action={updateCategory.bind(null, cat.id)}
                          defaultValues={{
                            name: cat.name,
                            slug: cat.slug,
                            description: cat.description ?? '',
                          }}
                          submitLabel="Update"
                          onSuccess={() => setEditingId(null)}
                          onCancel={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
