// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../dropdown-menu';

describe('ui/DropdownMenu (base-nova)', () => {
  it('opens from a native trigger by click and keyboard', async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Notifications">Bell</DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuItem>New notification</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );

    const trigger = screen.getByRole('button', { name: 'Notifications' });
    await user.click(trigger);
    expect(await screen.findByText('Notifications')).toBeVisible();
    expect(await screen.findByRole('menuitem', { name: 'New notification' })).toBeVisible();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menuitem', { name: 'New notification' })).not.toBeInTheDocument();

    trigger.focus();
    await user.keyboard('{Enter}');
    expect(await screen.findByRole('menuitem', { name: 'New notification' })).toBeVisible();
  });
});
