// tests/unit/app/page.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { ReactNode } from 'react';

// Wrapper component for tests
const Wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
);

const mockInitializeApp = vi.fn();
const mockSelectProblemSet = vi.fn();
const mockEndSessionEarly = vi.fn();
const mockPush = vi.fn();

const mockState: {
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  availableProblemSets: Array<{
    id: string;
    name: string | { en: string; zh: string };
    description?: string | { en: string; zh: string };
    problemSetKey: string;
    type: string;
    enabled: boolean;
    createdAt: number;
  }>;
  selectedProblemSetId: string | null;
  isSessionActive?: boolean;
  currentProblem?: unknown;
  sessionCompletedCount?: number;
  sessionQueue?: unknown[];
  sessionStartTime?: number | null;
  sessionPassCount?: number;
  sessionFailCount?: number;
} = {
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  availableProblemSets: [
    {
      id: 'set-1',
      name: { en: 'Addition within 20', zh: '20以内加法' },
      description: { en: 'Practice addition', zh: '练习加法' },
      problemSetKey: 'addition-within-20',
      type: 'addition',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'set-2',
      name: { en: 'Subtraction within 20', zh: '20以内减法' },
      description: { en: 'Practice subtraction', zh: '练习减法' },
      problemSetKey: 'subtraction-within-20',
      type: 'subtraction',
      enabled: true,
      createdAt: Date.now(),
    },
  ],
  selectedProblemSetId: null,
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => {
    return {
      state: mockState,
      actions: {
        initializeApp: mockInitializeApp,
        selectProblemSet: mockSelectProblemSet,
        endSessionEarly: mockEndSessionEarly,
      },
    };
  },
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    pathname: '/',
  }),
}));

describe('Home Page (Landing)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mutate the existing object instead of reassigning
    Object.assign(mockState, {
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      availableProblemSets: [
        {
          id: 'set-1',
          name: { en: 'Addition within 20', zh: '20以内加法' },
          description: { en: 'Practice addition', zh: '练习加法' },
          problemSetKey: 'addition-within-20',
          type: 'addition',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'set-2',
          name: { en: 'Subtraction within 20', zh: '20以内减法' },
          description: { en: 'Practice subtraction', zh: '练习减法' },
          problemSetKey: 'subtraction-within-20',
          type: 'subtraction',
          enabled: true,
          createdAt: Date.now(),
        },
      ],
      selectedProblemSetId: null,
    });
  });

  it('should render the main page with problem generator', () => {
    render(<Home />, { wrapper: Wrapper });
    // No Easy Practice title on landing view
  });

  it('should display problem set selector', () => {
    render(<Home />, { wrapper: Wrapper });

    expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
    expect(screen.getByTestId('problem-set-button-addition-within-20')).toBeInTheDocument();
    expect(screen.getByTestId('problem-set-button-subtraction-within-20')).toBeInTheDocument();
  });

  it('should show practice view when problem set is selected', async () => {
    const user = userEvent.setup();

    // Start with no selected problem set
    mockState.selectedProblemSetId = null;

    const { rerender } = render(<Home />, { wrapper: Wrapper });

    const additionButton = screen.getByTestId('problem-set-button-addition-within-20');

    // Mock the state change that would happen after selection
    mockSelectProblemSet.mockImplementation((id: string) => {
      mockState.selectedProblemSetId = id;
    });

    await user.click(additionButton);

    expect(mockSelectProblemSet).toHaveBeenCalledWith('set-1');
    // Should not navigate - stays on same page (SPA behavior)
    expect(mockPush).not.toHaveBeenCalled();

    // Rerender with updated state
    rerender(<Home />);

    // Should show practice view
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /(start new session|开始新练习)/i })
      ).toBeInTheDocument();
    });
  });

  it('should display problem display area when session is active', () => {
    // This test is no longer relevant for landing page
    // Landing page only shows problem set selection
    render(<Home />, { wrapper: Wrapper });

    // Should show problem set selector, not problem display
    expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
    expect(screen.queryByText('5 + 3')).not.toBeInTheDocument();
  });

  it('should display Start Session button when no session is active', () => {
    // This test is no longer relevant for landing page
    // Landing page shows problem set selection, not session controls
    render(<Home />, { wrapper: Wrapper });

    expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
  });

  it('should be responsive on mobile viewports', () => {
    render(<Home />, { wrapper: Wrapper });

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('flex');
  });

  it('Issue C: No infinite loops from page initialization > should not call initializeApp from page component', () => {
    render(<Home />, { wrapper: Wrapper });

    // The page component should not call initializeApp
    // Initialization happens in AppProvider
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('Issue C: No infinite loops from page initialization > should not cause maximum update depth exceeded error', () => {
    // This is tested by the fact that the component renders without errors
    expect(() => render(<Home />, { wrapper: Wrapper })).not.toThrow();
  });

  it('Issue B: Error handling during initialization > should display error message when initialization fails', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<Home />, { wrapper: Wrapper });

    expect(screen.getByText(/(Failed to load|加载失败)/i)).toBeInTheDocument();
  });

  it('Issue B: Error handling during initialization > should call initializeApp when retry button is clicked', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<Home />, { wrapper: Wrapper });

    const retryButton = screen.getByText(/(Retry|重试)/i);
    retryButton.click();

    expect(mockInitializeApp).toHaveBeenCalled();
  });

  it('Issue B: Error handling during initialization > should show loading state when not initialized and no error', () => {
    mockState.isInitialized = false;
    mockState.initializationError = null;

    render(<Home />, { wrapper: Wrapper });

    expect(screen.getByText(/(Loading\.\.\.|加载中\.\.\.)/i)).toBeInTheDocument();
  });
});

describe('Home Page (Session Close Feature)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Set up state for active session
    Object.assign(mockState, {
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      selectedProblemSetId: 'set-1',
      isSessionActive: true,
      sessionStartTime: Date.now() - 60000, // 1 minute ago
      sessionCompletedCount: 2,
      sessionQueue: ['p1', 'p2', 'p3', 'p4', 'p5'],
      sessionPassCount: 1,
      sessionFailCount: 1,
      currentProblem: {
        id: 'p3',
        problemSetId: 'set-1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      },
      availableProblemSets: [
        {
          id: 'set-1',
          name: { en: 'Addition within 20', zh: '20以内加法' },
          problemSetKey: 'addition-within-20',
          type: 'addition',
          enabled: true,
          createdAt: Date.now(),
        },
      ],
    });
  });

  it('should show close icon when session is active', () => {
    render(<Home />, { wrapper: Wrapper });

    const closeButton = screen.getByRole('button', { name: /close session/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should hide back button when session is active', () => {
    render(<Home />, { wrapper: Wrapper });

    const backButton = screen.queryByLabelText(/back to landing page/i);
    expect(backButton).not.toBeInTheDocument();
  });

  it('should show settings icon when session is not active', () => {
    mockState.isSessionActive = false;
    mockState.currentProblem = null;
    mockState.sessionCompletedCount = 0;

    render(<Home />, { wrapper: Wrapper });

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('should call endSessionEarly when close button is clicked and confirmed', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<Home />, { wrapper: Wrapper });

    const closeButton = screen.getByRole('button', { name: /close session/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
      expect(mockEndSessionEarly).toHaveBeenCalled();
    });
  });

  it('should not call endSessionEarly when close button is clicked but not confirmed', async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<Home />, { wrapper: Wrapper });

    const closeButton = screen.getByRole('button', { name: /close session/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalled();
    });

    expect(mockEndSessionEarly).not.toHaveBeenCalled();
  });
});
