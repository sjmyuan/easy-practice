import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CloseSessionIcon } from '@/components/CloseSessionIcon';

describe('CloseSessionIcon', () => {
  it('renders close icon button', () => {
    render(<CloseSessionIcon onClick={() => {}} />);
    
    const button = screen.getByRole('button', { name: /close session/i });
    expect(button).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<CloseSessionIcon onClick={handleClick} />);
    
    const button = screen.getByRole('button', { name: /close session/i });
    await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has proper styling classes', () => {
    render(<CloseSessionIcon onClick={() => {}} />);
    
    const button = screen.getByRole('button', { name: /close session/i });
    expect(button).toHaveClass('min-h-[48px]', 'rounded-lg', 'p-2', 'text-gray-600');
  });
});
