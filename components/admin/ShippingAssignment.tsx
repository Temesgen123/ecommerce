'use client';

import { useActionState, useState, useEffect } from 'react';
import { updateShipping, type ShippingFormState } from '@/app/actions/shipping';
import { Truck, Package } from 'lucide-react';

interface Driver {
  id: string;
  name: string | null;
  email: string;
}

interface Props {
  orderId: string;
  drivers: Driver[];
  currentValues: {
    carrier: string | null;
    carrierCompanyName: string | null;
    trackingNumber: string | null;
    driverId: string | null;
  };
}

const CARRIER_OPTIONS = [
  { value: 'FEDEX', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'NEXTSHOP_DELIVERY', label: 'NextShop Delivery' },
  { value: 'OTHER', label: 'Other' },
];

export default function ShippingAssignment({
  orderId,
  drivers,
  currentValues,
}: Props) {
  const updateAction = updateShipping.bind(null, orderId);
  const [state, formAction, isPending] = useActionState<
    ShippingFormState,
    FormData
  >(updateAction, {});

  const [carrier, setCarrier] = useState(currentValues.carrier ?? '');
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (state.message === 'ok') {
      setSavedMessage(true);
      const timeout = setTimeout(() => setSavedMessage(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [state.message]);

  const err = state.errors ?? {};
  const isOther = carrier === 'OTHER';
  const isMyStoreDelivery = carrier === 'NEXTSHOP_DELIVERY';
  const isExternalCarrier = carrier === 'FEDEX' || carrier === 'UPS' || isOther;

  return (
    <form action={formAction} className="space-y-4">
      {savedMessage && (
        <p
          className="text-sm rounded-lg px-3 py-2"
          style={{ background: '#DCFCE7', color: '#15803D' }}
        >
          ✓ Shipping details updated.
        </p>
      )}

      {/* Carrier selector */}
      <div className="space-y-1.5">
        <label
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--text-muted)' }}
        >
          Shipping Carrier
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {CARRIER_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium cursor-pointer transition-colors"
              style={{
                borderColor:
                  carrier === opt.value
                    ? 'var(--navy-500)'
                    : 'var(--border-subtle)',
                background: carrier === opt.value ? 'var(--navy-50)' : 'white',
                color:
                  carrier === opt.value
                    ? 'var(--navy-700)'
                    : 'var(--text-secondary)',
              }}
            >
              <input
                type="radio"
                name="carrier"
                value={opt.value}
                checked={carrier === opt.value}
                onChange={(e) => setCarrier(e.target.value)}
                className="sr-only"
              />
              {opt.value === 'MYSTORE_DELIVERY' ? (
                <Truck className="h-4 w-4" />
              ) : (
                <Package className="h-4 w-4" />
              )}
              {opt.label}
            </label>
          ))}
        </div>
        {err.carrier && (
          <p className="text-xs text-red-600">{err.carrier[0]}</p>
        )}
      </div>

      {/* Conditional: Other → company name */}
      {isOther && (
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Company Name
          </label>
          <input
            name="carrierCompanyName"
            defaultValue={currentValues.carrierCompanyName ?? ''}
            placeholder="e.g. DHL, USPS, local courier…"
            className={inputClass(!!err.carrierCompanyName)}
          />
          {err.carrierCompanyName && (
            <p className="text-xs text-red-600">{err.carrierCompanyName[0]}</p>
          )}
        </div>
      )}

      {/* Conditional: FedEx/UPS/Other → tracking number */}
      {isExternalCarrier && (
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Tracking Number <span className="text-gray-400">(optional)</span>
          </label>
          <input
            name="trackingNumber"
            defaultValue={currentValues.trackingNumber ?? ''}
            placeholder="e.g. 1Z999AA10123456784"
            className={inputClass(!!err.trackingNumber)}
          />
          {err.trackingNumber && (
            <p className="text-xs text-red-600">{err.trackingNumber[0]}</p>
          )}
        </div>
      )}

      {/* Conditional: MyStore Delivery → driver dropdown */}
      {isMyStoreDelivery && (
        <div className="space-y-1.5">
          <label
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: 'var(--text-muted)' }}
          >
            Assign Driver
          </label>
          {drivers.length === 0 ? (
            <p
              className="text-sm rounded-lg px-3 py-2"
              style={{ background: '#FEF9C3', color: '#854D0E' }}
            >
              No driver accounts exist yet. Create one under Admin → Drivers.
            </p>
          ) : (
            <select
              name="driverId"
              defaultValue={currentValues.driverId ?? ''}
              className={inputClass(!!err.driverId)}
            >
              <option value="">Select a driver…</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name ?? d.email} ({d.email})
                </option>
              ))}
            </select>
          )}
          {err.driverId && (
            <p className="text-xs text-red-600">{err.driverId[0]}</p>
          )}

          {/* Driver identification data, shown once assigned */}
          {currentValues.driverId && (
            <div
              className="mt-2 rounded-lg px-3 py-2 text-xs"
              style={{ background: 'var(--navy-50)', color: 'var(--navy-700)' }}
            >
              Currently assigned to:{' '}
              <span className="font-semibold">
                {drivers.find((d) => d.id === currentValues.driverId)?.name ??
                  drivers.find((d) => d.id === currentValues.driverId)?.email ??
                  'Unknown driver'}
              </span>
              {' · '}
              <span className="font-mono">{currentValues.driverId}</span>
            </div>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !carrier}
        className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {isPending ? 'Saving…' : 'Save Shipping Details'}
      </button>
    </form>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition ${
    hasError ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-white'
  }`;
}
