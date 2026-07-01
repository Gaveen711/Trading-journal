import { Link, useLocation } from 'react-router-dom';

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
