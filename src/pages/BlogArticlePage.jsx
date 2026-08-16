import { useEffect } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { CTALink, TextLink } from '../components/PublicSite';
import { getArticle, studyArticles } from '../data/study';
import { applyArticleSEO, removeJsonLd } from '../lib/seo';
import './PublicSite.css';

/** '2026-08-16' → '16 Aug 2026', pinned to UTC so the date never drifts a day. */
function formatUpdated(iso) {
  const [year, month, day] = iso.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
  });
}

export function BlogArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);

  useEffect(() => {
    if (!article) return undefined;
    // Runs after the app-shell PageSEO effect (PageSEO renders earlier in
    // App's tree), so the article's title/canonical/JSON-LD win the route change.
    applyArticleSEO(article);
    return () => removeJsonLd('article-schema');
  }, [article]);

  if (!article) return <Navigate to='/blogs' replace />;

  const index = studyArticles.findIndex((entry) => entry.slug === article.slug);
  const previous = index > 0 ? studyArticles[index - 1] : null;
  const next = index < studyArticles.length - 1 ? studyArticles[index + 1] : null;

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <div className='xj-cover'>
            <div className='xj-shell'>
              <div className='mx-auto max-w-[68ch]'>
                <article aria-labelledby='article-heading'>
                  <header className='xj-settle'>
                    <nav className='xja-crumb' aria-label='Breadcrumb'>
                      <Link to='/blogs'>The study</Link>
                      <span aria-hidden='true'>/</span>
                      <span>{article.category}</span>
                    </nav>
                    <h1 id='article-heading' className='xja-title'>{article.title}</h1>
                    <p className='xja-meta'>
                      <span>{article.level}</span>
                      <span aria-hidden='true'>·</span>
                      <span>{article.readMinutes} min read</span>
                      <span aria-hidden='true'>·</span>
                      <span>
                        Updated <time dateTime={article.updated}>{formatUpdated(article.updated)}</time>
                      </span>
                    </p>
                  </header>

                  <section className='xj-glass xja-takeaways' aria-labelledby='takeaways-heading'>
                    <h2 id='takeaways-heading' className='xj-label'>Key takeaways</h2>
                    <ul>
                      {article.takeaways.map((takeaway) => <li key={takeaway}>{takeaway}</li>)}
                    </ul>
                  </section>

                  <div className='xja-body'>
                    {article.sections.map(({ heading, paragraphs }) => (
                      <section key={heading}>
                        <h2>{heading}</h2>
                        {paragraphs.map((paragraph) => <p key={paragraph.slice(0, 48)}>{paragraph}</p>)}
                      </section>
                    ))}

                    <section aria-labelledby='further-reading-heading'>
                      <h2 id='further-reading-heading'>Further reading</h2>
                      <ul className='xja-sources'>
                        {article.sources.map(({ label, url }) => (
                          <li key={url}>
                            <TextLink to={url} external>{label}</TextLink>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </article>

                {previous || next ? (
                  <nav className='xja-pager' aria-label='More from the study'>
                    {previous ? (
                      <Link className='xj-glass' rel='prev' to={`/blogs/${previous.slug}`}>
                        <span className='xj-label'>Previous</span>
                        <strong>{previous.title}</strong>
                      </Link>
                    ) : <span aria-hidden='true' />}
                    {next ? (
                      <Link className='xj-glass xja-pager-next' rel='next' to={`/blogs/${next.slug}`}>
                        <span className='xj-label'>Next</span>
                        <strong>{next.title}</strong>
                      </Link>
                    ) : null}
                  </nav>
                ) : null}

                <aside className='xj-glass xja-cta' aria-labelledby='article-cta-heading'>
                  <div>
                    <h2 id='article-cta-heading'>Put it in the <em>journal.</em></h2>
                    <p>
                      An article only changes your trading if it shows up in your next entry.
                      Log the setup, the session and the exit — the review does the rest.
                    </p>
                  </div>
                  <CTALink to='/login?mode=signup'>Start free</CTALink>
                </aside>
              </div>
            </div>
          </div>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
