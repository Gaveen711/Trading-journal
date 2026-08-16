// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DataTable } from '../DataTable';

const columns = [
  { id: 'market', header: 'Market', cell: (row) => row.market },
  { id: 'direction', header: 'Direction', cell: (row) => row.direction },
  { id: 'pnl', header: 'P&L', cell: (row) => row.pnl, numeric: true, sortable: true },
];

const rows = [
  { id: 't1', market: 'XAU/USD', direction: 'BUY', pnl: '+120.00' },
  { id: 't2', market: 'XAG/USD', direction: 'SELL', pnl: '−48.20' },
];

const getRowId = (row) => row.id;

const baseProps = { columns, rows, getRowId, caption: 'Recent positions' };

describe('app/DataTable', () => {
  it('is a real table named by a visually hidden caption', () => {
    render(<DataTable {...baseProps} />);
    expect(screen.getByRole('table', { name: 'Recent positions' })).toBeInTheDocument();
    expect(document.querySelector('caption')).toHaveClass('sr-only');
    expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length);
  });

  it('adds one columnheader for the expander column', () => {
    render(
      <DataTable
        {...baseProps}
        renderExpanded={(row) => <div>Detail for {row.id}</div>}
        expandedRowId={null}
        onExpandedRowIdChange={() => {}}
      />
    );
    expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length + 1);
  });

  it('renders numeric cells as right-aligned figures', () => {
    render(<DataTable {...baseProps} />);
    const figure = screen.getByText('+120.00');
    expect(figure).toHaveClass('figure');
    expect(figure.closest('td')).toHaveClass('text-right');
  });

  it('renders the empty slot in a single cell spanning every column', () => {
    render(<DataTable {...baseProps} rows={[]} empty={<div>No positions logged yet</div>} />);
    const cell = screen.getByText('No positions logged yet').closest('td');
    expect(cell.colSpan).toBe(columns.length);
    const [, body] = screen.getAllByRole('rowgroup');
    expect(within(body).getAllByRole('row')).toHaveLength(1);
  });

  it('loading renders skeleton rows and no data rows', () => {
    render(<DataTable {...baseProps} loading skeletonRows={4} />);
    const [, body] = screen.getAllByRole('rowgroup');
    expect(within(body).getAllByRole('row')).toHaveLength(4);
    expect(screen.queryByText('XAU/USD')).toBeNull();
  });

  it('sortable headers are buttons inside <th> and cycle the sort direction', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn();
    const { rerender } = render(
      <DataTable {...baseProps} sort={null} onSortChange={onSortChange} />
    );

    const sortButton = screen.getByRole('button', { name: 'P&L' });
    expect(sortButton.closest('th')).not.toBeNull();

    await user.click(sortButton);
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'pnl', direction: 'asc' });

    rerender(
      <DataTable
        {...baseProps}
        sort={{ columnId: 'pnl', direction: 'asc' }}
        onSortChange={onSortChange}
      />
    );
    expect(screen.getByRole('button', { name: 'P&L' }).closest('th')).toHaveAttribute(
      'aria-sort',
      'ascending'
    );

    await user.click(screen.getByRole('button', { name: 'P&L' }));
    expect(onSortChange).toHaveBeenLastCalledWith({ columnId: 'pnl', direction: 'desc' });
  });

  it('expander button carries aria-expanded/aria-controls and toggles through the callback', async () => {
    const user = userEvent.setup();
    const onExpandedRowIdChange = vi.fn();
    const { rerender } = render(
      <DataTable
        {...baseProps}
        renderExpanded={(row) => <div>Detail for {row.id}</div>}
        expandedRowId={null}
        onExpandedRowIdChange={onExpandedRowIdChange}
      />
    );

    const [firstToggle] = screen.getAllByRole('button', { name: 'Show row details' });
    expect(firstToggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(firstToggle);
    expect(onExpandedRowIdChange).toHaveBeenLastCalledWith('t1');

    rerender(
      <DataTable
        {...baseProps}
        renderExpanded={(row) => <div>Detail for {row.id}</div>}
        expandedRowId="t1"
        onExpandedRowIdChange={onExpandedRowIdChange}
      />
    );

    const openToggle = screen.getByRole('button', { name: 'Hide row details' });
    expect(openToggle).toHaveAttribute('aria-expanded', 'true');
    const detailId = openToggle.getAttribute('aria-controls');
    expect(detailId).toBeTruthy();
    const detailRow = document.getElementById(detailId);
    expect(detailRow).not.toBeNull();
    expect(within(detailRow).getByText('Detail for t1')).toBeInTheDocument();

    await user.click(openToggle);
    expect(onExpandedRowIdChange).toHaveBeenLastCalledWith(null);
  });

  it('row activation lands on a focusable element, never on the <tr>', async () => {
    const user = userEvent.setup();
    const onRowActivate = vi.fn();
    render(<DataTable {...baseProps} onRowActivate={onRowActivate} />);

    // Clicking a plain cell does nothing — the <tr> has no click handler.
    await user.click(screen.getByText('BUY'));
    expect(onRowActivate).not.toHaveBeenCalled();

    // The first column hosts a real button; keyboard activation works.
    const activator = screen.getByRole('button', { name: 'XAU/USD' });
    activator.focus();
    await user.keyboard('{Enter}');
    expect(onRowActivate).toHaveBeenCalledWith(rows[0]);
  });
});
