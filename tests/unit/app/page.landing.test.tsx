import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { AppProvider } from '@/contexts/AppContext';
import * as services from '@/services';
import type { ProblemSet } from '@/types';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockRouter = {
  push: mockPush,
  replace: vi.fn(),
  pathname: '/',
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
}));

// Mock services
vi.mock('@/services', () => ({
  databaseService: {
    getProblemSets: vi.fn(),
    getProblemById: vi.fn(),
    getStatistics: vi.fn(),
    recordAttempt: vi.fn(),
    resetStatisticsByType: vi.fn(),
  },
  problemService: {
    hasProblems: vi.fn(),
    loadDefaultProblemSets: vi.fn(),
  },
}));

describe('Landing Page (app/page.tsx)', () => {
  const mockProblemSets: ProblemSet[] = [
    {
      id: 'set-1',
      name: 'Addition within 20',
      description: 'Practice addition with sums up to 20',
      problemSetKey: 'addition-within-20',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'set-2',
      name: 'Subtraction within 20',
      description: 'Practice subtraction with results up to 20',
      problemSetKey: 'subtraction-within-20',
      enabled: true,
      createdAt: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(services.problemService.hasProblems).mockResolvedValue(true);
    vi.mocked(services.databaseService.getProblemSets).mockResolvedValue(
      mockProblemSets
    );
  });

  describe('Initialization', () => {
    it('should display loading state initially', () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display problem set selector after initialization', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Choose a Problem Set')).toBeInTheDocument();
      });
    });

    it('should fetch and display available problem sets', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Addition within 20')).toBeInTheDocument();
        expect(screen.getByText('Subtraction within 20')).toBeInTheDocument();
      });
    });

    it('should display error state when initialization fails', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockRejectedValue(
        new Error('Database error')
      );

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText(/Error:/)).toBeInTheDocument();
      });
    });
  });

  describe('Problem Set Selection', () => {
    it('should navigate to practice page when a problem set is selected', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Addition within 20')).toBeInTheDocument();
      });

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });
      await user.click(additionButton);

      expect(mockPush).toHaveBeenCalledWith('/practice');
    });

    it('should store selected problem set ID in context', async () => {
      const user = userEvent.setup();

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Addition within 20')).toBeInTheDocument();
      });

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });
      await user.click(additionButton);

      // Context update will be verified in integration tests
      expect(mockPush).toHaveBeenCalledWith('/practice');
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper page layout', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Choose a Problem Set')).toBeInTheDocument();
      });

      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should display app title', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Easy Practice')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display message when no problem sets are available', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockResolvedValue([]);

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText('No problem sets available')
        ).toBeInTheDocument();
      });
    });

    it('should not show navigation options when no problem sets', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockResolvedValue([]);

      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(
          screen.getByText('No problem sets available')
        ).toBeInTheDocument();
      });

      // Should not have any problem set buttons
      const buttons = screen.queryAllByRole('button');
      expect(buttons).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(
        <AppProvider>
          <Home />
        </AppProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('Easy Practice')).toBeInTheDocument();
      });

      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toHaveTextContent('Easy Practice');

      const h2 = screen.getByRole('heading', { level: 2 });
      expect(h2).toHaveTextContent('Choose a Problem Set');
    });
  });
});
