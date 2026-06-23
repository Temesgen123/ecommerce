'use client';

import { useState, useTransition } from 'react';
import { Pencil, Trash2, X, Truck } from 'lucide-react';
import DriverForm from '@/components/admin/DriversForm';
import { deleteDriver } from '@/app/actions/admin-drivers';

interface Driver {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  _count: { deliveries: number };
}

interface DriversClientProps {
  drivers: Driver[];
}

export default function DriversClient({ drivers }: DriversClientProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(id: string, name: string | null) {
    if (
      !confirm(
        `Delete driver "${name ?? 'this account'}"? Any orders assigned to them will become unassigned.`,
      )
    )
      return;
    startTransition(async () => {
      await deleteDriver(id);
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Drivers</h1>
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
              <span className="text-base leading-none">+</span> New Driver
            </>
          )}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="mb-4 text-sm font-medium text-gray-700">New Driver</p>
          <DriverForm mode="create" onSuccess={() => setShowCreate(false)} />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-gray-200 bg-white">
        {drivers.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No drivers yet. Create one above.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Deliveries</th>
                <th className="px-6 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {drivers.map((driver) => (
                <>
                  {/* Normal row */}
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      <span className="inline-flex items-center gap-2">
                        <Truck className="h-3.5 w-3.5 text-gray-400" />
                        {driver.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{driver.email}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {driver._count.deliveries}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setEditingId(
                              editingId === driver.id ? null : driver.id,
                            )
                          }
                          className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(driver.id, driver.name)}
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
                  {editingId === driver.id && (
                    <tr key={`${driver.id}-edit`} className="bg-gray-50">
                      <td colSpan={4} className="px-6 py-4">
                        <DriverForm
                          mode="edit"
                          driverId={driver.id}
                          defaultValues={{
                            name: driver.name ?? '',
                            email: driver.email,
                          }}
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
