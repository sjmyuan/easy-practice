import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { LoadingView } from '../../../components/LoadingView';
import { LanguageProvider } from '@/contexts/LanguageContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('LoadingView', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should render loading text in English', async () => {
    // Set localStorage to return English
    localStorageMock.setItem('app-language', 'en');
    
    render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  it('should render loading text in Chinese', async () => {
    // Set localStorage to return Chinese
    localStorageMock.setItem('app-language', 'zh');
    
    render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });
  });

  it('should render loading text', () => {
    render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    // Should render the translation key initially during hydration, then actual text
    const loadingText = screen.getByText(/Loading...|加载中.../);
    expect(loadingText).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center'
    );
  });

  it('should render loading text with correct color', () => {
    render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    const loadingText = screen.getByText(/Loading...|加载中.../);
    expect(loadingText).toHaveClass('text-gray-500');
  });

  it('should render loading text with correct size', () => {
    render(
      <LanguageProvider>
        <LoadingView />
      </LanguageProvider>
    );

    const loadingText = screen.getByText(/Loading...|加载中.../);
    expect(loadingText).toHaveClass('text-xl');
  });
});
