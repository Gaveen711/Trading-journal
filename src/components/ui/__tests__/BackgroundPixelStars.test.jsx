// @vitest-environment jsdom
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { BackgroundPixelStars } from '../BackgroundPixelStars';

const context = {
  clearRect: vi.fn(),
  fillRect: vi.fn(),
  setTransform: vi.fn(),
};

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
});

describe('BackgroundPixelStars', () => {
  it('renders a decorative canvas and draws a static frame for reduced motion', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: true })));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);

    const { container } = render(<BackgroundPixelStars />);
    const canvas = container.querySelector('canvas');

    expect(canvas).toHaveClass('background-pixel-stars');
    expect(canvas).toHaveAttribute('aria-hidden', 'true');
    expect(context.clearRect).toHaveBeenCalled();
  });

  it('pauses its persistent animation while the tab is hidden', () => {
    vi.useFakeTimers();
    vi.stubGlobal('matchMedia', vi.fn(() => ({ matches: false })));
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context);
    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockReturnValue(42);
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    const clearTimer = vi.spyOn(window, 'clearTimeout');

    const { unmount } = render(<BackgroundPixelStars />);
    expect(requestFrame).toHaveBeenCalledTimes(1);

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    document.dispatchEvent(new Event('visibilitychange'));

    expect(cancelFrame).toHaveBeenCalledWith(42);
    expect(clearTimer).toHaveBeenCalled();

    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(requestFrame).toHaveBeenCalledTimes(2);

    unmount();
  });
});
