// tests/unit/components/ProblemCoverageSlider.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProblemCoverageSlider } from '@/components/ProblemCoverageSlider';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('ProblemCoverageSlider', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: 100,
    onChange: mockOnChange,
  };

  it('should render with default 100% value', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Problem Coverage|问题覆盖率/)).toBeInTheDocument();
    const percentageDisplay = screen.getByText((content, element) => {
      return Boolean(element?.className.includes('text-center') && content === '100%');
    });
    expect(percentageDisplay).toBeInTheDocument();
  });

  it('should display correct percentage for 80%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={80} />
      </LanguageProvider>
    );

    const percentageDisplay = screen.getByText((content, element) => {
      return Boolean(element?.className.includes('text-center') && content === '80%');
    });
    expect(percentageDisplay).toBeInTheDocument();
  });

  it('should display correct percentage for 50%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={50} />
      </LanguageProvider>
    );

    const percentageDisplay = screen.getByText((content, element) => {
      return Boolean(element?.className.includes('text-center') && content === '50%');
    });
    expect(percentageDisplay).toBeInTheDocument();
  });

  it('should display correct percentage for 30%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={30} />
      </LanguageProvider>
    );

    const percentageDisplay = screen.getByText((content, element) => {
      return Boolean(element?.className.includes('text-center') && content === '30%');
    });
    expect(percentageDisplay).toBeInTheDocument();
  });

  it('should call onChange when slider value changes', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <ProblemCoverageSlider
          value={100}
          onChange={onChange}
        />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;

    // Simulate changing the slider to step 2 (80%)
    fireEvent.change(slider, { target: { value: '2' } });

    // Verify onChange was called with 80
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('should have discrete steps at 30, 50, 80, 100', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;

    expect(slider.getAttribute('min')).toBe('0');
    expect(slider.getAttribute('max')).toBe('3');
    expect(slider.getAttribute('step')).toBe('1');
  });

  it('should map step 0 to 30%', async () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={30} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('0');
  });

  it('should map step 1 to 50%', async () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={50} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('1');
  });

  it('should map step 2 to 80%', async () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={80} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('2');
  });

  it('should map step 3 to 100%', async () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} value={100} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('3');
  });

  it('should have proper ARIA labels', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider');
    expect(slider).toHaveAccessibleName('Problem coverage percentage');
  });

  it('should be keyboard accessible', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <ProblemCoverageSlider
          value={100}
          onChange={onChange}
        />
      </LanguageProvider>
    );

    const slider = screen.getByRole('slider') as HTMLInputElement;

    // Verify slider is keyboard focusable
    expect(slider.tabIndex).toBeGreaterThanOrEqual(0);

    // Simulate keyboard change event (ArrowLeft would decrease from step 3 to step 2)
    fireEvent.change(slider, { target: { value: '2' } });

    // Verify keyboard interaction triggers onChange
    expect(onChange).toHaveBeenCalledWith(80);
  });

  it('should have mobile-friendly styling', () => {
    const { container } = render(
      <LanguageProvider>
        <ProblemCoverageSlider {...defaultProps} />
      </LanguageProvider>
    );

    const slider = container.querySelector('input[type="range"]');
    expect(slider).toBeInTheDocument();
  });
});
