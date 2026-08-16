// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SectionCard } from '../SectionCard';

describe('app/SectionCard', () => {
  it('renders a <section> landmark labelled by its <h2> heading', () => {
    render(
      <SectionCard title="Recent positions">
        <p>Body</p>
      </SectionCard>
    );
    const heading = screen.getByRole('heading', { level: 2, name: 'Recent positions' });
    const section = document.querySelector('section');
    expect(section).not.toBeNull();
    expect(heading.id).not.toBe('');
    expect(section).toHaveAttribute('aria-labelledby', heading.id);
  });

  it('renders meta and actions in the header row', () => {
    render(
      <SectionCard
        title="Trade history"
        meta="21 rows"
        actions={<button type="button">Export</button>}
      >
        <p>Body</p>
      </SectionCard>
    );
    expect(screen.getByText('21 rows')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export' })).toBeInTheDocument();
  });

  it('default mode is a ruled section, not a card', () => {
    render(
      <SectionCard title="Filters">
        <p>Body</p>
      </SectionCard>
    );
    expect(document.querySelector('[data-slot="card"]')).toBeNull();
  });

  it('surface mode renders a Card panel and keeps the heading contract', () => {
    render(
      <SectionCard title="Broker sync" surface>
        <p>Body</p>
      </SectionCard>
    );
    expect(document.querySelector('[data-slot="card"]')).not.toBeNull();
    const heading = screen.getByRole('heading', { level: 2, name: 'Broker sync' });
    const section = document.querySelector('section');
    expect(section).toHaveAttribute('aria-labelledby', heading.id);
  });
});
