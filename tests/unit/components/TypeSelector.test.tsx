// tests/unit/components/TypeSelector.test.tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { TypeSelector } from '@/components/TypeSelector';

describe('TypeSelector Component', () => {
  it('should render Addition and Subtraction buttons', () => {
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    expect(screen.getByRole('button', { name: /addition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtraction/i })).toBeInTheDocument();
  });

  it('should highlight the selected type', () => {
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    const additionButton = screen.getByRole('button', { name: /addition/i });
    const subtractionButton = screen.getByRole('button', { name: /subtraction/i });

    // Addition should be highlighted (active state)
    expect(additionButton).toHaveClass('bg-blue-600');
    expect(subtractionButton).not.toHaveClass('bg-blue-600');
  });

  it('should call onChange when a different type is selected', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    const subtractionButton = screen.getByRole('button', { name: /subtraction/i });
    await user.click(subtractionButton);

    expect(mockOnChange).toHaveBeenCalledWith('subtraction');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  it('should not call onChange when clicking the already selected type', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    const additionButton = screen.getByRole('button', { name: /addition/i });
    await user.click(additionButton);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should be accessible with proper ARIA labels', () => {
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    const additionButton = screen.getByRole('button', { name: /addition/i });
    const subtractionButton = screen.getByRole('button', { name: /subtraction/i });

    expect(additionButton).toHaveAttribute('type', 'button');
    expect(subtractionButton).toHaveAttribute('type', 'button');
  });

  it('should have large enough touch targets for mobile', () => {
    const mockOnChange = vi.fn();
    render(<TypeSelector selectedType="addition" onChange={mockOnChange} />);

    const buttons = screen.getAllByRole('button');

    buttons.forEach((button) => {
      // Buttons should have minimum height for touch targets (48px)
      expect(button).toHaveClass('h-12');
    });
  });
});
