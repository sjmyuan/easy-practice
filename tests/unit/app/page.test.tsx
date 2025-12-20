// tests/unit/app/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';

const mockInitializeApp = vi.fn();
const mockLoadNextProblem = vi.fn();
const mockSetType = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockLoadStruggledProblems = vi.fn();
const mockToggleSummary = vi.fn();
const mockResetAllData = vi.fn();

let mockState: {
  currentProblem: any;
  selectedType: string;
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  showSummary: boolean;
  struggledProblems: any[];
} = {
  currentProblem: null,
  selectedType: 'addition',
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  showSummary: false,
  struggledProblems: [],
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: mockState,
    actions: {
      initializeApp: mockInitializeApp,
      loadNextProblem: mockLoadNextProblem,
      setType: mockSetType,
      submitAnswer: mockSubmitAnswer,
      loadStruggledProblems: mockLoadStruggledProblems,
      toggleSummary: mockToggleSummary,
      resetAllData: mockResetAllData,
    },
  }),
}));

describe('Home Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: null,
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      showSummary: false,
      struggledProblems: [],
    };
  });

  it('should render the main page with problem generator', () => {
    render(<Home />);

    expect(screen.getByText(/math practice/i)).toBeInTheDocument();
  });

  it('should display type selector buttons', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /addition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtraction/i })).toBeInTheDocument();
  });

  it('should display problem display area', () => {
    render(<Home />);

    expect(screen.getByRole('region', { name: /current math problem/i })).toBeInTheDocument();
  });

  it('should be responsive on mobile viewports', () => {
    render(<Home />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass('min-h-screen');
  });

  describe('Issue C: No infinite loops from page initialization', () => {
    it('should not call initializeApp from page component', async () => {
      render(<Home />);

      // Wait a bit to ensure no effects run
      await waitFor(() => {
        expect(screen.getByText(/math practice/i)).toBeInTheDocument();
      });

      await new Promise((resolve) => setTimeout(resolve, 100));

      // initializeApp should not be called from the page component
      // It should only be called from AppContext
      expect(mockInitializeApp).not.toHaveBeenCalled();
    });

    it('should not cause maximum update depth exceeded error', async () => {
      // This test verifies that rendering the page multiple times doesn't cause issues
      const { rerender } = render(<Home />);

      // Rerender multiple times
      for (let i = 0; i < 5; i++) {
        rerender(<Home />);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));

      // Should still render without errors
      expect(screen.getByText(/math practice/i)).toBeInTheDocument();
      
      // initializeApp should still not be called
      expect(mockInitializeApp).not.toHaveBeenCalled();
    });
  });

  describe('Issue B: Error handling during initialization', () => {
    it('should display error message when initialization fails', () => {
      mockState = {
        ...mockState,
        isInitialized: false,
        initializationError: 'Failed to load problem sets',
      };

      render(<Home />);

      expect(screen.getByText(/error: failed to load problem sets/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('should call initializeApp when retry button is clicked', async () => {
      mockState = {
        ...mockState,
        isInitialized: false,
        initializationError: 'Database initialization failed',
      };

      render(<Home />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      retryButton.click();

      expect(mockInitializeApp).toHaveBeenCalledTimes(1);
    });

    it('should show loading state when not initialized and no error', () => {
      mockState = {
        ...mockState,
        isInitialized: false,
        initializationError: null,
      };

      render(<Home />);

      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
      expect(screen.queryByText(/math practice/i)).not.toBeInTheDocument();
    });
  });
});
