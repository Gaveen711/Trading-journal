import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { Hero } from '../components/landing/Hero';
import { BrokerWall } from '../components/landing/BrokerWall';
import { Chapters } from '../components/landing/Chapters';
import { Proof } from '../components/landing/Proof';
import { PricingBridge } from '../components/landing/PricingBridge';
import { FAQ } from '../components/landing/FAQ';
import { FinalCTA } from '../components/landing/FinalCTA';
import { useDeskReveal } from '../lib/goldSessions';
import {
  LANDING_FAQ,
  applyPageSEO,
  buildFAQSchema,
  buildOrganizationSchema,
  buildSoftwareSchema,
  buildWebSiteSchema,
  injectJsonLd,
  removeJsonLd,
} from '../lib/seo';
import './LandingPage.css';

/* ————————————————————————————————————————————————————————————————
   xaujournal — landing page, "Lightbox" direction (Vitrine, round 4).

   The real product is the hero: captures of the working dashboard
   (public/shots, generated from the showcase routes) sit on a tilted
   lightbox stack under museum glass. Every figure quoted in a caption
   is derived from the one sample record in src/lib/deskDemo.js — the
   same record the screenshots were rendered from — so the page can
   never show two numbers that disagree.

   Section files live in src/components/landing/. This file only
   composes them and owns the page-level SEO.
   ———————————————————————————————————————————————————————————————— */

function useLandingSchemas() {
  useEffect(() => {
    injectJsonLd('ld-organization', buildOrganizationSchema());
    injectJsonLd('ld-website', buildWebSiteSchema());
    injectJsonLd('ld-software', buildSoftwareSchema());
    injectJsonLd('ld-faq', buildFAQSchema(LANDING_FAQ));
    return () => {
      removeJsonLd('ld-organization');
      removeJsonLd('ld-website');
      removeJsonLd('ld-software');
      removeJsonLd('ld-faq');
    };
  }, []);
}

function useLandingStory(pageRef) {
  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const sections = [...page.querySelectorAll('.landing-story > .xj-section')];
    sections.forEach((section, index) => {
      section.classList.add('landing-story-section');
      section.style.setProperty('--story-x', index % 2 === 0 ? '28%' : '72%');
    });

    const revealAll = () => sections.forEach((section) => section.classList.add('is-story-visible'));
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
      revealAll();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-story-visible');
        observer.unobserve(entry.target);
      }),
      { threshold: 0.08, rootMargin: '0px 0px -12% 0px' },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pageRef]);
}

export function LandingPage() {
  const pageRef = useRef(null);
  const location = useLocation();
  useLandingSchemas();
  useDeskReveal();
  useLandingStory(pageRef);

  useEffect(() => {
    applyPageSEO(location.pathname);
  }, [location.pathname]);

  return (
    <div ref={pageRef} className="landing-pixel-page">
      <div className="landing-pixel-page__content">
        <PublicNavbar />
        <div className='xj xl' data-ux-skip='true'>
          <main className='landing-story' data-ux-skip='true'>
            <Hero />
            <BrokerWall />
            <Chapters />
            <Proof />
            <PricingBridge />
            <FAQ />
            <FinalCTA />
          </main>
        </div>
        <PublicFooter />
      </div>
    </div>
  );
}
