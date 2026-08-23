/* Product screenshot catalogue for the public site. The files are generated
   by `npm run shots` (see public/shots/README.md); this module is the only
   place that knows their names, box and alt text. Kept out of PublicSite.jsx
   so that file exports components only (react-refresh). */

export const SHOT_WIDTH = 1440;
export const SHOT_HEIGHT = 900;

export const SHOTS = {
  dashboard: { alt: 'xaujournal desk: the log-trade page with the day’s fills, P&L and session clock' },
  analytics: { alt: 'xaujournal analytics: win rate, expectancy and P&L broken down by session and setup' },
  calendar: { alt: 'xaujournal calendar: a month of trading days coloured by realised P&L' },
  history: { alt: 'xaujournal history: every trade with entry, exit, R-multiple and setup tag' },
  journal: { alt: 'xaujournal journal: a day’s notes, mood and rule check next to its trades' },
  sync: { alt: 'xaujournal broker sync: an MT5 account connected and importing fills automatically' },
};

export function shotSrc(name) {
  return `/shots/${name}.webp`;
}
