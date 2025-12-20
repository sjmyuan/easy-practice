// tests/unit/components/ProblemDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import type { Problem } from '@/types';

describe('ProblemDisplay Component', () => {
  const mockProblem: Problem = {
    id: '1',
    problemSetId: 'set-1',
    problem: '5 + 7',
    answer: '12',
    createdAt: new Date(),
  };

  it('should render the problem text clearly', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    expect(screen.getByText('5 + 7')).toBeInTheDocument();
  });

  it('should display large text for mobile readability', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    // Should have large text class for mobile readability
    expect(problemText).toHaveClass('text-6xl');
  });

  it('should not display the answer', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });

  it('should show empty state when no problem is provided', () => {
    render(<ProblemDisplay problem={null} />);

    expect(screen.getByText(/select a problem type/i)).toBeInTheDocument();
  });

  it('should be accessible with proper semantic HTML', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemDisplay = screen.getByRole('region');
    expect(problemDisplay).toHaveAttribute(
      'aria-label',
      'Current math problem'
    );
  });

  it('should center the problem text', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    expect(problemText).toHaveClass('text-center');
  });

  it('should render subtraction problems correctly', () => {
    const subtractionProblem: Problem = {
      id: '2',
      problemSetId: 'set-1',
      problem: '15 - 8',
      answer: '7',
      createdAt: new Date(),
    };

    render(<ProblemDisplay problem={subtractionProblem} />);

    expect(screen.getByText('15 - 8')).toBeInTheDocument();
  });

  it('should have proper contrast for readability', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    // Should have dark text class for contrast
    expect(problemText).toHaveClass('text-gray-900');
  });
});
