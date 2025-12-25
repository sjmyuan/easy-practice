// tests/unit/components/AnswerButtons.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { AnswerButtons } from '@/components/AnswerButtons';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('AnswerButtons Component', () => {
  it('should render Pass and Fail buttons', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    expect(screen.getByRole('button', { name: /(pass|通过)/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /(fail|未通过)/i })).toBeInTheDocument();
  });

  it('should call onPass when Pass button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    await user.click(passButton);

    expect(mockOnPass).toHaveBeenCalledTimes(1);
    expect(mockOnFail).not.toHaveBeenCalled();
  });

  it('should call onFail when Fail button is clicked', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });
    await user.click(failButton);

    expect(mockOnFail).toHaveBeenCalledTimes(1);
    expect(mockOnPass).not.toHaveBeenCalled();
  });

  it('should disable both buttons when disabled prop is true', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={true} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });

    expect(passButton).toBeDisabled();
    expect(failButton).toBeDisabled();
  });

  it('should not call handlers when buttons are disabled', async () => {
    const user = userEvent.setup();
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={true} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });

    await user.click(passButton);
    await user.click(failButton);

    expect(mockOnPass).not.toHaveBeenCalled();
    expect(mockOnFail).not.toHaveBeenCalled();
  });

  it('should have large touch targets for mobile', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });

    expect(passButton).toHaveClass('h-12');
    expect(failButton).toHaveClass('h-12');
  });

  it('should have appropriate padding for easy tapping', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });

    expect(passButton).toHaveClass('px-8');
    expect(failButton).toHaveClass('px-8');
  });

  it('should display Pass button with success styling', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    expect(passButton).toHaveClass('bg-[#6ECEDA]');
    expect(passButton).toHaveClass('rounded-2xl');
  });

  it('should display Fail button with error styling', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });
    expect(failButton).toHaveClass('bg-[#FF6F61]');
    expect(failButton).toHaveClass('rounded-2xl');
  });

  it('should be accessible with proper ARIA labels', () => {
    const mockOnPass = vi.fn();
    const mockOnFail = vi.fn();
    render(
      <LanguageProvider>
        <AnswerButtons onPass={mockOnPass} onFail={mockOnFail} disabled={false} />
      </LanguageProvider>
    );

    const passButton = screen.getByRole('button', { name: /(pass|通过)/i });
    const failButton = screen.getByRole('button', { name: /(fail|未通过)/i });

    expect(passButton).toHaveAccessibleName();
    expect(failButton).toHaveAccessibleName();
  });
});
