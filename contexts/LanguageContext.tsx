// contexts/LanguageContext.tsx - Language and translation management
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from 'react';
import zhTranslations from '@/locales/zh.json';
import enTranslations from '@/locales/en.json';

export type Language = 'zh' | 'en';

type TranslationObject = typeof zhTranslations;

export interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined
);

const LANGUAGE_STORAGE_KEY = 'app-language';
const DEFAULT_LANGUAGE: Language = 'zh';

const translations: Record<Language, TranslationObject> = {
  zh: zhTranslations,
  en: enTranslations,
};

/**
 * Get nested property value from object using dot notation
 * Example: getNestedValue({ a: { b: 'value' } }, 'a.b') returns 'value'
 */
function getNestedValue(obj: unknown, path: string): string | undefined {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        // Type assertion to allow string indexing
        current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }

  return typeof current === 'string' ? current : undefined;
}

/**
 * Load language preference from localStorage
 */
function loadLanguageFromStorage(): Language {
  try {
    const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to load language from localStorage:', error);
  }
  return DEFAULT_LANGUAGE;
}

/**
 * Save language preference to localStorage
 */
function saveLanguageToStorage(language: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.warn('Failed to save language to localStorage:', error);
  }
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize language from localStorage after mount (client-side only)
  React.useEffect(() => {
    const storedLanguage = loadLanguageFromStorage();
    setLanguageState(storedLanguage);
    setIsInitialized(true);
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    saveLanguageToStorage(newLanguage);
  }, []);

  /**
   * Translation function
   * @param key - Translation key in dot notation (e.g., 'common.start')
   * @returns Translated string or the key itself if translation not found
   */
  const t = useCallback(
    (key: string): string => {
      if (!isInitialized) {
        // Return key during initialization to avoid hydration mismatch
        return key;
      }

      const translation = getNestedValue(translations[language], key);
      if (translation !== undefined) {
        return translation;
      }

      // Fallback: try to get from default language
      if (language !== DEFAULT_LANGUAGE) {
        const fallback = getNestedValue(translations[DEFAULT_LANGUAGE], key);
        if (fallback !== undefined) {
          return fallback;
        }
      }

      // If translation not found, return the key itself
      console.warn(`Translation not found for key: ${key}`);
      return key;
    },
    [language, isInitialized]
  );

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t,
    }),
    [language, setLanguage, t]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
