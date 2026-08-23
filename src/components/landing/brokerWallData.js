/* ————————————————————————————————————————————————————————————————
   Broker wall — derived from the sync catalog, never hand-listed.

   BROKERS.mt4 / BROKERS.mt5 in src/data/brokerCatalog.js carry one entry
   per server ("Exness — Demo", "Exness — Live"). This module collapses
   them to one record per broker with the platforms it is listed under,
   and maps each to the mark shipped in public/broker-logos/. The map is
   explicit so a renamed catalog entry fails the test in __tests__ rather
   than silently rendering a blank tile.
   ———————————————————————————————————————————————————————————————— */

import { BROKERS } from '../../data/brokerCatalog';

/** Catalog name → file under public/broker-logos/. */
export const BROKER_LOGO_FILES = {
  'Admirals': 'admirals.png',
  'Alpha Capital Group': 'alphacapital.png',
  'AvaTrade': 'avatrade.png',
  'Axi': 'axi.png',
  'BlackBull Markets': 'blackbull.png',
  'Blueberry Markets': 'blueberry.png',
  'Darwinex': 'darwinex.png',
  'Eightcap': 'eightcap.png',
  'Exness': 'exness.png',
  'FBS': 'fbs.png',
  'FP Markets': 'fpmarkets.png',
  'FTMO': 'ftmo.png',
  'Funding Pips': 'fundingpips.png',
  'Fusion Markets': 'fusionmarkets.png',
  'FxPro': 'fxpro.png',
  'HFM (HotForex)': 'hfm.png',
  'IC Markets': 'icmarkets.png',
  'IG': 'ig.png',
  'IronFX': 'ironfx.png',
  'JustMarkets': 'justmarkets.png',
  'MultiBank': 'multibank.png',
  'MyFundedFX': 'myfundedfx.png',
  'OANDA': 'oanda.png',
  'OctaFX': 'octafx.svg',
  'Pepperstone': 'pepperstone.png',
  'RoboForex': 'roboforex.png',
  'The Funded Trader': 'thefundedtrader.svg',
  'ThinkMarkets': 'thinkmarkets.png',
  'Tickmill': 'tickmill.png',
  'TMGM': 'tmgm.png',
  'True Forex Funds': 'trueforexfunds.png',
  'Vantage': 'vantage.png',
  'XM': 'xm.png',
};

/* Marks drawn near-black on transparency for light sites. Under the wall's
   grayscale they would vanish into the ground, so these sit on a bone chip. */
export const BROKER_CHIP_MARKS = new Set(['FP Markets', 'FxPro', 'IC Markets', 'True Forex Funds']);

/** "Exness — Live" → "Exness". The separator is the catalog's em dash. */
export function brokerNameFromLabel(label) {
  return label.replace(/\s+—\s+(Demo|Live)$/u, '').trim();
}

/** "HFM (HotForex)" → "HFM": the tile has room for one name, not an alias. */
export function brokerDisplayName(name) {
  return name.replace(/\s*\(.*\)$/u, '');
}

function collect() {
  const byName = new Map();
  for (const platform of ['mt4', 'mt5']) {
    for (const { label } of BROKERS[platform]) {
      const name = brokerNameFromLabel(label);
      const entry = byName.get(name) ?? { name, platforms: new Set() };
      entry.platforms.add(platform);
      byName.set(name, entry);
    }
  }
  return [...byName.values()]
    .map(({ name, platforms }) => ({
      name,
      display: brokerDisplayName(name),
      mt4: platforms.has('mt4'),
      mt5: platforms.has('mt5'),
      logo: BROKER_LOGO_FILES[name] ? `/broker-logos/${BROKER_LOGO_FILES[name]}` : null,
      chip: BROKER_CHIP_MARKS.has(name),
    }))
    .sort((a, b) => a.name.localeCompare(b.name, 'en'));
}

/** Every broker the sync catalog lists, alphabetical, with its mark. */
export const BROKER_WALL = collect();

export const BROKER_COUNT = BROKER_WALL.length;
export const MT4_COUNT = BROKER_WALL.filter((b) => b.mt4).length;
export const MT5_COUNT = BROKER_WALL.filter((b) => b.mt5).length;

/* Two counter-scrolling rows. Alternating rather than halving keeps the
   alphabet from putting every A–M name on one row and N–Z on the other. */
export const BROKER_ROWS = [
  BROKER_WALL.filter((_, index) => index % 2 === 0),
  BROKER_WALL.filter((_, index) => index % 2 === 1),
];
