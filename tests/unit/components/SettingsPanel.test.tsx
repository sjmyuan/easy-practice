// tests/unit/components/SettingsPanel.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsPanel } from '@/components/SettingsPanel';

describe('SettingsPanel', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    problemCoverage: 50,
    onProblemCoverageChange: vi.fn(),
    totalProblems: 20,
    onResetData: vi.fn(),
  };

  it('should not render when isOpen is false', () => {
    const { container } = render(
      <SettingsPanel {...defaultProps} isOpen={false} />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should render when isOpen is true', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should render backdrop overlay', () => {
    render(<SettingsPanel {...defaultProps} />);

    const backdrop = screen.getByTestId('settings-backdrop');
    expect(backdrop).toBeInTheDocument();
  });

  it('should call onClose when backdrop is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<SettingsPanel {...defaultProps} onClose={onClose} />);

    const backdrop = screen.getByTestId('settings-backdrop');
    await user.click(backdrop);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should render settings panel with slide-in animation class', () => {
    const { container } = render(<SettingsPanel {...defaultProps} />);
    const panel = container.querySelector('[role="dialog"]');

    expect(panel).toHaveClass('translate-x-0');
  });

  it('should render close button', () => {
    render(<SettingsPanel {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close settings/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<SettingsPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByRole('button', { name: /close settings/i });
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('should render ProblemCoverageSlider', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByLabelText(/problem coverage/i)).toBeInTheDocument();
  });

  it('should render ResetDataButton', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByRole('button', { name: /reset data/i })).toBeInTheDocument();
  });

  it('should pass problemCoverage to ProblemCoverageSlider', () => {
    render(<SettingsPanel {...defaultProps} problemCoverage={80} />);

    const slider = screen.getByRole('slider');
    // Slider uses steps 0-3 for values 30, 50, 80, 100
    // 80% corresponds to step 2
    expect(slider).toHaveValue('2');
  });

  it('should call onProblemCoverageChange when slider changes', () => {
    const onProblemCoverageChange = vi.fn();

    render(
      <SettingsPanel
        {...defaultProps}
        onProblemCoverageChange={onProblemCoverageChange}
      />
    );

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '3' } });

    expect(onProblemCoverageChange).toHaveBeenCalledWith(100);
  });

  it('should call onResetData when reset button is clicked and confirmed', async () => {
    const onResetData = vi.fn();
    const user = userEvent.setup();

    // Mock window.confirm to return true
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<SettingsPanel {...defaultProps} onResetData={onResetData} />);

    const resetButton = screen.getByRole('button', { name: /reset data/i });
    await user.click(resetButton);

    expect(onResetData).toHaveBeenCalledOnce();

    vi.restoreAllMocks();
  });

  it('should have proper ARIA attributes for accessibility', () => {
    render(<SettingsPanel {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'settings-title');
  });

  it('should render settings title', () => {
    render(<SettingsPanel {...defaultProps} />);

    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('should not call onClose when clicking inside the panel', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();

    render(<SettingsPanel {...defaultProps} onClose={onClose} />);

    const panel = screen.getByRole('dialog');
    await user.click(panel);

    expect(onClose).not.toHaveBeenCalled();
  });
});
