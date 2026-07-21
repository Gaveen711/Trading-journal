import { useState } from 'react';
import { ArrowRight, Bug, Clock3, CreditCard, Mail, MessageCircle, PlugZap, ShieldCheck } from 'lucide-react';

import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import './PublicEditorial.css';

const CONTACT_ROUTES = [
  {
    icon: Mail,
    label: 'Email desk',
    value: 'info@xaujournal.com',
    helper: 'Account, billing, product and privacy questions.',
    href: 'mailto:info@xaujournal.com',
  },
  {
    icon: Clock3,
    label: 'Response window',
    value: 'Within one business day',
    helper: 'Monday to Friday support for traders worldwide.',
  },
  {
    icon: MessageCircle,
    label: 'Trader community',
    value: 'Discord feedback channel',
    helper: 'Share an idea, report an issue or follow product updates.',
    href: 'https://discord.gg/smbNwBZC2',
  },
];

const SUPPORT_TOPICS = [
  { icon: Bug, label: 'Bug report', detail: 'Include the page, browser, device and the exact steps that caused the issue.', href: 'mailto:info@xaujournal.com?subject=Bug%20report' },
  { icon: PlugZap, label: 'Broker sync', detail: 'Ask about MT4/MT5 connection status, MetaAPI or a missing trade import.', href: 'mailto:info@xaujournal.com?subject=Broker%20sync%20help' },
  { icon: CreditCard, label: 'Billing and account', detail: 'Get help with Pro access, invoices, cancellation, refunds or account changes.', href: 'mailto:info@xaujournal.com?subject=Billing%20and%20account%20help' },
  { icon: ShieldCheck, label: 'Privacy request', detail: 'Request data deletion or ask how account and broker data are handled.', href: '/privacy' },
];

function Field({ id, label, required = false, error, children }) {
  return (
    <label className='xep-field' htmlFor={id}>
      <span>{label}{required ? <em>Required</em> : <em>Optional</em>}</span>
      {children}
      {error ? <small className='xep-field-error' id={`${id}-error`} role='alert'>{error}</small> : null}
    </label>
  );
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [sentEmail, setSentEmail] = useState('');

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
    <div data-ux-skip='true'>
      <PublicNavbar />

      <main className='xep-page' data-ux-skip='true'>
        <section className='xep-contact-hero' aria-labelledby='contact-heading'>
          <div className='xep-shell xep-contact-grid'>
            <div className='xep-contact-copy'>
              <p className='xep-kicker'><span>01</span> Support docket / human reply</p>
              <h1 id='contact-heading' className='xep-title'>Bring the details.<br /><em>We’ll trace the issue.</em></h1>
              <p className='xep-lede'>Questions about Pro, broker sync, billing, privacy or a bug? Send the evidence once. A real person will read it and route it to the right place.</p>

              <ul className='xep-contact-routes'>
                {CONTACT_ROUTES.map(({ icon: Icon, label, value, helper, href }) => {
                  const content = (
                    <div className='xep-contact-route'>
                      <Icon aria-hidden='true' />
                      <div><span>{label}</span><strong>{value}</strong><p>{helper}</p></div>
                    </div>
                  );
                  return (
                    <li key={label}>
                      {href ? <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}>{content}</a> : content}
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className='xep-docket'>
              {status === 'sent' ? (
                <div className='xep-success' role='status' aria-live='polite'>
                  <ShieldCheck aria-hidden='true' />
                  <h2>Message logged.</h2>
                  <p>We received your note and will reply to <strong>{sentEmail}</strong> as soon as possible.</p>
                  <button className='xep-button xep-button--primary' type='button' onClick={() => setStatus('idle')}>Send another message <ArrowRight aria-hidden='true' /></button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div className='xep-docket-head'>
                    <div><span>Incoming request</span><strong>SUPPORT / NEW</strong></div>
                    <span className='xep-stamp'>Reply<br />within 1 day</span>
                  </div>
                  <div className='xep-docket-body'>
                    <p>Include the account email, affected page and what you expected to happen. Specifics shorten the reply.</p>

                    <div className='xep-field-grid'>
                      <Field id='contact-name' label='Name' required error={errors.name}>
                        <input id='contact-name' className='xep-input' value={form.name} onChange={set('name')} autoComplete='name' aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'contact-name-error' : undefined} />
                      </Field>
                      <Field id='contact-email' label='Email' required error={errors.email}>
                        <input id='contact-email' className='xep-input' type='email' value={form.email} onChange={set('email')} autoComplete='email' aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'contact-email-error' : undefined} />
                      </Field>
                    </div>

                    <Field id='contact-subject' label='Subject'>
                      <input id='contact-subject' className='xep-input' value={form.subject} onChange={set('subject')} placeholder='Broker sync, billing, bug report…' />
                    </Field>

                    <Field id='contact-message' label='Message' required error={errors.message}>
                      <textarea id='contact-message' className='xep-input' value={form.message} onChange={set('message')} rows='6' aria-invalid={Boolean(errors.message)} aria-describedby={errors.message ? 'contact-message-error' : undefined} placeholder='Page, account email, what happened, and what you already tried.' />
                    </Field>

                    {status === 'error' ? <p className='xep-form-error' role='alert'>The message did not send. Try again, or email info@xaujournal.com directly.</p> : null}

                    <div className='xep-submit-row'>
                      <small>Your message is used only to answer this request.</small>
                      <button className='xep-button xep-button--primary' type='submit' disabled={status === 'sending'}>
                        {status === 'sending' ? 'Sending…' : 'Send the docket'} <ArrowRight aria-hidden='true' />
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>

        <section className='xep-section xep-section--sheet' aria-labelledby='support-topics-heading'>
          <div className='xep-shell'>
            <p className='xep-kicker'><span>02</span> Route it faster</p>
            <h2 id='support-topics-heading' className='xep-heading'>Choose the closest <em>support desk.</em></h2>
            <div className='xep-support-list'>
              {SUPPORT_TOPICS.map(({ icon: Icon, label, detail, href }, index) => (
                <a className='xep-support-row' href={href} key={label}>
                  <span>0{index + 1}</span>
                  <h3>{label}</h3>
                  <p>{detail}</p>
                  <Icon aria-hidden='true' />
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}