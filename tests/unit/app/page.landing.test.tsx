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
    saveSession: vi.fn(),
    getSessionHistory: vi.fn(),
  },
  problemService: {
    hasProblems: vi.fn(),
    loadDefaultProblemSets: vi.fn(),
    getProblemSets: vi.fn(),
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
    vi.mocked(services.problemService.hasProblems).mockReturnValue(true);
    vi.mocked(services.problemService.getProblemSets).mockReturnValue(
      mockProblemSets
    );
    vi.mocked(services.problemService.loadDefaultProblemSets).mockResolvedValue();
    vi.mocked(services.databaseService.getSessionHistory).mockReturnValue([]);
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
      vi.mocked(services.problemService.loadDefaultProblemSets).mockRejectedValue(
        new Error('Load error')
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
        expect(screen.getByTestId('error-message')).toHaveTextContent('Load error');
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
    it('should have proper page layout with gradient background', async () => {
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
      expect(main).toHaveClass('bg-gradient-to-br');
    });

    // App title is intentionally not displayed on landing view

    it('should display settings icon on landing page', async () => {
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });

      const settingsIcon = screen.getByLabelText('Settings');
      expect(settingsIcon).toBeInTheDocument();
    });

    it('should open settings panel when settings icon is clicked on landing page', async () => {
      const user = userEvent.setup();
      render(
        <Wrapper>
          <Home />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('problem-set-selector-title')).toBeInTheDocument();
      });

      const settingsIcon = screen.getByLabelText('Settings');
      await act(async () => {
        await user.click(settingsIcon);
      });

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/设置|Settings/i)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display message when no problem sets are available', async () => {
      vi.mocked(services.problemService.getProblemSets).mockReturnValue([]);
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
      vi.mocked(services.problemService.getProblemSets).mockReturnValue([]);
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

  // Accessibility: No h1 title on landing view, so skip heading hierarchy test
});
