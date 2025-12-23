import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { ErrorView } from '../../../components/ErrorView';

describe('ErrorView', () => {
  it('should render error message', () => {
    render(<ErrorView message="Test error message" onRetry={() => {}} />);

    expect(screen.getByText('Error: Test error message')).toBeInTheDocument();
  });

  it('should render retry button', () => {
    render(<ErrorView message="Test error" onRetry={() => {}} />);

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = vi.fn();
    render(<ErrorView message="Test error" onRetry={onRetry} />);

    const retryButton = screen.getByRole('button', { name: /retry/i });
    retryButton.click();

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('should have correct styling classes', () => {
    const { container } = render(
      <ErrorView message="Test error" onRetry={() => {}} />
    );

    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass(
      'flex',
      'min-h-screen',
      'items-center',
      'justify-center'
    );
  });

  it('should render error message with correct color', () => {
    render(<ErrorView message="Critical error" onRetry={() => {}} />);

    const errorText = screen.getByText('Error: Critical error');
    expect(errorText).toHaveClass('text-red-600');
  });
});
