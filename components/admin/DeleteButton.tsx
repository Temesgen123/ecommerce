'use client';

import { useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteProduct } from '@/app/actions/products';

interface DeleteButtonProps {
  id: string;
  name: string;
}

export default function DeleteButton({ id, name }: DeleteButtonProps) {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    startTransition(async () => {
      await deleteProduct(id);
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
      title="Delete"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
