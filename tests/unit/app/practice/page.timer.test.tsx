// tests/unit/app/practice/page.timer.test.tsx
import { render, screen, act } from '@testing-library/react';
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
  availableProblemSets: [
    {
      id: 'set-1',
      name: 'Addition Within 10',
      key: 'addition-within-10',
      enabled: true,
    },
  ],
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

describe('Practice Page - Session Timer Integration', () => {
  beforeEach(() => {
    vi.useFakeTimers();
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
      availableProblemSets: [
        {
          id: 'set-1',
          name: 'Addition Within 10',
          key: 'addition-within-10',
          enabled: true,
        },
      ],
      sessionStartTime: null,
      sessionDuration: null,
      sessionPassCount: 0,
      sessionFailCount: 0,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Timer Display', () => {
    it('should display session timer when session is active', () => {
      const startTime = Date.now();
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 0,
      };

      render(<PracticePage />);

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
      expect(screen.getByLabelText('Session elapsed time')).toBeInTheDocument();
    });

    it('should not display session timer when session is not active', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionStartTime: null,
      };

      render(<PracticePage />);

      expect(screen.queryByLabelText('Session elapsed time')).not.toBeInTheDocument();
    });

    it('should display timer above progress indicator', () => {
      const startTime = Date.now();
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 1,
      };

      render(<PracticePage />);

      const timer = screen.getByLabelText('Session elapsed time');
      const progress = screen.getByText('1 / 2');

      // Get positions in the DOM
      const timerPosition = timer.compareDocumentPosition(progress);
      
      // DOCUMENT_POSITION_FOLLOWING (4) means progress comes after timer
      expect(timerPosition & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });

    it('should update timer as time passes', () => {
      const startTime = Date.now();
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 0,
      };

      render(<PracticePage />);

      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      // Advance time by 5 seconds
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:05')).toBeInTheDocument();

      // Advance time by 55 more seconds (1 minute total)
      act(() => {
        vi.advanceTimersByTime(55000);
      });

      expect(screen.getByText('00:01:00')).toBeInTheDocument();
    });

    it('should display correct elapsed time when session has already been running', () => {
      const startTime = Date.now() - 125000; // Started 2 minutes and 5 seconds ago
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 1,
      };

      render(<PracticePage />);

      expect(screen.getByText('00:02:05')).toBeInTheDocument();
    });
  });

  describe('Timer Persistence', () => {
    it('should continue showing timer when moving to next problem', () => {
      const startTime = Date.now() - 30000; // Started 30 seconds ago
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 0,
      };

      const { rerender } = render(<PracticePage />);

      expect(screen.getByText('00:00:30')).toBeInTheDocument();

      // Simulate moving to next problem (state update)
      mockState = {
        ...mockState,
        currentProblem: {
          id: 'p2',
          problem: '7 + 2',
          answer: '9',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionCompletedCount: 1,
      };

      rerender(<PracticePage />);

      // Timer should still be visible and continue counting
      expect(screen.getByText('00:00:30')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(screen.getByText('00:00:35')).toBeInTheDocument();
    });

    it('should hide timer when session completes', () => {
      const startTime = Date.now() - 120000; // Started 2 minutes ago
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1'],
        sessionCompletedCount: 0,
      };

      const { rerender } = render(<PracticePage />);

      expect(screen.getByText('00:02:00')).toBeInTheDocument();

      // Simulate session completion
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionStartTime: startTime,
        sessionDuration: 120000,
        currentProblem: null,
        sessionQueue: [],
        sessionCompletedCount: 1,
      };

      rerender(<PracticePage />);

      // Timer should be hidden
      expect(screen.queryByLabelText('Session elapsed time')).not.toBeInTheDocument();
      // Session duration should be shown in summary
      expect(screen.getByText(/Duration:/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label for timer', () => {
      const startTime = Date.now();
      mockState = {
        ...mockState,
        isSessionActive: true,
        sessionStartTime: startTime,
        currentProblem: {
          id: 'p1',
          problem: '5 + 3',
          answer: '8',
          problemSetId: 'set-1',
          createdAt: Date.now(),
        },
        sessionQueue: ['p1', 'p2'],
        sessionCompletedCount: 0,
      };

      render(<PracticePage />);

      const timer = screen.getByLabelText('Session elapsed time');
      expect(timer).toBeInTheDocument();
    });
  });
});
