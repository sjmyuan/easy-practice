import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingView } from '../../../components/LoadingView';

describe('LoadingView', () => {
  it('should render loading text', () => {
    render(<LoadingView />);
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<LoadingView />);
    
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('flex', 'min-h-screen', 'items-center', 'justify-center');
  });

  it('should render loading text with correct color', () => {
    render(<LoadingView />);
    
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toHaveClass('text-gray-500');
  });

  it('should render loading text with correct size', () => {
    render(<LoadingView />);
    
    const loadingText = screen.getByText('Loading...');
    expect(loadingText).toHaveClass('text-xl');
  });
});
