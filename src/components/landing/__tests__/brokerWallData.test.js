// The broker wall is derived from the sync catalog and mapped to marks on
// disk. Both halves drift independently — a broker added to the catalog, a
// logo renamed — so the map is checked against the filesystem, not trusted.
import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import { BROKERS } from '../../../data/brokerCatalog';
import {
  BROKER_CHIP_MARKS,
  BROKER_COUNT,
  BROKER_LOGO_FILES,
  BROKER_ROWS,
  BROKER_WALL,
  MT4_COUNT,
  MT5_COUNT,
  brokerDisplayName,
  brokerNameFromLabel,
} from '../brokerWallData';

const LOGO_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../../../public/broker-logos');
const ON_DISK = new Set(readdirSync(LOGO_DIR));

describe('landing/brokerWallData', () => {
  it('collapses every catalog label to one broker and keeps the catalog union', () => {
    const expected = new Set(
      [...BROKERS.mt4, ...BROKERS.mt5].map((entry) => brokerNameFromLabel(entry.label)),
    );
    expect(new Set(BROKER_WALL.map((b) => b.name))).toEqual(expected);
    expect(BROKER_COUNT).toBe(expected.size);
    expect(BROKER_COUNT).toBeGreaterThan(20);
  });

  it('maps every broker to a mark that exists in public/broker-logos', () => {
    for (const broker of BROKER_WALL) {
      const file = BROKER_LOGO_FILES[broker.name];
      expect(file, `no logo mapped for "${broker.name}"`).toBeTruthy();
      expect(ON_DISK.has(file), `${file} missing on disk for "${broker.name}"`).toBe(true);
      expect(broker.logo).toBe(`/broker-logos/${file}`);
    }
  });

  it('has no map entry for a broker the catalog no longer lists', () => {
    const names = new Set(BROKER_WALL.map((b) => b.name));
    for (const mapped of Object.keys(BROKER_LOGO_FILES)) {
      expect(names.has(mapped), `"${mapped}" is mapped but not in the catalog`).toBe(true);
    }
  });

  it('only chips marks the catalog actually lists', () => {
    const names = new Set(BROKER_WALL.map((b) => b.name));
    for (const name of BROKER_CHIP_MARKS) {
      expect(names.has(name), `"${name}" is chipped but not in the catalog`).toBe(true);
    }
    expect(BROKER_WALL.filter((b) => b.chip).map((b) => b.name).sort()).toEqual([...BROKER_CHIP_MARKS].sort());
  });

  it('records the platforms each broker is listed under', () => {
    const mt4Names = new Set(BROKERS.mt4.map((e) => brokerNameFromLabel(e.label)));
    const mt5Names = new Set(BROKERS.mt5.map((e) => brokerNameFromLabel(e.label)));
    for (const broker of BROKER_WALL) {
      expect(broker.mt4).toBe(mt4Names.has(broker.name));
      expect(broker.mt5).toBe(mt5Names.has(broker.name));
      expect(broker.mt4 || broker.mt5).toBe(true);
    }
    expect(MT4_COUNT).toBe(mt4Names.size);
    expect(MT5_COUNT).toBe(mt5Names.size);
  });

  it('splits the wall into two rows that together hold every broker once', () => {
    const [a, b] = BROKER_ROWS;
    expect(a.length + b.length).toBe(BROKER_COUNT);
    expect(Math.abs(a.length - b.length)).toBeLessThanOrEqual(1);
    expect(new Set([...a, ...b].map((x) => x.name)).size).toBe(BROKER_COUNT);
  });

  it('strips the server suffix and the alias for display', () => {
    expect(brokerNameFromLabel('Exness — Live')).toBe('Exness');
    expect(brokerNameFromLabel('FTMO — Demo')).toBe('FTMO');
    expect(brokerDisplayName('HFM (HotForex)')).toBe('HFM');
    expect(brokerDisplayName('IC Markets')).toBe('IC Markets');
  });
});
