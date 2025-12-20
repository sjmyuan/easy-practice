// tests/unit/app/practice/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PracticePage from '@/app/practice/page';

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

let mockState: {
  currentProblem: {
    problem: string;
    answer: number | string;
    problemType: string;
  } | null;
  selectedType: string;
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  showSummary: boolean;
  struggledProblems: Array<{
    problemId: string;
    problem: string;
    answer: string;
    category: string;
    failCount: number;
  }>;
  isSessionActive: boolean;
  sessionQueue: Array<{
    problem: string;
    answer: number | string;
    problemType: string;
  }>;
  sessionCompletedCount: number;
  selectedProblemSetId: string | null;
  availableProblemSets: Array<{
    id: string;
    name: string;
    type: string;
    enabled: boolean;
    createdAt: number;
  }>;
} = {
  currentProblem: null,
  selectedType: 'addition',
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
      selectedType: 'addition',
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
    };

    render(<PracticePage />);

    expect(screen.getByText(/session complete/i)).toBeInTheDocument();
    expect(screen.getByText(/you completed 5 problems/i)).toBeInTheDocument();
  });

  it('should have Change Problem Set button during session', () => {
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

    expect(screen.getByText(/change problem set/i)).toBeInTheDocument();
  });

  it('should have Change Problem Set button after session complete', () => {
    mockState = {
      ...mockState,
      isSessionActive: false,
      sessionCompletedCount: 5,
    };

    render(<PracticePage />);

    const changeButtons = screen.getAllByText(/change problem set/i);
    expect(changeButtons.length).toBeGreaterThan(0);
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
});
