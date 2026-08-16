import { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { CTAButton, Panel, SectionHead } from '../components/PublicSite';
import { useDeskReveal } from '../lib/goldSessions';
import './PublicSite.css';
import './ContactPage.css';

const CONTACT_ROUTES = [
  {
    label: 'Email',
    value: 'info@xaujournal.com',
    helper: 'Account, billing, product and privacy questions.',
    href: 'mailto:info@xaujournal.com',
  },
  {
    label: 'Response',
    value: 'Within one business day',
    helper: 'Monday to Friday, for traders in every timezone.',
  },
  {
    label: 'Community',
    value: 'Discord feedback channel',
    helper: 'Share an idea, report an issue or follow product updates.',
    href: 'https://discord.gg/smbNwBZC2',
  },
];

const SUPPORT_TOPICS = [
  { label: 'Bug report', detail: 'Include the page, browser, device and the exact steps that caused the issue.', href: 'mailto:info@xaujournal.com?subject=Bug%20report' },
  { label: 'Broker sync', detail: 'Ask about MT4/MT5 connection status, MetaAPI or a missing trade import.', href: 'mailto:info@xaujournal.com?subject=Broker%20sync%20help' },
  { label: 'Billing', detail: 'Get help with Pro access, invoices, cancellation, refunds or account changes.', href: 'mailto:info@xaujournal.com?subject=Billing%20and%20account%20help' },
  { label: 'Privacy', detail: 'Request data deletion or ask how account and broker data are handled.', href: '/privacy' },
];

function Field({ id, label, required = false, error, children }) {
  return (
    <label className='xj-field' htmlFor={id}>
      <span>{label}<em>{required ? 'Required' : 'Optional'}</em></span>
      {children}
      {error ? <small className='xj-field-error' id={`${id}-error`} role='alert'>{error}</small> : null}
    </label>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [sentEmail, setSentEmail] = useState('');
  useDeskReveal();

  const set = (key) => (event) => {
    const value = event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Enter your name.';
    if (!form.email.trim()) next.email = 'Enter your email address.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Enter a valid email address.';
    if (!form.message.trim()) next.message = 'Tell us what you need help with.';
    return next;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate();
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus('idle');
      const firstInvalidKey = Object.keys(nextErrors)[0];
      window.requestAnimationFrame(() => document.getElementById(`contact-${firstInvalidKey}`)?.focus());
      return;
    }

    setStatus('sending');
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error('Failed to send message.');

      setSentEmail(form.email);
      setStatus('sent');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('error');
    }
  };

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <section className='xj-cover' aria-labelledby='contact-heading'>
            <div className='xj-shell xjc-grid'>
              <div className='xj-settle'>
                <p className='xj-eyebrow'>Support line · human reply</p>
                <h1 id='contact-heading' className='xj-h1'>Bring the <em>details.</em></h1>
                <p className='xj-lede'>
                  Questions about Pro, broker sync, billing, privacy or a bug? Send the evidence
                  once. A real person reads it and routes it to the right place.
                </p>

                <ul className='xjc-routes'>
                  {CONTACT_ROUTES.map(({ label, value, helper, href }) => {
                    const content = (
                      <>
                        <span className='xj-label'>{label}</span>
                        <div><strong>{value}</strong><p>{helper}</p></div>
                      </>
                    );
                    return (
                      <li key={label}>
                        {href ? (
                          <a
                            href={href}
                            target={href.startsWith('http') ? '_blank' : undefined}
                            rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                          >
                            {content}
                          </a>
                        ) : (
                          <div className='xjc-route-static'>{content}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <Panel className='xjc-form' label='Incoming · support' meta='Reply in 1 business day'>
                {status === 'sent' ? (
                  <div className='xjc-success' role='status' aria-live='polite'>
                    <ShieldCheck aria-hidden='true' />
                    <h2 className='xj-h3'>Message logged.</h2>
                    <p>We received your note and will reply to <strong>{sentEmail}</strong> as soon as possible.</p>
                    <CTAButton ghost onClick={() => setStatus('idle')}>Send another message</CTAButton>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} noValidate>
                    <p className='xjc-hint'>
                      Include the account email, the affected page and what you expected to happen.
                      Specifics shorten the reply.
                    </p>

                    <div className='xjc-field-grid'>
                      <Field id='contact-name' label='Name' required error={errors.name}>
                        <input id='contact-name' className='xj-input' value={form.name} onChange={set('name')} autoComplete='name' aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                      </Field>
                      <Field id='contact-email' label='Email' required error={errors.email}>
                        <input id='contact-email' className='xj-input' type='email' value={form.email} onChange={set('email')} autoComplete='email' aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                      </Field>
                    </div>

                    <Field id='contact-subject' label='Subject'>
                      <input id='contact-subject' className='xj-input' value={form.subject} onChange={set('subject')} placeholder='Broker sync, billing, bug report…' />
                    </Field>

                    <Field id='contact-message' label='Message' required error={errors.message}>
                      <textarea id='contact-message' className='xj-input' value={form.message} onChange={set('message')} rows='6' aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} placeholder='Page, account email, what happened, and what you already tried.' />
                    </Field>

                    {status === 'error' ? (
                      <p className='xjc-form-error' role='alert'>
                        The message did not send. Try again, or email info@xaujournal.com directly.
                      </p>
                    ) : null}

                    <div className='xjc-submit'>
                      <small>Your message is used only to answer this request.</small>
                      <CTAButton type='submit' disabled={status === 'sending'}>
                        {status === 'sending' ? 'Sending…' : 'Send it'}
                      </CTAButton>
                    </div>
                  </form>
                )}
              </Panel>
            </div>
          </section>

          <section className='xj-section' aria-labelledby='support-topics-heading'>
            <div className='xj-shell'>
              <SectionHead
                eyebrow='Faster if you pick a desk'
                id='support-topics-heading'
                title={<>Choose the closest <em>support desk.</em></>}
              />
              <div className='xj-rows xj-reveal'>
                {SUPPORT_TOPICS.map(({ label, detail, href }) => (
                  <a className='xj-row' href={href} key={label}>
                    <span>{label}</span>
                    <p>{detail}</p>
                    <svg viewBox='0 0 14 14' aria-hidden='true'><path d='M3 11L11 3M11 3H5M11 3v6' /></svg>
                  </a>
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
