// @vitest-environment jsdom
//
// The hub's category filter lives in the URL (?category=…) so an article's
// category chip can deep-link back with its shelf preselected. These pin the
// contract: chips ↔ query string ↔ visible cards, plus the empty state for a
// stale link.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { studyArticles, studyCategories } from '../../data/study';

vi.mock('../../components/PublicNavbar', () => ({ PublicNavbar: () => <div data-testid='nav' /> }));
vi.mock('../../components/FooterNav', () => ({ PublicFooter: () => <div data-testid='footer' /> }));

const { BlogsPage } = await import('../BlogsPage');

function LocationProbe() {
  const location = useLocation();
  return <div data-testid='search'>{location.search}</div>;
}

function renderHub(initialEntry = '/blogs') {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path='/blogs' element={<><BlogsPage /><LocationProbe /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

const cardTitles = () =>
  within(screen.getByRole('list', { name: 'Notes' }))
    .getAllByRole('heading', { level: 3 })
    .map((heading) => heading.textContent);

const chip = (name) => screen.getByRole('button', { name: new RegExp(`^${name.replace(/[&]/g, '\\$&')}\\b`) });

beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: false, media: query, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  }));
});

describe('BlogsPage — category filter', () => {
  it('shows every note with the All chip pressed and counts in each chip', () => {
    renderHub();
    expect(cardTitles()).toHaveLength(studyArticles.length);
    expect(chip('All')).toHaveAttribute('aria-pressed', 'true');
    for (const category of studyCategories) {
      const count = studyArticles.filter((note) => note.category === category).length;
      expect(chip(category)).toHaveTextContent(String(count));
      expect(chip(category)).toHaveAttribute('aria-pressed', 'false');
    }
    expect(screen.getByRole('status')).toHaveTextContent(`Showing ${studyArticles.length} notes`);
  });

  it('writes the chosen category to the URL and filters the grid', async () => {
    const user = userEvent.setup();
    renderHub();
    await user.click(chip('Gold & Sessions'));

    expect(screen.getByTestId('search')).toHaveTextContent('?category=Gold+%26+Sessions');
    expect(chip('Gold & Sessions')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('All')).toHaveAttribute('aria-pressed', 'false');
    const expected = studyArticles.filter((note) => note.category === 'Gold & Sessions').map((note) => note.title);
    expect(cardTitles()).toEqual(expected);

    await user.click(chip('All'));
    expect(screen.getByTestId('search')).toHaveTextContent('');
    expect(cardTitles()).toHaveLength(studyArticles.length);
  });

  it('preselects the category named in the query string (the article deep link)', () => {
    renderHub('/blogs?category=Risk%20%26%20Psychology');
    expect(chip('Risk & Psychology')).toHaveAttribute('aria-pressed', 'true');
    expect(cardTitles()).toEqual(
      studyArticles.filter((note) => note.category === 'Risk & Psychology').map((note) => note.title),
    );
  });

  it('offers a way back from a stale category link', async () => {
    const user = userEvent.setup();
    renderHub('/blogs?category=Retired');
    expect(screen.queryByRole('list', { name: 'Notes' })).toBeNull();
    expect(screen.getByText(/no notes are filed under/i)).toHaveTextContent('Retired');

    await user.click(screen.getByRole('button', { name: /show all notes/i }));
    expect(screen.getByTestId('search')).toHaveTextContent('');
    expect(cardTitles()).toHaveLength(studyArticles.length);
  });

  it('features the most recently updated note, with the first three takeaways', () => {
    renderHub();
    const newest = [...studyArticles].sort((a, b) => b.updated.localeCompare(a.updated))[0];
    const featured = screen.getByRole('region', { name: newest.title });
    expect(within(featured).getByRole('link', { name: /^read/i })).toHaveAttribute('href', `/blogs/${newest.slug}`);
    const takeaways = within(featured).getByRole('complementary', { name: /takeaways/i });
    expect(within(takeaways).getAllByRole('listitem')).toHaveLength(Math.min(3, newest.takeaways.length));
  });
});
