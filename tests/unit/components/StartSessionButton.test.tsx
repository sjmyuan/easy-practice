// tests/unit/components/StartSessionButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartSessionButton } from '@/components/StartSessionButton';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('StartSessionButton', () => {
  it('should render button with text', () => {
    render(
      <LanguageProvider>
        <StartSessionButton onStart={vi.fn()} />
      </LanguageProvider>
    );

    expect(
      screen.getByRole('button', { name: /start new session|开始新练习/i })
    ).toBeInTheDocument();
  });

  it('should call onStart when clicked', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <StartSessionButton onStart={onStart} />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /start new session|开始新练习/i });
    await user.click(button);

    expect(onStart).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(
      <LanguageProvider>
        <StartSessionButton onStart={vi.fn()} disabled={true} />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /start new session|开始新练习/i });
    expect(button).toBeDisabled();
  });

  it('should not call onStart when disabled and clicked', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();

    render(
      <LanguageProvider>
        <StartSessionButton onStart={onStart} disabled={true} />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /start new session|开始新练习/i });
    await user.click(button);

    expect(onStart).not.toHaveBeenCalled();
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <LanguageProvider>
        <StartSessionButton onStart={vi.fn()} />
      </LanguageProvider>
    );
    const button = container.querySelector('button');

    expect(button).toHaveClass('bg-[#6ECEDA]');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-2xl');
  });
});
