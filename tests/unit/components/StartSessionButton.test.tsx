// tests/unit/components/StartSessionButton.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StartSessionButton } from '@/components/StartSessionButton';

describe('StartSessionButton', () => {
  it('should render button with text', () => {
    render(<StartSessionButton onStart={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: /start new session/i })
    ).toBeInTheDocument();
  });

  it('should call onStart when clicked', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();

    render(<StartSessionButton onStart={onStart} />);

    const button = screen.getByRole('button', { name: /start new session/i });
    await user.click(button);

    expect(onStart).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<StartSessionButton onStart={vi.fn()} disabled={true} />);

    const button = screen.getByRole('button', { name: /start new session/i });
    expect(button).toBeDisabled();
  });

  it('should not call onStart when disabled and clicked', async () => {
    const onStart = vi.fn();
    const user = userEvent.setup();

    render(<StartSessionButton onStart={onStart} disabled={true} />);

    const button = screen.getByRole('button', { name: /start new session/i });
    await user.click(button);

    expect(onStart).not.toHaveBeenCalled();
  });

  it('should have proper styling classes', () => {
    const { container } = render(<StartSessionButton onStart={vi.fn()} />);
    const button = container.querySelector('button');

    expect(button).toHaveClass('bg-[#6ECEDA]');
    expect(button).toHaveClass('text-white');
    expect(button).toHaveClass('rounded-2xl');
  });
});
