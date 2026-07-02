import { Link, useLocation } from 'react-router-dom';
import { Discord, Facebook, Instagram, TwitterX } from 'react-bootstrap-icons';
import Logo from './Logo';

const FOOTER_LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms-and-conditions', label: 'Terms' },
  { to: '/refund-policy', label: 'Refunds' },
  { to: '/the-story', label: 'The Story' },
  { to: '/contact', label: 'Contact' },
];

function normalizePath(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function FooterNav({ className, linkClassName, style }) {
  const location = useLocation();
  const currentPath = normalizePath(location.pathname);
  const links = FOOTER_LINKS.filter((link) => normalizePath(link.to) !== currentPath);

  return (
    <nav className={className} style={style} aria-label="Footer navigation">
      {links.map((link) => (
        <Link key={link.to} to={link.to} className={linkClassName}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}

export function SocialLinks({ className = '' }) {
  return (
    <ul className={`example-2 ${className}`} aria-label="Social links">
      <li className="icon-content">
        <a data-social="facebook" aria-label="Facebook" href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer">
          <div className="filled" />
          <Facebook />
        </a>
      </li>
      <li className="icon-content">
        <a data-social="instagram" aria-label="Instagram" href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
          <div className="filled" />
          <Instagram />
        </a>
      </li>
      <li className="icon-content">
        <a data-social="x" aria-label="X" href="https://x.com/xau_journal" target="_blank" rel="noopener noreferrer">
          <div className="filled" />
          <TwitterX />
        </a>
      </li>
      <li className="icon-content">
        <a data-social="discord" aria-label="Discord" href="https://discord.gg/smbNwBZC2" target="_blank" rel="noopener noreferrer">
          <div className="filled" />
          <Discord />
        </a>
      </li>
    </ul>
  );
}

export function PublicFooter({ className = '', style }) {
  return (
    <footer className={`site-footer ${className}`} style={style}>
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <Logo iconSize="w-7 h-7" />
          <p>Focused XAUUSD trade review, broker sync, and decision intelligence for disciplined traders.</p>
        </div>

        <div className="site-footer__menu">
          <FooterNav
            className="site-footer__nav"
            linkClassName="site-footer__link"
          />
          <SocialLinks />
        </div>

        <div className="site-footer__meta">
          <p>Copyright 2026 Xau Journal. All Rights Reserved.</p>
          <span>Built for private review workflows.</span>
        </div>
      </div>
    </footer>
  );
}
