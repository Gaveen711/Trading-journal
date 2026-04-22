import { useEffect, useRef } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { useAppTheme } from '../hooks/useAppTheme';

const GOLD      = '#C9A84C';
const GOLD_DIM  = 'rgba(201,168,76,0.12)';
const GOLD_LINE = 'rgba(201,168,76,0.28)';

const FREE_FEATURES = [
  '30 trades / month',
  'Basic P&L tracking',
  'Trade calendar',
  'Manual trade entry',
  'Email support',
];

const PRO_FEATURES = [
  'Unlimited trades',
  'Full analytics suite',
  'Session intelligence',
  'MT5 Expert Advisor sync',
  'TradingView webhook',
  'API key access',
  'Priority support',
  'Early access to new features',
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. Cancel from the billing portal at any time. You keep Pro access until the end of your billing period — no partial-month charges.' },
  { q: 'Is my trading data safe?', a: 'Your data is stored in Firebase with row-level security rules. Only you can access it. We cannot read your trades.' },
  { q: 'Does the EA work on mobile MT5?', a: 'Expert Advisors require the MT5 desktop terminal on Windows. The recommended workflow is to run the EA on your desktop while executing trades from mobile — data syncs in real time.' },
  { q: 'What payment methods do you accept?', a: 'All major credit and debit cards via Stripe. No PayPal at this time.' },
  { q: 'Is there a free trial for Pro?', a: 'The free plan lets you experience the full interface. A 7-day Pro trial is on our roadmap — sign up to be notified.' },
];

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          const delay = Number(e.target.dataset.delay || 0);
          setTimeout(() => {
            e.target.style.opacity = '1';
            e.target.style.transform = 'translateY(0)';
          }, delay);
          io.unobserve(e.target);
        }
      }),
      { threshold: 0.08 }
    );
    document.querySelectorAll('[data-reveal]').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(28px)';
      el.style.transition = 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)';
      io.observe(el);
    });
    return () => io.disconnect();
  }, []);
}

function useNavScroll(ref) {
  useEffect(() => {
    const nav = ref.current;
    if (!nav) return;
    const fn = () => {
      nav.style.background = window.scrollY > 20 ? 'rgba(3,3,10,0.84)' : 'transparent';
      nav.style.backdropFilter = window.scrollY > 20 ? 'blur(24px)' : 'none';
      nav.style.borderBottomColor = window.scrollY > 20 ? 'rgba(255,255,255,0.06)' : 'transparent';
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [ref]);
}

export function PricingPage() {
  const navigate = useNavigate();
  const navRef   = useRef(null);
  useReveal();
  useNavScroll(navRef);
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* Ambient blob */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div style={{ position:'absolute', top:'20%', left:'50%', transform:'translateX(-50%)', width:'60vw', height:'40vh', borderRadius:'50%', background:`radial-gradient(ellipse, ${GOLD_DIM} 0%, transparent 70%)`, filter:'blur(80px)' }} />
      </div>

      {/* Nav */}
      <header>
        <nav ref={navRef} role="navigation" aria-label="Main navigation" style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, height:64, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 2rem', background:'transparent', borderBottom:'1px solid transparent', transition:'background 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.4s' }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.5rem', color:'hsl(var(--foreground))' }}>
            <span style={{ width:30, height:30, borderRadius:7, background:`linear-gradient(135deg,${GOLD},#7B5A1A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.65rem', fontWeight:900, color:'#000' }}>XAU</span>
            <span style={{ fontSize:'1rem', fontWeight:800, letterSpacing:'-0.03em' }}>Gold Journal</span>
          </Link>
          <ul className="hidden md:flex" style={{ alignItems:'center', gap:'0.125rem', listStyle:'none', margin:0, padding:0 }}>
            {[{to:'/',l:'Home'},{to:'/contact',l:'Contact'},{to:'/privacy',l:'Privacy'}].map(({to,l})=>(
              <li key={to}><NavLink to={to} style={{ textDecoration:'none', fontSize:'0.8125rem', fontWeight:500, padding:'0.375rem 0.875rem', borderRadius:6, color:'hsl(var(--muted-foreground))', transition:'color 0.2s' }}
                onMouseOver={e=>e.currentTarget.style.color='hsl(var(--foreground))'}
                onMouseOut={e=>e.currentTarget.style.color='hsl(var(--muted-foreground))'}>{l}</NavLink></li>
            ))}
          </ul>
          <button onClick={()=>navigate('/login')} style={{ background:GOLD, color:'#000', border:'none', fontSize:'0.8rem', fontWeight:800, letterSpacing:'0.03em', padding:'0.5rem 1.25rem', borderRadius:7, cursor:'pointer', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)' }}
            onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 4px 20px ${GOLD_LINE}`;}}
            onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>Get started free</button>
        </nav>
      </header>

      <main style={{ position:'relative', zIndex:1, padding:'0 2rem' }}>

        {/* Hero */}
        <div style={{ textAlign:'center', padding:'10rem 0 6rem', maxWidth:640, margin:'0 auto' }}>
          <p data-reveal style={{ fontSize:'0.68rem', fontWeight:700, letterSpacing:'0.2em', textTransform:'uppercase', color:GOLD, marginBottom:'1.25rem' }}>Pricing</p>
          <h1 data-reveal data-delay="80" style={{ fontSize:'clamp(2.5rem,5vw,4rem)', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1.05, margin:'0 0 1.25rem' }}>Simple, honest pricing</h1>
          <p data-reveal data-delay="160" style={{ fontSize:'1.0625rem', color:'hsl(var(--muted-foreground))', lineHeight:1.75, fontWeight:400, margin:0 }}>Start free. Upgrade when you're ready for the full system.</p>
        </div>

        {/* Cards */}
        <div data-reveal data-delay="80" style={{ maxWidth:860, margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))', gap:'1.25rem', paddingBottom:'8rem' }}>

          {/* Free card */}
          <div style={{ borderRadius:16, border:'1px solid hsl(var(--border))', background:'hsl(var(--card))', padding:'2.5rem', display:'flex', flexDirection:'column' }}>
            <div style={{ marginBottom:'2rem' }}>
              <p style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'hsl(var(--muted-foreground))', marginBottom:'0.5rem' }}>Free</p>
              <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
                <span style={{ fontSize:'3rem', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1 }}>$0</span>
                <span style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))' }}>/month</span>
              </div>
              <p style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))', marginTop:'0.75rem', lineHeight:1.65 }}>Everything you need to get started and build the habit.</p>
            </div>
            <ul style={{ listStyle:'none', margin:0, padding:0, marginBottom:'2rem', flex:1 }}>
              {FREE_FEATURES.map(f=>(
                <li key={f} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0', fontSize:'0.875rem', borderBottom:'1px solid hsl(var(--border))' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color:'hsl(var(--muted-foreground))', flexShrink:0 }}><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={()=>navigate('/login')} style={{ width:'100%', padding:'0.875rem', borderRadius:8, border:'1px solid hsl(var(--border))', background:'transparent', color:'hsl(var(--foreground))', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }}
              onMouseOver={e=>{e.currentTarget.style.background='hsl(var(--muted))';}}
              onMouseOut={e=>{e.currentTarget.style.background='transparent';}}>Get started free</button>
          </div>

          {/* Pro card */}
          <div style={{ borderRadius:16, border:`1px solid ${GOLD_LINE}`, background:'hsl(var(--card))', padding:'2.5rem', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden', boxShadow:`0 0 60px ${GOLD_DIM}` }}>
            {/* Glow */}
            <div aria-hidden="true" style={{ position:'absolute', top:-60, right:-60, width:180, height:180, borderRadius:'50%', background:`radial-gradient(circle,${GOLD_DIM} 0%,transparent 70%)`, filter:'blur(30px)', pointerEvents:'none' }} />

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem' }}>
              <div>
                <p style={{ fontSize:'0.75rem', fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:GOLD, marginBottom:'0.5rem' }}>Pro</p>
                <div style={{ display:'flex', alignItems:'baseline', gap:'0.25rem' }}>
                  <span style={{ fontSize:'3rem', fontWeight:900, letterSpacing:'-0.04em', lineHeight:1, color:GOLD }}>$19</span>
                  <span style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))' }}>/month</span>
                </div>
                <p style={{ fontSize:'0.8rem', color:'hsl(var(--muted-foreground))', marginTop:'0.25rem' }}>or $190/year <span style={{ color:GOLD, fontWeight:700 }}>— save 17%</span></p>
                <p style={{ fontSize:'0.875rem', color:'hsl(var(--muted-foreground))', marginTop:'0.75rem', lineHeight:1.65 }}>The complete system for serious gold traders.</p>
              </div>
              <span style={{ fontSize:'0.65rem', fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', padding:'0.3rem 0.75rem', borderRadius:999, background:GOLD, color:'#000', whiteSpace:'nowrap' }}>Most popular</span>
            </div>
            <ul style={{ listStyle:'none', margin:0, padding:0, marginBottom:'2rem', flex:1 }}>
              {PRO_FEATURES.map(f=>(
                <li key={f} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.5rem 0', fontSize:'0.875rem', borderBottom:`1px solid ${GOLD_LINE}` }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0 }}><path d="M20 6L9 17l-5-5"/></svg>
                  {f}
                </li>
              ))}
            </ul>
            <button onClick={()=>navigate('/login')} style={{ width:'100%', padding:'0.875rem', borderRadius:8, border:'none', background:GOLD, color:'#000', fontSize:'0.875rem', fontWeight:800, cursor:'pointer', transition:'all 0.22s cubic-bezier(0.22,1,0.36,1)', letterSpacing:'0.03em' }}
              onMouseOver={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow=`0 6px 24px ${GOLD_LINE}`;}}
              onMouseOut={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none';}}>Upgrade to Pro</button>
          </div>
        </div>

        {/* FAQ */}
        <div style={{ maxWidth:720, margin:'0 auto', paddingBottom:'10rem' }}>
          <h2 data-reveal style={{ fontSize:'clamp(1.5rem,3vw,2.25rem)', fontWeight:900, letterSpacing:'-0.03em', marginBottom:'3rem', textAlign:'center' }}>Frequently asked questions</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0' }}>
            {FAQ.map((item,i)=>(
              <FAQItem key={item.q} {...item} delay={i*60} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop:'1px solid hsl(var(--border))', padding:'3rem 2rem' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', flexWrap:'wrap', alignItems:'center', justifyContent:'space-between', gap:'1.5rem' }}>
          <Link to="/" style={{ textDecoration:'none', display:'flex', alignItems:'center', gap:'0.5rem', color:'hsl(var(--foreground))' }}>
            <span style={{ width:24, height:24, borderRadius:5, background:`linear-gradient(135deg,${GOLD},#7B5A1A)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.58rem', fontWeight:900, color:'#000' }}>XAU</span>
            <span style={{ fontSize:'0.875rem', fontWeight:800, letterSpacing:'-0.02em' }}>Gold Journal</span>
          </Link>
          <ul style={{ display:'flex', flexWrap:'wrap', gap:'1.5rem', listStyle:'none', margin:0, padding:0 }}>
            {[{to:'/',l:'Home'},{to:'/contact',l:'Contact'},{to:'/privacy',l:'Privacy'}].map(({to,l})=>(
              <li key={to}><NavLink to={to} style={{ textDecoration:'none', fontSize:'0.8125rem', color:'hsl(var(--muted-foreground))', transition:'color 0.2s' }} onMouseOver={e=>e.currentTarget.style.color='hsl(var(--foreground))'} onMouseOut={e=>e.currentTarget.style.color='hsl(var(--muted-foreground))'}>{l}</NavLink></li>
            ))}
          </ul>
          <p style={{ fontSize:'0.75rem', color:'hsl(var(--muted-foreground))', margin:0 }}>© {new Date().getFullYear()} XAU Journal</p>
        </div>
      </footer>
    </div>
  );
}

/* ── FAQ accordion item ─────────────────────────────────────────── */
import { useState } from 'react';
function FAQItem({ q, a, delay }) {
  const [open, setOpen] = useState(false);
  return (
    <div data-reveal data-delay={delay} style={{ borderBottom:'1px solid hsl(var(--border))' }}>
      <button onClick={()=>setOpen(o=>!o)} style={{ width:'100%', background:'none', border:'none', textAlign:'left', padding:'1.375rem 0', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem', color:'hsl(var(--foreground))' }}>
        <span style={{ fontSize:'0.9375rem', fontWeight:600, letterSpacing:'-0.01em' }}>{q}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transition:'transform 0.3s cubic-bezier(0.22,1,0.36,1)', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      <div style={{ overflow:'hidden', maxHeight: open ? '300px' : '0', transition:'max-height 0.4s cubic-bezier(0.22,1,0.36,1)', willChange:'max-height' }}>
        <p style={{ padding:'0 0 1.375rem', fontSize:'0.875rem', color:'hsl(var(--muted-foreground))', lineHeight:1.75, fontWeight:400, margin:0 }}>{a}</p>
      </div>
    </div>
  );
}