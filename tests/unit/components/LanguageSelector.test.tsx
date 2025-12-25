// tests/unit/components/LanguageSelector.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSelector from '@/components/LanguageSelector';
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext';

// Mock the useLanguage hook for specific tests
vi.mock('@/contexts/LanguageContext', async () => {
  const actual = await vi.importActual('@/contexts/LanguageContext');
  return {
    ...actual,
    useLanguage: vi.fn(),
  };
});

describe('LanguageSelector Component', () => {
  const mockSetLanguage = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useLanguage).mockReturnValue({
      language: 'zh',
      setLanguage: mockSetLanguage,
      t: (key: string) => key,
    });
  });

  describe('Rendering', () => {
    it('should render the language selector component', () => {
      render(<LanguageSelector />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should display Chinese flag/label when language is Chinese', () => {
      vi.mocked(useLanguage).mockReturnValue({
        language: 'zh',
        setLanguage: mockSetLanguage,
        t: (key: string) => (key === 'settings.chinese' ? '中文' : key),
      });

      render(<LanguageSelector />);

      expect(screen.getByText('中文')).toBeInTheDocument();
    });

    it('should display English label when language is English', () => {
      vi.mocked(useLanguage).mockReturnValue({
        language: 'en',
        setLanguage: mockSetLanguage,
        t: (key: string) => (key === 'settings.english' ? 'English' : key),
      });

      render(<LanguageSelector />);

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    it('should have appropriate ARIA labels for accessibility', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'settings.language');
    });
  });

  describe('Language Switching', () => {
    it('should toggle language from Chinese to English when clicked', () => {
      vi.mocked(useLanguage).mockReturnValue({
        language: 'zh',
        setLanguage: mockSetLanguage,
        t: (key: string) => key,
      });

      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetLanguage).toHaveBeenCalledWith('en');
    });

    it('should toggle language from English to Chinese when clicked', () => {
      vi.mocked(useLanguage).mockReturnValue({
        language: 'en',
        setLanguage: mockSetLanguage,
        t: (key: string) => key,
      });

      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetLanguage).toHaveBeenCalledWith('zh');
    });

    it('should call setLanguage only once per click', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.click(button);

      expect(mockSetLanguage).toHaveBeenCalledTimes(1);
    });
  });

  describe('Styling and UX', () => {
    it('should have hover effects', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toHaveClass('transition-all');
    });

    it('should be keyboard accessible', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      button.focus();

      expect(button).toHaveFocus();

      // Buttons respond to clicks, which can be triggered by Enter key
      fireEvent.click(button);
      expect(mockSetLanguage).toHaveBeenCalled();
    });

    it('should be clickable on touch devices', () => {
      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      fireEvent.touchStart(button);
      fireEvent.click(button);

      expect(mockSetLanguage).toHaveBeenCalled();
    });
  });

  describe('Integration with LanguageContext', () => {
    it('should work correctly when used within LanguageProvider', () => {
      // Import actual implementation
      vi.doUnmock('@/contexts/LanguageContext');
      
      const { unmount } = render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      unmount();

      // Restore mock for subsequent tests
      vi.mocked(useLanguage).mockReturnValue({
        language: 'zh',
        setLanguage: mockSetLanguage,
        t: (key: string) => key,
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing translations gracefully', () => {
      vi.mocked(useLanguage).mockReturnValue({
        language: 'zh',
        setLanguage: mockSetLanguage,
        t: () => '',
      });

      render(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
    });
  });
});
