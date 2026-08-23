import { Link } from 'react-router-dom';
import { SHOTS, SHOT_HEIGHT, SHOT_WIDTH, shotSrc } from './shots.js';
import { InteractiveHoverButton } from './ui/interactive-hover-button.jsx';
/* Display serif for the Vitrine headlines — Geist itself is imported once in
   src/main.jsx; the italic file carries the real italics the headings use. */
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
    <InteractiveHoverButton
      as={Link}
      className={`${ghost ? 'xj-cta--ghost' : ''} ${className}`.trim()}
      to={to}
    >
      {children}
    </InteractiveHoverButton>
  );
}

export function CTAButton({ children, ghost = false, className = '', ...rest }) {
  return (
    <InteractiveHoverButton
      className={`${ghost ? 'xj-cta--ghost' : ''} ${className}`.trim()}
      {...rest}
    >
      {children}
    </InteractiveHoverButton>
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
          <span className='xj-panel-controls' aria-hidden='true'>
            <i />
            <i />
            <i />
          </span>
          <strong>{label}</strong>
          {meta ? <span className='xj-panel-meta'>{meta}</span> : null}
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

/* ————————————————————————— product plates —————————————————————————
   Real screenshots of the dashboard, captured by `npm run shots` from the
   dev-only showcase routes (see public/shots/README.md). The plate declares
   the capture box (1440×900) so nothing shifts while the image streams in;
   if a file is missing (a fresh checkout before `npm run shots`) the frame
   stays up and shows its title, so layout work never depends on the bytes. */

/**
 * One product plate. `chrome` draws a window bar above the image; `priority`
 * is for the hero (eager + high fetch priority); everything else lazy-loads.
 */
export function Shot({ name, title, chrome = true, priority = false, className = '', style, ...rest }) {
  const meta = SHOTS[name];
  const label = title ?? name;
  return (
    <figure className={`xj-shot ${chrome ? 'xj-shot--chrome' : ''} ${className}`.trim()} style={style} {...rest}>
      {chrome ? (
        <div className='xj-shot-bar' aria-hidden='true'>
          <span className='xj-shot-dots'><i /><i /><i /></span>
          <span className='xj-shot-title'>{label}</span>
        </div>
      ) : null}
      <div className='xj-shot-frame'>
        <img
          src={shotSrc(name)}
          width={SHOT_WIDTH}
          height={SHOT_HEIGHT}
          alt={meta?.alt ?? label}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          draggable='false'
          onError={(event) => { event.currentTarget.setAttribute('data-missing', 'true'); }}
        />
        <span className='xj-shot-missing' aria-hidden='true'>{label}</span>
      </div>
    </figure>
  );
}
