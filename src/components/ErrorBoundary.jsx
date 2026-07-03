import React from 'react';

const shellStyle = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  fontFamily: "'TT Norms Pro', 'Plus Jakarta Sans', 'Arimo', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  color: 'hsl(var(--foreground, 0 0% 100%))',
  background: 'hsl(var(--background, 240 24% 3%))',
  backgroundImage: [
    'radial-gradient(circle at 18% 12%, hsl(var(--primary, 35 62% 62%) / 0.16), transparent 28rem)',
    'radial-gradient(circle at 86% 18%, hsl(var(--primary-to, 12 86% 67%) / 0.14), transparent 30rem)',
  ].join(', '),
};

const cardStyle = {
  width: 'min(100%, 430px)',
  borderRadius: '28px',
  border: '1px solid hsl(var(--border, 240 16% 13%) / 0.9)',
  background: 'hsl(var(--card, 240 24% 5%) / 0.88)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  padding: '34px',
  boxShadow: '0 28px 90px rgba(0,0,0,0.42)',
};

const eyebrowStyle = {
  margin: '0 0 18px',
  color: 'hsl(var(--primary, 35 62% 62%))',
  fontSize: '11px',
  fontWeight: 900,
  letterSpacing: '0.22em',
  textTransform: 'uppercase',
};

const iconStyle = {
  width: '54px',
  height: '54px',
  borderRadius: '18px',
  background: 'rgba(239,68,68,0.11)',
  border: '1px solid rgba(239,68,68,0.28)',
  color: 'rgb(248,113,113)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '24px',
};

const detailStyle = {
  marginTop: '22px',
  borderRadius: '16px',
  border: '1px solid hsl(var(--border, 240 16% 13%) / 0.9)',
  background: 'hsl(var(--muted, 240 20% 9%) / 0.56)',
  padding: '14px 16px',
};

const primaryButtonStyle = {
  width: '100%',
  minHeight: '48px',
  borderRadius: '16px',
  border: 0,
  background: 'hsl(var(--foreground, 0 0% 100%))',
  color: 'hsl(var(--background, 240 24% 3%))',
  fontSize: '13px',
  fontWeight: 900,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const secondaryButtonStyle = {
  width: '100%',
  minHeight: '46px',
  borderRadius: '16px',
  border: '1px solid hsl(var(--border, 240 16% 13%) / 0.9)',
  background: 'transparent',
  color: 'hsl(var(--foreground, 0 0% 100%) / 0.72)',
  fontSize: '13px',
  fontWeight: 800,
  cursor: 'pointer',
  fontFamily: 'inherit',
};

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
      const shortMsg = msg.length > 96 ? `${msg.slice(0, 96)}...` : msg;

      return (
        <div style={shellStyle}>
          <section style={cardStyle} aria-labelledby="error-boundary-title" role="alert">
            <p style={eyebrowStyle}>XAU Journal system message</p>

            <div style={iconStyle} aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>

            <h1
              id="error-boundary-title"
              style={{
                margin: 0,
                maxWidth: '320px',
                fontSize: 'clamp(2rem, 7vw, 2.75rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.04em',
                fontWeight: 900,
                color: 'hsl(var(--foreground, 0 0% 100%))',
              }}
            >
              Something went wrong.
            </h1>

            <p
              style={{
                margin: '16px 0 0',
                maxWidth: '330px',
                color: 'hsl(var(--muted-foreground, 240 5% 65%) / 0.9)',
                fontSize: '14px',
                fontWeight: 650,
                lineHeight: 1.65,
              }}
            >
              The app hit an unexpected error. Your data is safe. Refresh the page to get back on track.
            </p>

            <div style={detailStyle}>
              <p
                style={{
                  margin: 0,
                  color: 'hsl(var(--muted-foreground, 240 5% 65%) / 0.72)',
                  fontFamily: "'SF Mono', 'Fira Code', Consolas, monospace",
                  fontSize: '11px',
                  lineHeight: 1.55,
                  wordBreak: 'break-word',
                }}
              >
                {shortMsg}
              </p>
            </div>

            <div style={{ display: 'grid', gap: '10px', marginTop: '26px' }}>
              <button
                type="button"
                onClick={() => window.location.reload()}
                style={primaryButtonStyle}
                onMouseOver={(event) => { event.currentTarget.style.opacity = '0.9'; }}
                onMouseOut={(event) => { event.currentTarget.style.opacity = '1'; }}
              >
                Refresh page
              </button>
              <button
                type="button"
                onClick={() => { window.location.href = '/'; }}
                style={secondaryButtonStyle}
                onMouseOver={(event) => { event.currentTarget.style.color = 'hsl(var(--foreground, 0 0% 100%))'; }}
                onMouseOut={(event) => { event.currentTarget.style.color = 'hsl(var(--foreground, 0 0% 100%) / 0.72)'; }}
              >
                Go to home
              </button>
            </div>
          </section>
        </div>
      );
    }

    return this.props.children;
  }
}
