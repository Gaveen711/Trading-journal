// @vitest-environment jsdom
//
// One note page: the table of contents mirrors the sections one-to-one, the
// category chip deep-links back to the hub, the head gets the article's SEO,
// and an unknown slug is a real not-found page rather than a redirect.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, cleanup } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { studyArticles } from '../../data/study';

vi.mock('../../components/PublicNavbar', () => ({ PublicNavbar: () => <div data-testid='nav' /> }));
vi.mock('../../components/FooterNav', () => ({ PublicFooter: () => <div data-testid='footer' /> }));

const { BlogArticlePage } = await import('../BlogArticlePage');

const article = studyArticles.find((note) => note.slug === 'gold-trading-sessions-explained');

let railMatches = true;

function renderArticle(slug) {
  return render(
    <MemoryRouter initialEntries={[`/blogs/${slug}`]}>
      <Routes>
        <Route path='/blogs/:slug' element={<BlogArticlePage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  railMatches = true;
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes('min-width') ? railMatches : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
});

afterEach(() => {
  cleanup();
  document.getElementById('article-schema')?.remove();
});

describe('BlogArticlePage', () => {
  it('builds one table-of-contents entry per section, each pointing at its heading', () => {
    renderArticle(article.slug);
    const toc = screen.getByRole('navigation', { name: 'On this page' });
    const links = within(toc).getAllByRole('link');
    expect(links).toHaveLength(article.sections.length);
    links.forEach((link, i) => {
      expect(link).toHaveTextContent(article.sections[i].heading);
      const id = link.getAttribute('href').slice(1);
      const section = document.getElementById(id);
      expect(section).not.toBeNull();
      expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(article.sections[i].heading);
    });
    expect(within(toc).queryByRole('group')).toBeNull(); // a plain rail, no <details>, on wide screens
    expect(links[0]).toHaveAttribute('aria-current', 'location');
  });

  it('folds the contents into a disclosure below the rail breakpoint', () => {
    railMatches = false;
    renderArticle(article.slug);
    const toc = screen.getByRole('navigation', { name: 'On this page' });
    expect(toc.querySelector('details')).not.toBeNull();
    expect(within(toc).getAllByRole('link')).toHaveLength(article.sections.length);
  });

  it('has one h1 and links its category chip back to the filtered hub', () => {
    renderArticle(article.slug);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(article.title);
    expect(screen.getByRole('link', { name: `All notes in ${article.category}` }))
      .toHaveAttribute('href', `/blogs?category=${encodeURIComponent(article.category)}`);
  });

  it('applies the article SEO and cleans its JSON-LD up on unmount', () => {
    const { unmount } = renderArticle(article.slug);
    expect(document.title).toBe(`${article.title} — xaujournal study`);
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href'))
      .toBe(`https://www.xaujournal.com/blogs/${article.slug}`);
    const schema = JSON.parse(document.getElementById('article-schema').textContent);
    expect(schema['@type']).toBe('Article');
    expect(schema.headline).toBe(article.title);
    unmount();
    expect(document.getElementById('article-schema')).toBeNull();
  });

  it('renders the not-found page for an unknown slug instead of redirecting', () => {
    renderArticle('not-a-real-note');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('That page does not exist.');
    expect(document.title).toBe('Page not found — xaujournal');
    expect(document.querySelector('meta[name="robots"]')?.getAttribute('content')).toBe('noindex, follow');
    expect(document.getElementById('article-schema')).toBeNull();
    expect(screen.getByTestId('nav')).toBeInTheDocument();
  });

  it('pages to the neighbours in newest-first order', () => {
    renderArticle(article.slug);
    const ordered = [...studyArticles].sort((a, b) => b.updated.localeCompare(a.updated));
    const index = ordered.findIndex((note) => note.slug === article.slug);
    const pager = screen.getByRole('navigation', { name: 'More notes' });
    expect(within(pager).getByRole('link', { name: /previous/i })).toHaveAttribute('href', `/blogs/${ordered[index - 1].slug}`);
    expect(within(pager).getByRole('link', { name: /next/i })).toHaveAttribute('href', `/blogs/${ordered[index + 1].slug}`);
  });
});
