// tests/unit/components/ProgressIndicator.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressIndicator } from '@/components/ProgressIndicator';

describe('ProgressIndicator', () => {
  it('should render completed and total count', () => {
    render(<ProgressIndicator completed={5} total={20} />);

    expect(screen.getByText('5 / 20')).toBeInTheDocument();
  });

  it('should render zero completed', () => {
    render(<ProgressIndicator completed={0} total={15} />);

    expect(screen.getByText('0 / 15')).toBeInTheDocument();
  });

  it('should render when all complete', () => {
    render(<ProgressIndicator completed={10} total={10} />);

    expect(screen.getByText('10 / 10')).toBeInTheDocument();
  });

  it('should not render when total is zero', () => {
    const { container } = render(<ProgressIndicator completed={0} total={0} />);

    expect(container.firstChild).toBeNull();
  });

  it('should have proper styling classes', () => {
    const { container } = render(
      <ProgressIndicator completed={3} total={10} />
    );
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveClass('text-center');
    expect(element).toHaveClass('text-gray-600');
    expect(element).toHaveClass('text-sm');
  });
});
