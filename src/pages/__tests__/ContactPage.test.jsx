// @vitest-environment jsdom
//
// The contact sheet talks to POST /api/contact, which the dev server proxies
// to production. These tests pin the wire shape the endpoint expects
// ({ name, email, subject, message }), the inline validation, the broker
// request reveal, and the pending -> sent / error paths — all against a
// mocked fetch, so nothing here ever reaches the real endpoint.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// jsdom ships neither; useDeskReveal() reads both. With matchMedia reporting
// reduced motion the hook marks every .xj-reveal visible and never observes.
window.matchMedia = () => ({ matches: true, addEventListener() {}, removeEventListener() {} });
window.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };

vi.mock('../../components/PublicNavbar', () => ({ PublicNavbar: () => <nav data-testid='navbar' /> }));
vi.mock('../../components/FooterNav', () => ({ PublicFooter: () => <footer data-testid='footer' /> }));

const { ContactPage } = await import('../ContactPage');
const { BROKER_PRESETS } = await import('../../data/brokerCatalog');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/contact']}>
      <ContactPage />
    </MemoryRouter>,
  );
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

async function fillRequired(user, { topic = 'Broker sync' } = {}) {
  await user.type(screen.getByLabelText(/^name/i), 'Test Trader');
  await user.type(screen.getByLabelText(/^email/i), 'trader@example.com');
  await user.selectOptions(screen.getByLabelText(/^topic/i), topic);
  await user.type(screen.getByLabelText(/^message/i), 'Fills from the London open did not import.');
}

// userEvent types every character through the real event pipeline, so the
// long-form cases take seconds when the whole suite runs in parallel.
describe('ContactPage', { timeout: 20_000 }, () => {
  let fetchMock;
  let errorSpy;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
    vi.unstubAllGlobals();
  });

  it('renders one h1, labelled controls, the mailto fallback and catalog-derived broker counts', () => {
    renderPage();

    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    expect(screen.getByLabelText(/^name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^message/i)).toBeInTheDocument();

    const mailto = screen.getByRole('link', { name: /info@xaujournal\.com/i });
    expect(mailto).toHaveAttribute('href', 'mailto:info@xaujournal.com');

    // The figures come from the catalog, never from copy.
    const syncing = BROKER_PRESETS.filter((p) => !p.comingSoon && p.id !== 'custom');
    const mt4 = syncing.filter((p) => p.platforms.includes('mt4')).length;
    const mt5 = syncing.filter((p) => p.platforms.includes('mt5')).length;
    expect(syncing.length).toBeGreaterThan(0);
    const aside = screen.getByRole('complementary');
    expect(within(aside).getByText(String(syncing.length), { selector: 'strong' })).toBeInTheDocument();
    expect(within(aside).getByText(String(mt5), { selector: 'b' })).toBeInTheDocument();
    expect(within(aside).getByText(String(mt4), { selector: 'b' })).toBeInTheDocument();

    // The topic select carries the support desks plus the two additions.
    const options = within(screen.getByLabelText(/^topic/i)).getAllByRole('option').map((o) => o.textContent);
    expect(options).toEqual(expect.arrayContaining(['Bug report', 'Broker sync', 'Billing', 'Request a broker', 'Other']));
  });

  it('shows inline errors on submit and a format error on blur, each wired through aria attributes', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: /send message/i }));

    const name = screen.getByLabelText(/^name/i);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAttribute('aria-describedby', 'xct-name-error');
    expect(screen.getByText('Enter your name.')).toHaveAttribute('id', 'xct-name-error');
    expect(screen.getByText('Enter your email address.')).toBeInTheDocument();
    expect(screen.getByText('Choose a topic.')).toBeInTheDocument();
    expect(screen.getByText('Tell us what you need.')).toBeInTheDocument();
    await waitFor(() => expect(name).toHaveFocus());
    expect(fetchMock).not.toHaveBeenCalled();

    // Fixing a field clears its error as soon as it is valid.
    await user.type(name, 'Test Trader');
    expect(name).toHaveAttribute('aria-invalid', 'false');
    expect(screen.queryByText('Enter your name.')).not.toBeInTheDocument();

    // A malformed email is flagged on blur, before any submit.
    const email = screen.getByLabelText(/^email/i);
    await user.clear(email);
    await user.type(email, 'not-an-email');
    await user.tab();
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(email).toHaveAttribute('aria-invalid', 'true');
  });

  it('reveals the broker fields for "Request a broker", validates them, and folds them into the payload', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
    renderPage();

    expect(screen.queryByLabelText(/^broker/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /request a broker/i }));

    const select = screen.getByLabelText(/^topic/i);
    expect(select).toHaveValue('broker');
    const brokerInput = screen.getByLabelText(/^broker/i);
    expect(brokerInput).toBeInTheDocument();
    await waitFor(() => expect(brokerInput).toHaveFocus());
    expect(screen.getByRole('radio', { name: 'MT4' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'cTrader' })).toBeInTheDocument();

    // Both revealed fields are required once the topic asks for them.
    await user.type(screen.getByLabelText(/^name/i), 'Test Trader');
    await user.type(screen.getByLabelText(/^email/i), 'trader@example.com');
    await user.type(screen.getByLabelText(/^message/i), 'ECN account, live server.');
    await user.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText('Enter the broker’s name.')).toBeInTheDocument();
    expect(screen.getByText('Pick the platform you trade on.')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();

    await user.type(brokerInput, 'Moneta Markets');
    await user.click(screen.getByRole('radio', { name: 'MT5' }));
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/contact');
    expect(init.method).toBe('POST');
    expect(init.headers).toEqual({ 'Content-Type': 'application/json' });
    const body = JSON.parse(init.body);
    expect(Object.keys(body)).toEqual(['name', 'email', 'subject', 'message']);
    expect(body.subject).toBe('Request a broker — Moneta Markets (MT5)');
    expect(body.message).toBe('Broker: Moneta Markets\nPlatform: MT5\n\nECN account, live server.');

    // After sending, "Write another" comes back to a blank form with no request fields.
    await user.click(await screen.findByRole('button', { name: /write another/i }));
    expect(screen.queryByLabelText(/^broker/i)).not.toBeInTheDocument();
  });

  it('goes pending, then prints the receipt with the reply address on success', async () => {
    const user = userEvent.setup();
    const request = deferred();
    fetchMock.mockReturnValue(request.promise);
    renderPage();

    await fillRequired(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    // Pending: the button reports it and is disabled; the envelope says so.
    const pending = screen.getByRole('button', { name: /sending/i });
    expect(pending).toBeDisabled();
    expect(pending).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByRole('status')).toHaveTextContent('Sending');

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({
      name: 'Test Trader',
      email: 'trader@example.com',
      subject: 'Broker sync',
      message: 'Fills from the London open did not import.',
    });

    request.resolve({ ok: true, json: async () => ({ success: true }) });

    const receiptHeading = await screen.findByRole('heading', { level: 2, name: /^sent · \d{2}:\d{2} utc$/i });
    expect(receiptHeading).toBeInTheDocument();
    expect(screen.getByText('trader@example.com', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/within two business days/i, { selector: 'dd' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/sent · \d{2}:\d{2} utc/i);
    expect(screen.queryByRole('button', { name: /send message/i })).not.toBeInTheDocument();

    // "Write another" returns an empty form.
    await user.click(screen.getByRole('button', { name: /write another/i }));
    expect(screen.getByLabelText(/^name/i)).toHaveValue('');
    expect(screen.getByLabelText(/^message/i)).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent('Draft');
  });

  it('keeps the text and offers the mailto fallback when the endpoint fails', async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: 'nope' }) });
    renderPage();

    await fillRequired(user, { topic: 'Billing' });
    await user.click(screen.getByRole('button', { name: /send message/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/did not reach us/i);
    expect(screen.getByLabelText(/^message/i)).toHaveValue('Fills from the London open did not import.');
    expect(screen.getByLabelText(/^name/i)).toHaveValue('Test Trader');
    expect(screen.getByRole('status')).toHaveTextContent('Not sent');

    const fallback = within(alert).getByRole('link', { name: /email it to info@xaujournal\.com/i });
    const href = fallback.getAttribute('href');
    expect(href.startsWith('mailto:info@xaujournal.com?subject=')).toBe(true);
    expect(decodeURIComponent(href)).toContain('subject=Billing');
    expect(decodeURIComponent(href)).toContain('Fills from the London open did not import.');

    // The button is live again for a retry.
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('rejects a message over the endpoint cap and shows the live counter', async () => {
    const user = userEvent.setup();
    renderPage();

    const message = screen.getByLabelText(/^message/i);
    await user.type(message, 'abc');
    expect(screen.getByText('3 / 5,000')).toBeInTheDocument();

    // paste past the cap (typing 5,001 characters one by one is needlessly slow)
    await user.clear(message);
    await user.click(message);
    await user.paste('x'.repeat(5001));
    await user.tab();
    expect(screen.getByText('Keep it under 5,000 characters.')).toBeInTheDocument();
    expect(message).toHaveAttribute('aria-invalid', 'true');
    expect(message).toHaveAttribute('aria-describedby', 'xct-message-hint xct-message-error');
  });
});
