// tests/unit/app/page.epic3.test.tsx
// Epic 3: Mobile-First Design (Parent-Centric)
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';
import type { Problem } from '@/types';

const mockStartNewSession = vi.fn();
const mockSetType = vi.fn();
const mockSubmitAnswer = vi.fn();

interface MockState {
  currentProblem: Problem | null;
  selectedType: string;
  isLoading: boolean;
  isInitialized: boolean;
  initializationError: string | null;
  isSessionActive: boolean;
  sessionQueue: Problem[];
  sessionCompletedCount: number;
}

let mockState: MockState = {
  currentProblem: { problem: '5 + 3', answer: 8, problemType: 'addition' },
  selectedType: 'addition',
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  isSessionActive: true,
  sessionQueue: [
    { problem: '5 + 3', answer: 8, problemType: 'addition' },
    { problem: '7 + 2', answer: 9, problemType: 'addition' },
  ],
  sessionCompletedCount: 0,
};

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: mockState,
    actions: {
      setType: mockSetType,
      submitAnswer: mockSubmitAnswer,
      startNewSession: mockStartNewSession,
    },
  }),
}));

describe('Epic 3: Mobile-First Design - User Story 1: Responsive Design', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: { problem: '5 + 3', answer: 8, problemType: 'addition' },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: [
        { problem: '5 + 3', answer: 8, problemType: 'addition' },
        { problem: '7 + 2', answer: 9, problemType: 'addition' },
      ],
      sessionCompletedCount: 0,
    };
  });

  describe('AC1: Portrait mode - no scrolling required', () => {
    it('should use min-h-screen to ensure full viewport height coverage', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should use flex layout to center content vertically', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('flex');
      expect(main).toHaveClass('flex-col');
    });

    it('should have proper padding to prevent content touching edges', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('p-8');
    });

    it('should use max-w constraint to prevent excessive width on large screens', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.max-w-2xl');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC2: Landscape mode - dynamic layout adjustment', () => {
    it('should have flexible layout that adapts to different orientations', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      // Flex layout allows natural reflow in different orientations
      expect(main).toHaveClass('flex');
      expect(main).toHaveClass('items-center');
      expect(main).toHaveClass('justify-center');
    });

    it('should maintain proper spacing in all orientations', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.space-y-8');
      expect(container).toBeInTheDocument();
    });
  });

  describe('AC3: Consistent design across different screen sizes', () => {
    it('should use responsive width classes (w-full, max-w-2xl)', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.w-full');
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass('max-w-2xl');
    });

    it('should maintain consistent rounded corners', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.rounded-2xl');
      expect(container).toBeInTheDocument();
    });

    it('should maintain consistent shadow effects', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.shadow-lg');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('Epic 3: Mobile-First Design - User Story 2: Large Text and Buttons', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: { problem: '5 + 3', answer: 8, problemType: 'addition' },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: [
        { problem: '5 + 3', answer: 8, problemType: 'addition' },
        { problem: '7 + 2', answer: 9, problemType: 'addition' },
      ],
      sessionCompletedCount: 0,
    };
  });

  describe('AC1: Text/buttons at least 16px for readability', () => {
    it('should have heading text of 3xl (30px) or larger', () => {
      render(<Home />);

      const heading = screen.getByRole('heading', { name: /math practice/i });
      expect(heading).toHaveClass('text-3xl');
    });

    it('should have problem display text of 6xl (60px) or larger', () => {
      render(<Home />);

      const problemDisplay = screen.getByRole('region', {
        name: /current math problem/i,
      });
      const problemText = problemDisplay.querySelector('.text-6xl');
      expect(problemText).toBeInTheDocument();
    });

    it('should have button text that is readable (font-medium or font-semibold)', () => {
      render(<Home />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      expect(additionButton.className).toMatch(/font-(medium|semibold|bold)/);
    });
  });

  describe('AC2: Sufficient padding to prevent accidental taps', () => {
    it('should have buttons with minimum height of 48px (h-12)', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/h-12|min-h-\[48px\]/);
      });
    });

    it('should have buttons with sufficient horizontal padding', () => {
      render(<Home />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      expect(additionButton.className).toMatch(/px-(6|8)/);
    });

    it('should have appropriate gap between adjacent buttons', () => {
      render(<Home />);

      // Find button containers
      const main = screen.getByRole('main');
      const gapContainers = main.querySelectorAll('.gap-4, .gap-8');
      expect(gapContainers.length).toBeGreaterThan(0);
    });
  });

  describe('AC3: Sufficient contrast for low-light conditions', () => {
    it('should use high contrast colors for primary text', () => {
      render(<Home />);

      const heading = screen.getByRole('heading', { name: /math practice/i });
      expect(heading).toHaveClass('text-gray-900');
    });

    it('should use appropriate background colors with good contrast', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      expect(main).toHaveClass('bg-gray-50');
    });

    it('should have white background for main content card', () => {
      render(<Home />);

      const container = screen.getByRole('main').querySelector('.bg-white');
      expect(container).toBeInTheDocument();
    });
  });
});

describe('Epic 3: Mobile-First Design - User Story 3: Engaging Visuals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockState = {
      currentProblem: { problem: '5 + 3', answer: 8, problemType: 'addition' },
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      isSessionActive: true,
      sessionQueue: [
        { problem: '5 + 3', answer: 8, problemType: 'addition' },
        { problem: '7 + 2', answer: 9, problemType: 'addition' },
      ],
      sessionCompletedCount: 0,
    };
  });

  describe('AC1: Colorful visuals (illustrations, animations)', () => {
    it('should use colorful button styles (blue, green, red)', () => {
      render(<Home />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      // Should have color classes applied
      expect(additionButton.className).toMatch(
        /bg-blue|bg-green|bg-red|bg-gray/
      );
    });

    it('should include transition effects for interactivity', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/transition/);
      });
    });

    it('should have rounded corners for a friendly appearance', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/rounded/);
      });
    });

    it('should use emoji or icons for visual appeal in session complete state', () => {
      mockState = {
        ...mockState,
        isSessionActive: false,
        sessionCompletedCount: 5,
      };

      render(<Home />);

      const completeMessage = screen.getByText(/🎉 session complete!/i);
      expect(completeMessage).toBeInTheDocument();
    });
  });

  describe('AC2: Visuals should not distract from parent interaction', () => {
    it('should keep animations subtle (transition-colors only)', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Should use subtle transitions, not distracting animations
        expect(button.className).toMatch(/transition-colors/);
      });
    });

    it('should maintain clear visual hierarchy with font sizes', () => {
      render(<Home />);

      const heading = screen.getByRole('heading', { name: /math practice/i });
      expect(heading).toHaveClass('text-3xl');

      const problemText = screen
        .getByRole('region', { name: /current math problem/i })
        .querySelector('.text-6xl');
      expect(problemText).toBeInTheDocument();
    });

    it('should use appropriate spacing to prevent visual clutter', () => {
      render(<Home />);

      const main = screen.getByRole('main');
      const spacingContainer = main.querySelector('.space-y-8');
      expect(spacingContainer).toBeInTheDocument();
    });
  });

  describe('AC3: Visuals remain engaging without becoming repetitive', () => {
    it('should use varied colors for different button types', () => {
      render(<Home />);

      const additionButton = screen.getByRole('button', { name: /addition/i });
      expect(additionButton.className).toMatch(/bg-blue-600|bg-gray-200/);
    });

    it('should have hover states for interactive feedback', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/hover:/);
      });
    });

    it('should use consistent but varied visual patterns', () => {
      render(<Home />);

      // Shadow effects add depth
      const shadowElements = screen
        .getByRole('main')
        .querySelectorAll('.shadow-lg');
      expect(shadowElements.length).toBeGreaterThan(0);

      // Rounded corners add friendliness
      const roundedElements = screen
        .getByRole('main')
        .querySelectorAll('[class*="rounded"]');
      expect(roundedElements.length).toBeGreaterThan(0);
    });
  });
});
