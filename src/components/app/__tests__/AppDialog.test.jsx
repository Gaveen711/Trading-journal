// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { useRef, useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppDialog } from '../AppDialog';

function TriggerFixture(dialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <AppDialog open={open} onOpenChange={setOpen} title="Edit trade" {...dialogProps}>
        <button type="button">First action</button>
        <button type="button">Second action</button>
      </AppDialog>
    </>
  );
}

function InitialFocusFixture() {
  const [open, setOpen] = useState(false);
  const inputRef = useRef(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Open dialog
      </button>
      <AppDialog
        open={open}
        onOpenChange={setOpen}
        title="Edit trade"
        initialFocus={inputRef}
      >
        <button type="button">Other action</button>
        <input ref={inputRef} aria-label="Lot size" />
      </AppDialog>
    </>
  );
}

function NestedFixture() {
  const [parentOpen, setParentOpen] = useState(true);
  const [childOpen, setChildOpen] = useState(false);
  return (
    <AppDialog open={parentOpen} onOpenChange={setParentOpen} title="Pricing">
      <button type="button" onClick={() => setChildOpen(true)}>
        Open terms
      </button>
      <AppDialog open={childOpen} onOpenChange={setChildOpen} title="Pro terms">
        <p>Terms body</p>
      </AppDialog>
    </AppDialog>
  );
}

describe('app/AppDialog', () => {
  it('renders role="dialog" named by the title and described by the description', async () => {
    render(
      <AppDialog open onOpenChange={() => {}} title="Log trade" description="Fill every field.">
        <button type="button">Body action</button>
      </AppDialog>
    );
    const dialog = await screen.findByRole('dialog', { name: 'Log trade' });
    expect(dialog).toHaveAccessibleDescription('Fill every field.');
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('titleHidden keeps the accessible name while hiding the title node', async () => {
    render(
      <AppDialog open onOpenChange={() => {}} title="Image preview" titleHidden>
        <img alt="Trade screenshot" src="data:," />
      </AppDialog>
    );
    await screen.findByRole('dialog', { name: 'Image preview' });
    expect(document.querySelector('[data-slot="dialog-title"]')).toHaveClass('sr-only');
  });

  it('Escape and backdrop press close a dismissible dialog', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AppDialog open onOpenChange={onOpenChange} title="Log trade">
        <button type="button">Inside</button>
      </AppDialog>
    );
    await screen.findByRole('dialog', { name: 'Log trade' });

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);

    onOpenChange.mockClear();
    await user.click(document.querySelector('[data-slot="dialog-overlay"]'));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('dismissible={false} vetoes Escape and outside press and renders no close button', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <AppDialog open onOpenChange={onOpenChange} title="Consent required" dismissible={false}>
        <button type="button">I agree</button>
      </AppDialog>
    );
    await screen.findByRole('dialog', { name: 'Consent required' });

    await user.keyboard('{Escape}');
    await user.click(document.querySelector('[data-slot="dialog-overlay"]'));

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Consent required' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close' })).toBeNull();
  });

  it('traps focus while open and restores it to the trigger on close', async () => {
    const user = userEvent.setup();
    render(<TriggerFixture />);
    const trigger = screen.getByRole('button', { name: 'Open dialog' });

    await user.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Edit trade' });
    await waitFor(() => expect(dialog).toContainElement(document.activeElement));

    // Tab past every tabbable: Base UI's focus guards route focus back into
    // the popup (possibly a tick later), so focus must always settle inside.
    for (let i = 0; i < 5; i += 1) {
      await user.tab();
      await waitFor(() => expect(dialog).toContainElement(document.activeElement));
    }
    // Reverse traversal must stay trapped too.
    for (let i = 0; i < 3; i += 1) {
      await user.tab({ shift: true });
      await waitFor(() => expect(dialog).toContainElement(document.activeElement));
    }

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('marks the page outside as inert and locks body scroll while open', async () => {
    const user = userEvent.setup();
    render(<TriggerFixture />);
    const trigger = screen.getByRole('button', { name: 'Open dialog' });

    await user.click(trigger);
    await screen.findByRole('dialog', { name: 'Edit trade' });

    // Base UI applies aria-hidden/inert to the sibling tree of the portal and
    // a CSS scroll lock on the root scroller.
    await waitFor(() => {
      expect(
        trigger.closest('[aria-hidden="true"]') ?? trigger.closest('[inert]')
      ).not.toBeNull();
    });
    const html = document.documentElement;
    const locked =
      html.style.overflowY === 'hidden' ||
      document.body.style.overflowY === 'hidden' ||
      html.style.overflow === 'hidden' ||
      document.body.style.overflow === 'hidden';
    expect(locked).toBe(true);

    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('size="full" spans the viewport with an accessible close in the corner', async () => {
    render(
      <AppDialog open onOpenChange={() => {}} title="Image preview" titleHidden size="full">
        <img alt="Trade screenshot" src="data:," />
      </AppDialog>
    );
    const dialog = await screen.findByRole('dialog', { name: 'Image preview' });
    // The popup itself spans the viewport so its corner close button sits at
    // the true viewport corner while remaining inside the focus trap.
    expect(dialog.className).toContain('size-full');
    const close = screen.getByRole('button', { name: 'Close' });
    expect(dialog).toContainElement(close);
  });

  it('initialFocus moves opening focus to the referenced element', async () => {
    const user = userEvent.setup();
    render(<InitialFocusFixture />);
    await user.click(screen.getByRole('button', { name: 'Open dialog' }));
    await screen.findByRole('dialog', { name: 'Edit trade' });
    await waitFor(() => expect(screen.getByRole('textbox', { name: 'Lot size' })).toHaveFocus());
  });

  it('nested: Escape closes only the top-most dialog', async () => {
    const user = userEvent.setup();
    render(<NestedFixture />);
    await screen.findByRole('dialog', { name: 'Pricing' });

    await user.click(screen.getByRole('button', { name: 'Open terms' }));
    await screen.findByRole('dialog', { name: 'Pro terms' });

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Pro terms' })).toBeNull()
    );
    expect(screen.getByRole('dialog', { name: 'Pricing' })).toBeInTheDocument();
  });

  it('renders the footer inside the dialog', async () => {
    render(
      <AppDialog
        open
        onOpenChange={() => {}}
        title="Edit trade"
        footer={<button type="button">Save changes</button>}
      >
        <p>Body</p>
      </AppDialog>
    );
    const dialog = await screen.findByRole('dialog', { name: 'Edit trade' });
    expect(dialog).toContainElement(screen.getByRole('button', { name: 'Save changes' }));
  });
});
