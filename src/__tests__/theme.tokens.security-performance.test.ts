import { describe, expect, it } from 'vitest';
import { darkTheme, lightTheme } from '../theme/colors';

describe('mobile theme tokens consistency', () => {
  it('keeps primary colors non-empty for branding consistency', () => {
    expect(lightTheme.colors.primary.length).toBeGreaterThan(0);
    expect(darkTheme.colors.primary.length).toBeGreaterThan(0);
  });

  it('provides distinct light and dark backgrounds for accessibility contrast', () => {
    expect(lightTheme.colors.background).not.toBe(darkTheme.colors.background);
    expect(lightTheme.isDark).toBe(false);
    expect(darkTheme.isDark).toBe(true);
  });

  it('reads theme tokens quickly for rendering performance', () => {
    const start = Date.now();

    for (let i = 0; i < 100000; i += 1) {
      const bg = i % 2 === 0 ? lightTheme.colors.background : darkTheme.colors.background;
      if (!bg) {
        throw new Error('Missing color token');
      }
    }

    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(150);
  });
});
