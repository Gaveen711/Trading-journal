import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import Logo from './Logo';
import { ArrowUp } from 'lucide-react';
import './PublicNavbar.css';
import '../pages/PublicExperience.css';

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const updateNavigation = () => {
      frameId = 0;
      const nextScrolled = window.scrollY > 20;
      const nextShowScrollTop = window.scrollY > 560;
      setIsScrolled((current) => current === nextScrolled ? current : nextScrolled);
      setShowScrollTop((current) => current === nextShowScrollTop ? current : nextShowScrollTop);
    };
    const handleScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updateNavigation);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    updateNavigation();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'How it works' },
    { to: '/the-story', label: 'The Story' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  const scrollToTop = (event) => {
    event.currentTarget.blur();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <>
      <header>
        <nav
          data-public-nav
          className={`fixed top-4 left-1/2 w-[calc(100%-2rem)] max-w-6xl z-[150] h-14 md:h-16 flex items-center justify-between px-5 md:px-8 backdrop-blur-xl border rounded-2xl md:rounded-full shadow-lg transition-all duration-300 will-change-transform ${isScrolled
            ? 'bg-background/90 border-border/40 shadow-xl'
            : 'bg-background/60 border-border/20 shadow-md'
            }`}
        >
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/', { replace: true }); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[151]"
            aria-label="Go to XAU Journal home"
          >
            <Logo iconSize="w-6 h-6" />
          </button>

          <ul className="hidden lg:flex items-center gap-1 lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
            {navLinks.map(({ to, label }) => (
              <Motion.li key={to} whileHover={{ y: -1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
                <NavLink
                  to={to}
                  onClick={(e) => {
                    if (to === location.pathname) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (to.startsWith('/#')) {
                      const hash = to.split('#')[1];
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const el = document.getElementById(hash);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }}
                  className={({ isActive }) =>
                    `text-[15px] font-semibold px-5 py-2.5 rounded-full transition-all duration-200 ${isActive
                      ? 'text-foreground bg-foreground/5'
                      : 'text-muted-foreground hover:text-foreground hover:bg-foreground/5'
                    }`
                  }
                >
                  {label}
                </NavLink>
              </Motion.li>
            ))}
          </ul>

          <div className="flex items-center gap-2.5 z-[151]">
            <div className="hidden lg:block">
              <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300">
                <svg viewBox="0 0 24 24" className="arr-2" aria-hidden="true">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
                <span className="text">Get Started</span>
                <span className="circle" aria-hidden="true" />
                <svg viewBox="0 0 24 24" className="arr-1" aria-hidden="true">
                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                </svg>
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-full border border-border/30 hover:bg-foreground/5 transition-all duration-200 text-muted-foreground hover:text-foreground" aria-label="Toggle menu" aria-expanded={mobileMenuOpen} aria-controls="public-mobile-menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              id="public-mobile-menu"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[140] flex flex-col items-center justify-center gap-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="flex flex-col items-center justify-center gap-8" onClick={(e) => e.stopPropagation()}>
                {navLinks.map(({ to, label }) => (
                  <NavLink key={to} to={to} onClick={(e) => {
                    setMobileMenuOpen(false);
                    if (to === location.pathname) {
                      e.preventDefault();
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    } else if (to.startsWith('/#')) {
                      const hash = to.split('#')[1];
                      if (location.pathname === '/') {
                        e.preventDefault();
                        const el = document.getElementById(hash);
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }} className={({ isActive }) =>
                    `text-3xl font-bold tracking-tight transition-colors ${isActive ? 'text-primary' : 'hover:text-primary'
                    }`
                  }>
                    {label}
                  </NavLink>
                ))}
                <button onClick={() => { setMobileMenuOpen(false); navigate('/login'); }} className="cta cta-mobile active:scale-95 transition-all duration-300">
                  <svg viewBox="0 0 24 24" className="arr-2" aria-hidden="true">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                  <span className="text">Get Started</span>
                  <span className="circle" aria-hidden="true" />
                  <svg viewBox="0 0 24 24" className="arr-1" aria-hidden="true">
                    <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                  </svg>
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>

      <button
        type="button"
        className={'public-scroll-top' + (showScrollTop ? ' is-visible' : '')}
        onClick={scrollToTop}
        aria-label="Scroll to top"
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ArrowUp aria-hidden="true" />
      </button>

    </>
  );
}
