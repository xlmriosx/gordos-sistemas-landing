import { useTranslation } from 'react-i18next';
import { ToggleGroup, ToggleGroupItem } from './ui/toggle-group';
import { useLanguage, type Language } from '../i18n';

/** Compact EN/ES control. Sits beside ThemeToggle in the product chrome. */
export function LanguageToggle({ className }: { className?: string }) {
  const { t } = useTranslation('ui');
  const [language, setLanguage] = useLanguage();

  return (
    <div className={className}>
      <ToggleGroup
        type="single"
        value={language}
        onValueChange={(next) => next && setLanguage(next as Language)}
        aria-label={t('language.label')}
      >
        <ToggleGroupItem
          value="en"
          aria-label={t('language.english')}
          title={t('language.english')}
        >
          EN
        </ToggleGroupItem>
        <ToggleGroupItem
          value="es"
          aria-label={t('language.spanish')}
          title={t('language.spanish')}
        >
          ES
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
