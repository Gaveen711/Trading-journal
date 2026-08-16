import { Link } from 'react-router-dom';
/* Display serif for the Vitrine headlines — Geist itself is imported once in
   src/main.jsx; the italic file carries the real italics the headings use. */
import '@fontsource-variable/newsreader/opsz.css';
import '@fontsource-variable/newsreader/opsz-italic.css';
import '../pages/PublicSite.css';

/* Shared building blocks for the public "Vitrine" site.
   Session maths lives in src/lib/goldSessions.js; the sample record
   behind the interactive panels lives in src/lib/deskDemo.js. */

export function Arrow() {
  return (
    <svg viewBox='0 0 14 14' aria-hidden='true'>
      <path d='M2 7h10M8 3l4 4-4 4' />
    </svg>
  );
}

export function ArrowOut() {
  return (
    <svg viewBox='0 0 14 14' aria-hidden='true'>
      <path d='M3 11L11 3M11 3H5M11 3v6' />
    </svg>
  );
}

export function Wordmark({ as: Tag = 'span' }) {
  return <Tag className='xj-wordmark'>xau<b>/</b>journal</Tag>;
}

/** Primary action. Bone, never amber — amber has to keep meaning "signal". */
export function CTALink({ to, children, ghost = false, className = '' }) {
  return (
    <Link className={`xj-cta ${ghost ? 'xj-cta--ghost' : ''} ${className}`.trim()} to={to}>
      {children}
      <Arrow />
    </Link>
  );
}

export function CTAButton({ children, ghost = false, className = '', ...rest }) {
  return (
    <button type='button' {...rest} className={`xj-cta ${ghost ? 'xj-cta--ghost' : ''} ${className}`.trim()}>
      {children}
      <Arrow />
    </button>
  );
}

export function TextLink({ to, children, external = false }) {
  if (external) {
    return (
      <a className='xj-link' href={to} target='_blank' rel='noopener noreferrer'>
        {children}
        <ArrowOut />
      </a>
    );
  }
  return (
    <Link className='xj-link' to={to}>
      {children}
      <ArrowOut />
    </Link>
  );
}

/** Bordered surface with an optional silkscreened header strip. */
export function Panel({ label, meta, children, className = '', ...rest }) {
  return (
    <div className={`xj-panel ${className}`.trim()} {...rest}>
      {label ? (
        <div className='xj-panel-bar'>
          <strong>{label}</strong>
          {meta ? <span>{meta}</span> : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}

/** Section heading. `split` puts the lede alongside instead of beneath. */
export function SectionHead({ eyebrow, title, id, lede, split = false }) {
  return (
    <div className={split ? 'xj-head xj-head--split' : 'xj-head'}>
      <div>
        {eyebrow ? <p className='xj-eyebrow'>{eyebrow}</p> : null}
        <h2 id={id} className='xj-h2'>{title}</h2>
      </div>
      {lede ? <p className='xj-lede'>{lede}</p> : null}
    </div>
  );
}
