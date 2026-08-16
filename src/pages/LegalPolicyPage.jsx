import { useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { CTALink, Panel } from '../components/PublicSite';
import './PublicSite.css';

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
    setMeta('og:title', seo.title, true);
    setMeta('og:description', seo.description, true);
    setMeta('og:type', 'website', true);
    setMeta('twitter:card', 'summary');
    setMeta('twitter:title', seo.title);
    setMeta('twitter:description', seo.description);

    // Canonical and og:url are owned by PageSEO -> applyPageSEO(). This page's
    // chunk resolves after that effect, so writing them here overwrote the
    // shared policy with a different host.

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
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <header className='xj-cover' aria-label={`${title} ${accent}`}>
            <div className='xj-shell xj-legal-grid'>
              <div className='xj-settle'>
                <p className='xj-eyebrow'>{code} · {eyebrow}</p>
                <h1 className='xj-h1'>{title} <em>{accent}</em></h1>
                <p className='xj-lede'>{lede}</p>
              </div>

              <Panel className='xj-record' label='Public record' meta={code} aria-label='Policy record details'>
                <dl>
                  <div><dt>Document</dt><dd>{code} / {new Date().getFullYear()}</dd></div>
                  <div><dt>Status</dt><dd>Active</dd></div>
                  <div><dt>Last updated</dt><dd>{updated}</dd></div>
                  <div><dt>Owner</dt><dd>xaujournal</dd></div>
                  <div><dt>Sections</dt><dd>{sections.length}</dd></div>
                </dl>
              </Panel>
            </div>
          </header>

          <section className='xj-section'>
            <div className='xj-shell'>
              <div className='xj-legal-body'>
                <aside className='xj-legal-toc'>
                  <p className='xj-label'>Contents</p>
                  <nav aria-label={`${title} ${accent} sections`}>
                    {sections.map((section) => (
                      <a key={section.id} href={`#${section.id}`}>
                        <span>{section.title.split('.')[0].padStart(2, '0')}</span>
                        {section.title.split('. ')[1] || section.title}
                      </a>
                    ))}
                  </nav>
                </aside>

                <article>
                  {guarantee ? (
                    <div className='xj-legal-guarantee'>
                      <ShieldCheck aria-hidden='true' />
                      <div>
                        <span>First Pro payment — 7-day guarantee</span>
                        <strong>{guarantee}</strong>
                      </div>
                    </div>
                  ) : null}

                  <div className='xj-legal-summary' style={guarantee ? { marginTop: 20 } : undefined}>
                    <span>In brief</span>
                    <p>{summary}</p>
                  </div>

                  <div className='xj-legal-sections'>
                    {sections.map((section) => {
                      const [number, heading = section.title] = section.title.split('. ');
                      return (
                        <section key={section.id} id={section.id} className='xj-legal-section'>
                          <span>{number.padStart(2, '0')}</span>
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
            </div>
          </section>

          <section className='xj-section' aria-label='Questions about this policy'>
            <div className='xj-shell'>
              <div className='xj-close-row'>
                <h2 className='xj-h2'>Questions about <em>this policy?</em></h2>
                <div className='xj-actions'>
                  <CTALink to='/contact'>Contact support</CTALink>
                  <a className='xj-link' href='mailto:info@xaujournal.com'>info@xaujournal.com</a>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
