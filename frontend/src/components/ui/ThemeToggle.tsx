import React from 'react';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import Button from './Button';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { mode, toggle } = useThemeMode();
  const isDark = mode === 'dark';
  return (
    <Button
      variant="secondary"
      onClick={toggle}
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      leftIcon={isDark ? <Sun size={18} /> : <Moon size={18} />}
    >
      {isDark ? 'Tema Claro' : 'Tema Escuro'}
    </Button>
  );
};

export default ThemeToggle;