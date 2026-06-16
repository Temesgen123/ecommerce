'use client';

import { useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
            backgroundColor: '#fff',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <span style={{ fontSize: 28 }}>⚠️</span>
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              color: '#111',
              marginBottom: '0.75rem',
            }}
          >
            Something went wrong
          </h1>

          <p
            style={{
              color: '#6b7280',
              maxWidth: 400,
              lineHeight: 1.6,
              marginBottom: '2rem',
            }}
          >
            A critical error occurred. Please try refreshing the page.
          </p>

          {error.digest && (
            <p
              style={{
                fontSize: '0.75rem',
                color: '#9ca3af',
                fontFamily: 'monospace',
                backgroundColor: '#f9fafb',
                padding: '0.375rem 0.75rem',
                borderRadius: 4,
                marginBottom: '2rem',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              backgroundColor: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.95rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
