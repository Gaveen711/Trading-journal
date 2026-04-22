import { useState, useEffect, useRef } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';

const GOLD = '#C9A84C';
const GOLD_DIM = 'rgba(201,168,76,0.12)';
const GOLD_LINE = 'rgba(201,168,76,0.28)';

function useReveal() {
    useEffect(() => {
        const io = new IntersectionObserver(entries => entries.forEach(e => {
            if (e.isIntersecting) {
                setTimeout(() => { e.target.style.opacity = '1'; e.target.style.transform = 'translateY(0)'; }, Number(e.target.dataset.delay || 0));
                io.unobserve(e.target);
            }
        }), { threshold: 0.08 });
        document.querySelectorAll('[data-reveal]').forEach(el => {
            el.style.opacity = '0'; el.style.transform = 'translateY(28px)';
            el.style.transition = 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)';
            io.observe(el);
        });
        return () => io.disconnect();
    }, []);
}

function useNavScroll(ref) {
    useEffect(() => {
        const nav = ref.current; if (!nav) return;
        const fn = () => { nav.style.background = window.scrollY > 20 ? 'rgba(3,3,10,0.84)' : 'transparent'; nav.style.backdropFilter = window.scrollY > 20 ? 'blur(24px)' : 'none'; nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(255,255,255,0.06)' : 'transparent'; };
        window.addEventListener('scroll', fn, { passive: true }); return () => window.removeEventListener('scroll', fn);
    }, [ref]);
}

const INPUT_STYLE = {
    width: '100%', background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
    borderRadius: 8, padding: '0.75rem 1rem', fontSize: '0.9rem', fontFamily: 'inherit',
    color: 'hsl(var(--foreground))', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
};

const LABEL_STYLE = {
    display: 'block', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem',
};

export function ContactPage() {
    const navigate = useNavigate();
    const navRef = useRef(null);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState('idle'); // idle | sending | sent | error
    useReveal();
    useNavScroll(navRef);
    useEffect(() => { window.scrollTo(0, 0); }, []);

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));
    const focusIn = (e) => { e.target.style.borderColor = GOLD_LINE; e.target.style.boxShadow = `0 0 0 3px ${GOLD_DIM}`; };
    const focusOut = (e) => { e.target.style.borderColor = 'hsl(var(--border))'; e.target.style.boxShadow = 'none'; };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.message) return;
        setStatus('sending');
        // Simulate send — wire up to your backend/email service
        await new Promise(r => setTimeout(r, 1400));
        setStatus('sent');
    };

    return (
        <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
                <div style={{ position: 'absolute', top: '15%', right: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.05) 0%,transparent 70%)', filter: 'blur(80px)' }} />
            </div>

            {/* Nav */}
            <header>
                <nav ref={navRef} role="navigation" aria-label="Main navigation" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', background: 'transparent', borderBottom: '1px solid transparent', transition: 'background 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground))' }}>
                        <span style={{ width: 30, height: 30, borderRadius: 7, background: `linear-gradient(135deg,${GOLD},#7B5A1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 900, color: '#000' }}>XAU</span>
                        <span style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Gold Journal</span>
                    </Link>
                    <ul className="hidden md:flex" style={{ alignItems: 'center', gap: '0.125rem', listStyle: 'none', margin: 0, padding: 0 }}>
                        {[{ to: '/', l: 'Home' }, { to: '/pricing', l: 'Pricing' }, { to: '/privacy', l: 'Privacy' }].map(({ to, l }) => (
                            <li key={to}><NavLink to={to} style={{ textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 500, padding: '0.375rem 0.875rem', borderRadius: 6, color: 'hsl(var(--muted-foreground))', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>{l}</NavLink></li>
                        ))}
                    </ul>
                    <button onClick={() => navigate('/login')} style={{ background: GOLD, color: '#000', border: 'none', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '0.03em', padding: '0.5rem 1.25rem', borderRadius: 7, cursor: 'pointer', transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)' }} onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 20px ${GOLD_LINE}`; }} onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>Get started free</button>
                </nav>
            </header>

            <main style={{ position: 'relative', zIndex: 1, padding: '0 2rem' }}>
                {/* Header */}
                <div style={{ textAlign: 'center', padding: '10rem 0 5rem', maxWidth: 580, margin: '0 auto' }}>
                    <p data-reveal style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1.25rem' }}>Contact</p>
                    <h1 data-reveal data-delay="80" style={{ fontSize: 'clamp(2.25rem,5vw,3.75rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.06, margin: '0 0 1.25rem' }}>Get in touch</h1>
                    <p data-reveal data-delay="160" style={{ fontSize: '1.0625rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.75, fontWeight: 400, margin: 0 }}>Questions, feedback, or a bug to report — we read every message and reply within one business day.</p>
                </div>

                {/* Layout */}
                <div data-reveal data-delay="80" style={{ maxWidth: 940, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '3rem', paddingBottom: '10rem', alignItems: 'start' }}>

                    {/* Info panel */}
                    <div>
                        <div style={{ marginBottom: '3rem' }}>
                            <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: GOLD, marginBottom: '1rem' }}>Direct email</p>
                            <a href="mailto:support@xaujournal.com" style={{ textDecoration: 'none', fontSize: '1.125rem', fontWeight: 700, color: 'hsl(var(--foreground))', letterSpacing: '-0.01em', transition: 'color 0.2s' }}
                                onMouseOver={e => e.currentTarget.style.color = GOLD}
                                onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--foreground))'}>support@xaujournal.com</a>
                            <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', marginTop: '0.5rem', lineHeight: 1.65 }}>Response within 1 business day.</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {[
                                { label: 'Bug reports', desc: 'Found something broken? Include your browser and what you did.' },
                                { label: 'Feature requests', desc: 'We actively shape the roadmap based on trader feedback.' },
                                { label: 'Billing & account', desc: 'Subscription issues, invoices, or cancellation help.' },
                            ].map(item => (
                                <div key={item.label} style={{ padding: '1.25rem', borderRadius: 10, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>{item.label}</p>
                                    <p style={{ fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.6, margin: 0, fontWeight: 400 }}>{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    {status === 'sent' ? (
                        <div style={{ padding: '3rem', borderRadius: 16, border: `1px solid ${GOLD_LINE}`, background: 'hsl(var(--card))', textAlign: 'center' }}>
                            <div style={{ width: 52, height: 52, borderRadius: '50%', background: GOLD_DIM, border: `1px solid ${GOLD_LINE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.75rem' }}>Message sent</h2>
                            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.7, margin: 0 }}>Thanks for reaching out — we'll reply to <strong style={{ color: 'hsl(var(--foreground))' }}>{form.email}</strong> within one business day.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '2.5rem', borderRadius: 16, border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={LABEL_STYLE}>Name *</label>
                                    <input value={form.name} onChange={set('name')} required placeholder="Your name" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
                                </div>
                                <div>
                                    <label style={LABEL_STYLE}>Email *</label>
                                    <input type="email" value={form.email} onChange={set('email')} required placeholder="you@example.com" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
                                </div>
                            </div>
                            <div>
                                <label style={LABEL_STYLE}>Subject</label>
                                <input value={form.subject} onChange={set('subject')} placeholder="What's this about?" style={INPUT_STYLE} onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <div>
                                <label style={LABEL_STYLE}>Message *</label>
                                <textarea value={form.message} onChange={set('message')} required rows={6} placeholder="Tell us what's on your mind..." style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: 140, lineHeight: 1.65 }} onFocus={focusIn} onBlur={focusOut} />
                            </div>
                            <button type="submit" disabled={status === 'sending'} style={{ padding: '0.9rem', borderRadius: 8, border: 'none', background: GOLD, color: '#000', fontSize: '0.875rem', fontWeight: 800, cursor: status === 'sending' ? 'wait' : 'pointer', letterSpacing: '0.03em', transition: 'all 0.22s cubic-bezier(0.22,1,0.36,1)', opacity: status === 'sending' ? 0.7 : 1 }}
                                onMouseOver={e => { if (status !== 'sending') { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 24px ${GOLD_LINE}`; } }}
                                onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                                {status === 'sending' ? 'Sending…' : 'Send message'}
                            </button>
                        </form>
                    )}
                </div>
            </main>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid hsl(var(--border))', padding: '3rem 2rem' }}>
                <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
                    <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--foreground))' }}>
                        <span style={{ width: 24, height: 24, borderRadius: 5, background: `linear-gradient(135deg,${GOLD},#7B5A1A)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.58rem', fontWeight: 900, color: '#000' }}>XAU</span>
                        <span style={{ fontSize: '0.875rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Gold Journal</span>
                    </Link>
                    <ul style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
                        {[{ to: '/', l: 'Home' }, { to: '/pricing', l: 'Pricing' }, { to: '/privacy', l: 'Privacy' }].map(({ to, l }) => (
                            <li key={to}><NavLink to={to} style={{ textDecoration: 'none', fontSize: '0.8125rem', color: 'hsl(var(--muted-foreground))', transition: 'color 0.2s' }} onMouseOver={e => e.currentTarget.style.color = 'hsl(var(--foreground))'} onMouseOut={e => e.currentTarget.style.color = 'hsl(var(--muted-foreground))'}>{l}</NavLink></li>
                        ))}
                    </ul>
                    <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>© {new Date().getFullYear()} XAU Journal</p>
                </div>
            </footer>
        </div>
    );
}