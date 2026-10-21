import { useTranslation } from 'react-i18next';
import { Sun, Moon } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useTheme, type Theme } from '../lib/theme';

/** Compact light/dark control for product chrome and the design-system topbar. */
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useTranslation('ui');
  const [theme, setTheme] = useTheme();

  return (
    <div className={className}>
      <ToggleGroup
        type="single"
        value={theme}
        onValueChange={(next) => next && setTheme(next as Theme)}
        aria-label={t('theme.label')}
      >
        <ToggleGroupItem
          value="light"
          aria-label={t('theme.light')}
          title={t('theme.light')}
        >
          <Sun size={14} strokeWidth={1.5} />
        </ToggleGroupItem>
        <ToggleGroupItem
          value="dark"
          aria-label={t('theme.dark')}
          title={t('theme.dark')}
        >
          <Moon size={14} strokeWidth={1.5} />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
