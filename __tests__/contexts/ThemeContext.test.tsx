import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { lightTokens, darkTokens } from '@/lib/tokens';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('ThemeContext', () => {
  it('defaults to light theme', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.isDark).toBe(false);
    expect(result.current.colors.accent).toBe(lightTokens.accent);
  });

  it('toggles to dark and returns dark tokens', () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => { result.current.toggleTheme(); });
    expect(result.current.isDark).toBe(true);
    expect(result.current.colors.accent).toBe(darkTokens.accent);
  });

  it('throws when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within ThemeProvider');
    consoleError.mockRestore();
  });
});
