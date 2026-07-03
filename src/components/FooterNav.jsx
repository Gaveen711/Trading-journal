import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Discord, TwitterX, Facebook, Instagram } from 'react-bootstrap-icons';
import { Mail, Globe, Clock } from 'lucide-react';
import Logo from './Logo';
import FooterBackgroundGradient from './footer-background-gradient';
import { TextHoverEffect } from './text-hover-effect';

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
    Icon: TwitterX,
  },
  {
    id: 'discord',
    label: 'Discord',
    href: 'https://discord.gg/smbNwBZC2',
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
    <footer className={`bg-[#0F0F11]/10 relative h-fit rounded-3xl overflow-hidden m-4 md:m-8 border border-border/5 ${className}`} style={style}>
      <div className="max-w-7xl mx-auto p-8 md:p-14 z-[60] relative text-muted-foreground">
        {/* Main grid for the footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 lg:gap-16 pb-12">

          {/* Section 1: Social Media Icons */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-white text-lg font-semibold mb-6">Follow Us</h4>
            <div className="xau-footer-social-wrapper">
              <a
                href="https://x.com/xau_journal"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter X"
              >
                <TwitterX className="icons-social-media" id="x" />
              </a>

              <a
                href="https://discord.gg/smbNwBZC2"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Discord"
              >
                <Discord className="icons-social-media" id="discord" />
              </a>

              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <Facebook className="icons-social-media" id="facebook" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <Instagram className="icons-social-media" id="instagram" />
              </a>
            </div>
          </div>

          {/* Section 2: Explore links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Explore</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/the-story" className="xau-footer-link">
                  The Story
                </Link>
              </li>
              <li>
                <Link to="/contact" className="xau-footer-link">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="xau-footer-link">
                  Pricing Plans
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Legal & Help */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Legal & Help</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/privacy" className="xau-footer-link">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="xau-footer-link">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="xau-footer-link">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 4: Contact Us */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-6">Get Support</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary shrink-0" />
                <a
                  href="mailto:info@xaujournal.com"
                  className="xau-footer-link break-all"
                >
                  info@xaujournal.com
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Clock size={18} className="text-primary shrink-0" />
                <span>Response within 1 day</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Separator line */}
        <hr className="border-t border-border/10 my-8" />

        {/* Bottom section: copyright */}
        <div className="flex justify-center items-center text-sm">
          {/* Copyright text */}
          <div className="text-center">
            <p>&copy; {new Date().getFullYear()} Xau Journal. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Animated Text Effect */}
      <div className="w-full flex h-[10rem] sm:h-[18rem] md:h-[24rem] lg:h-[30rem] -mt-16 sm:-mt-28 md:-mt-40 lg:-mt-52 -mb-8 sm:-mb-16 md:-mb-24 lg:-mb-36 overflow-hidden">
        <TextHoverEffect text="xaujournal" className="z-10" />
      </div>

      <FooterBackgroundGradient />
    </footer>
  );
}
