import { useEffect, useState, useSyncExternalStore } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { Arrow, CTALink, TextLink } from '../components/PublicSite';
import { getArticle, studyArticles } from '../data/study';
import { useDeskReveal } from '../lib/goldSessions';
import { applyArticleSEO, removeJsonLd } from '../lib/seo';
import { NotFoundPage } from './NotFoundPage';
import './PublicSite.css';
import './Blog.css';

/* ————————————————————————————————————————————————————————————————
   /blogs/:slug — one study note. A sticky table of contents tracks the
   section being read (the page's only amber mark), the body runs in a
   68ch measure, and the takeaways sit on a ruled pane after it. Prev
   and next follow the hub's order: newest first, ties in reading order.
   ———————————————————————————————————————————————————————————————— */

/** Same order as the hub: newest first, ties keep reading order (sort is stable). */
const NOTES = [...studyArticles].sort((a, b) => b.updated.localeCompare(a.updated));

/** Query key the hub reads to preselect a category filter. */
const CATEGORY_PARAM = 'category';

/**
 * The one italic word per headline, chosen by hand where a title carries it
 * naturally. Titles absent from this map render plain — emphasis is never
 * forced into data. If a title changes so the word no longer appears, the
 * title falls back to plain text rather than breaking.
 */
const TITLE_EMPHASIS = {
  'what-spot-gold-trading-is': 'spot',
  'pips-points-lots-gold-position-size': 'sizing',
  'order-types-and-execution': 'exits',
  'why-keep-a-trading-journal': 'journal',
  'what-moves-the-gold-price': 'moves',
  'gold-trading-sessions-explained': 'matter',
  'reading-gold-candlestick-charts': 'gold',
  'risk-per-trade-position-sizing-gold': 'rule',
  'risk-reward-win-rate-expectancy': 'enough',
};

const RAIL_QUERY = '(min-width: 960px)';

/** '2026-08-16' → '16 Aug 2026', pinned to UTC so the date never drifts a day. */
function formatUpdated(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

/** 'Why “pip” is a slippery word on gold' → 'why-pip-is-a-slippery-word-on-gold' */
function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

/** Section anchors, unique even if two headings slugify alike. */
function sectionIds(sections) {
  const seen = new Map();
  return sections.map(({ heading }) => {
    const base = slugify(heading) || 'section';
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    return n ? `${base}-${n + 1}` : base;
  });
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function Headline({ title, emphasis }) {
  if (!emphasis) return title;
  const at = title.search(new RegExp(`\\b${escapeRegExp(emphasis)}\\b`));
  if (at < 0) return title;
  return (
    <>
      {title.slice(0, at)}
      <em>{emphasis}</em>
      {title.slice(at + emphasis.length)}
    </>
  );
}

/* The rail breakpoint, read through useSyncExternalStore so the contents
   render as a sticky rail on wide screens and fold into a <details> below
   it — without two copies of the list in the DOM. */
function subscribeRail(onChange) {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return () => {};
  const query = window.matchMedia(RAIL_QUERY);
  query.addEventListener('change', onChange);
  return () => query.removeEventListener('change', onChange);
}

function readRail() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
  return window.matchMedia(RAIL_QUERY).matches;
}

function useRail() {
  return useSyncExternalStore(subscribeRail, readRail, readRail);
}

/**
 * Which section is being read. `key` is the section ids joined by '\n' so
 * the effect only re-runs when the article changes. The current section is
 * the last one whose top has passed a reading line 40% down the viewport;
 * an IntersectionObserver on that band wakes the check, so nothing runs
 * per scroll frame.
 */
function useCurrentSection(key) {
  const [current, setCurrent] = useState('');

  useEffect(() => {
    const ids = key ? key.split('\n') : [];
    setCurrent(ids[0] ?? '');
    if (!ids.length || typeof IntersectionObserver === 'undefined') return undefined;
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!sections.length) return undefined;

    const pick = () => {
      const line = window.innerHeight * 0.4;
      let found = sections[0].id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= line) found = section.id;
        else break;
      }
      setCurrent(found);
    };

    const observer = new IntersectionObserver(pick, {
      rootMargin: '-96px 0px -60% 0px',
      threshold: [0, 1],
    });
    sections.forEach((section) => observer.observe(section));
    pick();
    return () => observer.disconnect();
  }, [key]);

  return current;
}

function Contents({ entries, current }) {
  return (
    <ol>
      {entries.map(({ id, heading }) => (
        <li key={id}>
          <a
            href={`#${id}`}
            className={id === current ? 'is-current' : undefined}
            aria-current={id === current ? 'location' : undefined}
          >
            {heading}
          </a>
        </li>
      ))}
    </ol>
  );
}

function MissingArticle() {
  return (
    <>
      <PublicNavbar />
      <div className='xj xba-missing' data-ux-skip='true'>
        <NotFoundPage />
      </div>
      <PublicFooter />
    </>
  );
}

export function BlogArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);
  const rail = useRail();
  useDeskReveal();

  const ids = article ? sectionIds(article.sections) : [];
  const current = useCurrentSection(ids.join('\n'));

  useEffect(() => {
    if (!article) return undefined;
    // Runs after the app-shell PageSEO effect (PageSEO renders earlier in
    // App's tree), so the article's title/canonical/JSON-LD win the route change.
    applyArticleSEO(article);
    return () => removeJsonLd('article-schema');
  }, [article]);

  // Unknown slug: a real not-found page (noindex, no canonical) inside the
  // site chrome — never a redirect, which search engines read as a soft 404.
  if (!article) return <MissingArticle />;

  const index = NOTES.findIndex((entry) => entry.slug === article.slug);
  const previous = index > 0 ? NOTES[index - 1] : null;
  const next = index < NOTES.length - 1 ? NOTES[index + 1] : null;
  const entries = article.sections.map((section, i) => ({ id: ids[i], heading: section.heading }));
  const hubWithCategory = `/blogs?${CATEGORY_PARAM}=${encodeURIComponent(article.category)}`;

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <article aria-labelledby='xba-title'>
            <header className='xj-cover xba-head'>
              <div className='xj-shell xj-settle'>
                <div className='xba-head-bar'>
                  <Link className='xba-cat' to={hubWithCategory} aria-label={`All notes in ${article.category}`}>
                    <Arrow />
                    {article.category}
                  </Link>
                  <p className='xba-meta'>
                    <span>{article.level}</span>
                    <span>{article.readMinutes} min read</span>
                    <span>
                      Updated <time dateTime={article.updated}>{formatUpdated(article.updated)}</time>
                    </span>
                  </p>
                </div>
                <h1 id='xba-title' className='xj-h1 xba-title'>
                  <Headline title={article.title} emphasis={TITLE_EMPHASIS[article.slug]} />
                </h1>
                <p className='xj-lede'>{article.summary}</p>
              </div>
            </header>

            <div className='xj-shell xba-body'>
              <div className='xba-layout'>
                <nav className='xba-rail xba-toc' aria-label='On this page'>
                  {rail ? (
                    <>
                      <p className='xj-label'>On this page</p>
                      <Contents entries={entries} current={current} />
                    </>
                  ) : (
                    <details className='xj-glass'>
                      <summary>
                        On this page
                        <ChevronDown aria-hidden='true' strokeWidth={1.6} />
                      </summary>
                      <Contents entries={entries} current={current} />
                    </details>
                  )}
                </nav>

                <div>
                  <div className='xba-prose'>
                    {article.sections.map(({ heading, paragraphs }, i) => (
                      <section key={ids[i]} id={ids[i]} aria-labelledby={`${ids[i]}-heading`}>
                        <h2 id={`${ids[i]}-heading`}>{heading}</h2>
                        {paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
                      </section>
                    ))}
                  </div>

                  <section className='xj-glass xba-takeaways xj-reveal' aria-labelledby='xba-takeaways-heading'>
                    <div className='xj-panel-bar'>
                      <strong id='xba-takeaways-heading'>Takeaways</strong>
                      <span>From {article.sources.length} sources</span>
                    </div>
                    <ul className='xbh-ruled'>
                      {article.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
                    </ul>
                  </section>

                  <section className='xba-sources' aria-labelledby='xba-sources-heading'>
                    <h2 id='xba-sources-heading'>Sources</h2>
                    <p>This note was written from the references below; the takeaways summarise them.</p>
                    <ul>
                      {article.sources.map(({ label, url }) => (
                        <li key={url}>
                          <TextLink to={url} external>{label}</TextLink>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </article>

          <div className='xj-shell xba-after'>
            <nav className='xba-pager xj-reveal' aria-label='More notes'>
              {previous ? (
                <Link className='xj-glass' rel='prev' to={`/blogs/${previous.slug}`}>
                  <span className='xj-label'>Previous</span>
                  <strong>{previous.title}</strong>
                </Link>
              ) : <span aria-hidden='true' />}
              {next ? (
                <Link className='xj-glass is-next' rel='next' to={`/blogs/${next.slug}`}>
                  <span className='xj-label'>Next</span>
                  <strong>{next.title}</strong>
                </Link>
              ) : null}
            </nav>

            <aside className='xj-glass xba-cta xj-reveal' aria-labelledby='xba-cta-heading'>
              <div>
                <h2 id='xba-cta-heading'>Put it in the <em>journal</em>.</h2>
                <p>
                  A note only changes your trading if it shows up in your next entry.
                  Log the setup, the session and the exit — the review does the rest.
                </p>
              </div>
              <div className='xj-actions'>
                <CTALink to='/login?mode=signup'>Start free</CTALink>
                <small>Free plan · no card required</small>
              </div>
            </aside>
          </div>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
