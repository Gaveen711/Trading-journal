import { Link, useLocation } from 'react-router-dom';
import { Discord, TwitterX } from 'react-bootstrap-icons';
import Logo from './Logo';

const FOOTER_LINKS = [
  { to: '/privacy', label: 'Privacy' },
  { to: '/terms-and-conditions', label: 'Terms' },
  { to: '/refund-policy', label: 'Refunds' },
  { to: '/the-story', label: 'The Story' },
  { to: '/contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  {
    id: 'x',
    label: 'X',
    href: 'https://x.com/xau_journal',
    description: 'Product updates and build notes',
    Icon: TwitterX,
  },
  {
    id: 'discord',
    label: 'Discord',
    href: 'https://discord.gg/smbNwBZC2',
    description: 'Community support and trader feedback',
    Icon: Discord,
  },
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
      {SOCIAL_LINKS.map(({ id, label, href, Icon }) => (
        <li key={id} className="icon-content">
          <a data-social={id} aria-label={label} href={href} target="_blank" rel="noopener noreferrer">
            <div className="filled" />
            <Icon />
          </a>
        </li>
      ))}
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
