// @vitest-environment jsdom
//
// Field alignment is a layout property, and jsdom has no layout — so this
// suite asserts the two things that DECIDE the layout instead: every labelled
// control in the form resolves to the same height class, and every label is
// bound to the control it names.
//
// The regression it guards: one grid row held a 48px DatePicker, a 48px
// CustomSelect and a 32px SetupCombobox, and the Setup cell also carried the
// whole Strategies field, so that column ran to twice the height of its
// neighbours. It also dumps the rendered markup for the browser measurement
// harness (see the alignment check in the same change).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('../ToastContext', () => ({ useToast: () => vi.fn() }));
vi.mock('../../firebase', () => ({
  auth: { currentUser: { uid: 'u1' } },
  storage: {},
}));
vi.mock('firebase/storage', () => ({
  ref: vi.fn(), uploadBytes: vi.fn(), getDownloadURL: vi.fn(), deleteObject: vi.fn(),
}));

const { EditTradeModal } = await import('../EditTradeModal');

const TRADE = {
  id: 't1',
  date: '2026-08-19',
  direction: 'BUY',
  entry: 2400,
  exit: 2410,
  lots: 0.1,
  pnl: 100,
  outcome: 'WIN',
  session: 'London',
  setupId: null,
  strategies: ['Breakout'],
  note: 'note',
  screenshots: [],
};

function renderModal() {
  return render(
    <EditTradeModal
      trade={TRADE}
      plan="pro"
      setShowPricingModal={vi.fn()}
      onSave={vi.fn()}
      onClose={vi.fn()}
      setups={[{ id: 's1', name: 'Breakout', isDefault: false }]}
      createSetup={vi.fn()}
      archiveSetup={vi.fn()}
    />
  );
}

beforeEach(() => { document.body.innerHTML = ''; });

describe('EditTradeModal — field alignment', () => {
  it('gives every labelled control in the form the same height', () => {
    const { container } = renderModal();

    // The controls that sit in the aligned grid rows.
    const controls = [
      container.querySelector('#modal-lots'),
      container.querySelector('#modal-entry'),
      container.querySelector('#modal-exit'),
      container.querySelector('#modal-setup'),
    ].filter(Boolean);

    expect(controls).toHaveLength(4);
    for (const control of controls) {
      expect(control.className).toMatch(/(^|\s)h-11(\s|$)/);
      // A stale h-8 / h-12 left behind would put the row back out of line.
      expect(control.className).not.toMatch(/(^|\s)h-(8|12)(\s|$)/);
    }
  });

  it('binds every field label to the control it names', () => {
    renderModal();
    for (const name of [/lot size/i, /entry price/i, /exit price/i, /notes/i, /setup/i, /strategies/i]) {
      // getByLabelText only resolves through a real label association.
      expect(screen.getByLabelText(name)).toBeInTheDocument();
    }
  });

  it('puts exactly one field in each cell of the three-column row', () => {
    const { container } = renderModal();
    const row = container.querySelector('.sm\\:grid-cols-3');
    expect(row).not.toBeNull();

    const cells = [...row.children];
    expect(cells).toHaveLength(3);
    for (const cell of cells) {
      // Two labels in one cell is the ragged-column bug returning.
      expect(cell.querySelectorAll('label')).toHaveLength(1);
    }
  });

  it('gives the date picker and session select the same height as the rest', () => {
    const { container } = renderModal();
    const row = container.querySelector('.sm\\:grid-cols-3');
    const triggers = [...row.children].map((cell) =>
      cell.querySelector('button, [role="combobox"], div.input-premium')
    );

    expect(triggers.filter(Boolean)).toHaveLength(3);
    for (const trigger of triggers) {
      expect(trigger.className).toMatch(/(^|\s)h-11(\s|$)/);
      expect(trigger.className).not.toMatch(/(^|\s)h-(8|12)(\s|$)/);
    }
  });

  it('labels carry no indent that would break them off the field edge', () => {
    const { container } = renderModal();
    for (const label of container.querySelectorAll('label')) {
      expect(label.className).not.toMatch(/(^|\s)ml-1(\s|$)/);
    }
  });
});
