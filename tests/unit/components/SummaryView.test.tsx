// tests/unit/components/SummaryView.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { SummaryView } from '@/components/SummaryView';
import type { StruggledProblemSummary } from '@/types';

describe('SummaryView Component', () => {
  const mockProblems: StruggledProblemSummary[] = [
    {
      problemId: '1',
      problem: '5 + 7',
      answer: '12',
      category: 'addition',
      failCount: 3,
      totalAttempts: 5,
      failureRate: 0.6,
      lastAttemptedAt: Date.now(),
      priority: 80,
    },
    {
      problemId: '2',
      problem: '15 - 8',
      answer: '7',
      category: 'subtraction',
      failCount: 2,
      totalAttempts: 4,
      failureRate: 0.5,
      lastAttemptedAt: Date.now(),
      priority: 70,
    },
  ];

  it('should render summary title', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByText(/struggled problems/i)).toBeInTheDocument();
  });

  it('should display list of struggled problems', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByText(/5 \+ 7/)).toBeInTheDocument();
    expect(screen.getByText(/15 - 8/)).toBeInTheDocument();
  });

  it('should display failure count for each problem', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByText(/failed 3 times/i)).toBeInTheDocument();
    expect(screen.getByText(/failed 2 times/i)).toBeInTheDocument();
  });

  it('should display failure rate for each problem', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByText(/60%/)).toBeInTheDocument();
    expect(screen.getByText(/50%/)).toBeInTheDocument();
  });

  it('should show empty message when no problems', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={[]} onClose={mockOnClose} />);

    expect(
      screen.getByText(/no struggled problems found/i)
    ).toBeInTheDocument();
  });

  it('should render close button', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should display problem details when clicked', async () => {
    const user = userEvent.setup();
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    const problemItem = screen.getByLabelText('View details for 5 + 7');
    expect(problemItem).toBeInTheDocument();

    await user.click(problemItem);
    // After clicking, more details should be visible
    expect(screen.getByText(/total attempts/i)).toBeInTheDocument();
  });

  it('should be accessible with proper ARIA labels', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    const region = screen.getByRole('region');
    expect(region).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/summary/i)
    );
  });

  it('should display problems sorted by failure rate', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    const problems = screen.getAllByRole('button', { name: /view details/i });
    expect(problems).toHaveLength(2);
    // First problem should have higher failure rate (60%)
    expect(problems[0]).toHaveTextContent(/5 \+ 7/);
  });

  it('should show answer for each problem', () => {
    const mockOnClose = vi.fn();
    render(<SummaryView problems={mockProblems} onClose={mockOnClose} />);

    expect(screen.getByText(/= 12/)).toBeInTheDocument();
    expect(screen.getByText(/= 7/)).toBeInTheDocument();
  });
});
