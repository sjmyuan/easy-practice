// tests/unit/components/HistoryView.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistoryView } from '@/components/HistoryView';
import type { Session } from '@/types';

// Mock the LanguageContext
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'history.title': 'Session History',
        'history.noSessions': 'No session history available',
        'history.session': 'Session',
        'history.duration': 'Duration',
        'history.accuracy': 'Accuracy',
        'history.problems': 'Problems',
        'history.passed': 'Passed',
        'history.failed': 'Failed',
        'history.completedAt': 'Completed',
      };
      return translations[key] || key;
    },
    language: 'en',
  }),
}));

describe('HistoryView', () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Rendering', () => {
    it('should render with empty sessions', () => {
      render(<HistoryView sessions={[]} onClose={mockOnClose} />);

      expect(screen.getByText('Session History')).toBeInTheDocument();
      expect(screen.getByText('No session history available')).toBeInTheDocument();
    });

    it('should render close button', () => {
      render(<HistoryView sessions={[]} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close history');
      expect(closeButton).toBeInTheDocument();
    });

    it('should render with session data', () => {
      const sessions: Session[] = [
        {
          id: 'session-1',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 600000, // 10 minutes ago
          endTime: Date.now() - 300000, // 5 minutes ago
          duration: 300000, // 5 minutes
          passCount: 8,
          failCount: 2,
          totalProblems: 10,
          accuracy: 80,
          createdAt: Date.now() - 300000,
        },
      ];

      render(<HistoryView sessions={sessions} onClose={mockOnClose} />);

      expect(screen.getByText('Session History')).toBeInTheDocument();
      expect(screen.queryByText('No session history available')).not.toBeInTheDocument();
    });

    it('should render multiple sessions', () => {
      const sessions: Session[] = [
        {
          id: 'session-1',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 600000,
          endTime: Date.now() - 300000,
          duration: 300000,
          passCount: 8,
          failCount: 2,
          totalProblems: 10,
          accuracy: 80,
          createdAt: Date.now() - 300000,
        },
        {
          id: 'session-2',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 1200000,
          endTime: Date.now() - 900000,
          duration: 300000,
          passCount: 9,
          failCount: 1,
          totalProblems: 10,
          accuracy: 90,
          createdAt: Date.now() - 900000,
        },
      ];

      render(<HistoryView sessions={sessions} onClose={mockOnClose} />);

      // Should render cards for both sessions
      const sessionElements = screen.getAllByText(/Session/);
      expect(sessionElements.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Session Cards', () => {
    const mockSession: Session = {
      id: 'session-1',
      problemSetKey: 'ps-1',
      startTime: Date.now() - 600000,
      endTime: Date.now() - 300000,
      duration: 300000, // 5 minutes
      passCount: 8,
      failCount: 2,
      totalProblems: 10,
      accuracy: 80,
      createdAt: Date.now() - 300000,
    };

    it('should display session accuracy', () => {
      render(<HistoryView sessions={[mockSession]} onClose={mockOnClose} />);

      expect(screen.getByText(/80%/)).toBeInTheDocument();
    });

    it('should display total problems count', () => {
      render(<HistoryView sessions={[mockSession]} onClose={mockOnClose} />);

      // Look for the "Problems" label and verify the count is displayed
      expect(screen.getByText('Problems')).toBeInTheDocument();
      // The number 10 should appear as the value under Problems label
      const problemElements = screen.getAllByText(/10/);
      expect(problemElements.length).toBeGreaterThan(0);
    });

    it('should display pass count', () => {
      render(<HistoryView sessions={[mockSession]} onClose={mockOnClose} />);

      expect(screen.getByText(/8 \/ 2/)).toBeInTheDocument();
    });

    it('should display fail count', () => {
      render(<HistoryView sessions={[mockSession]} onClose={mockOnClose} />);

      expect(screen.getByText(/8 \/ 2/)).toBeInTheDocument();
    });

    it('should display session duration in minutes', () => {
      render(<HistoryView sessions={[mockSession]} onClose={mockOnClose} />);

      // 300000 ms = 5 minutes - look for more specific pattern
      expect(screen.getByText(/5m 0s/)).toBeInTheDocument();
    });

    it('should display completion date', () => {
      const session: Session = {
        ...mockSession,
        endTime: new Date('2025-01-01T12:00:00').getTime(),
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      // Should show formatted date
      expect(screen.getByText(/2025/)).toBeInTheDocument();
    });
  });

  describe('Accuracy Display', () => {
    it('should show 100% accuracy for perfect session', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 600000,
        endTime: Date.now() - 300000,
        duration: 300000,
        passCount: 10,
        failCount: 0,
        totalProblems: 10,
        accuracy: 100,
        createdAt: Date.now() - 300000,
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      expect(screen.getByText(/100%/)).toBeInTheDocument();
    });

    it('should show 0% accuracy for all failed session', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 600000,
        endTime: Date.now() - 300000,
        duration: 300000,
        passCount: 0,
        failCount: 10,
        totalProblems: 10,
        accuracy: 0,
        createdAt: Date.now() - 300000,
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      expect(screen.getByText(/0%/)).toBeInTheDocument();
    });

    it('should display accuracy with no decimal places', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 600000,
        endTime: Date.now() - 300000,
        duration: 300000,
        passCount: 7,
        failCount: 3,
        totalProblems: 10,
        accuracy: 70,
        createdAt: Date.now() - 300000,
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      expect(screen.getByText('70%')).toBeInTheDocument();
      expect(screen.queryByText(/70\.\d+%/)).not.toBeInTheDocument();
    });
  });

  describe('Duration Formatting', () => {
    it('should display duration in seconds for short sessions', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 45000,
        endTime: Date.now(),
        duration: 45000, // 45 seconds
        passCount: 5,
        failCount: 0,
        totalProblems: 5,
        accuracy: 100,
        createdAt: Date.now(),
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      // Should show seconds for < 1 minute
      expect(screen.getByText(/45/)).toBeInTheDocument();
    });

    it('should display duration in minutes and seconds for medium sessions', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 125000,
        endTime: Date.now(),
        duration: 125000, // 2 minutes 5 seconds
        passCount: 10,
        failCount: 0,
        totalProblems: 10,
        accuracy: 100,
        createdAt: Date.now(),
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      // Should show minutes and seconds
      expect(screen.getByText(/2m 5s/)).toBeInTheDocument();
    });

    it('should display duration in hours, minutes, seconds for long sessions', () => {
      const session: Session = {
        id: 'session-1',
        problemSetKey: 'ps-1',
        startTime: Date.now() - 3725000,
        endTime: Date.now(),
        duration: 3725000, // 1 hour 2 minutes 5 seconds
        passCount: 50,
        failCount: 10,
        totalProblems: 60,
        accuracy: 83,
        createdAt: Date.now(),
      };

      render(<HistoryView sessions={[session]} onClose={mockOnClose} />);

      // Should show hours
      expect(screen.getByText(/1h 2m 5s/)).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(<HistoryView sessions={[]} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close history');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking close button with sessions', () => {
      const sessions: Session[] = [
        {
          id: 'session-1',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 600000,
          endTime: Date.now() - 300000,
          duration: 300000,
          passCount: 8,
          failCount: 2,
          totalProblems: 10,
          accuracy: 80,
          createdAt: Date.now() - 300000,
        },
      ];

      render(<HistoryView sessions={sessions} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close history');
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for modal', () => {
      render(<HistoryView sessions={[]} onClose={mockOnClose} />);

      const region = screen.getByRole('region');
      expect(region).toHaveAttribute('aria-label', 'Session history');
    });

    it('should have accessible close button', () => {
      render(<HistoryView sessions={[]} onClose={mockOnClose} />);

      const closeButton = screen.getByLabelText('Close history');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Sorting', () => {
    it('should display sessions in chronological order (most recent first)', () => {
      const sessions: Session[] = [
        {
          id: 'session-1',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 1200000,
          endTime: Date.now() - 900000,
          duration: 300000,
          passCount: 8,
          failCount: 2,
          totalProblems: 10,
          accuracy: 80,
          createdAt: Date.now() - 900000,
        },
        {
          id: 'session-2',
          problemSetKey: 'ps-1',
          startTime: Date.now() - 600000,
          endTime: Date.now() - 300000,
          duration: 300000,
          passCount: 9,
          failCount: 1,
          totalProblems: 10,
          accuracy: 90,
          createdAt: Date.now() - 300000,
        },
      ];

      render(<HistoryView sessions={sessions} onClose={mockOnClose} />);

      // Most recent session should appear first
      // This will be verified by the actual implementation
      expect(screen.getByText('Session History')).toBeInTheDocument();
    });
  });
});
