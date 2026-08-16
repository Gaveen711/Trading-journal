// @vitest-environment jsdom
// Contract tests for the §2.8 patterns — direct primitive composition, no
// wrapper: Tabs for panel-switching, ToggleGroup for segmented filters.
import { describe, it, expect } from 'vitest';
import { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../ui/tabs';
import { ToggleGroup, ToggleGroupItem } from '../../ui/toggle-group';

function PositionsTabs() {
  const [tab, setTab] = useState('positions');
  return (
    <Tabs value={tab} onValueChange={(value) => setTab(value)}>
      <TabsList variant="line" activateOnFocus className="h-auto">
        <TabsTrigger value="positions" className="text-xs after:bg-primary">
          Positions
        </TabsTrigger>
        <TabsTrigger value="orders" className="text-xs after:bg-primary">
          Orders
        </TabsTrigger>
      </TabsList>
      <TabsContent value="positions">Positions panel</TabsContent>
      <TabsContent value="orders">Orders panel</TabsContent>
    </Tabs>
  );
}

function DirectionFilter() {
  const [filterDir, setFilterDir] = useState('');
  return (
    <>
      <ToggleGroup
        spacing={0}
        value={[filterDir || 'all']}
        onValueChange={([next]) => next && setFilterDir(next === 'all' ? '' : next)}
      >
        <ToggleGroupItem value="all" size="sm">
          All
        </ToggleGroupItem>
        <ToggleGroupItem value="BUY" size="sm">
          <span aria-hidden="true">▲</span> Buy
        </ToggleGroupItem>
        <ToggleGroupItem value="SELL" size="sm">
          <span aria-hidden="true">▼</span> Sell
        </ToggleGroupItem>
      </ToggleGroup>
      <output data-testid="filter-value">{filterDir}</output>
    </>
  );
}

function pressedButtons() {
  return screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('aria-pressed') === 'true');
}

describe('app patterns: tabs recipe', () => {
  it('exposes a tablist and moves selection with ArrowRight', async () => {
    const user = userEvent.setup();
    render(<PositionsTabs />);

    expect(screen.getByRole('tablist')).toBeInTheDocument();
    const positionsTab = screen.getByRole('tab', { name: 'Positions' });
    const ordersTab = screen.getByRole('tab', { name: 'Orders' });
    expect(positionsTab).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('Positions panel')).toBeInTheDocument();

    await user.click(positionsTab);
    await user.keyboard('{ArrowRight}');

    await waitFor(() => expect(ordersTab).toHaveAttribute('aria-selected', 'true'));
    expect(positionsTab).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Orders panel')).toBeInTheDocument();
    expect(screen.queryByText('Positions panel')).toBeNull();
  });
});

describe('app patterns: segmented single-select recipe', () => {
  it('keeps exactly one item pressed and maps the "all" sentinel to "" at the boundary', async () => {
    const user = userEvent.setup();
    render(<DirectionFilter />);

    expect(pressedButtons()).toHaveLength(1);
    expect(pressedButtons()[0]).toHaveAccessibleName('All');

    await user.click(screen.getByRole('button', { name: 'Buy' }));
    expect(screen.getByTestId('filter-value')).toHaveTextContent('BUY');
    expect(pressedButtons()).toHaveLength(1);
    expect(pressedButtons()[0]).toHaveAccessibleName('Buy');

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(screen.getByTestId('filter-value').textContent).toBe('');
    expect(pressedButtons()).toHaveLength(1);
    expect(pressedButtons()[0]).toHaveAccessibleName('All');
  });

  it('re-selecting the pressed item does not empty the group', async () => {
    const user = userEvent.setup();
    render(<DirectionFilter />);

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(pressedButtons()).toHaveLength(1);
    expect(pressedButtons()[0]).toHaveAccessibleName('All');
    expect(screen.getByTestId('filter-value').textContent).toBe('');
  });
});
