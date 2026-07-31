'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2, X, ChevronRight } from 'lucide-react';
import CategoryForm from './CategoryForm';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '@/app/actions/categories';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: (Category & { _count: { products: number } })[];
  _count: { products: number };
}

interface CategoriesClientProps {
  categories: Category[];
}

export default function CategoriesClient({
  categories,
}: CategoriesClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();

  // Only top-level categories can be parents (1 level of nesting is enough
  // for Men / Women / Kids). Passing all top-level cats to the form dropdown.
  const topLevel = categories.filter((c) => c.parentId === null);

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleDelete(id: string, name: string, hasChildren: boolean) {
    const warning = hasChildren
      ? `Delete "${name}"? Its subcategories will become top-level and products will become uncategorised.`
      : `Delete "${name}"? Products in this category will become uncategorised.`;
    if (!confirm(warning)) return;
    startTransition(async () => {
      await deleteCategory(id);
    });
  }

  // ── Render a single category row (used for both parent and child rows) ──
  function CategoryRow({
    cat,
    isChild = false,
  }: {
    cat: Category;
    isChild?: boolean;
  }) {
    const hasChildren = cat.children && cat.children.length > 0;
    const isExpanded = expanded.has(cat.id);

    return (
      <>
        {/* Main row */}
        <tr className={`hover:bg-gray-50 ${isChild ? 'bg-gray-50/60' : ''}`}>
          {/* Name — indented for children */}
          <td className="px-6 py-3 font-medium text-gray-900">
            <div className="flex items-center gap-1.5">
              {isChild && (
                <span className="ml-4 text-gray-300 select-none">└─</span>
              )}
              {!isChild && hasChildren && (
                <button
                  onClick={() => toggleExpand(cat.id)}
                  className="rounded p-0.5 text-gray-400 hover:text-gray-700 transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand subcategories'}
                >
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      isExpanded ? 'rotate-90' : ''
                    }`}
                  />
                </button>
              )}
              {!isChild && !hasChildren && (
                <span className="w-5 inline-block" />
              )}
              <span className={isChild ? 'text-gray-600 text-sm' : ''}>
                {cat.name}
              </span>
              {hasChildren && !isChild && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {cat.children.length} sub
                </span>
              )}
            </div>
          </td>

          {/* Slug */}
          <td className="px-6 py-3 font-mono text-xs text-gray-500">
            {cat.slug}
          </td>

          {/* Description */}
          <td className="px-6 py-3 text-gray-500 max-w-xs truncate">
            {cat.description ?? <span className="text-gray-300">—</span>}
          </td>

          {/* Product count */}
          <td className="px-6 py-3 text-gray-500">{cat._count.products}</td>

          {/* Actions */}
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
                onClick={() => handleDelete(cat.id, cat.name, hasChildren)}
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
          <tr className="bg-blue-50/40">
            <td colSpan={5} className="px-6 py-4">
              <CategoryForm
                action={updateCategory.bind(null, cat.id)}
                defaultValues={{
                  name: cat.name,
                  slug: cat.slug,
                  description: cat.description ?? '',
                  // Sub-categories can be re-parented; top-level cats keep null
                  parentId: cat.parentId,
                }}
                // Only top-level categories are valid parents (no grandchildren)
                parentOptions={topLevel
                  .filter((p) => p.id !== cat.id) // can't parent itself
                  .map((p) => ({ id: p.id, name: p.name }))}
                submitLabel="Update"
                onSuccess={() => setEditingId(null)}
                onCancel={() => setEditingId(null)}
              />
            </td>
          </tr>
        )}

        {/* Expanded children */}
        {!isChild &&
          hasChildren &&
          isExpanded &&
          cat.children.map((child) => (
            <>
              <CategoryRow key={child.id} cat={child as Category} isChild />
              {/* Inline edit for child */}
              {editingId === child.id && (
                <tr key={`${child.id}-edit`} className="bg-blue-50/40">
                  <td colSpan={5} className="px-6 py-4">
                    <CategoryForm
                      action={updateCategory.bind(null, child.id)}
                      defaultValues={{
                        name: child.name,
                        slug: child.slug,
                        description: child.description ?? '',
                        parentId: child.parentId,
                      }}
                      parentOptions={topLevel
                        .filter((p) => p.id !== child.id)
                        .map((p) => ({ id: p.id, name: p.name }))}
                      submitLabel="Update"
                      onSuccess={() => setEditingId(null)}
                      onCancel={() => setEditingId(null)}
                    />
                  </td>
                </tr>
              )}
            </>
          ))}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Categories</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Create top-level categories (e.g. Shoes), then add subcategories
            (Men, Women, Kids) by selecting a parent.
          </p>
        </div>
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
            parentOptions={topLevel.map((p) => ({ id: p.id, name: p.name }))}
            onSuccess={() => setShowCreate(false)}
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
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
              {/* Only render top-level categories here; children render inside */}
              {categories
                .filter((c) => c.parentId === null)
                .map((cat) => (
                  <CategoryRow key={cat.id} cat={cat} />
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
