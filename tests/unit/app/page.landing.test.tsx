import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Home from '@/app/page';
import { LanguageProvider } from '@/contexts/LanguageContext';
import * as services from '@/services';
import type { ProblemSet } from '@/types';
import type { ReactNode } from 'react';

import { AppProvider } from '@/contexts/AppContext';
// Wrapper component for tests
const Wrapper = ({ children }: { children: ReactNode }) => (
  <AppProvider>
    <LanguageProvider>{children}</LanguageProvider>
  </AppProvider>
);

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
      act(() => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      expect(screen.getByTestId('loading-view')).toBeInTheDocument();
    });

    it('should display problem set selector after initialization', async () => {
      await act(async () => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });
    });

    it('should fetch and display available problem sets', async () => {
      await act(async () => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-button-addition-within-20')).toBeInTheDocument();
        expect(screen.getByTestId('problem-set-button-subtraction-within-20')).toBeInTheDocument();
      });
    });

    it('should display error state when initialization fails', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockRejectedValue(
        new Error('Database error')
      );
      await act(async () => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('error-view')).toBeInTheDocument();
        expect(screen.getByTestId('error-message')).toHaveTextContent('Database error');
      });
    });
  });

  describe('Problem Set Selection', () => {
    it('should show practice view when a problem set is selected', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-button-addition-within-20')).toBeInTheDocument();
      });
      const additionButton = screen.getByTestId('problem-set-button-addition-within-20');
      await act(async () => {
        await user.click(additionButton);
      });
      // Should not navigate - stays on same page (SPA behavior)
      expect(mockPush).not.toHaveBeenCalled();
      // Should show practice view with Start Session button
      await waitFor(() => {
        expect(screen.getByTestId('start-session-button')).toBeInTheDocument();
      });
    });

    it('should store selected problem set ID in context', async () => {
      const user = userEvent.setup();
      await act(async () => {
        render(
          <Wrapper>
            <Home />
          </Wrapper>
        );
      });
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-button-addition-within-20')).toBeInTheDocument();
      });
      const additionButton = screen.getByTestId('problem-set-button-addition-within-20');
      await act(async () => {
        await user.click(additionButton);
      });
      // Should not navigate - stays on same page (SPA behavior)
      expect(mockPush).not.toHaveBeenCalled();
      // Should show practice view instead of landing view
      await waitFor(() => {
        expect(screen.queryByTestId('problem-set-selector-title')).not.toBeInTheDocument();
      });
    });
  });

  describe('Layout and Styling', () => {
    it('should have proper page layout', async () => {
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });
      const main = screen.getByRole('main');
      expect(main).toHaveClass('min-h-screen');
    });

    it('should display app title', async () => {
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-title')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display message when no problem sets are available', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockResolvedValue([]);
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });
    });

    it('should not show navigation options when no problem sets', async () => {
      vi.mocked(services.databaseService.getProblemSets).mockResolvedValue([]);
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );
      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });
      // Should not have any problem set buttons
      const list = screen.getByTestId('problem-set-list');
      expect(list.childElementCount).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', async () => {
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('landing-title')).toBeInTheDocument();
      });
      const h1 = screen.getByTestId('landing-title');
      expect(h1).toHaveTextContent('Easy Practice');
      const h2 = screen.getByTestId('problem-set-selector-title');
      expect(h2).toBeInTheDocument();
    });
  });
});
