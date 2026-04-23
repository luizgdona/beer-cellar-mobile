export type AppTheme = {
  isDark: boolean;
  colors: {
    background: string;
    surface: string;
    card: string;
    text: string;
    textMuted: string;
    border: string;
    primary: string;
    primaryAlt: string;
    success: string;
    danger: string;
    warningBg: string;
    warningText: string;
    consumedBg: string;
    consumedText: string;
    overlay: string;
  };
};

export const lightTheme: AppTheme = {
  isDark: false,
  colors: {
    background: '#eef3f8',
    surface: '#ffffff',
    card: '#f8fbff',
    text: '#15263a',
    textMuted: '#5d7087',
    border: '#d4deea',
    primary: '#d6a437',
    primaryAlt: '#2c6cb0',
    success: '#1b9a73',
    danger: '#dc3a4a',
    warningBg: '#fff5de',
    warningText: '#7a560f',
    consumedBg: '#dff4ec',
    consumedText: '#0f7558',
    overlay: 'rgba(214, 164, 55, 0.16)',
  },
};

export const darkTheme: AppTheme = {
  isDark: true,
  colors: {
    background: '#0b1724',
    surface: '#122235',
    card: '#162b41',
    text: '#eef4fb',
    textMuted: '#9db0c6',
    border: '#27415a',
    primary: '#f2c14d',
    primaryAlt: '#4f90d1',
    success: '#2bb089',
    danger: '#ff6b7a',
    warningBg: '#433312',
    warningText: '#f5d280',
    consumedBg: '#17382e',
    consumedText: '#81e2bc',
    overlay: 'rgba(242, 193, 77, 0.16)',
  },
};
