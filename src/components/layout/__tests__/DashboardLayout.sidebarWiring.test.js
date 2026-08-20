// Regression: DashboardRightSidebar's log form grew a Setup picker and a
// discipline pre-submit check, both fed by props (`setups`, `resolveSetup`,
// `createSetup`, `archiveSetup`, `disciplineRules`) that DashboardLayout owns
// the hooks for — and DashboardLayout published them on the outlet context but
// never passed them to the sidebar itself.
//
// Nothing failed loudly. Every one of those props is optional and degrades:
// the picker rendered permanently empty, `strategy` was written as '', and
// `evaluateRules(..., undefined, ...)` normalized to all-rules-disabled, so the
// pre-submit rule toast could never fire. Two shipped features were dead in the
// one surface that logs trades.
//
// Rendering DashboardLayout would mean standing up auth, the DI container and
// four Firestore listeners, so the invariant is asserted against the source:
// every prop the child destructures WITHOUT a default must appear at the
// parent's single call site. That is the general form of the bug — a prop with
// no default and no argument is `undefined` at runtime with no warning.
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const LAYOUT = 'src/components/layout/DashboardLayout.jsx';
const SIDEBAR = 'src/components/layout/DashboardRightSidebar.jsx';

/** Strips `//` line comments so commented-out prop names cannot be counted. */
const withoutComments = (source) => source.replace(/^[ \t]*\/\/.*$/gm, '');

/**
 * The destructured parameter names of `export function <name>({ ... })`, split
 * into those with a default value and those without. Only one level deep — no
 * prop in either file is nested-destructured, and a parser here would be a
 * bigger dependency than the invariant is worth.
 */
function declaredProps(source, name) {
  const start = source.indexOf(`export function ${name}({`);
  expect(start, `${name} signature not found`).toBeGreaterThan(-1);
  const open = source.indexOf('{', start + `export function ${name}(`.length);
  const close = source.indexOf('\n}) {', open);
  expect(close, `${name} signature is not the expected multi-line form`).toBeGreaterThan(open);

  const required = new Set();
  const defaulted = new Set();
  for (const entry of withoutComments(source.slice(open + 1, close)).split(',')) {
    const text = entry.trim();
    if (!text) continue;
    const identifier = text.match(/^([A-Za-z_$][\w$]*)/);
    if (!identifier) continue;
    (text.includes('=') ? defaulted : required).add(identifier[1]);
  }
  return { required, defaulted };
}

/** Attribute names on the single `<name ... />` element in `source`. */
function passedProps(source, name) {
  const start = source.indexOf(`<${name}`);
  expect(start, `<${name}> call site not found`).toBeGreaterThan(-1);
  const end = source.indexOf('/>', start);
  expect(end, `<${name}> is not self-closing`).toBeGreaterThan(start);
  const block = withoutComments(source.slice(start, end));
  return new Set([...block.matchAll(/(?:^|\s)([A-Za-z_$][\w$]*)=\{/g)].map((match) => match[1]));
}

describe('DashboardLayout → DashboardRightSidebar prop wiring', () => {
  const layout = readFileSync(LAYOUT, 'utf8');
  const sidebar = readFileSync(SIDEBAR, 'utf8');
  const declared = declaredProps(sidebar, 'DashboardRightSidebar');
  const passed = passedProps(layout, 'DashboardRightSidebar');

  it('passes every sidebar prop that has no default value', () => {
    const missing = [...declared.required].filter((prop) => !passed.has(prop));
    expect(missing).toEqual([]);
  });

  it('passes the setup catalog and discipline settings the log form reads', () => {
    // Named explicitly as well as covered by the rule above: `setups` carries a
    // default (an empty catalog) precisely so the component can be rendered in
    // isolation, which means the general check cannot catch it going missing.
    for (const prop of ['setups', 'resolveSetup', 'createSetup', 'archiveSetup', 'disciplineRules']) {
      expect(declared.required.has(prop) || declared.defaulted.has(prop)).toBe(true);
      expect(passed.has(prop), `DashboardRightSidebar is never given \`${prop}\``).toBe(true);
    }
  });
});
