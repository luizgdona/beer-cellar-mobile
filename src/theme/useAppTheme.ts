import { AppTheme } from './colors';
import { useThemePreference } from '../contexts/ThemeContext';

export const useAppTheme = (): AppTheme => {
  const { theme } = useThemePreference();
  return theme;
};
