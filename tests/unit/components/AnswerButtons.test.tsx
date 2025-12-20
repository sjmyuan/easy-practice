// tests/unit/components/AnswerButtons.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AnswerButtons } from '@/components/AnswerButtons';

describe('AnswerButtons Component', () => {
  it('should render Pass and Fail buttons', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    expect(screen.getByRole('button', { name: /pass/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /fail/i })).toBeInTheDocument();
  });

  it('should call onPass when Pass button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    await user.click(passButton);

    expect(mockOnPass).toHaveBeenCalledTimes(1);
    expect(mockOnFail).not.toHaveBeenCalled();
  });

  it('should call onFail when Fail button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const failButton = screen.getByRole('button', { name: /fail/i });
    await user.click(failButton);

    expect(mockOnFail).toHaveBeenCalledTimes(1);
    expect(mockOnPass).not.toHaveBeenCalled();
  });

  it('should disable both buttons when disabled prop is true', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={true} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    const failButton = screen.getByRole('button', { name: /fail/i });

    expect(passButton).toBeDisabled();
    expect(failButton).toBeDisabled();
  });

  it('should not call handlers when buttons are disabled', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={true} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    const failButton = screen.getByRole('button', { name: /fail/i });

    await user.click(passButton);
    await user.click(failButton);

    expect(mockOnPass).not.toHaveBeenCalled();
    expect(mockOnFail).not.toHaveBeenCalled();
  });

  it('should have large touch targets for mobile', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    const failButton = screen.getByRole('button', { name: /fail/i });

    expect(passButton).toHaveClass('h-12');
    expect(failButton).toHaveClass('h-12');
  });

  it('should have appropriate padding for easy tapping', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    const failButton = screen.getByRole('button', { name: /fail/i });

    expect(passButton).toHaveClass('px-8');
    expect(failButton).toHaveClass('px-8');
  });

  it('should display Pass button with success styling', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    expect(passButton).toHaveClass('bg-green-500');
  });

  it('should display Fail button with error styling', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const failButton = screen.getByRole('button', { name: /fail/i });
    expect(failButton).toHaveClass('bg-red-500');
  });

  it('should be accessible with proper ARIA labels', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
    );

    const passButton = screen.getByRole('button', { name: /pass/i });
    const failButton = screen.getByRole('button', { name: /fail/i });

    expect(passButton).toHaveAccessibleName();
    expect(failButton).toHaveAccessibleName();
  });
});
