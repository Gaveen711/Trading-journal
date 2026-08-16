import { hourlyProfile, formatR, sessionSplit } from '../lib/deskDemo';
import { useUtcClock } from '../lib/goldSessions';
import '../pages/PublicVisuals.css';

/* ————————————————————————————————————————————————————————————
   Signature visuals. Both are hand-built from the same sample
   record the rest of the site quotes — no stock photography, and
   nothing here is decorative: every mark is a number.
   ———————————————————————————————————————————————————————————— */

/* ————————————————— the session dial ————————————————— */

const DIAL = {
  size: 360,
  c: 180,
  base: 84,      // the zero ring — hours that neither pay nor cost
  // One symmetric scale for both directions: R is R whether it is earned or
  // lost, so an outward spoke and an inward one are directly comparable.
  // Only the peak hour uses the full reach; the worst hour (−4.0R) travels
  // about a quarter of it, which is the honest picture.
  reach: 34,
  arcs: { asia: 130, london: 141, ny: 152 },
  ticks: 160,
  labels: 172,
};

/** Polar → cartesian, with 00:00 at the top of the dial. */
function point(angleDeg, radius) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return [DIAL.c + radius * Math.cos(rad), DIAL.c + radius * Math.sin(rad)];
}

const fmt = (n) => n.toFixed(2);

function arcPath(fromHour, toHour, radius) {
  const a0 = (fromHour / 24) * 360;
  const a1 = (toHour / 24) * 360;
  const sweep = ((a1 - a0) + 360) % 360;
  const [x0, y0] = point(a0, radius);
  const [x1, y1] = point(a1, radius);
  return `M${fmt(x0)} ${fmt(y0)} A${radius} ${radius} 0 ${sweep > 180 ? 1 : 0} 1 ${fmt(x1)} ${fmt(y1)}`;
}

const DIAL_SESSIONS = [
  { id: 'asia', label: 'Asia', from: 0, to: 9 },
  { id: 'london', label: 'London', from: 7, to: 16 },
  { id: 'ny', label: 'New York', from: 12, to: 21 },
];

export function SessionDial() {
  const now = useUtcClock(30000);
  const { hours, peak } = hourlyProfile();
  const split = sessionSplit();
  const best = hours.reduce((a, b) => (b.net > a.net ? b : a));

  // The live hand tracks minutes too, so it creeps rather than jumping hourly.
  const nowAngle = ((now.getUTCHours() + now.getUTCMinutes() / 60) / 24) * 360;
  const [handX, handY] = point(nowAngle, DIAL.base + DIAL.reach + 8);

  return (
    <figure className='xjv-dial'>
      <div className='xjv-dial-stage'>
        <svg
          viewBox={`0 0 ${DIAL.size} ${DIAL.size}`}
          role='img'
          aria-label={`Twenty-four hour dial of the sample record. The 08:00 UTC hour alone returns ${formatR(best.net)} across ${best.count} trades, while every hour before 07:00 UTC loses money.`}
        >
          {/* zero ring — the line an hour has to beat */}
          <circle className='xjv-dial-zero' cx={DIAL.c} cy={DIAL.c} r={DIAL.base} />

          {/* hour spokes: outward pays, inward costs */}
          {hours.map((h) => {
            const angle = ((h.hour + 0.5) / 24) * 360;
            if (!h.count) {
              const [dx, dy] = point(angle, DIAL.base);
              return <circle key={h.hour} className='xjv-dial-empty' cx={fmt(dx)} cy={fmt(dy)} r='1.4' />;
            }
            const end = DIAL.base + (h.net / peak) * DIAL.reach;
            const [x0, y0] = point(angle, DIAL.base);
            const [x1, y1] = point(angle, end);
            const isBest = h.hour === best.hour;
            return (
              <line
                key={h.hour}
                className={`xjv-dial-spoke ${h.net >= 0 ? 'is-up' : 'is-down'} ${isBest ? 'is-best' : ''}`.trim()}
                x1={fmt(x0)} y1={fmt(y0)} x2={fmt(x1)} y2={fmt(y1)}
              />
            );
          })}

          {/* session arcs — only the desk that actually pays is lit */}
          {DIAL_SESSIONS.map((session) => (
            <path
              key={session.id}
              className={`xjv-dial-arc is-${session.id}`}
              d={arcPath(session.from, session.to, DIAL.arcs[session.id])}
            />
          ))}

          {/* hour ticks, emphasised every six hours */}
          {Array.from({ length: 24 }, (_, hour) => {
            const angle = (hour / 24) * 360;
            const major = hour % 6 === 0;
            const [x0, y0] = point(angle, DIAL.ticks);
            const [x1, y1] = point(angle, DIAL.ticks + (major ? 7 : 3.5));
            return (
              <line
                key={hour}
                className={major ? 'xjv-dial-tick is-major' : 'xjv-dial-tick'}
                x1={fmt(x0)} y1={fmt(y0)} x2={fmt(x1)} y2={fmt(y1)}
              />
            );
          })}

          {[0, 6, 12, 18].map((hour) => {
            const [tx, ty] = point((hour / 24) * 360, DIAL.labels);
            return (
              <text key={hour} className='xjv-dial-hour' x={fmt(tx)} y={fmt(ty)} dominantBaseline='middle' textAnchor='middle'>
                {String(hour).padStart(2, '0')}
              </text>
            );
          })}

          {/* live UTC hand */}
          <line className='xjv-dial-hand' x1={DIAL.c} y1={DIAL.c} x2={fmt(handX)} y2={fmt(handY)} />
          <circle className='xjv-dial-hub' cx={DIAL.c} cy={DIAL.c} r='3' />
        </svg>

        {/* the one number the whole shape is about */}
        <div className='xjv-dial-callout'>
          <span className='xj-label'>Strongest hour</span>
          <strong className='xj-num'>{String(best.hour).padStart(2, '0')}:00</strong>
          <em className='xj-num is-up'>{formatR(best.net)}</em>
        </div>
      </div>

      <figcaption className='xjv-dial-legend'>
        {split.map((session) => (
          <span key={session.id} className={`xjv-dial-key is-${session.id}`}>
            <i aria-hidden='true' />
            {session.label}
            <b className={session.net >= 0 ? 'xj-num is-up' : 'xj-num is-down'}>{formatR(session.net)}</b>
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

/* ————————————————— the replay ————————————————— */

/* [open, high, low, close] — the London session from case file 001.
   Entry 2,387.44 and exit 2,394.18 match the figures quoted elsewhere
   on the site, so the picture and the prose cannot drift apart. */
const CANDLES = [
  [2386.2, 2387.1, 2385.4, 2385.9],
  [2385.9, 2386.4, 2384.2, 2384.6],
  [2384.6, 2385.0, 2382.8, 2383.1],
  [2383.1, 2383.6, 2381.4, 2381.9],
  [2381.9, 2384.0, 2381.2, 2383.7],
  [2383.7, 2385.2, 2383.3, 2384.9],
  [2384.9, 2386.0, 2384.4, 2385.6],
  [2385.6, 2388.2, 2385.3, 2387.9],
  [2387.9, 2389.4, 2387.2, 2389.0],
  [2389.0, 2390.6, 2388.5, 2390.2],
  [2390.2, 2391.8, 2389.7, 2391.4],
  [2391.4, 2393.0, 2390.9, 2392.6],
  [2392.6, 2394.4, 2392.1, 2394.0],
  [2394.0, 2394.6, 2393.4, 2394.18],
];

const ENTRY_INDEX = 7;
const CONFIRM_INDEX = 8;
const EXIT_INDEX = 13;
const ENTRY_PRICE = 2387.44;
const EXIT_PRICE = 2394.18;

const REPLAY = { w: 420, h: 250, padX: 16, padTop: 30, padBottom: 34 };

export function TradeReplay() {
  const highs = CANDLES.map((c) => c[1]);
  const lows = CANDLES.map((c) => c[2]);
  const top = Math.max(...highs);
  const bottom = Math.min(...lows);
  const span = top - bottom;

  const plotH = REPLAY.h - REPLAY.padTop - REPLAY.padBottom;
  const step = (REPLAY.w - REPLAY.padX * 2) / CANDLES.length;
  const bodyW = step * 0.5;

  const y = (price) => REPLAY.padTop + plotH * (1 - (price - bottom) / span);
  const x = (index) => REPLAY.padX + step * (index + 0.5);

  const entryY = y(ENTRY_PRICE);
  const confirmX = x(CONFIRM_INDEX) - step / 2;

  return (
    <figure className='xjv-replay'>
      <div className='xjv-replay-stage'>
        <div className='xjv-replay-bar'>
          <strong>Case file 001 · replay</strong>
          <span>XAU/USD · London</span>
        </div>
        <svg
          viewBox={`0 0 ${REPLAY.w} ${REPLAY.h}`}
          role='img'
          aria-label='The London session from case file 001. The trade was entered at 2,387.44 at 14:26, six minutes before the confirmation close the plan required, and exited at 2,394.18 for a gain of 1.18R — a winning trade taken against its own rule.'
        >
          {/* the level the plan actually required */}
          <line className='xjv-replay-rule' x1={REPLAY.padX} y1={fmt(entryY)} x2={REPLAY.w - REPLAY.padX} y2={fmt(entryY)} />

          {CANDLES.map(([o, h, l, c], i) => {
            const up = c >= o;
            const cx = x(i);
            const bodyTop = y(Math.max(o, c));
            const bodyBottom = y(Math.min(o, c));
            return (
              <g key={i} className={`xjv-candle ${up ? 'is-up' : 'is-down'} ${i === ENTRY_INDEX ? 'is-entry' : ''}`.trim()}>
                <line className='xjv-candle-wick' x1={fmt(cx)} y1={fmt(y(h))} x2={fmt(cx)} y2={fmt(y(l))} />
                <rect
                  className='xjv-candle-body'
                  x={fmt(cx - bodyW / 2)}
                  y={fmt(bodyTop)}
                  width={fmt(bodyW)}
                  height={fmt(Math.max(bodyBottom - bodyTop, 1.2))}
                />
              </g>
            );
          })}

          {/* the close he was supposed to wait for */}
          <line className='xjv-replay-gate' x1={fmt(confirmX)} y1={REPLAY.padTop - 12} x2={fmt(confirmX)} y2={REPLAY.h - REPLAY.padBottom + 6} />

          {/* where he actually got in */}
          <circle className='xjv-replay-entry' cx={fmt(x(ENTRY_INDEX))} cy={fmt(entryY)} r='4.5' />
          <circle className='xjv-replay-entry-halo' cx={fmt(x(ENTRY_INDEX))} cy={fmt(entryY)} r='9' />

          {/* the exit */}
          <circle className='xjv-replay-exit' cx={fmt(x(EXIT_INDEX))} cy={fmt(y(EXIT_PRICE))} r='3.5' />

          <text className='xjv-replay-tag is-entry' x={fmt(x(ENTRY_INDEX) - 8)} y={fmt(entryY + 22)} textAnchor='end'>
            14:26 entry
          </text>
          {/* Anchored at the foot of the gate line: the head of it sits level
              with the exit label and the two collided at narrow widths.
              Kept short too — SVG text cannot reflow, so the full explanation
              lives in the HTML legend below where it stays legible on phones. */}
          <text className='xjv-replay-tag is-gate' x={fmt(confirmX)} y={REPLAY.h - REPLAY.padBottom + 22} textAnchor='middle'>
            14:32
          </text>
          <text className='xjv-replay-tag is-exit' x={fmt(x(EXIT_INDEX))} y={fmt(y(EXIT_PRICE) - 14)} textAnchor='end'>
            exit +1.18R
          </text>
        </svg>

        <div className='xjv-replay-verdict'>
          <p className='xjv-replay-key'>
            <i aria-hidden='true' />
            14:32 — the confirmation close the plan required
          </p>
          <span className='xj-label'>Six minutes early</span>
          <strong>The market forgave it. The record did not.</strong>
        </div>
      </div>
    </figure>
  );
}
