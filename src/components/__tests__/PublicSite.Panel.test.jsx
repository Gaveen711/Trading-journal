// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Panel } from '../PublicSite';

describe('PublicSite/Panel', () => {
  it('keeps window controls, title, and metadata in separate header columns', () => {
    const { container } = render(
      <Panel label='Public record' meta='TOS'>
        <p>Policy details</p>
      </Panel>,
    );

    const bar = container.querySelector('.xj-panel-bar');
    const controls = container.querySelector('.xj-panel-controls');

    expect(bar).not.toBeNull();
    expect(controls).toHaveAttribute('aria-hidden', 'true');
    expect(controls.querySelectorAll('i')).toHaveLength(3);
    expect(screen.getByText('Public record')).toBeInTheDocument();
    expect(screen.getByText('TOS')).toHaveClass('xj-panel-meta');
  });
});
