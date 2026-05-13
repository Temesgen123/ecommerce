export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--navy-900)',
        borderTop: '1px solid var(--navy-800)',
      }}
    >
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-base font-bold" style={{ color: '#fff' }}>
            My<span style={{ color: 'var(--accent)' }}>Store</span>
          </p>
          <div
            className="flex gap-6 text-sm"
            style={{ color: 'var(--navy-100)' }}
          >
            <a href="/products" className="hover:text-white transition-colors">
              Products
            </a>
          </div>
          <p className="text-xs" style={{ color: 'var(--navy-300, #5B8EC8)' }}>
            © {new Date().getFullYear()} MyStore. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
