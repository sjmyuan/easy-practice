// tests/unit/components/ResetDataButton.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ResetDataButton } from '@/components/ResetDataButton';

describe('ResetDataButton Component', () => {
  it('should render Reset Data button', () => {
    const mockOnReset = vi.fn();
    render(<ResetDataButton onReset={mockOnReset} />);

    expect(
      screen.getByRole('button', { name: /reset data/i })
    ).toBeInTheDocument();
  });

  it('should show confirmation dialog when clicked', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(confirmSpy).toHaveBeenCalledWith(
      expect.stringMatching(/are you sure/i)
    );

    confirmSpy.mockRestore();
  });

  it('should call onReset when confirmed', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm to return true
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(mockOnReset).toHaveBeenCalledTimes(1);

    confirmSpy.mockRestore();
  });

  it('should not call onReset when cancelled', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm to return false
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(mockOnReset).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('should have appropriate styling', () => {
    const mockOnReset = vi.fn();
    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    expect(button).toHaveClass('bg-red-500');
  });

  it('should have warning appearance', () => {
    const mockOnReset = vi.fn();
    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    expect(button).toHaveClass('text-white');
  });

  it('should be accessible with proper ARIA label', () => {
    const mockOnReset = vi.fn();
    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    expect(button).toHaveAccessibleName();
  });

  it('should have sufficient padding for mobile', () => {
    const mockOnReset = vi.fn();
    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    expect(button).toHaveClass('h-12');
    expect(button).toHaveClass('px-6');
  });

  it('should show type-specific confirmation message when selectedProblemSetKey is provided', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <ResetDataButton onReset={mockOnReset} selectedProblemSetKey="addition-within-20" />
    );

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to reset all performance data for addition-within-20 problems? This action cannot be undone.'
    );

    confirmSpy.mockRestore();
  });

  it('should show generic confirmation message when selectedProblemSetKey is not provided', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<ResetDataButton onReset={mockOnReset} />);

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to reset all performance data? This action cannot be undone.'
    );

    confirmSpy.mockRestore();
  });

  it('should show correct message for different problem sets', async () => {
    const user = userEvent.setup();
    const mockOnReset = vi.fn();

    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <ResetDataButton onReset={mockOnReset} selectedProblemSetKey="subtraction-within-20" />
    );

    const button = screen.getByRole('button', { name: /reset data/i });
    await user.click(button);

    expect(confirmSpy).toHaveBeenCalledWith(
      'Are you sure you want to reset all performance data for subtraction-within-20 problems? This action cannot be undone.'
    );

    confirmSpy.mockRestore();
  });
});
