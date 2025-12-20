// tests/unit/app/practice/page.epic3.test.tsx
// Epic 3: Mobile-First Design (Parent-Centric) - Practice Page
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PracticePage from '@/app/practice/page';
import type { Problem } from '@/types';

const mockStartNewSession = vi.fn();
const mockSubmitAnswer = vi.fn();
const mockSelectProblemSet = vi.fn();

interface MockState {
  currentProblem: Problem | null;
  selectedType: string;
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  isSessionActive: boolean;
  sessionQueue: string[];
  sessionCompletedCount: number;
  selectedProblemSetId: string | null;
  availableProblemSets: Array<{ id: string; name: string; type: string; enabled: boolean; createdAt: number }>;
  showSummary: boolean;
  struggledProblems: Array<{ problemId: string; problem: string; answer: string; category: string; failCount: number }>;
}

let mockState: MockState = {
  currentProblem: {
    id: 'p1',
    problem: '5 + 3',
    answer: '8',
    problemSetId: 'set-1',
    createdAt: Date.now(),
  },
  selectedType: 'addition',
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  isSessionActive: true,
  sessionQueue: ['p1', 'p2'],
  sessionCompletedCount: 0,
  selectedProblemSetId: 'set-1',
  availableProblemSets: [],
  showSummary: false,
  struggledProblems: [],
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: mockState,
    actions: {
      submitAnswer: mockSubmitAnswer,
      startNewSession: mockStartNewSession,
      selectProblemSet: mockSelectProblemSet,
      loadStruggledProblems: vi.fn(),
      toggleSummary: vi.fn(),
      resetAllData: vi.fn(),
    },
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/practice',
  }),
}));

describe('Epic 3: Mobile-First Design - User Story 1: Responsive Design - Practice Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: {
        id: 'p1',
        problem: '5 + 3',
        answer: '8',
        problemSetId: 'set-1',
        createdAt: Date.now(),
      },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: ['p1', 'p2'],
      sessionCompletedCount: 0,
      selectedProblemSetId: 'set-1',
      availableProblemSets: [],
      showSummary: false,
      struggledProblems: [],
    };
  });

  describe('AC1: Portrait mode - no scrolling required', () => {
    it('should use min-h-screen to ensure full viewport height coverage', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should use flex layout to center content vertically', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex');
      expect(main).toHaveClass('flex-col');
    });

    it('should have proper padding to prevent content touching edges', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('p-8');
    });

    it('should use max-w constraint to prevent excessive width on large screens', () => {
      render(<PracticePage />);

      const container = screen.getByRole('main').querySelector('.max-w-2xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC2: Landscape mode - dynamic layout adjustment', () => {
    it('should have flexible layout that adapts to different orientations', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex');
      expect(main).toHaveClass('items-center');
      expect(main).toHaveClass('justify-center');
    });

    it('should maintain proper spacing in all orientations', () => {
      render(<PracticePage />);

      const container = screen.getByRole('main').querySelector('.space-y-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC3: Consistent design across different screen sizes', () => {
    it('should use responsive width classes (w-full, max-w-2xl)', () => {
      render(<PracticePage />);

      const container = screen.getByRole('main').querySelector('.w-full');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('max-w-2xl');
    });

    it('should maintain consistent rounded corners', () => {
      render(<PracticePage />);

      const card = screen.getByRole('main').querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('should maintain consistent shadow effects', () => {
      render(<PracticePage />);

      const card = screen.getByRole('main').querySelector('.shadow-lg');
      expect(card).toBeInTheDocument();
    });
  });
});

describe('Epic 3: Mobile-First Design - User Story 2: Large Text and Buttons - Practice Page', () => {
  beforeEach(() => {
    mockState = {
      currentProblem: {
        id: 'p1',
        problem: '5 + 3',
        answer: '8',
        problemSetId: 'set-1',
        createdAt: Date.now(),
      },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: ['p1', 'p2'],
      sessionCompletedCount: 0,
      selectedProblemSetId: 'set-1',
      availableProblemSets: [],
      showSummary: false,
      struggledProblems: [],
    };
  });

  describe('AC1: Text/buttons at least 16px for readability', () => {
    it('should have heading text of 3xl (30px) or larger', () => {
      render(<PracticePage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl');
    });

    it('should have problem display text of 6xl (60px) or larger', () => {
      render(<PracticePage />);

      const problemText = screen.getByText('5 + 3');
      expect(problemText).toHaveClass('text-6xl');
    });

    it('should have button text that is readable (font-medium or font-semibold)', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasReadableFont = buttons.some(
        (btn) =>
          btn.classList.contains('font-medium') ||
          btn.classList.contains('font-semibold')
      );
      expect(hasReadableFont).toBe(true);
    });
  });

  describe('AC2: Sufficient padding to prevent accidental taps', () => {
    it('should have buttons with minimum height of 48px (h-12)', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasMinHeight = buttons.some((btn) => btn.classList.contains('h-12'));
      expect(hasMinHeight).toBe(true);
    });

    it('should have buttons with sufficient horizontal padding', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasPadding = buttons.some(
        (btn) =>
          btn.classList.contains('px-6') ||
          btn.classList.contains('px-8') ||
          btn.classList.contains('px-4')
      );
      expect(hasPadding).toBe(true);
    });

    it('should have appropriate gap between adjacent buttons', () => {
      render(<PracticePage />);

      const gapContainers = screen.getByRole('main').querySelectorAll('.gap-4');
      expect(gapContainers.length).toBeGreaterThan(0);
    });
  });

  describe('AC3: Sufficient contrast for low-light conditions', () => {
    it('should use high contrast colors for primary text', () => {
      render(<PracticePage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-gray-900');
    });

    it('should use appropriate background colors with good contrast', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-gray-50');
    });

    it('should have white background for main content card', () => {
      render(<PracticePage />);

      const card = screen.getByRole('main').querySelector('.bg-white');
      expect(card).toBeInTheDocument();
    });
  });
});

describe('Epic 3: Mobile-First Design - User Story 3: Engaging Visuals - Practice Page', () => {
  beforeEach(() => {
    mockState = {
      currentProblem: {
        id: 'p1',
        problem: '5 + 3',
        answer: '8',
        problemSetId: 'set-1',
        createdAt: Date.now(),
      },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: ['p1', 'p2'],
      sessionCompletedCount: 0,
      selectedProblemSetId: 'set-1',
      availableProblemSets: [],
      showSummary: false,
      struggledProblems: [],
    };
  });

  describe('AC1: Colorful visuals (illustrations, animations)', () => {
    it('should use colorful button styles (blue, green, red)', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      const hasColorfulButtons =
        main.querySelector('.bg-blue-500') ||
        main.querySelector('.bg-green-500') ||
        main.querySelector('.bg-red-500');
      expect(hasColorfulButtons).toBeTruthy();
    });

    it('should include transition effects for interactivity', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasTransitions = buttons.some((btn) =>
        btn.classList.contains('transition-colors')
      );
      expect(hasTransitions).toBe(true);
    });

    it('should have rounded corners for a friendly appearance', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasRounded = buttons.some((btn) => btn.classList.contains('rounded-lg'));
      expect(hasRounded).toBe(true);
    });

    it('should use emoji or icons for visual appeal in session complete state', () => {
      mockState.isSessionActive = false;
      mockState.sessionCompletedCount = 5;

      render(<PracticePage />);

      expect(screen.getByText(/🎉/)).toBeInTheDocument();
    });
  });

  describe('AC2: Visuals should not distract from parent interaction', () => {
    it('should keep animations subtle (transition-colors only)', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      // Check no heavy animations like animate-spin, animate-bounce
      expect(main.querySelector('.animate-spin')).not.toBeInTheDocument();
      expect(main.querySelector('.animate-bounce')).not.toBeInTheDocument();
    });

    it('should maintain clear visual hierarchy with font sizes', () => {
      render(<PracticePage />);

      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('text-3xl');

      const problemText = screen.getByText('5 + 3');
      expect(problemText).toHaveClass('text-6xl');
    });

    it('should use appropriate spacing to prevent visual clutter', () => {
      render(<PracticePage />);

      const container = screen.getByRole('main').querySelector('.space-y-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC3: Visuals remain engaging without becoming repetitive', () => {
    it('should use varied colors for different button types', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      const hasVariedColors =
        main.querySelector('.bg-blue-500') &&
        (main.querySelector('.bg-green-500') || main.querySelector('.bg-red-500'));
      expect(hasVariedColors).toBeTruthy();
    });

    it('should have hover states for interactive feedback', () => {
      render(<PracticePage />);

      const buttons = screen.getAllByRole('button');
      const hasHoverStates = buttons.some(
        (btn) =>
          btn.className.includes('hover:bg-') || btn.className.includes('hover:')
      );
      expect(hasHoverStates).toBe(true);
    });

    it('should use consistent but varied visual patterns', () => {
      render(<PracticePage />);

      const main = screen.getByRole('main');
      expect(main.querySelector('.rounded-2xl')).toBeInTheDocument();
      expect(main.querySelector('.rounded-lg')).toBeInTheDocument();
    });
  });
});
