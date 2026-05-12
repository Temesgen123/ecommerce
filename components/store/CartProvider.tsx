'use client';

import { useEffect, useState } from 'react';
import CartDrawer from './CartDrawer';

export default function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      {children}
      {mounted && <CartDrawer />}
    </>
  );
}
