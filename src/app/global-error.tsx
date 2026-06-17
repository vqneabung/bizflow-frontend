'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="vi">
      <body>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '28rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
              Đã xảy ra lỗi nghiêm trọng
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#71717a', marginTop: '0.5rem' }}>
              Vui lòng thử lại hoặc liên hệ hỗ trợ nếu lỗi tiếp tục.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#a1a1aa', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                marginTop: '1.5rem',
                padding: '0.75rem 1.5rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontWeight: '500',
              }}
            >
              Thử lại
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
