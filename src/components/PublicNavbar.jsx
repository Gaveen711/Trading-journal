import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion as Motion } from 'framer-motion';

import Logo from './Logo';
import { useAppTheme } from '../hooks/useAppTheme';
import { MoonStarsFill, SunFill } from 'react-bootstrap-icons';

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isLightMode, toggleTheme } = useAppTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [mobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'How it works' },
    { to: '/the-story', label: 'The Story' },
    { to: '/pricing', label: 'Pricing' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <>
      <header>
        <nav
          style={{ transform: 'translateX(-50%)' }}
          className={`fixed top-4 left-1/2 w-[calc(100%-2rem)] max-w-6xl z-[100] h-14 md:h-16 flex items-center justify-between px-5 md:px-8 backdrop-blur-xl border rounded-2xl md:rounded-full shadow-lg transition-all duration-500 ${isScrolled
            ? 'bg-background/90 border-border/40 shadow-xl'
            : 'bg-background/60 border-border/20 shadow-md'
            }`}
        >
          <button
            onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); navigate('/', { replace: true }); }}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity z-[101]"
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

          <div className="flex items-center gap-2.5 z-[101]">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full hover:bg-foreground/5 text-muted-foreground hover:text-foreground transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isLightMode ? <MoonStarsFill className="w-4 h-4" /> : <SunFill className="w-4 h-4" />}
            </button>
            <div className="hidden lg:block">
              <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300">
                <span>Get Started</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
              </button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-full border border-border/30 hover:bg-foreground/5 transition-all duration-200 text-muted-foreground hover:text-foreground" aria-label="Toggle menu">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {mobileMenuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden fixed inset-0 bg-background/98 backdrop-blur-xl z-[100] flex flex-col items-center justify-center gap-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <button onClick={() => setMobileMenuOpen(false)} className="absolute top-6 right-6 p-2 text-foreground/80 hover:text-foreground transition-colors z-[102]" aria-label="Close menu">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
              </button>
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
                <button onClick={() => navigate('/login')} className="cta active:scale-95 transition-all duration-300 w-full max-w-[280px]">
                  <span>Get started</span>
                  <svg width="15px" height="10px" viewBox="0 0 13 10"><path d="M1,5 L11,5" /><polyline points="8 1 12 5 8 9" /></svg>
                </button>
              </div>
            </Motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
