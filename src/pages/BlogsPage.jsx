import { useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { Arrow, CTAButton, CTALink } from '../components/PublicSite';
import { studyArticles, studyCategories } from '../data/study';
import { useDeskReveal } from '../lib/goldSessions';
import { applyPageSEO } from '../lib/seo';
import './PublicSite.css';
import './Blog.css';

/* ————————————————————————————————————————————————————————————————
   /blogs — "Study notes". The most recently updated note sits on a
   featured plate; the rest filter by category into a grid of cards.
   The active filter lives in the URL (?category=…) so an article's
   category chip can deep-link back here with its shelf preselected.
   ———————————————————————————————————————————————————————————————— */

/** Query key the article page's category chip deep-links with: /blogs?category=… */
const CATEGORY_PARAM = 'category';

/** Newest first. Ties keep the library's reading order (sort is stable). */
const NOTES = [...studyArticles].sort((a, b) => b.updated.localeCompare(a.updated));

const READ_MINUTES = NOTES.map((note) => note.readMinutes);
const SHORTEST_READ = Math.min(...READ_MINUTES);
const LONGEST_READ = Math.max(...READ_MINUTES);
const READ_RANGE = SHORTEST_READ === LONGEST_READ ? `${SHORTEST_READ}` : `${SHORTEST_READ}–${LONGEST_READ}`;

const COUNTS = studyCategories.map((category) => ({
  category,
  count: NOTES.filter((note) => note.category === category).length,
}));

const FEATURED_TAKEAWAYS = 3;

/** '2026-08-16' → '16 Aug 2026', pinned to UTC so the date never drifts a day. */
function formatUpdated(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

function FeaturedNote({ note }) {
  const shown = note.takeaways.slice(0, FEATURED_TAKEAWAYS);
  const rest = note.takeaways.length - shown.length;
  return (
    <section className='xj-glass xbh-feature xj-reveal' aria-labelledby='xbh-feature-title'>
      <div className='xj-panel-bar'>
        <strong>Latest note</strong>
        <span>Updated <time dateTime={note.updated}>{formatUpdated(note.updated)}</time></span>
      </div>
      <div className='xbh-feature-body'>
        <div className='xbh-feature-main'>
          <p className='xbh-meta'>
            <span>{note.category}</span>
            <span>{note.level}</span>
            <span>{note.readMinutes} min</span>
          </p>
          <h2 id='xbh-feature-title' className='xbh-feature-title'>
            <Link to={`/blogs/${note.slug}`}>{note.title}</Link>
          </h2>
          <p className='xbh-feature-summary'>{note.summary}</p>
          <CTALink to={`/blogs/${note.slug}`}>Read</CTALink>
        </div>
        <aside className='xbh-notes-pane' aria-label='Takeaways from the latest note'>
          <p className='xj-label'>Takeaways</p>
          <ul className='xbh-ruled'>
            {shown.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
          </ul>
          {rest > 0 ? (
            <p className='xbh-notes-more'>+{rest} more in the note</p>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function NoteCard({ note }) {
  return (
    <li>
      <Link className='xj-glass xbh-card' to={`/blogs/${note.slug}`}>
        <p className='xbh-meta'>
          <span>{note.category}</span>
          <span>{note.level}</span>
          <span className='xbh-meta-end'>{note.readMinutes} min</span>
        </p>
        <h3 className='xbh-card-title'>{note.title}</h3>
        <p className='xbh-card-summary'>{note.summary}</p>
        <p className='xbh-card-foot'>
          <span>Updated <time dateTime={note.updated}>{formatUpdated(note.updated)}</time></span>
          <Arrow />
        </p>
      </Link>
    </li>
  );
}

export function BlogsPage() {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  useDeskReveal();

  useEffect(() => {
    applyPageSEO(location.pathname);
  }, [location.pathname]);

  const requested = searchParams.get(CATEGORY_PARAM);
  const active = requested ?? 'all';
  const visible = requested ? NOTES.filter((note) => note.category === requested) : NOTES;
  const featured = NOTES[0];

  const select = (category) => {
    const next = new URLSearchParams(searchParams);
    if (category) next.set(CATEGORY_PARAM, category);
    else next.delete(CATEGORY_PARAM);
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <header className='xj-cover' aria-labelledby='xbh-title'>
            <div className='xj-shell xj-settle'>
              <p className='xj-eyebrow'>Study notes</p>
              <h1 id='xbh-title' className='xj-h1'>Read before the <em>open</em>.</h1>
              <p className='xj-lede'>
                Short, sourced reading on gold, its sessions and risk — written for traders who
                keep a journal. Every note ends with the references it was written from.
              </p>
              <p className='xbh-index xj-num'>
                {NOTES.length} notes · {studyCategories.length} categories · {READ_RANGE} min each
              </p>
            </div>
          </header>

          <div className='xbh-feature-section'>
            <div className='xj-shell'>
              <FeaturedNote note={featured} />
            </div>
          </div>

          <section className='xj-section' aria-labelledby='xbh-all-title'>
            <div className='xj-shell'>
              <div className='xbh-toolbar'>
                <h2 id='xbh-all-title' className='xbh-h2'>All notes</h2>
                <div className='xbh-chips' role='group' aria-label='Filter notes by category'>
                  <button
                    type='button'
                    className='xbh-chip'
                    aria-pressed={active === 'all'}
                    onClick={() => select(null)}
                  >
                    All <span className='xj-num'>{NOTES.length}</span>
                  </button>
                  {COUNTS.map(({ category, count }) => (
                    <button
                      key={category}
                      type='button'
                      className='xbh-chip'
                      aria-pressed={active === category}
                      onClick={() => select(category)}
                    >
                      {category} <span className='xj-num'>{count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <p className='xj-sr' role='status'>
                {visible.length === 1 ? 'Showing 1 note' : `Showing ${visible.length} notes`}
                {requested ? ` in ${requested}` : ''}
              </p>

              {visible.length ? (
                <ul className='xbh-grid' aria-label='Notes'>
                  {visible.map((note) => <NoteCard key={note.slug} note={note} />)}
                </ul>
              ) : (
                <div className='xj-glass xbh-empty'>
                  <strong>No notes are filed under “{requested}”.</strong>
                  <p>The link may be out of date. Every note is still on the shelf.</p>
                  <CTAButton ghost onClick={() => select(null)}>Show all notes</CTAButton>
                </div>
              )}

              <div className='xbh-sources'>
                <p className='xj-label'>Sources</p>
                <p>
                  Every note closes with the references it was written from; the takeaways
                  summarise those sources. Nothing here is a trade recommendation.
                </p>
              </div>
            </div>
          </section>

          <section className='xj-section' aria-labelledby='xbh-cta-title'>
            <div className='xj-shell xj-close-row'>
              <div>
                <p className='xj-eyebrow'>Next step</p>
                <h2 id='xbh-cta-title' className='xj-h2'>Journal what you <em>read</em>.</h2>
                <p className='xj-lede'>
                  Reading builds the map. The record of your own fills is the territory —
                  start it before the next London open.
                </p>
              </div>
              <div className='xj-actions'>
                <CTALink to='/login?mode=signup'>Start free</CTALink>
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
