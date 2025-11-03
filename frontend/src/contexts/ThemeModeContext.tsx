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
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored as ThemeMode;
    }
    return 'dark';
  });

  // Recalcula o tema quando o modo muda ou quando a preferência do sistema muda (se modo for 'system')
  const [systemIsDark, setSystemIsDark] = useState<boolean>(() => {
    return typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
      try {
        media.addEventListener('change', listener);
      } catch {
        // Fallback para navegadores antigos
        media.addListener(listener);
      }
      return () => {
        try {
          media.removeEventListener('change', listener);
        } catch {
          media.removeListener(listener);
        }
      };
    }
    return () => {};
  }, []);

  const effectiveMode: ThemeMode = mode === 'system' ? (systemIsDark ? 'dark' : 'light') : mode;
  const theme = useMemo(() => createTheme(effectiveMode), [effectiveMode]);

  useEffect(() => {
    localStorage.setItem('themeMode', mode);
    document.documentElement.setAttribute('data-theme', effectiveMode);
  }, [mode, effectiveMode]);

  const toggle = () => setMode(prev => (prev === 'dark' ? 'light' : prev === 'light' ? 'dark' : 'light'));

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