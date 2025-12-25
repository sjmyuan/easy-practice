// components/LanguageSelector.tsx
'use client';

import { useLanguage } from '@/contexts/LanguageContext';

/**
 * LanguageSelector component
 * 
 * A toggle button that allows users to switch between Chinese and English.
 * The current language is persisted to localStorage.
 */
export default function LanguageSelector() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh');
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all"
      aria-label={t('settings.language')}
      type="button"
    >
      <span className="text-lg" role="img" aria-label={language === 'zh' ? 'Chinese' : 'English'}>
        {language === 'zh' ? '🇨🇳' : '🇺🇸'}
      </span>
      <span>
        {language === 'zh' ? t('settings.chinese') : t('settings.english')}
      </span>
    </button>
  );
}
