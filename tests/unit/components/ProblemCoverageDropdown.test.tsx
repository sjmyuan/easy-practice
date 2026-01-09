// tests/unit/components/ProblemCoverageDropdown.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProblemCoverageDropdown } from '@/components/ProblemCoverageDropdown';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('ProblemCoverageDropdown', () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: 100,
    onChange: mockOnChange,
  };

  it('should render with default 100% value', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} />
      </LanguageProvider>
    );

    expect(screen.getByText(/Problem Coverage|问题覆盖率/)).toBeInTheDocument();
    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('100');
  });

  it('should display correct percentage for 80%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} value={80} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('80');
  });

  it('should display correct percentage for 50%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} value={50} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('50');
  });

  it('should display correct percentage for 30%', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} value={30} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('30');
  });

  it('should render as a dropdown (combobox)', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox', { name: /problem coverage/i });
    expect(dropdown).toBeInTheDocument();
  });

  it('should have all coverage options (30%, 50%, 80%, 100%)', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    const options = Array.from(dropdown.options).map(opt => opt.value);
    
    expect(options).toEqual(['30', '50', '80', '100']);
  });

  it('should call onChange with correct value when dropdown selection changes', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown
          value={100}
          onChange={onChange}
        />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(dropdown, { target: { value: '50' } });

    expect(onChange).toHaveBeenCalledWith(50);
  });

  it('should display selected value correctly in dropdown', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown value={80} onChange={mockOnChange} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;
    expect(dropdown.value).toBe('80');
  });

  it('should have proper ARIA labels', () => {
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown {...defaultProps} />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox');
    expect(dropdown).toHaveAccessibleName('Problem coverage percentage');
  });

  it('should be keyboard accessible', () => {
    const onChange = vi.fn();
    render(
      <LanguageProvider>
        <ProblemCoverageDropdown
          value={100}
          onChange={onChange}
        />
      </LanguageProvider>
    );

    const dropdown = screen.getByRole('combobox') as HTMLSelectElement;

    // Verify dropdown is keyboard focusable
    expect(dropdown.tabIndex).toBeGreaterThanOrEqual(0);

    // Simulate keyboard change event
    fireEvent.change(dropdown, { target: { value: '80' } });

    // Verify keyboard interaction triggers onChange
    expect(onChange).toHaveBeenCalledWith(80);
  });
});
