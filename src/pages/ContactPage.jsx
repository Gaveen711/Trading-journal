import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { PublicFooter } from '../components/FooterNav';
import { PublicNavbar } from '../components/PublicNavbar';
import { ArrowOut, CTAButton, TextLink } from '../components/PublicSite';
import { BROKER_PRESETS } from '../data/brokerCatalog';
import { formatUtc, useDeskReveal } from '../lib/goldSessions';
import { applyPageSEO } from '../lib/seo';
import './PublicSite.css';
import './ContactPage.css';

/* ——————————————————————————— constants ———————————————————————————
   The contact endpoint (api/[...route].ts → POST /contact) reads exactly
   four fields: name, email, subject, message. It caps `message` at 5000
   characters and drops anything else, so the topic and the broker-request
   fields below are folded INTO subject/message rather than sent alongside. */

const SUPPORT_EMAIL = 'info@xaujournal.com';
const MESSAGE_LIMIT = 5000;
/* The privacy, terms and refund pages all say "within two business days";
   this page says the same thing so the promise is one promise. */
const REPLY_PROMISE = 'within two business days';

/* Help topics. The first three are the existing support desks and double as
   the "what to include" rows; `broker` reveals the request fields; `other`
   is the catch-all. `label` becomes the stored subject line. */
const TOPICS = [
  { value: 'bug', label: 'Bug report', include: 'The page, browser, device and the exact steps that caused the issue.' },
  { value: 'sync', label: 'Broker sync', include: 'MT4/MT5 connection status, MetaAPI if it is involved, or the trade that did not import.' },
  { value: 'billing', label: 'Billing', include: 'Pro access, invoices, cancellation, refunds or account changes, plus the account email.' },
  { value: 'privacy', label: 'Privacy' },
  { value: 'broker', label: 'Request a broker' },
  { value: 'other', label: 'Other' },
];

const GUIDE_TOPICS = TOPICS.filter((topic) => topic.include);

const PLATFORMS = [
  { value: 'mt4', label: 'MT4' },
  { value: 'mt5', label: 'MT5' },
  { value: 'ctrader', label: 'cTrader' },
  { value: 'other', label: 'Other' },
];

/* Broker figures come from the catalog, never from copy. "Syncing today"
   means a preset with pre-filled servers that is neither the catch-all
   "Other Broker" entry nor flagged coming soon. */
const SYNCING_BROKERS = BROKER_PRESETS.filter((preset) => !preset.comingSoon && preset.id !== 'custom');
const BROKER_COUNTS = {
  total: SYNCING_BROKERS.length,
  mt4: SYNCING_BROKERS.filter((preset) => preset.platforms?.includes('mt4')).length,
  mt5: SYNCING_BROKERS.filter((preset) => preset.platforms?.includes('mt5')).length,
};
const COMING_SOON_NAMES = BROKER_PRESETS.filter((preset) => preset.comingSoon).map((preset) => preset.name);

const EMPTY_FORM = { name: '', email: '', topic: '', brokerName: '', platform: '', message: '' };

/* Order decides which invalid field takes focus after a failed submit. */
const FIELD_ORDER = ['name', 'email', 'topic', 'brokerName', 'platform', 'message'];
const FIELD_IDS = {
  name: 'xct-name',
  email: 'xct-email',
  topic: 'xct-topic',
  brokerName: 'xct-broker',
  platform: 'xct-platform-mt4',
  message: 'xct-message',
};

/* Same test the endpoint runs, so a value that passes here is not bounced
   with a 400 a second later. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ——————————————————————————— helpers ——————————————————————————— */

function listWithAnd(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

function topicLabel(value) {
  return TOPICS.find((topic) => topic.value === value)?.label;
}

function platformLabel(value) {
  return PLATFORMS.find((platform) => platform.value === value)?.label;
}

function validateField(key, form) {
  const isBroker = form.topic === 'broker';
  switch (key) {
    case 'name':
      return form.name.trim() ? '' : 'Enter your name.';
    case 'email':
      if (!form.email.trim()) return 'Enter your email address.';
      return EMAIL_RE.test(form.email.trim()) ? '' : 'Enter a valid email address.';
    case 'topic':
      return form.topic ? '' : 'Choose a topic.';
    case 'brokerName':
      return !isBroker || form.brokerName.trim() ? '' : 'Enter the broker’s name.';
    case 'platform':
      return !isBroker || form.platform ? '' : 'Pick the platform you trade on.';
    case 'message':
      if (!form.message.trim()) return 'Tell us what you need.';
      return form.message.length > MESSAGE_LIMIT ? `Keep it under ${MESSAGE_LIMIT.toLocaleString()} characters.` : '';
    default:
      return '';
  }
}

function validateAll(form) {
  const next = {};
  for (const key of FIELD_ORDER) {
    const message = validateField(key, form);
    if (message) next[key] = message;
  }
  return next;
}

/* The request body the endpoint has always received: { name, email, subject,
   message }. The topic becomes the subject; a broker request also carries the
   broker and platform at the top of the message so the stored record and the
   staff email keep them even though the endpoint has no field for either. */
function buildPayload(form) {
  const isBroker = form.topic === 'broker';
  const broker = form.brokerName.trim();
  const platform = platformLabel(form.platform) ?? 'platform not given';
  const subject = isBroker
    ? `Request a broker — ${broker} (${platform})`
    : topicLabel(form.topic) ?? '';
  const message = isBroker
    ? `Broker: ${broker}\nPlatform: ${platform}\n\n${form.message}`
    : form.message;
  return { name: form.name, email: form.email, subject, message };
}

/* Fallback when the endpoint is unreachable: the same subject and text,
   handed to the reader's own mail client so nothing has to be retyped. */
function mailtoFor(form) {
  const { subject, message } = buildPayload(form);
  const body = `Name: ${form.name}\n\n${message}`.slice(0, 4000);
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function describedBy(id, { hint = false, error = false } = {}) {
  const ids = [];
  if (hint) ids.push(`${id}-hint`);
  if (error) ids.push(`${id}-error`);
  return ids.length ? ids.join(' ') : undefined;
}

function focusField(key) {
  const run = () => document.getElementById(FIELD_IDS[key])?.focus();
  if (typeof window.requestAnimationFrame === 'function') window.requestAnimationFrame(run);
  else run();
}

/* ——————————————————————————— pieces ——————————————————————————— */

/* Label sits above the control as its own element (not wrapped around it) so
   the accessible name is the label alone and the error can be wired through
   aria-describedby instead of being read as part of the name. */
function Field({ id, label, required = false, error, children, className = '' }) {
  return (
    <div className={`xct-field ${className}`.trim()}>
      <label className='xct-label' htmlFor={id}>
        <span>{label}</span>
        <em>{required ? 'Required' : 'Optional'}</em>
      </label>
      {children}
      {error ? <small className='xj-field-error' id={`${id}-error`} role='alert'>{error}</small> : null}
    </div>
  );
}

function EnvelopeStatus({ status, receipt }) {
  if (status === 'sending') return <span className='xj-live'>Sending</span>;
  if (status === 'sent' && receipt) return `Sent · ${receipt.at} UTC`;
  if (status === 'error') return 'Not sent';
  return 'Draft';
}

/* ——————————————————————————— page ——————————————————————————— */

export function ContactPage() {
  const location = useLocation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [receipt, setReceipt] = useState(null);
  useDeskReveal();

  useEffect(() => {
    applyPageSEO(location.pathname);
  }, [location.pathname]);

  const isBroker = form.topic === 'broker';
  const messageCount = form.message.length;

  /* Every change re-checks only the fields already flagged, so an error
     clears the moment it is fixed but never appears mid-keystroke. */
  const setValue = (key, value) => {
    const next = { ...form, [key]: value };
    setForm(next);
    setErrors((current) => {
      const still = {};
      for (const flagged of Object.keys(current)) {
        const message = validateField(flagged, next);
        if (message) still[flagged] = message;
      }
      return still;
    });
  };

  const handleChange = (key) => (event) => setValue(key, event.target.value);

  /* Blur validates what was typed (a malformed email, an over-long message).
     Empty required fields wait for submit, so tabbing past one is not an error. */
  const handleBlur = (key) => () => {
    const value = form[key];
    if (!String(value).trim() && !errors[key]) return;
    const message = validateField(key, form);
    setErrors((current) => {
      if (message) return { ...current, [key]: message };
      if (!current[key]) return current;
      const { [key]: _cleared, ...rest } = current;
      return rest;
    });
  };

  const pickTopic = (value, focusKey) => {
    setValue('topic', value);
    focusField(focusKey);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateAll(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setStatus('idle');
      focusField(FIELD_ORDER.find((key) => nextErrors[key]));
      return;
    }

    setStatus('sending');
    setErrors({});

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(form)),
      });
      if (!response.ok) throw new Error('Failed to send message.');

      setReceipt({ email: form.email, topic: form.topic, at: formatUtc(new Date(), false) });
      setStatus('sent');
      setForm(EMPTY_FORM);
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setStatus('error');
    }
  };

  const startAnother = () => {
    setStatus('idle');
    setReceipt(null);
    focusField('name');
  };

  return (
    <>
      <PublicNavbar />
      <div className='xj' data-ux-skip='true'>
        <main data-ux-skip='true'>
          <section className='xj-cover' aria-labelledby='contact-heading'>
            <div className='xj-shell xct-grid'>
              <header className='xct-head xj-settle'>
                <p className='xj-eyebrow'>Contact</p>
                <h1 id='contact-heading' className='xj-h1'>Talk to the people who <em>built</em> the desk.</h1>
                <p className='xj-lede'>
                  No ticket queue and no auto-reply. Messages land with the team that builds
                  xaujournal, and we aim to answer {REPLY_PROMISE}. The more specific the note,
                  the shorter the thread.
                </p>
              </header>

              <div className='xj-glass xct-sheet'>
                <dl className='xct-envelope'>
                  <div>
                    <dt>To</dt>
                    <dd>{SUPPORT_EMAIL}</dd>
                  </div>
                  <div>
                    <dt>Re</dt>
                    <dd>{topicLabel(form.topic) ?? (receipt ? topicLabel(receipt.topic) : null) ?? <span className='xct-dim'>—</span>}</dd>
                  </div>
                  <div className='xct-envelope-status'>
                    <dt>Status</dt>
                    <dd role='status'><EnvelopeStatus status={status} receipt={receipt} /></dd>
                  </div>
                </dl>

                {status === 'sent' && receipt ? (
                  <div className='xct-receipt'>
                    <h2>Sent · {receipt.at} UTC</h2>
                    <dl>
                      <dt>Reply</dt>
                      <dd>Goes to <strong>{receipt.email}</strong>, {REPLY_PROMISE}.</dd>
                      <dt>Next</dt>
                      <dd>
                        A person reads it. No auto-reply arrives first, so quiet until then is normal.
                        {receipt.topic === 'broker'
                          ? ' We check the catalog before anything else; if the broker already syncs, the reply carries the connection steps.'
                          : ''}
                      </dd>
                    </dl>
                    <CTAButton ghost onClick={startAnother}>Write another</CTAButton>
                  </div>
                ) : (
                  <form className='xct-form' onSubmit={handleSubmit} noValidate>
                    <div className='xct-pair'>
                      <Field id={FIELD_IDS.name} label='Name' required error={errors.name}>
                        <input
                          id={FIELD_IDS.name}
                          className='xj-input'
                          value={form.name}
                          onChange={handleChange('name')}
                          onBlur={handleBlur('name')}
                          autoComplete='name'
                          required
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={describedBy(FIELD_IDS.name, { error: Boolean(errors.name) })}
                        />
                      </Field>
                      <Field id={FIELD_IDS.email} label='Email' required error={errors.email}>
                        <input
                          id={FIELD_IDS.email}
                          className='xj-input'
                          type='email'
                          inputMode='email'
                          value={form.email}
                          onChange={handleChange('email')}
                          onBlur={handleBlur('email')}
                          autoComplete='email'
                          required
                          aria-invalid={Boolean(errors.email)}
                          aria-describedby={describedBy(FIELD_IDS.email, { error: Boolean(errors.email) })}
                        />
                      </Field>
                    </div>

                    <Field id={FIELD_IDS.topic} label='Topic' required error={errors.topic}>
                      <div className='xct-select'>
                        <select
                          id={FIELD_IDS.topic}
                          className={`xj-input ${form.topic ? '' : 'is-empty'}`.trim()}
                          value={form.topic}
                          onChange={handleChange('topic')}
                          onBlur={handleBlur('topic')}
                          required
                          aria-invalid={Boolean(errors.topic)}
                          aria-describedby={describedBy(FIELD_IDS.topic, { error: Boolean(errors.topic) })}
                        >
                          <option value=''>Choose a topic</option>
                          {TOPICS.map((topic) => (
                            <option key={topic.value} value={topic.value}>{topic.label}</option>
                          ))}
                        </select>
                        <ChevronDown aria-hidden='true' strokeWidth={1.5} />
                      </div>
                    </Field>

                    {isBroker ? (
                      <div className='xct-request'>
                        <p className='xj-eyebrow'>Broker request</p>
                        <Field id={FIELD_IDS.brokerName} label='Broker' required error={errors.brokerName}>
                          <input
                            id={FIELD_IDS.brokerName}
                            className='xj-input'
                            value={form.brokerName}
                            onChange={handleChange('brokerName')}
                            onBlur={handleBlur('brokerName')}
                            autoComplete='off'
                            placeholder='The name on your trading account'
                            required
                            aria-invalid={Boolean(errors.brokerName)}
                            aria-describedby={describedBy(FIELD_IDS.brokerName, { error: Boolean(errors.brokerName) })}
                          />
                        </Field>
                        <fieldset
                          className='xct-field xct-platform'
                          aria-describedby={describedBy('xct-platform', { error: Boolean(errors.platform) })}
                        >
                          <legend className='xct-label'>
                            <span>Platform</span>
                            <em>Required</em>
                          </legend>
                          <div className='xct-chips'>
                            {PLATFORMS.map((platform) => (
                              <label className='xct-chip' key={platform.value}>
                                <input
                                  id={`xct-platform-${platform.value}`}
                                  className='xj-sr'
                                  type='radio'
                                  name='platform'
                                  value={platform.value}
                                  checked={form.platform === platform.value}
                                  onChange={handleChange('platform')}
                                  aria-invalid={Boolean(errors.platform)}
                                />
                                <span className='xct-chip-face'>{platform.label}</span>
                              </label>
                            ))}
                          </div>
                          {errors.platform ? (
                            <small className='xj-field-error' id='xct-platform-error' role='alert'>{errors.platform}</small>
                          ) : null}
                        </fieldset>
                        <p className='xct-request-note'>
                          We check the catalog first. If the broker already syncs, the reply carries the connection steps.
                        </p>
                      </div>
                    ) : null}

                    <Field id={FIELD_IDS.message} label='Message' required error={errors.message}>
                      <textarea
                        id={FIELD_IDS.message}
                        className='xj-input'
                        rows='7'
                        value={form.message}
                        onChange={handleChange('message')}
                        onBlur={handleBlur('message')}
                        required
                        aria-invalid={Boolean(errors.message)}
                        aria-describedby={describedBy(FIELD_IDS.message, { hint: true, error: Boolean(errors.message) })}
                      />
                      <div className='xct-meta'>
                        <span id={`${FIELD_IDS.message}-hint`}>
                          {isBroker
                            ? `Anything that helps: server name, account type, demo or live. Up to ${MESSAGE_LIMIT.toLocaleString()} characters.`
                            : `Page, account email, what happened and what you expected. Up to ${MESSAGE_LIMIT.toLocaleString()} characters.`}
                        </span>
                        <span
                          className={`xj-num xct-count ${messageCount > MESSAGE_LIMIT ? 'is-over' : ''}`.trim()}
                          aria-hidden='true'
                        >
                          {messageCount.toLocaleString()} / {MESSAGE_LIMIT.toLocaleString()}
                        </span>
                      </div>
                    </Field>

                    {status === 'error' ? (
                      <div className='xct-fail' role='alert'>
                        <p className='xj-label'>Not sent</p>
                        <p>
                          The message did not reach us. Your text is still here — try again, or hand
                          it to your own mail client with the same subject and text.
                        </p>
                        <a className='xj-link' href={mailtoFor(form)}>
                          Email it to {SUPPORT_EMAIL}
                          <ArrowOut />
                        </a>
                      </div>
                    ) : null}

                    <div className='xct-submit'>
                      <p className='xct-consent'>
                        Kept only to answer this message. <TextLink to='/privacy'>Privacy policy</TextLink>
                      </p>
                      <CTAButton type='submit' disabled={status === 'sending'} aria-busy={status === 'sending'}>
                        {status === 'sending' ? 'Sending…' : 'Send message'}
                      </CTAButton>
                    </div>
                  </form>
                )}
              </div>

              <aside className='xct-aside xj-reveal' aria-label='What to include and broker requests'>
                <p className='xj-label'>What to include</p>
                <ul className='xct-rows'>
                  {GUIDE_TOPICS.map((topic) => {
                    const active = form.topic === topic.value;
                    return (
                      <li key={topic.value}>
                        <button
                          type='button'
                          className='xct-row'
                          aria-pressed={active}
                          onClick={() => pickTopic(topic.value, 'message')}
                        >
                          <span className='xct-row-label'>{topic.label}</span>
                          <span className='xct-row-detail'>{topic.include}</span>
                          <span className='xct-row-cue'>{active ? 'Selected' : 'Use'}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <p className='xct-direct'>
                  Prefer your own mail client? <TextLink external to={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</TextLink>
                </p>

                <div className='xct-broker'>
                  <p className='xj-eyebrow'>Ask for your broker</p>
                  <p className='xct-stat'>
                    <strong className='xj-num'>{BROKER_COUNTS.total}</strong>
                    <span>brokers sync today</span>
                  </p>
                  <ul className='xct-platforms' aria-label='By platform'>
                    <li>
                      <img src='/mt5.svg' width='16' height='16' alt='' aria-hidden='true' />
                      <span><b className='xj-num'>{BROKER_COUNTS.mt5}</b> on MT5</span>
                    </li>
                    <li>
                      <img src='/mt4.svg' width='16' height='16' alt='' aria-hidden='true' />
                      <span><b className='xj-num'>{BROKER_COUNTS.mt4}</b> on MT4</span>
                    </li>
                  </ul>
                  <p className='xct-broker-copy'>
                    Each one arrives with its MT4 or MT5 servers pre-filled, so fills import on their own.
                    If yours is not in the catalog, ask for it here; brokers are added by request.
                    {COMING_SOON_NAMES.length
                      ? ` ${listWithAnd(COMING_SOON_NAMES)} are already marked coming soon, so no need to ask for those.`
                      : ''}
                  </p>
                  <CTAButton ghost onClick={() => pickTopic('broker', 'brokerName')}>Request a broker</CTAButton>
                </div>
              </aside>
            </div>
          </section>
        </main>
      </div>
      <PublicFooter />
    </>
  );
}
