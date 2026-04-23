import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

describe('LanguageContext', () => {
  it('defaults to pt-BR', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.language).toBe('pt-BR');
  });

  it('translates a key in pt-BR', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    expect(result.current.t('auth.login')).toBe('Entrar');
  });

  it('toggles to en and translates correctly', () => {
    const { result } = renderHook(() => useLanguage(), { wrapper });
    act(() => { result.current.toggleLanguage(); });
    expect(result.current.language).toBe('en');
    expect(result.current.t('auth.login')).toBe('Log In');
  });

  it('throws when used outside provider', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useLanguage())).toThrow('useLanguage must be used within LanguageProvider');
    consoleError.mockRestore();
  });
});
