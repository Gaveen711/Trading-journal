// @vitest-environment jsdom
//
// The dashboard palette lives on `.dashboard-shell`, never on <html> (see
// styles/auth.css). A resolver that reads documentElement silently returns the
// public site's colors, which is the bug this module was extracted to fix —
// so the scoping is the thing worth pinning down.
import { describe, it, expect, afterEach } from 'vitest';
import { resolveChartTheme, seriesColor } from '../../lib/chartTheme.js';

afterEach(() => { document.body.innerHTML = ''; document.head.innerHTML = ''; });

function styleSheet(css) {
  const el = document.createElement('style');
  el.textContent = css;
  document.head.appendChild(el);
}

describe('chartTheme', () => {
  it('reads tokens from .dashboard-shell, not <html>', () => {
    styleSheet(`
      :root { --chart-2: 0 0% 45%; --win: 142 72% 29%; }
      .dashboard-shell { --chart-2: 181 88% 28%; --win: 143 72% 31%; }
    `);
    const shell = document.createElement('div');
    shell.className = 'dashboard-shell';
    document.body.appendChild(shell);

    const theme = resolveChartTheme();
    expect(theme.series[1]).toBe('hsl(181 88% 28%)');
    expect(theme.winBorder).toBe('hsl(143 72% 31%)');
  });

  it('falls back to documentElement when no shell is mounted', () => {
    styleSheet(`:root { --chart-2: 0 0% 45%; }`);
    expect(resolveChartTheme().series[1]).toBe('hsl(0 0% 45%)');
  });

  it('cycles the ramp past its length', () => {
    const theme = { series: ['a', 'b', 'c', 'd', 'e'], seriesSoft: ['A', 'B', 'C', 'D', 'E'] };
    expect(seriesColor(theme, 0)).toBe('a');
    expect(seriesColor(theme, 6)).toBe('b');
    expect(seriesColor(theme, 6, true)).toBe('B');
  });
});
