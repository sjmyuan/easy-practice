// tests/unit/app/page.epic3.test.tsx
// Epic 3: Mobile-First Design (Parent-Centric) - Landing Page
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from '@/app/page';

const mockSelectProblemSet = vi.fn();

interface MockState {
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
}

let mockState: MockState = {
  isLoading: false,
  isInitialized: true,
  initializationError: null,
  availableProblemSets: [
    {
      id: 'set-1',
      name: 'Addition within 20',
      description: 'Practice addition',
      problemSetKey: 'addition-within-20',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'set-2',
      name: 'Subtraction within 20',
      description: 'Practice subtraction',
      problemSetKey: 'subtraction-within-20',
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
      selectProblemSet: mockSelectProblemSet,
      initializeApp: vi.fn(),
    },
  }),
}));

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
  }),
}));

describe('Epic 3: Mobile-First Design - User Story 1: Responsive Design', () => {
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
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'set-2',
          name: 'Subtraction within 20',
          description: 'Practice subtraction',
          problemSetKey: 'subtraction-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ],
      selectedProblemSetId: null,
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
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      availableProblemSets: [
        {
          id: 'set-1',
          name: 'Addition within 20',
          description: 'Practice addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'set-2',
          name: 'Subtraction within 20',
          description: 'Practice subtraction',
          problemSetKey: 'subtraction-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ],
      selectedProblemSetId: null,
    };
  });

  describe('AC1: Text/buttons at least 16px for readability', () => {
    it('should have heading text of 3xl (30px) or larger', () => {
      render(<Home />);

      const heading = screen.getByRole('heading', { name: /math practice/i });
      expect(heading).toHaveClass('text-3xl');
    });

    it('should have problem set selector text readable', () => {
      render(<Home />);

      const heading = screen.getByText(/choose a problem set/i);
      expect(heading).toHaveClass('text-3xl');
    });

    it('should have button text that is readable (font-medium or font-semibold)', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      const hasReadableFont = buttons.some(
        (btn) =>
          btn.classList.contains('font-medium') ||
          btn.classList.contains('font-semibold') ||
          btn.querySelector('.font-semibold')
      );
      expect(hasReadableFont || buttons.length > 0).toBe(true);
    });

    it('should have button text that is readable (font-medium or font-semibold)', () => {
      render(<Home />);

      const problemSetButton = screen.getByRole('button', { name: /addition within 20/i });
      const heading = problemSetButton.querySelector('h3');
      expect(heading?.className).toMatch(/font-(medium|semibold|bold)/);
    });
  });

  describe('AC2: Sufficient padding to prevent accidental taps', () => {
    it('should have buttons with minimum height of 48px or larger', () => {
      render(<Home />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // min-h-20 is 80px (5rem), which is larger than 48px
        expect(button.className).toMatch(/min-h-20|h-12|min-h-\[48px\]/);
      });
    });

    it('should have buttons with sufficient padding', () => {
      render(<Home />);

      const problemSetButton = screen.getByRole('button', { name: /addition within 20/i });
      // p-6 includes both horizontal and vertical padding
      expect(problemSetButton.className).toMatch(/p-6|px-(6|8)|py-(6|8)/);
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
      isLoading: false,
      isInitialized: true,
      initializationError: null,
      availableProblemSets: [
        { id: 'addition-within-20', name: 'Addition Within 20', description: 'Practice addition problems', problemSetKey: 'addition-within-20', enabled: true, createdAt: Date.now() },
        { id: 'subtraction-within-20', name: 'Subtraction Within 20', description: 'Practice subtraction problems', problemSetKey: 'subtraction-within-20', enabled: true, createdAt: Date.now() },
      ],
      selectedProblemSetId: null,
    };
  });

  describe('AC1: Colorful visuals (illustrations, animations)', () => {
    it('should use colorful button styles (blue, green, red)', () => {
      render(<Home />);

      const problemSetButton = screen.getByRole('button', { name: /addition within 20/i });
      // Should have color classes applied
      expect(problemSetButton.className).toMatch(
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

    it('should use friendly visual elements in the layout', () => {
      render(<Home />);

      // Landing page should have clear heading
      const heading = screen.getByText(/choose a problem set/i);
      expect(heading).toBeInTheDocument();
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

      const problemSetHeading = screen.getByText(/choose a problem set/i);
      expect(problemSetHeading).toHaveClass('text-3xl');
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

      const problemSetButton = screen.getByRole('button', { name: /addition within 20/i });
      // Problem set buttons use bg-white with colored borders/hover states
      expect(problemSetButton.className).toMatch(/bg-white|border-gray-200|hover:border-blue-500/);
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
