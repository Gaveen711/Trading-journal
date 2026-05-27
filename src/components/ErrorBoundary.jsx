import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('CRITICAL UI FAILURE:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message || 'Unknown error';

      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            fontFamily: "'TT Norms Pro', 'Plus Jakarta Sans', 'Arimo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: 'hsl(224 71.4% 2%)',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '28px',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              padding: '40px 36px',
              boxShadow: '0 32px 80px rgba(0,0,0,0.5)',
              textAlign: 'center',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: 'rgba(239,68,68,0.12)',
                border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 28px',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  borderRadius: '50%',
                  background: 'rgba(239,68,68,0.08)',
                  filter: 'blur(16px)',
                  pointerEvents: 'none',
                }}
              />
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgb(239,68,68)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'relative', zIndex: 1 }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                color: '#ffffff',
                marginBottom: '10px',
                letterSpacing: '-0.02em',
              }}
            >
              Something went wrong
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255,255,255,0.5)',
                lineHeight: 1.65,
                marginBottom: '28px',
                fontWeight: 500,
              }}
            >
              The app hit an unexpected error. Your data is safe — try refreshing to get back on track.
            </p>

            {/* Error detail pill */}
            <div
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '12px',
                padding: '12px 16px',
                marginBottom: '28px',
                textAlign: 'left',
              }}
            >
              <p
                style={{
                  fontSize: '11px',
                  fontFamily: "'SF Mono', 'Fira Code', 'Consolas', monospace",
                  color: 'rgba(255,255,255,0.35)',
                  wordBreak: 'break-all',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {msg.length > 80 ? msg.slice(0, 80) + '…' : msg}
              </p>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: '100%',
                  height: '48px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderTopColor: 'rgba(255,255,255,0.22)',
                  background: 'linear-gradient(180deg, rgba(99,102,241,0.9) 0%, rgba(79,70,229,0.95) 100%)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 8px 24px rgba(99,102,241,0.25)',
                  transition: 'opacity 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={e => e.currentTarget.style.opacity = '0.88'}
                onMouseOut={e => e.currentTarget.style.opacity = '1'}
              >
                Refresh page
              </button>

              <button
                onClick={() => window.location.href = '/'}
                style={{
                  width: '100%',
                  height: '44px',
                  borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(12px)',
                  color: 'rgba(255,255,255,0.6)',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
                onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
              >
                Go to home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
