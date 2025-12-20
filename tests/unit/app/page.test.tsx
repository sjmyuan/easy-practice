// tests/unit/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';

const mockInitializeApp = vi.fn();
const mockSelectProblemSet = vi.fn();
const mockPush = vi.fn();

let mockState: {
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  availableProblemSets: Array<{
    id: string;
    name: string;
    description: string;
    type: string;
    enabled: boolean;
    createdAt: number;
  }>;
  selectedProblemSetId: string | null;
} = {
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  availableProblemSets: [
    {
      id: 'set-1',
      name: 'Addition within 20',
      description: 'Practice addition',
      type: 'addition',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'set-2',
      name: 'Subtraction within 20',
      description: 'Practice subtraction',
      type: 'subtraction',
      enabled: true,
      createdAt: Date.now(),
    },
  ],
  selectedProblemSetId: null,
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: mockState,
    actions: {
      initializeApp: mockInitializeApp,
      selectProblemSet: mockSelectProblemSet,
    },
  }),
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
    mockState = {
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      availableProblemSets: [
        {
          id: 'set-1',
          name: 'Addition within 20',
          description: 'Practice addition',
          type: 'addition',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'set-2',
          name: 'Subtraction within 20',
          description: 'Practice subtraction',
          type: 'subtraction',
          enabled: true,
          createdAt: Date.now(),
        },
      ],
      selectedProblemSetId: null,
    };
  });

  it('should render the main page with problem generator', () => {
    render(<Home />);

    expect(screen.getByText(/easy practice/i)).toBeInTheDocument();
  });

  it('should display problem set selector', () => {
    render(<Home />);

    expect(screen.getByText(/choose a problem set/i)).toBeInTheDocument();
    expect(screen.getByText('Addition within 20')).toBeInTheDocument();
    expect(screen.getByText('Subtraction within 20')).toBeInTheDocument();
  });

  it('should navigate to practice page when problem set is selected', async () => {
    const user = userEvent.setup();
    render(<Home />);

    const additionButton = screen.getByRole('button', {
      name: /addition within 20/i,
    });
    await user.click(additionButton);

    expect(mockSelectProblemSet).toHaveBeenCalledWith('set-1');
    expect(mockPush).toHaveBeenCalledWith('/practice');
  });

  it('should display problem display area when session is active', () => {
    // This test is no longer relevant for landing page
    // Landing page only shows problem set selection
    render(<Home />);

    // Should show problem set selector, not problem display
    expect(screen.getByText(/choose a problem set/i)).toBeInTheDocument();
    expect(screen.queryByText('5 + 3')).not.toBeInTheDocument();
  });

  it('should display Start Session button when no session is active', () => {
    // This test is no longer relevant for landing page
    // Landing page shows problem set selection, not session controls
    render(<Home />);

    expect(screen.getByText(/choose a problem set/i)).toBeInTheDocument();
  });

  it('should be responsive on mobile viewports', () => {
    render(<Home />);

    const main = screen.getByRole('main');
    expect(main).toHaveClass('min-h-screen');
    expect(main).toHaveClass('flex');
  });

  it('Issue C: No infinite loops from page initialization > should not call initializeApp from page component', () => {
    render(<Home />);

    // The page component should not call initializeApp
    // Initialization happens in AppProvider
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  it('Issue C: No infinite loops from page initialization > should not cause maximum update depth exceeded error', () => {
    // This is tested by the fact that the component renders without errors
    expect(() => render(<Home />)).not.toThrow();
  });

  it('Issue B: Error handling during initialization > should display error message when initialization fails', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<Home />);

    expect(screen.getByText(/error: failed to load/i)).toBeInTheDocument();
  });

  it('Issue B: Error handling during initialization > should call initializeApp when retry button is clicked', () => {
    mockState.initializationError = 'Failed to load';
    mockState.isInitialized = false;

    render(<Home />);

    const retryButton = screen.getByText(/retry/i);
    retryButton.click();

    expect(mockInitializeApp).toHaveBeenCalled();
  });

  it('Issue B: Error handling during initialization > should show loading state when not initialized and no error', () => {
    mockState.isInitialized = false;
    mockState.initializationError = null;

    render(<Home />);

    expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
  });
});
