import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import { createTheme, type ThemeMode, type AppTheme } from '../styles/theme';
import { GlobalStyle } from '../styles/globalStyles';

type ThemeModeContextValue = {
  mode: ThemeMode;
  theme: AppTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

export const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const stored = localStorage.getItem('themeMode');
    return (stored === 'light' || stored === 'dark') ? (stored as ThemeMode) : 'dark';
  });

  const theme = useMemo(() => createTheme(mode), [mode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggle = () => setMode(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeModeContext.Provider value={{ mode, theme, setMode, toggle }}>
      <ThemeProvider theme={theme}>
        <GlobalStyle theme={theme} />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};

export default ThemeModeProvider;