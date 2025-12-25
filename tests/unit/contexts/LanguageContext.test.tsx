// tests/unit/contexts/LanguageContext.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';
import type { ReactNode } from 'react';

describe('LanguageContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <LanguageProvider>{children}</LanguageProvider>
  );

  // Mock localStorage
  const localStorageMock = (() => {
    let store: Record<string, string> = {};

    return {
      getItem: (key: string) => store[key] || null,
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        store = {};
      },
    };
  })();

  beforeEach(() => {
    // Clear localStorage before each test
    localStorageMock.clear();
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with Chinese as default language when no preference is stored', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('zh');
    });

    it('should load language preference from localStorage if available', () => {
      localStorageMock.setItem('app-language', 'en');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('en');
    });

    it('should default to Chinese if localStorage has invalid language', () => {
      localStorageMock.setItem('app-language', 'invalid');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('zh');
    });
  });

  describe('Language Switching', () => {
    it('should switch from Chinese to English', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('zh');

      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });

    it('should switch from English to Chinese', () => {
      localStorageMock.setItem('app-language', 'en');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('en');

      act(() => {
        result.current.setLanguage('zh');
      });

      expect(result.current.language).toBe('zh');
    });

    it('should persist language preference to localStorage when changed', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('en');
      });

      expect(localStorageMock.getItem('app-language')).toBe('en');
    });

    it('should update localStorage when switching back to Chinese', () => {
      localStorageMock.setItem('app-language', 'en');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('zh');
      });

      expect(localStorageMock.getItem('app-language')).toBe('zh');
    });
  });

  describe('Translation Function', () => {
    it('should provide a translation function', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe('function');
    });

    it('should return translated text for a given key in Chinese', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      // Assuming translation key 'common.start' exists
      const translated = result.current.t('common.start');
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
    });

    it('should return translated text for a given key in English', () => {
      localStorageMock.setItem('app-language', 'en');

      const { result } = renderHook(() => useLanguage(), { wrapper });

      const translated = result.current.t('common.start');
      expect(translated).toBeDefined();
      expect(typeof translated).toBe('string');
    });

    it('should update translations when language is switched', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const chineseText = result.current.t('common.start');

      act(() => {
        result.current.setLanguage('en');
      });

      const englishText = result.current.t('common.start');

      // The translated text should be different for different languages
      expect(chineseText).not.toBe(englishText);
    });

    it('should return the key itself if translation is not found', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      const missingKey = 'non.existent.key';
      const translated = result.current.t(missingKey);

      expect(translated).toBe(missingKey);
    });
  });

  describe('Context Provider', () => {
    it('should throw error when useLanguage is used outside provider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow('useLanguage must be used within a LanguageProvider');

      consoleError.mockRestore();
    });

    it('should provide language context to all children', () => {
      const { result, rerender } = renderHook(() => useLanguage(), { wrapper });

      expect(result.current.language).toBe('zh');

      act(() => {
        result.current.setLanguage('en');
      });

      // After rerender, the language should still be 'en'
      rerender();
      expect(result.current.language).toBe('en');
    });
  });

  describe('Persistence', () => {
    it('should persist language preference across page reloads', () => {
      const { result } = renderHook(() => useLanguage(), { wrapper });

      act(() => {
        result.current.setLanguage('en');
      });

      // Simulate page reload by creating a new hook instance
      const { result: newResult } = renderHook(() => useLanguage(), { wrapper });

      expect(newResult.current.language).toBe('en');
    });

    it('should handle localStorage being unavailable gracefully', () => {
      // Mock localStorage to throw error
      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: () => {
            throw new Error('localStorage not available');
          },
          setItem: () => {
            throw new Error('localStorage not available');
          },
        },
        writable: true,
      });

      const { result } = renderHook(() => useLanguage(), { wrapper });

      // Should still initialize with default Chinese
      expect(result.current.language).toBe('zh');

      // Should still allow language switching even if persistence fails
      act(() => {
        result.current.setLanguage('en');
      });

      expect(result.current.language).toBe('en');
    });
  });
});
