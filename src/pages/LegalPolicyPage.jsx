import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck2, Mail } from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import './PublicEditorial.css';

function usePolicySeo(seo) {
  useEffect(() => {
    document.title = seo.title;

    const setMeta = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }

      element.setAttribute('content', content);
    };

    setMeta('description', seo.description);
    setMeta('keywords', seo.keywords);
    setMeta('robots', 'index, follow');
    setMeta('og:title', seo.title, true);
    setMeta('og:description', seo.description, true);
    setMeta('og:type', 'website', true);
    setMeta('og:url', seo.canonical, true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seo.canonical);

    document.body.style.overflow = '';
    window.scrollTo(0, 0);
  }, [seo]);
}

export function LegalPolicyPage({
  seo,
  code,
  eyebrow,
  title,
  accent,
  lede,
  summary,
  sections,
  guarantee,
}) {
  usePolicySeo(seo);

  const updated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div data-ux-skip="true">
      <PublicNavbar />

      <main className="xep-page xep-legal-page">
        <header className="xep-legal-hero">
          <div className="xep-shell">
            <div className="xep-legal-hero-grid">
              <div>
                <p className="xep-kicker"><span>{code}</span>{eyebrow}</p>
                <h1 className="xep-title">{title}<br /><em>{accent}</em></h1>
                <p className="xep-lede">{lede}</p>
              </div>

              <aside className="xep-policy-card" aria-label="Policy record details">
                <div className="xep-policy-card-head">
                  <FileCheck2 aria-hidden="true" />
                  <span>Public record</span>
                </div>
                <dl>
                  <div><dt>Document</dt><dd>{code} / {new Date().getFullYear()}</dd></div>
                  <div><dt>Status</dt><dd>Active</dd></div>
                  <div><dt>Last updated</dt><dd>{updated}</dd></div>
                  <div><dt>Owner</dt><dd>XAU Journal</dd></div>
                </dl>
                <div className="xep-policy-card-foot">Plain-language register / effective immediately</div>
              </aside>
            </div>

            <div className="xep-casebar" aria-label="Policy filing details">
              <span>Register / {code}</span>
              <span>XAU Journal / Public record</span>
              <span>{sections.length} sections</span>
            </div>
          </div>
        </header>

        <section className="xep-section xep-section--sheet">
          <div className="xep-shell xep-legal-grid">
            <aside className="xep-legal-toc">
              <p className="xep-rule-label">Contents</p>
              <nav aria-label={`${title} ${accent} sections`}>
                {sections.map((section) => (
                  <a key={section.id} href={`#${section.id}`}>
                    <span>{section.title.split('.')[0].padStart(2, '0')}</span>
                    {section.title.split('. ')[1] || section.title}
                  </a>
                ))}
              </nav>
            </aside>

            <article className="xep-legal-document">
              {guarantee && (
                <div className="xep-legal-guarantee">
                  <span className="xep-stamp">7 day<br />guarantee</span>
                  <div>
                    <p className="xep-rule-label">First Pro payment</p>
                    <strong>{guarantee}</strong>
                  </div>
                </div>
              )}

              <div className="xep-legal-summary">
                <span>In brief</span>
                <p>{summary}</p>
              </div>

              <div className="xep-legal-sections">
                {sections.map((section) => {
                  const [number, heading = section.title] = section.title.split('. ');
                  return (
                    <section key={section.id} id={section.id} className="xep-legal-section">
                      <span className="xep-legal-number">{number.padStart(2, '0')}</span>
                      <div>
                        <h2>{heading}</h2>
                        {section.content.split('\n\n').map((block, index) => (
                          <p key={`${section.id}-${index}`}>{block}</p>
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            </article>
          </div>
        </section>

        <section className="xep-section xep-section--night xep-legal-help">
          <div className="xep-shell">
            <p className="xep-kicker"><span>?</span>Clarification desk</p>
            <div>
              <h2 className="xep-heading">Questions about<br /><em>this policy?</em></h2>
              <p className="xep-lede">Ask before you connect an account, start a subscription, or share information with XAU Journal.</p>
              <div className="xep-actions">
                <Link className="xep-button xep-button--primary" to="/contact">Contact support <ArrowRight aria-hidden="true" /></Link>
                <a className="xep-button xep-button--quiet" href="mailto:info@xaujournal.com"><Mail aria-hidden="true" /> info@xaujournal.com</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
