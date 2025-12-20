// tests/unit/app/practice/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticePage from '@/app/practice/page';
import type { AppState } from '@/contexts/AppContext';

const mockInitializeApp = vi.fn();
const mockLoadNextProblem = vi.fn();
const mockSetType = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockLoadStruggledProblems = vi.fn();
const mockToggleSummary = vi.fn();
const mockResetAllData = vi.fn();
const mockStartNewSession = vi.fn();
const mockSelectProblemSet = vi.fn();
const mockPush = vi.fn();

let mockState: AppState = {
  currentProblem: null,
  recentProblemIds: [],
  selectedProblemSetKey: 'addition',
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  showSummary: false,
  struggledProblems: [],
  isSessionActive: false,
  sessionQueue: [],
  sessionCompletedCount: 0,
  selectedProblemSetId: 'set-1',
  availableProblemSets: [],
  sessionStartTime: null,
  sessionDuration: null,
  sessionPassCount: 0,
  sessionFailCount: 0,
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: mockState,
    actions: {
      initializeApp: mockInitializeApp,
      loadNextProblem: mockLoadNextProblem,
      setProblemSetKey: mockSetType,
      submitAnswer: mockSubmitAnswer,
      loadStruggledProblems: mockLoadStruggledProblems,
      toggleSummary: mockToggleSummary,
      resetAllData: mockResetAllData,
      startNewSession: mockStartNewSession,
      selectProblemSet: mockSelectProblemSet,
    },
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    pathname: '/practice',
  }),
}));

describe('Practice Page', () => {
  const originalError = console.error;

  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: null,
      recentProblemIds: [],
      selectedProblemSetKey: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      showSummary: false,
      struggledProblems: [],
      isSessionActive: false,
      sessionQueue: [],
      sessionCompletedCount: 0,
      selectedProblemSetId: 'set-1',
      availableProblemSets: [],
      sessionStartTime: null,
      sessionDuration: null,
      sessionPassCount: 0,
      sessionFailCount: 0,
    };
    // Suppress console errors during tests
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalError;
  });

  it('should render the practice page', () => {
    render(<PracticePage />);

    expect(screen.getByText(/math practice/i)).toBeInTheDocument();
  });

  it('should redirect to landing if no problem set selected', async () => {
    mockState.selectedProblemSetId = null;

    render(<PracticePage />);

    // Wait for useEffect to trigger the redirect
    await vi.waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/');
    });
  });

  it('should not throw error when redirecting to landing page', () => {
    mockState.selectedProblemSetId = null;

    // This should not throw a React error about setState during render
    expect(() => render(<PracticePage />)).not.toThrow();

    // Should not call console.error with React warnings
    expect(console.error).not.toHaveBeenCalledWith(
      expect.stringMatching(/Cannot update a component.*while rendering/i)
    );
  });

  it('should display problem when session is active', () => {
    mockState = {
      ...mockState,
      isSessionActive: true,
      currentProblem: {
        id: 'p1',
        problem: '5 + 3',
        answer: '8',
        problemSetId: 'set-1',
        createdAt: Date.now(),
      },
      sessionQueue: ['p1', 'p2'],
    };

    render(<PracticePage />);

    expect(screen.getByText('5 + 3')).toBeInTheDocument();
  });

  it('should display Start Session button when no session is active', () => {
    mockState = {
      ...mockState,
      isSessionActive: false,
      sessionCompletedCount: 0,
    };

    render(<PracticePage />);

    // Should show loading initially (auto-start will trigger)
    expect(screen.getByText(/loading session/i)).toBeInTheDocument();
  });

  it('should display session complete message after completion', () => {
    mockState = {
      ...mockState,
      isSessionActive: false,
      sessionCompletedCount: 5,
      sessionDuration: 0,
      sessionPassCount: 0,
      sessionFailCount: 0,
    };

    render(<PracticePage />);

    expect(screen.getByText(/session complete/i)).toBeInTheDocument();
  });

  it('should have clickable Math Practice heading that navigates to landing', () => {
    mockState = {
      ...mockState,
      isSessionActive: true,
      currentProblem: {
        id: 'p1',
        problem: '5 + 3',
        answer: '8',
        problemSetId: 'set-1',
        createdAt: Date.now(),
      },
      sessionQueue: ['p1', 'p2'],
    };

    render(<PracticePage />);

    const heading = screen.getByRole('button', { name: /return to landing page/i });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Math Practice');
  });

  it('should be responsive on mobile viewports', () => {
    render(<PracticePage />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('flex');
  });

  it('should display error message when initialization fails', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<PracticePage />);

    expect(screen.getByText(/error: failed to load/i)).toBeInTheDocument();
  });

  it('should call initializeApp when retry button is clicked', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<PracticePage />);

    const retryButton = screen.getByText(/retry/i);
    retryButton.click();

    expect(mockInitializeApp).toHaveBeenCalled();
  });

  it('should show loading state when not initialized and no error', () => {
    mockState.isInitialized = false;
    mockState.initializationError = null;

    render(<PracticePage />);

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });

  describe('Session Statistics Display', () => {
    it('should display session duration in HH:MM:SS format when session completes', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 5,
        sessionDuration: 125000, // 2 minutes 5 seconds in milliseconds
      };

      render(<PracticePage />);

      expect(screen.getByText(/session complete/i)).toBeInTheDocument();
      expect(screen.getByText(/00:02:05/)).toBeInTheDocument();
    });

    it('should display pass count when session completes', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 5,
        sessionPassCount: 4,
        sessionFailCount: 1,
        sessionDuration: 60000,
      };

      render(<PracticePage />);

      expect(screen.getByText(/pass/i)).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
    });

    it('should display fail count when session completes', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 5,
        sessionPassCount: 4,
        sessionFailCount: 1,
        sessionDuration: 60000,
      };

      render(<PracticePage />);

      expect(screen.getByText(/fail/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('should display total problems when session completes', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 10,
        sessionPassCount: 8,
        sessionFailCount: 2,
        sessionDuration: 120000,
      };

      render(<PracticePage />);

      expect(screen.getByText(/total/i)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument();
    });

    it('should display all session statistics together when session completes', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 15,
        sessionPassCount: 12,
        sessionFailCount: 3,
        sessionDuration: 300000, // 5 minutes
      };

      render(<PracticePage />);

      expect(screen.getByText(/session complete/i)).toBeInTheDocument();
      expect(screen.getByText(/00:05:00/)).toBeInTheDocument();
      expect(screen.getByText(/pass/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText(/fail/i)).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText(/total/i)).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });

    it('should format duration correctly for hours, minutes, and seconds', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 20,
        sessionDuration: 3661000, // 1 hour, 1 minute, 1 second
      };

      render(<PracticePage />);

      expect(screen.getByText(/01:01:01/)).toBeInTheDocument();
    });

    it('should handle zero duration gracefully', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 1,
        sessionDuration: 0,
      };

      render(<PracticePage />);

      expect(screen.getByText(/00:00:00/)).toBeInTheDocument();
    });

    it('should not display session statistics when session is still active', () => {
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionCompletedCount: 3,
        sessionPassCount: 2,
        sessionFailCount: 1,
        sessionDuration: null, // Duration not calculated yet
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2', 'p3', 'p4', 'p5'],
      };

      render(<PracticePage />);

      // Should show problem, not statistics
      expect(screen.getByText('5 + 3')).toBeInTheDocument();
      expect(screen.queryByText(/duration:/i)).not.toBeInTheDocument();
    });
  });
});
