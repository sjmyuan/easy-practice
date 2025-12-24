// tests/unit/components/NextProblemButton.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { NextProblemButton } from '@/components/NextProblemButton';

describe('NextProblemButton Component', () => {
  it('should render the Next Problem button', () => {
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={false} />);

    expect(
      screen.getByRole('button', { name: /next problem/i })
    ).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    await user.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    expect(button).toBeDisabled();
  });

  it('should not call onClick when disabled', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={true} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    await user.click(button);

    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('should have large touch target for mobile', () => {
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    expect(button).toHaveClass('h-12');
  });

  it('should be styled prominently', () => {
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    expect(button).toHaveClass('bg-[#4A90E2]');
    expect(button).toHaveClass('rounded-2xl');
  });

  it('should have proper type attribute', () => {
    const mockOnClick = vi.fn();
    render(<NextProblemButton onClick={mockOnClick} disabled={false} />);

    const button = screen.getByRole('button', { name: /next problem/i });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('should show loading state when provided', () => {
    const mockOnClick = vi.fn();
    render(
      <NextProblemButton
        onClick={mockOnClick}
        disabled={false}
        isLoading={true}
      />
    );

    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
