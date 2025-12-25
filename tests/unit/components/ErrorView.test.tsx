import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ErrorView } from '../../../components/ErrorView';
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

describe('ErrorView', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should render error message in English', async () => {
    localStorageMock.setItem('app-language', 'en');
    render(
      <LanguageProvider>
        <ErrorView message="Test error message" onRetry={() => {}} />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Retry/i })).toBeInTheDocument();
    });
  });

  it('should render error message in Chinese', async () => {
    localStorageMock.setItem('app-language', 'zh');
    render(
      <LanguageProvider>
        <ErrorView message="Test error message" onRetry={() => {}} />
      </LanguageProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Test error message/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument();
    });
  });

  it('should render error message', () => {
    render(
      <LanguageProvider>
        <ErrorView message="Test error message" onRetry={() => {}} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Test error message/)).toBeInTheDocument();
  });

  it('should render retry button', () => {
    render(
      <LanguageProvider>
        <ErrorView message="Test error" onRetry={() => {}} />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /(Retry|重试)/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(
      <LanguageProvider>
        <ErrorView message="Test error" onRetry={onRetry} />
      </LanguageProvider>
    );

    const retryButton = screen.getByRole('button', { name: /(Retry|重试)/i });
    retryButton.click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling classes', () => {
    const { container } = render(
      <LanguageProvider>
        <ErrorView message="Test error" onRetry={() => {}} />
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

  it('should render error message with correct color', () => {
    render(
      <LanguageProvider>
        <ErrorView message="Critical error" onRetry={() => {}} />
      </LanguageProvider>
    );

    const errorText = screen.getByText(/Critical error/);
    expect(errorText).toHaveClass('text-red-600');
  });
});
