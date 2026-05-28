import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  const isDark = theme === 'dark';

  return (
    <button className="icon-btn" onClick={onToggle} type="button" aria-label="Alternar tema" title={isDark ? 'Modo claro' : 'Modo escuro'}>
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
    </button>
  );
}
