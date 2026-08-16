import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { Arrow, CTALink } from '../components/PublicSite';
import { studyArticles, studyCategories } from '../data/study';
import { useDeskReveal } from '../lib/goldSessions';
import { applyPageSEO } from '../lib/seo';
import './PublicSite.css';

/** One shelf slide. The whole card is the link; the spine names its shelf. */
function StudyCard({ article }) {
  return (
    <Link className='xj-glass xjs-card' to={`/blogs/${article.slug}`}>
      <span className='xjs-card-spine' aria-hidden='true'>{article.category}</span>
      <h3>{article.title}</h3>
      <p className='xjs-card-summary'>{article.summary}</p>
      <p className='xjs-card-meta'>
        <span>{article.level}</span>
        <span aria-hidden='true'>·</span>
        <span>{article.readMinutes} min</span>
        <Arrow />
      </p>
    </Link>
  );
}

export function BlogsPage() {
  const location = useLocation();
  useDeskReveal();

  useEffect(() => {
    applyPageSEO(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <header className='xj-cover' aria-label='The study'>
            <div className='xj-shell xj-settle'>
              <p className='xj-eyebrow'>Study materials — XAUUSD</p>
              <h1 className='xj-h1'>The <em>study</em></h1>
              <p className='xj-lede'>
                {studyArticles.length} short reads that take you from a raw XAUUSD quote to a
                position sized on purpose — written for people trading gold for the first time.
              </p>
            </div>
          </header>

          {studyCategories.map((category, index) => {
            const shelf = studyArticles.filter((article) => article.category === category);
            const headingId = `study-shelf-${index + 1}`;
            return (
              <section key={category} className='xj-section' aria-labelledby={headingId}>
                <div className='xj-shell'>
                  <div className='xjs-shelf-head'>
                    <span className='xj-label'>{String(index + 1).padStart(2, '0')}</span>
                    <h2 id={headingId}>{category}</h2>
                    <i className='xjs-shelf-rule' aria-hidden='true' />
                    <span className='xj-label'>{shelf.length} articles</span>
                  </div>
                  <div className='xj-reveal grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                    {shelf.map((article) => <StudyCard key={article.slug} article={article} />)}
                  </div>
                </div>
              </section>
            );
          })}

          <section className='xj-section' aria-labelledby='study-cta-heading'>
            <div className='xj-shell xj-close-row'>
              <div>
                <p className='xj-eyebrow'>Next step</p>
                <h2 id='study-cta-heading' className='xj-h2'>Journal what you <em>learn.</em></h2>
                <p className='xj-lede'>
                  Reading builds the map. The record of your own trades is the territory —
                  start it before the next London open.
                </p>
              </div>
              <div className='xj-actions'>
                <CTALink to='/login?mode=signup'>Start your journal</CTALink>
                <small>Free plan · no card required</small>
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
