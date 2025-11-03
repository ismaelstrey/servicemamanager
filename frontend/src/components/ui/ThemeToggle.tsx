import React from 'react';
import { useThemeMode } from '../../contexts/ThemeModeContext';
import Button from './Button';
import Tooltip from './Tooltip';
import { Sun, Moon, Monitor } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const { mode, toggle } = useThemeMode();

  const icon = mode === 'dark' ? <Moon size={18} /> : mode === 'light' ? <Sun size={18} /> : <Monitor size={18} />;
  const tooltip = `Tema: ${mode === 'dark' ? 'Escuro' : mode === 'light' ? 'Claro' : 'Sistema'}`;

  return (
    <Tooltip content={tooltip} placement="bottom">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        aria-label="Alternar modo de tema"
        title={tooltip}
        leftIcon={icon}
        children=""
      />
    </Tooltip>
  );
};

export default ThemeToggle;