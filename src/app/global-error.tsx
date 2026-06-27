'use client'

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="id">
      <body>
        <main style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif',
          background: '#f9fafb',
          color: '#111827',
        }}>
          <section style={{
            width: '100%',
            maxWidth: '520px',
            border: '1px solid #e5e7eb',
            borderLeft: '5px solid #C61E21',
            borderRadius: '8px',
            background: '#ffffff',
            padding: '28px',
            boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
          }}>
            <p style={{
              margin: '0 0 8px',
              color: '#C61E21',
              fontSize: '13px',
              fontWeight: 800,
              textTransform: 'uppercase',
            }}>
              PorosMadura
            </p>
            <h1 style={{
              margin: '0 0 12px',
              fontSize: '28px',
              lineHeight: 1.2,
            }}>
              Terjadi kesalahan
            </h1>
            <p style={{
              margin: '0 0 20px',
              color: '#4b5563',
              lineHeight: 1.6,
            }}>
              Halaman belum bisa ditampilkan. Coba muat ulang halaman ini.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                border: 0,
              borderRadius: '6px',
              background: '#C61E21',
                color: '#ffffff',
                cursor: 'pointer',
                fontWeight: 800,
                padding: '10px 16px',
              }}
            >
              Muat ulang
            </button>
          </section>
        </main>
      </body>
    </html>
  )
}
