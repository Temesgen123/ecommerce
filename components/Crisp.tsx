'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    $crisp: any[];
    CRISP_WEBSITE_ID: string;
  }
}

export default function CrispChat() {
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_CRISP_WEBSITE_ID;

    if (!id) {
      console.error('Crisp: NEXT_PUBLIC_CRISP_WEBSITE_ID is missing!');
      return;
    }

    window.$crisp = [];
    window.CRISP_WEBSITE_ID = id;

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.head.appendChild(script);

    return () => {
      script.remove();
      delete (window as any).CRISP_WEBSITE_ID;
      delete (window as any).$crisp;
    };
  }, []);

  return null;
}
