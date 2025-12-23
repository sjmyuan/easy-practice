// tests/unit/components/SettingsIcon.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsIcon } from '@/components/SettingsIcon';

describe('SettingsIcon', () => {
  it('should render settings icon button', () => {
    render(<SettingsIcon onClick={vi.fn()} />);

    const button = screen.getByRole('button', { name: /settings/i });
    expect(button).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<SettingsIcon onClick={onClick} />);

    const button = screen.getByRole('button', { name: /settings/i });
    await user.click(button);

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should render Settings icon from lucide-react', () => {
    const { container } = render(<SettingsIcon onClick={vi.fn()} />);
    const svg = container.querySelector('svg');

    expect(svg).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<SettingsIcon onClick={vi.fn()} />);

    const button = screen.getByRole('button', { name: /settings/i });
    expect(button).toHaveAttribute('aria-label', 'Settings');
  });

  it('should have hover and transition styles', () => {
    const { container } = render(<SettingsIcon onClick={vi.fn()} />);
    const button = container.querySelector('button');

    expect(button).toHaveClass('transition-all');
  });
});
