import { useRef, useState } from 'react';
import { pad2 } from '../../lib/tradeUtils';
import { SectionHead, Shot } from '../PublicSite';
import { GOLD_SESSIONS, isSessionOpen, useUtcClock } from '../../lib/goldSessions';
import { DEMO_TRADES, formatR, formatR2, summarise } from '../../lib/deskDemo';
import './Chapters.css';

/* ————————————————————————————————————————————————————————————————
   The product, in three chapters: capture, read, keep.

   Each chapter is one real capture of the dashboard under glass with a
   smaller inset beside it, and a placard column that reads it. Numbered
   amber markers sit over the plate — amber because each one is pointing
   at a figure the placard discusses, the only job amber is allowed here.

   Chapter two keeps the session rail: four desks as a real tablist, and
   the figures beneath re-read the same sample record through whichever
   UTC window is selected. Every number is derived from DEMO_TRADES.
   ———————————————————————————————————————————————————————————————— */

const RECORD_SIZE = DEMO_TRADES.length;

const windowLabel = (session) => `${pad2(session.open)}:00–${pad2(session.close)}:00`;

/** The four rail sessions, each carrying the sample figures for its UTC window. */
/** Rail city → the deskDemo session its trades are tagged with. */
const RAIL_TO_DESK = { syd: 'asia', tok: 'asia', lon: 'london', ny: 'ny' };

/* Figures are read by the DESK the fill was tagged with, not by clock
   window — the hero ticker quotes sessionSplit() the same way, so the two
   never disagree about what London made. A window read would let the
   London tab swallow the NY overlap and report a different number. */
const RAIL = GOLD_SESSIONS.map((session) => ({
  ...session,
  figures: summarise(DEMO_TRADES.filter((t) => t.session === RAIL_TO_DESK[session.id])),
}));

/* The record files Sydney and Tokyo under one Asia desk, so the panel says
   which desk a city's figures belong to. */
const DESK_NAMES = { asia: 'Asia desk', london: 'London desk', ny: 'New York desk' };

/* Marker coordinates are percentages of the 1440×900 capture each plate
   shows (public/shots/*.webp), read off the real pixels. Regenerating the
   shots with a different layout means re-reading these. */
const CHAPTERS = [
  {
    id: 'capture',
    number: '01',
    name: 'Capture',
    title: <>Fills arrive. You add the <em>reason.</em></>,
    shot: { name: 'history', title: 'History — every fill on record' },
    inset: { name: 'sync', title: 'Broker sync' },
    copy: [
      'Connect an MT4 or MT5 account once. Closed fills land in the record on their own — entry, exit, size, timestamp — keyed by deal ticket, so a re-sync never files the same trade twice.',
      'On the free desk a manual entry takes seconds: price in, price out, lots, a setup tag and a note. Pro lets you pin the chart screenshot to it, so the fill becomes something you can read back in a month.',
    ],
    marks: [
      { n: 1, x: 86, y: 59, on: 'main', text: 'Each fill with its R-multiple and realised P&L, signed.' },
      { n: 2, x: 39, y: 66, on: 'main', text: 'The setup tag — one word that makes the trade searchable later.' },
      { n: 3, x: 85, y: 70, on: 'inset', text: 'IC Markets connected — 60 fills on file, synced on their own.' },
    ],
  },
  {
    id: 'read',
    number: '02',
    name: 'Read',
    title: <>Which session <em>pays</em> you.</>,
    shot: { name: 'analytics', title: 'Analytics — sessions and setups' },
    inset: { name: 'calendar', title: 'P&L calendar' },
    copy: [
      'Gold trades through four desks a day. The analytics split every figure by session and by setup, so a flat month stops being a mood and becomes an address: this window, this pattern.',
      'Pick a desk below. The figures re-read the same sample record through the fills tagged to it.',
    ],
    marks: [
      { n: 1, x: 62, y: 78, on: 'main', text: 'P&L by session — the edge in London, the leak in the Asia hours.' },
      { n: 2, x: 52, y: 24, on: 'main', text: 'Hit rate, expectancy and profit factor for whatever the filters hold.' },
      { n: 3, x: 48, y: 56, on: 'inset', text: 'The month, one cell per day, coloured only by realised P&L.' },
    ],
  },
  {
    id: 'keep',
    number: '03',
    name: 'Keep',
    title: <>The record keeps you <em>honest.</em></>,
    shot: { name: 'journal', title: 'Journal — the day beside its trades' },
    inset: { name: 'dashboard', title: 'The desk' },
    copy: [
      'A daily entry sits next to the day’s fills, with a session mood on a five-point scale. Six weeks later the pattern between the two is hard to argue with.',
      'Three rules you set yourself: trades per day, risk per trade, a cooldown after a loss. Break one and the trade carries a flag; the desk totals what broken rules cost you over the last seven days. Nothing is blocked — the flag is the point.',
    ],
    marks: [
      { n: 1, x: 32, y: 42, on: 'main', text: 'Session mood — five faces, monochrome; colour stays reserved for P&L.' },
      { n: 2, x: 69, y: 33, on: 'main', text: 'The day’s notes, filed against the day’s trades.' },
      { n: 3, x: 69, y: 27, on: 'inset', text: 'The desk’s best trade, with the session it came from.' },
    ],
  },
];

/* ————————————————————— the session rail ————————————————————— */

/**
 * Four desks as a real tablist: roving tabindex, arrow keys, Home/End.
 * The open desk carries a live dot; the selected desk carries the amber
 * hairline. Both are signals, so both may be amber.
 */
function SessionRail({ selectedId, onSelect, panelId }) {
  const now = useUtcClock(30000);
  const tabRefs = useRef([]);

  const moveTo = (index) => {
    const next = (index + RAIL.length) % RAIL.length;
    onSelect(RAIL[next].id);
    tabRefs.current[next]?.focus();
  };

  const onKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveTo(index + 1); }
    else if (event.key === 'ArrowLeft') { event.preventDefault(); moveTo(index - 1); }
    else if (event.key === 'Home') { event.preventDefault(); moveTo(0); }
    else if (event.key === 'End') { event.preventDefault(); moveTo(RAIL.length - 1); }
  };

  return (
    <div className='xc-rail' role='tablist' aria-label='Read the sample record through a session'>
      {RAIL.map((session, index) => {
        const selected = session.id === selectedId;
        const open = isSessionOpen(session, now);
        return (
          <button
            key={session.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            type='button'
            role='tab'
            id={`xc-tab-${session.id}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={selected ? 0 : -1}
            className='xc-rail-tab'
            data-open={open ? 'true' : undefined}
            onClick={() => onSelect(session.id)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            <span className='xc-rail-city'>{session.city}</span>
            <span className='xc-rail-hours xj-num'>{windowLabel(session)}</span>
            {open ? <span className='xc-rail-live xj-live'>Open</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function signClass(value) {
  return value > 0 ? 'is-up' : value < 0 ? 'is-down' : '';
}

/** The figures for one session window — the tabpanel the rail controls. */
function SessionFigures({ session, panelId }) {
  const f = session.figures;
  return (
    <div
      id={panelId}
      role='tabpanel'
      aria-labelledby={`xc-tab-${session.id}`}
      className='xc-figs xj-glass'
    >
      <div className='xj-panel-bar'>
        <strong>{session.city} · {windowLabel(session)} UTC</strong>
        <span>{DESK_NAMES[RAIL_TO_DESK[session.id]]} · {f.wins}W {f.losses}L</span>
      </div>
      <dl className='xc-figs-grid'>
        <div>
          <dt>Trades</dt>
          <dd className='xj-num'>{f.count}</dd>
        </div>
        <div>
          <dt>Hit rate</dt>
          <dd className='xj-num'>{f.winRate}%</dd>
        </div>
        <div>
          <dt>Net</dt>
          <dd className={`xj-num ${signClass(f.net)}`.trim()}>{formatR(f.net)}</dd>
        </div>
        <div>
          <dt>Expectancy</dt>
          <dd className={`xj-num ${signClass(f.expectancy)}`.trim()}>{formatR2(f.expectancy)}</dd>
        </div>
      </dl>
    </div>
  );
}

/** The rail opens on whichever desk is live; London — the record's edge — when the market rests. */
function initialRailId() {
  const now = new Date();
  const open = GOLD_SESSIONS.find((session) => isSessionOpen(session, now));
  return open ? open.id : 'lon';
}

function ReadChapterRail() {
  const [railId, setRailId] = useState(initialRailId);
  const session = RAIL.find((entry) => entry.id === railId) ?? RAIL[2];
  const panelId = 'xc-read-figures';
  return (
    <div className='xc-rail-block'>
      <SessionRail selectedId={railId} onSelect={setRailId} panelId={panelId} />
      <SessionFigures session={session} panelId={panelId} />
    </div>
  );
}

/* ————————————————————— one chapter ————————————————————— */

function Marker({ mark }) {
  return (
    <span
      className='xc-mark xj-num'
      data-n={mark.n}
      style={{ '--x': `${mark.x}%`, '--y': `${mark.y}%` }}
    >
      {mark.n}
    </span>
  );
}

function Chapter({ chapter, flip }) {
  const mainMarks = chapter.marks.filter((mark) => mark.on === 'main');
  const insetMarks = chapter.marks.filter((mark) => mark.on === 'inset');
  const headingId = `chapter-${chapter.id}-heading`;

  return (
    <article
      className={`xc-chapter ${flip ? 'xc-chapter--flip' : ''} xj-reveal`.trim()}
      id={`chapter-${chapter.id}`}
      aria-labelledby={headingId}
    >
      <div className='xc-plate'>
        <div className='xc-plate-main'>
          <Shot name={chapter.shot.name} title={chapter.shot.title} />
          <div className='xc-marks' aria-hidden='true'>
            {mainMarks.map((mark) => <Marker key={mark.n} mark={mark} />)}
          </div>
        </div>
        <div className='xc-inset'>
          <Shot name={chapter.inset.name} title={chapter.inset.title} chrome={false} />
          <div className='xc-marks' aria-hidden='true'>
            {insetMarks.map((mark) => <Marker key={mark.n} mark={mark} />)}
          </div>
        </div>
      </div>

      <div className='xc-cap'>
        <div className='xc-head'>
          <p className='xc-num'>
            <span className='xj-num'>Chapter {chapter.number}</span>
            <span>{chapter.name}</span>
          </p>
          <h3 id={headingId} className='xj-h2 xc-title'>{chapter.title}</h3>
        </div>

        <div className='xc-body'>
          {chapter.copy.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

          <ol className='xc-legend' aria-label='What the markers point at'>
            {chapter.marks.map((mark) => (
              <li key={mark.n} data-n={mark.n}>
                <span className='xc-legend-n xj-num' aria-hidden='true'>{mark.n}</span>
                <span>{mark.text}</span>
              </li>
            ))}
          </ol>

          {chapter.id === 'read' ? <ReadChapterRail /> : null}
        </div>
      </div>
    </article>
  );
}

export function Chapters() {
  return (
    <section className='xj-section xc' aria-labelledby='chapters-heading'>
      <div className='xj-shell'>
        <SectionHead
          id='chapters-heading'
          eyebrow='The product'
          title={<>Three chapters, <em>one</em> record.</>}
          lede={`Capture the fill, read the session, keep the habit. Every figure below is the same ${RECORD_SIZE}-trade XAUUSD sample the screenshots were rendered from.`}
        />
        <div className='xc-chapters'>
          {CHAPTERS.map((chapter, index) => (
            <Chapter key={chapter.id} chapter={chapter} flip={index % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
