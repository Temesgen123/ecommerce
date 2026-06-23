'use client';

import { useActionState, useEffect } from 'react';
import {
  createDriver,
  updateDriver,
  type DriverFormState,
} from '@/app/actions/admin-drivers';

interface DriverFormProps {
  mode: 'create' | 'edit';
  driverId?: string;
  defaultValues?: { name?: string; email?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function DriverForm({
  mode,
  driverId,
  defaultValues = {},
  onSuccess,
  onCancel,
}: DriverFormProps) {
  const action =
    mode === 'edit' && driverId
      ? updateDriver.bind(null, driverId)
      : createDriver;

  const [state, formAction, isPending] = useActionState<
    DriverFormState,
    FormData
  >(action, {});

  useEffect(() => {
    if (state.message === 'ok') onSuccess?.();
  }, [state.message, onSuccess]);

  const err = state.errors ?? {};

  return (
    <form action={formAction} className="space-y-3">
      {state.message && state.message !== 'ok' && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Name */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Name</label>
          <input
            name="name"
            defaultValue={defaultValues.name ?? ''}
            placeholder="e.g. Jordan Smith"
            className={field(!!err.name)}
          />
          {err.name && <p className="text-xs text-red-600">{err.name[0]}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={defaultValues.email ?? ''}
            placeholder="driver@example.com"
            className={field(!!err.email)}
          />
          {err.email && <p className="text-xs text-red-600">{err.email[0]}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">
            Password{' '}
            {mode === 'edit' && (
              <span className="text-gray-400">
                (leave blank to keep current)
              </span>
            )}
          </label>
          <input
            name="password"
            type="password"
            placeholder={mode === 'edit' ? '••••••••' : 'Min. 8 characters'}
            className={field(!!err.password)}
          />
          {err.password && (
            <p className="text-xs text-red-600">{err.password[0]}</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-gray-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : mode === 'edit' ? 'Update' : 'Create Driver'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function field(hasError: boolean) {
  return `w-full rounded-md border px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`;
}
