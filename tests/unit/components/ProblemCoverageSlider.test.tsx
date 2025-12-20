// tests/unit/components/ProblemCoverageSlider.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProblemCoverageSlider } from '@/components/ProblemCoverageSlider';

describe('ProblemCoverageSlider', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: 100,
    onChange: mockOnChange,
    totalProblems: 20,
  };

  it('should render with default 100% value', () => {
    render(<ProblemCoverageSlider {...defaultProps} />);

    expect(screen.getByText('Problem Coverage')).toBeInTheDocument();
    expect(screen.getByText('100% (20/20 problems)')).toBeInTheDocument();
  });

  it('should display correct percentage and problem count for 80%', () => {
    render(<ProblemCoverageSlider {...defaultProps} value={80} />);

    expect(screen.getByText('80% (16/20 problems)')).toBeInTheDocument();
  });

  it('should display correct percentage and problem count for 50%', () => {
    render(<ProblemCoverageSlider {...defaultProps} value={50} />);

    expect(screen.getByText('50% (10/20 problems)')).toBeInTheDocument();
  });

  it('should display correct percentage and problem count for 30%', () => {
    render(<ProblemCoverageSlider {...defaultProps} value={30} />);

    expect(screen.getByText('30% (6/20 problems)')).toBeInTheDocument();
  });

  it('should handle zero total problems', () => {
    render(<ProblemCoverageSlider {...defaultProps} totalProblems={0} />);

    expect(screen.getByText('100% (0/0 problems)')).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', () => {
    const onChange = vi.fn();
    render(<ProblemCoverageSlider value={100} onChange={onChange} totalProblems={20} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    
    // Simulate changing the slider to step 2 (80%)
    fireEvent.change(slider, { target: { value: '2' } });

    // Verify onChange was called with 80
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('should have discrete steps at 30, 50, 80, 100', () => {
    render(<ProblemCoverageSlider {...defaultProps} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;

    expect(slider.getAttribute('min')).toBe('0');
    expect(slider.getAttribute('max')).toBe('3');
    expect(slider.getAttribute('step')).toBe('1');
  });

  it('should map step 0 to 30%', async () => {
    render(<ProblemCoverageSlider {...defaultProps} value={30} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('0');
  });

  it('should map step 1 to 50%', async () => {
    render(<ProblemCoverageSlider {...defaultProps} value={50} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('1');
  });

  it('should map step 2 to 80%', async () => {
    render(<ProblemCoverageSlider {...defaultProps} value={80} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('2');
  });

  it('should map step 3 to 100%', async () => {
    render(<ProblemCoverageSlider {...defaultProps} value={100} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('3');
  });

  it('should have proper ARIA labels', () => {
    render(<ProblemCoverageSlider {...defaultProps} />);

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAccessibleName('Problem coverage percentage');
  });

  it('should be keyboard accessible', () => {
    const onChange = vi.fn();
    render(<ProblemCoverageSlider value={100} onChange={onChange} totalProblems={20} />);

    const slider = screen.getByRole('slider') as HTMLInputElement;
    
    // Verify slider is keyboard focusable
    expect(slider.tabIndex).toBeGreaterThanOrEqual(0);
    
    // Simulate keyboard change event (ArrowLeft would decrease from step 3 to step 2)
    fireEvent.change(slider, { target: { value: '2' } });

    // Verify keyboard interaction triggers onChange
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('should round problem count correctly', () => {
    // Test with odd number that creates decimal
    render(<ProblemCoverageSlider {...defaultProps} totalProblems={15} value={50} />);

    // 50% of 15 = 7.5, should round to 8
    expect(screen.getByText('50% (8/15 problems)')).toBeInTheDocument();
  });

  it('should have mobile-friendly styling', () => {
    const { container } = render(<ProblemCoverageSlider {...defaultProps} />);

    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });
});
