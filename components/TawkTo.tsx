'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: Date;
  }
}

export default function TawkTo() {
  useEffect(() => {
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();

    const s1 = document.createElement('script');
    const s0 = document.getElementsByTagName('script')[0];

    s1.async = true;
    s1.src = `https://embed.tawk.to/${process.env.NEXT_PUBLIC_TAWKTO_PROPERTY_ID}/default`;
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');

    s0.parentNode?.insertBefore(s1, s0);

    return () => {
      // Cleanup on unmount
      s1.remove();
    };
  }, []);

  return null;
}
