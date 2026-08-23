import { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { ArrowUp } from 'lucide-react';
import { formatUtc, useUtcClock } from '../lib/goldSessions';
import { CTAButton, Wordmark } from './PublicSite';

const NAV_LINKS = [
  { to: '/', label: 'Product', index: '01' },
  { to: '/blogs', label: 'Blog', index: '02' },
  { to: '/pricing', label: 'Pricing', index: '03' },
  { to: '/contact', label: 'Contact', index: '04' },
];

function MenuClock() {
  const now = useUtcClock();
  return <span className='xj-num'>{formatUtc(now, false)} UTC</span>;
}

export function PublicNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    let frameId = 0;
    const update = () => {
      frameId = 0;
      const nextScrolled = window.scrollY > 16;
      const nextTop = window.scrollY > 620;
      setIsScrolled((current) => (current === nextScrolled ? current : nextScrolled));
      setShowScrollTop((current) => (current === nextTop ? current : nextTop));
    };
    const onScroll = () => {
      if (!frameId) frameId = window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const scrollToTop = (event) => {
    event.currentTarget.blur();
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  // Clicking the current route should return to the top rather than no-op.
  const handleSamePath = (to) => (event) => {
    if (to === location.pathname) {
      event.preventDefault();
      scrollToTop(event);
    }
  };

  return (
    <div className='xj' data-ux-skip='true'>
      <header>
        <nav className={isScrolled ? 'xj-nav is-scrolled' : 'xj-nav'} aria-label='Site'>
          <div className='xj-nav-inner'>
            <NavLink to='/' aria-label='xaujournal — home' onClick={handleSamePath('/')}>
              <Wordmark />
            </NavLink>

            <ul className='xj-nav-links'>
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={handleSamePath(to)}
                    className={({ isActive }) => (isActive ? 'is-active' : undefined)}
                  >
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <div className='xj-nav-cta'>
              <NavLink className='xj-nav-signin' to='/login?mode=signin'>Sign in</NavLink>
              <CTAButton onClick={() => navigate('/login?mode=signup')}>Start free</CTAButton>
              <button
                className='xj-burger'
                type='button'
                onClick={() => setMenuOpen((open) => !open)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls='xj-mobile-menu'
              >
                <svg viewBox='0 0 24 24' aria-hidden='true'>
                  {menuOpen ? <path d='M18 6L6 18M6 6l12 12' /> : <path d='M3 8h18M3 16h18' />}
                </svg>
              </button>
            </div>
          </div>
        </nav>

        <div id='xj-mobile-menu' className={menuOpen ? 'xj-menu is-open' : 'xj-menu'} aria-hidden={!menuOpen}>
          <nav aria-label='Mobile'>
            {NAV_LINKS.map(({ to, label, index }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                tabIndex={menuOpen ? 0 : -1}
                onClick={(event) => {
                  setMenuOpen(false);
                  handleSamePath(to)(event);
                }}
                className={({ isActive }) => (isActive ? 'is-active' : undefined)}
              >
                <small>{index}</small>
                {label}
              </NavLink>
            ))}
            <NavLink
              to='/login?mode=signin'
              tabIndex={menuOpen ? 0 : -1}
              onClick={() => setMenuOpen(false)}
            >
              <small>05</small>
              Sign in
            </NavLink>
          </nav>

          <CTAButton
            tabIndex={menuOpen ? 0 : -1}
            onClick={() => {
              setMenuOpen(false);
              navigate('/login?mode=signup');
            }}
          >
            Start free
          </CTAButton>

          <div className='xj-menu-foot'>
            <span>XAU/USD</span>
            {menuOpen ? <MenuClock /> : <span aria-hidden='true' />}
          </div>
        </div>
      </header>

      <button
        type='button'
        className={showScrollTop ? 'xj-top is-visible' : 'xj-top'}
        onClick={scrollToTop}
        aria-label='Scroll to top'
        aria-hidden={!showScrollTop}
        tabIndex={showScrollTop ? 0 : -1}
      >
        <ArrowUp aria-hidden='true' />
      </button>
    </div>
  );
}
