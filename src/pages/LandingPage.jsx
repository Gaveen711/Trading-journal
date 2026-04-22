import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';

/* ─── Gold accent constants ──────────────────────────────────────── */
const GOLD      = '#C9A84C';
const GOLD_DIM  = 'rgba(201,168,76,0.12)';
const GOLD_LINE = 'rgba(201,168,76,0.28)';

/* ─── Scroll-reveal hook ─────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = Number(e.target.dataset.delay || 0);
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, delay);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -48px 0px' }
    );
    els.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.75s cubic-bezier(0.22,1,0.36,1), transform 0.75s cubic-bezier(0.22,1,0.36,1)';
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

/* ─── Nav scroll transparency hook ──────────────────────────────── */
function useNavScroll(ref) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const onScroll = () => {
      if (window.scrollY > 20) {
        nav.style.background = 'rgba(3,3,10,0.84)';
        nav.style.backdropFilter = 'blur(24px) saturate(160%)';
        nav.style.borderBottomColor = 'rgba(255,255,255,0.06)';
      } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.borderBottomColor = 'transparent';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [ref]);
}

/* ─── Data ───────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
    title: 'Instant MT5 Sync',
    body: 'Our Expert Advisor watches your terminal and pushes every closed position to the cloud the moment it happens. Zero manual entry, absolute precision.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>,
    title: 'Deep Analytics',
    body: 'Win-rate by session, drawdown clusters, streak analysis, and behavioural heatmaps — every metric purpose-built for gold.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
    title: 'Trade Calendar',
    body: 'A month-view calendar shows your P&L heat at a glance. Identify your best and worst days in a single look.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
    title: 'Trade Journal',
    body: 'Attach thoughts, emotions, and notes to each trade. Build an annotated playbook straight from your own history.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Bank-Grade Security',
    body: 'Firestore row-level security rules mean your data is yours alone. Nobody — including us — can access your trades.',
  },
  {
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
    title: 'Session Intelligence',
    body: 'London, New York, Tokyo — see exactly which session your edge lives in and schedule your trading around it.',
  },
];

const STEPS = [
  { n: '01', title: 'Install the EA', body: 'Drop our MQL5 Expert Advisor onto any XAUUSD chart in MT5. It runs silently and requires no manual action from you.' },
  { n: '02', title: 'Trade normally', body: 'The moment you close a position, the EA captures price, lot, P&L, and duration — and syncs everything to your dashboard.' },
  { n: '03', title: 'Find your edge', body: 'Review analytics, annotate trades, and study your calendar. Turn raw executions into actionable intelligence.' },
];

const STATS = [
  { value: 'XAUUSD', label: 'Built exclusively for gold' },
  { value: '< 1s',   label: 'MT5 sync latency' },
  { value: '100%',   label: 'Your data, your control' },
];

/* ═══════════════════════════════════════════════════════════════════ */
export function LandingPage() {
  const navigate = useNavigate();
  const navRef   = useRef(null);
  useReveal();
  useNavScroll(navRef);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/20">

      {/* ── Ambient blobs ─────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div style={{ position:'absolute', top:'-8%', left:'-4%', width:'44vw', height:'44vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)', filter:'blur(60px)' }} />
        <div style={{ position:'absolute', bottom:'8%', right:'-4%', width:'38vw', height:'38vw', borderRadius:'50%', background:`radial-gradient(circle, ${GOLD_DIM} 0%, transparent 70%)`, filter:'blur(80px)' }} />
      </div>

      {/* ── Nav ───────────────────────────────────────────────── */}
      <header>
        <nav ref={navRef} role="navigation" aria-label="Main navigation" style={{
          position:'fixed', top:0, left:0, right:0, zIndex:100, height:64,
          display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem',
          background:'transparent', borderBottom:'1px solid transparent',
          transition:'background 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s',
        }}>
          <button onClick={() => window.scrollTo({top:0,behavior:'smooth'})} aria-label="Go to top"
            style={{ background:'none', border:'none', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.5rem', padding:0, color:'hsl(var(--foreground))' }}>
            <span style={{ width:30, height:30, borderRadius:7, background:`linear-gradient(135deg,${GOLD},#7B5A1A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:900, color:'#000', letterSpacing:'-0.01em' }}>XAU</span>
            <span style={{ fontSize:'1rem', fontWeight:800, letterSpacing:'-0.03em' }}>Gold Journal</span>
          </button>

          <ul className="hidden md:flex" style={{ alignItems:'center', gap:'0.125rem', listStyle:'none', margin:0, padding:0 }}>
            {[{to:'/pricing',l:'Pricing'},{to:'/contact',l:'Contact'},{to:'/privacy',l:'Privacy'}].map(({to,l})=>(
              <li key={to}><NavLink to={to} style={{ textDecoration:'none', fontSize:'0.8125rem', fontWeight:500, padding:'0.375rem 0.875rem', borderRadius:6, color:'hsl(var(--muted-foreground))', display:'block', transition:'color 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.color='hsl(var(--foreground))'}
                onMouseOut={e=>e.currentTarget.style.color='hsl(var(--muted-foreground))'}>{l}</NavLink></li>
            ))}
          </ul>

          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <NavLink to="/login" className="hidden sm:block" style={{ textDecoration:'none', fontSize:'0.8125rem', fontWeight:500, color:'hsl(var(--muted-foreground))', transition:'color 0.2s' }}
              onMouseOver={e=>e.currentTarget.style.color='hsl(var(--foreground))'}
              onMouseOut={e=>e.currentTarget.style.color='hsl(var(--muted-foreground))'}>Sign in</NavLink>
            <button onClick={()=>navigate('/login')} style={{ background:GOLD, color:'#000', border:'none', fontSize:'0.8rem', fontWeight:800, letterSpacing:'0.03em', padding:'0.5rem 1.25rem', borderRadius:7, cursor:'pointer', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 4px 20px ${GOLD_LINE}`;}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>Get started free</button>
          </div>
        </nav>
      </header>

      <main>
        {/* ── Hero ──────────────────────────────────────────────── */}
        <section aria-label="Hero" style={{ position:'relative', zIndex:1, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'8rem 2rem 6rem', textAlign:'center' }}>

          <div data-reveal data-delay="0" style={{ display:'inline-flex', alignItems:'center', gap:'0.5rem', padding:'0.375rem 1rem', borderRadius:999, border:`1px solid ${GOLD_LINE}`, background:GOLD_DIM, fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase', color:GOLD, marginBottom:'2.5rem' }}>
            <span style={{ width:5, height:5, borderRadius:'50%', background:GOLD, display:'inline-block' }} />
            Built exclusively for XAUUSD
          </div>

          <h1 data-reveal data-delay="80" style={{ fontSize:'clamp(2.75rem,7vw,6rem)', fontWeight:900, lineHeight:1.03, letterSpacing:'-0.04em', maxWidth:820, margin:'0 auto 1.5rem' }}>
            The trading journal<br /><span className="text-gradient">gold deserves.</span>
          </h1>

          <p data-reveal data-delay="160" style={{ fontSize:'clamp(1rem,2vw,1.125rem)', fontWeight:400, color:'hsl(var(--muted-foreground))', lineHeight:1.75, maxWidth:540, margin:'0 auto 3rem' }}>
            Automated MT5 sync, deep analytics, and a beautiful calendar —
            everything a XAUUSD trader needs, nothing they don't.
          </p>

          <div data-reveal data-delay="240" style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', justifyContent:'center' }}>
            <button onClick={()=>navigate('/login')} style={{ background:'hsl(var(--foreground))', color:'hsl(var(--background))', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.8125rem', fontWeight:800, letterSpacing:'0.04em', padding:'0.9rem 2.25rem', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.opacity='0.9';}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.opacity='1';}}>Start journaling free</button>
            <Link to="/pricing" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', textDecoration:'none', color:'hsl(var(--muted-foreground))', border:'1px solid hsl(var(--border))', borderRadius:8, fontSize:'0.8125rem', fontWeight:500, padding:'0.9rem 2rem', transition:'all 0.22s' }}
              onMouseOver={e=>{e.currentTarget.style.borderColor=GOLD_LINE;e.currentTarget.style.color=GOLD;e.currentTarget.style.background=GOLD_DIM;}}
              onMouseOut={e=>{e.currentTarget.style.borderColor='hsl(var(--border))';e.currentTarget.style.color='hsl(var(--muted-foreground))';e.currentTarget.style.background='transparent';}}>
              See pricing <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>

          {/* Stats strip */}
          <div data-reveal data-delay="320" style={{ display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'3rem', marginTop:'5.5rem' }}>
            {STATS.map(s=>(
              <div key={s.label} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem', fontWeight:900, letterSpacing:'-0.04em', color:GOLD }}>{s.value}</div>
                <div style={{ fontSize:'0.72rem', fontWeight:500, color:'hsl(var(--muted-foreground))', marginTop:'0.25rem', letterSpacing:'0.07em', textTransform:'uppercase' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{ maxWidth:1100, margin:'0 auto', padding:'0 2rem' }}>
          <div style={{ height:1, background:'linear-gradient(90deg,transparent,hsl(var(--border)),transparent)' }} />
        </div>

        {/* ── Features ──────────────────────────────────────────── */}
        <section id="features" aria-label="Features" style={{ position:'relative', zIndex:1, padding:'8rem 2rem' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div data-reveal style={{ marginBottom:'4rem', maxWidth:520 }}>
              <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:GOLD, marginBottom:'1rem' }}>The system</p>
              <h2 style={{ fontSize:'clamp(1.875rem,4vw,3rem)', fontWeight:900, lineHeight:1.1, letterSpacing:'-0.03em', margin:'0 0 1rem' }}>Every tool you need.<br />Nothing you don't.</h2>
              <p style={{ fontSize:'1rem', color:'hsl(var(--muted-foreground))', lineHeight:1.75, fontWeight:400, margin:0 }}>Designed from the ground up for gold traders — not a generic journal with a XAUUSD filter applied.</p>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'1px', background:'hsl(var(--border))', borderRadius:16, overflow:'hidden', border:'1px solid hsl(var(--border))' }}>
              {FEATURES.map((f,i)=>(
                <FeatureCard key={f.title} {...f} delay={i*55} />
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────────── */}
        <section aria-label="How it works" style={{ position:'relative', zIndex:1, padding:'8rem 2rem', background:'hsl(var(--card))' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div data-reveal style={{ textAlign:'center', marginBottom:'5rem' }}>
              <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:GOLD, marginBottom:'1rem' }}>How it works</p>
              <h2 style={{ fontSize:'clamp(1.875rem,4vw,3rem)', fontWeight:900, letterSpacing:'-0.03em', lineHeight:1.1, margin:0 }}>Three steps to full clarity</h2>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:'1.5rem' }}>
              {STEPS.map((step,i)=>(
                <div key={step.n} data-reveal data-delay={i*100} style={{ padding:'2.5rem', borderRadius:14, border:'1px solid hsl(var(--border))', background:'hsl(var(--background))', position:'relative', overflow:'hidden' }}>
                  <div style={{ position:'absolute', top:'1.5rem', right:'1.75rem', fontSize:'3rem', fontWeight:900, letterSpacing:'-0.06em', color:'hsl(var(--border))', lineHeight:1, userSelect:'none' }}>{step.n}</div>
                  <div style={{ width:36, height:2, background:GOLD, borderRadius:1, marginBottom:'1.5rem' }} />
                  <h3 style={{ fontSize:'1.0625rem', fontWeight:700, marginBottom:'0.625rem', letterSpacing:'-0.02em' }}>{step.title}</h3>
                  <p style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))', lineHeight:1.75, fontWeight:400, margin:0 }}>{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <section aria-label="Call to action" style={{ position:'relative', zIndex:1, padding:'10rem 2rem', textAlign:'center' }}>
          <div aria-hidden="true" style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:500, height:300, background:`radial-gradient(ellipse, ${GOLD_DIM} 0%, transparent 70%)`, filter:'blur(50px)', pointerEvents:'none' }} />
          <div data-reveal style={{ maxWidth:580, margin:'0 auto', position:'relative' }}>
            <p style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:GOLD, marginBottom:'1.25rem' }}>Start today — it's free</p>
            <h2 style={{ fontSize:'clamp(2rem,5vw,3.75rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.05, margin:'0 0 1.5rem' }}>
              Stop guessing.<br /><span className="text-gradient">Start knowing.</span>
            </h2>
            <p style={{ fontSize:'1rem', color:'hsl(var(--muted-foreground))', lineHeight:1.75, fontWeight:400, marginBottom:'2.5rem' }}>
              Free forever. Upgrade to Pro for unlimited trades and the full analytics suite.
            </p>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.875rem', justifyContent:'center' }}>
              <button onClick={()=>navigate('/login')} style={{ background:GOLD, color:'#000', border:'none', borderRadius:8, cursor:'pointer', fontSize:'0.8125rem', fontWeight:800, letterSpacing:'0.04em', padding:'0.9rem 2.25rem', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)' }}
                onMouseOver={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow=`0 8px 32px ${GOLD_LINE}`;}}
                onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>Create free account</button>
              <Link to="/pricing" style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', textDecoration:'none', color:'hsl(var(--muted-foreground))', border:'1px solid hsl(var(--border))', borderRadius:8, fontSize:'0.8125rem', fontWeight:500, padding:'0.9rem 2rem', transition:'all 0.2s' }}
                onMouseOver={e=>{e.currentTarget.style.color='hsl(var(--foreground))';e.currentTarget.style.borderColor=GOLD_LINE;}}
                onMouseOut={e=>{e.currentTarget.style.color='hsl(var(--muted-foreground))';e.currentTarget.style.borderColor='hsl(var(--border))';}}>View pricing</Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <footer style={{ borderTop:'1px solid hsl(var(--border))', padding:'3rem 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'1.5rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span style={{ width:24, height:24, borderRadius:5, background:`linear-gradient(135deg,${GOLD},#7B5A1A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.58rem', fontWeight:900, color:'#000' }}>XAU</span>
            <span style={{ fontSize:'0.875rem', fontWeight:800, letterSpacing:'-0.02em' }}>Gold Journal</span>
          </div>
          <nav aria-label="Footer navigation">
            <ul style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', listStyle:'none', margin:0, padding:0 }}>
              {[{to:'/pricing',l:'Pricing'},{to:'/contact',l:'Contact'},{to:'/privacy',l:'Privacy'}].map(({to,l})=>(
                <li key={to}><NavLink to={to} style={{ textDecoration:'none', fontSize:'0.8125rem', color:'hsl(var(--muted-foreground))', transition:'color 0.2s' }}
                  onMouseOver={e=>e.currentTarget.style.color='hsl(var(--foreground))'}
                  onMouseOut={e=>e.currentTarget.style.color='hsl(var(--muted-foreground))'}>{l}</NavLink></li>
              ))}
            </ul>
          </nav>
          <p style={{ fontSize:'0.75rem', color:'hsl(var(--muted-foreground))', margin:0 }}>© {new Date().getFullYear()} XAU Journal · Curated by Gaveen Perera</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── Feature card ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, body, delay }) {
  return (
    <div data-reveal data-delay={delay} style={{ padding:'2rem', background:'hsl(var(--background))', transition:'background 0.2s', cursor:'default' }}
      onMouseOver={e=>e.currentTarget.style.background='hsl(var(--card))'}
      onMouseOut={e=>e.currentTarget.style.background='hsl(var(--background))'}>
      <div style={{ width:42, height:42, borderRadius:10, background:GOLD_DIM, border:`1px solid ${GOLD_LINE}`, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD, marginBottom:'1.25rem' }}>{icon}</div>
      <h3 style={{ fontSize:'0.9375rem', fontWeight:700, marginBottom:'0.5rem', letterSpacing:'-0.02em' }}>{title}</h3>
      <p style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))', lineHeight:1.7, fontWeight:400, margin:0 }}>{body}</p>
    </div>
  );
}