// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusSquare } from '../StatusSquare';

describe('app/StatusSquare', () => {
  it('keeps the label in the accessibility tree as sr-only text when no children are given', () => {
    render(<StatusSquare state="on" label="Market open" />);
    const label = screen.getByText('Market open');
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass('sr-only');
  });

  it('shows visible text when children are given', () => {
    render(
      <StatusSquare state="attn" label="Sync status">
        Last sync 18m ago
      </StatusSquare>
    );
    const text = screen.getByText('Last sync 18m ago');
    expect(text).toBeInTheDocument();
    expect(text).not.toHaveClass('sr-only');
  });

  it('encodes the three states as distinct data-state values, not colors', () => {
    const { container } = render(
      <>
        <StatusSquare state="on" label="Open" />
        <StatusSquare state="off" label="Closed" />
        <StatusSquare state="attn" label="Stale" />
      </>
    );
    const states = Array.from(container.querySelectorAll('[data-state]')).map((el) =>
      el.getAttribute('data-state')
    );
    expect(states).toEqual(['on', 'off', 'attn']);
  });

  it('never animates', () => {
    const { container } = render(
      <StatusSquare state="on" label="Open">
        Open
      </StatusSquare>
    );
    expect(container.innerHTML).not.toMatch(/animate-/);
  });
});
