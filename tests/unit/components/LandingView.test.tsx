import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { LandingView } from '../../../components/LandingView';
import { AppProvider } from '@/contexts/AppContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { ProblemSet } from '../../../types';
import type { ReactNode } from 'react';

// Wrapper component for tests
const Wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>
    <AppProvider>{children}</AppProvider>
  </LanguageProvider>
);

const mockProblemSets: ProblemSet[] = [
  {
    id: '1',
    name: 'Addition within 10',
    problemSetKey: 'addition-within-10',
    enabled: true,
    createdAt: Date.now(),
  },
  {
    id: '2',
    name: 'Subtraction within 10',
    problemSetKey: 'subtraction-within-10',
    enabled: true,
    createdAt: Date.now(),
  },
];

describe('LandingView', () => {
  it('should render title', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    expect(screen.getByText('Easy Practice')).toBeInTheDocument();
  });

  it('should render ProblemSetSelector with correct props', () => {
    const onSelect = vi.fn();
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={onSelect}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    // ProblemSetSelector should render problem set buttons
    expect(screen.getByText(/(Addition within 10|10以内加法)/)).toBeInTheDocument();
    expect(screen.getByText(/(Subtraction within 10|10以内减法)/)).toBeInTheDocument();
  });

  it('should call onSelect when a problem set is selected', () => {
    const onSelect = vi.fn();
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={onSelect}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const button = screen.getByText(/(Addition within 10|10以内加法)/);
    button.click();

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should disable selection when loading', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={true}
      />,
      { wrapper: Wrapper }
    );

    const button = screen.getByRole('button', {
      name: /(Addition within 10|10以内加法)/,
    });
    expect(button).toBeDisabled();
  });

  it('should have correct layout styling', () => {
    const { container } = render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('flex', 'min-h-screen');
  });

  it('should display logo image', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const logo = screen.getByAltText('Easy Practice Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.svg');
  });

  it('should have playful gradient background', () => {
    const { container } = render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('bg-gradient-to-br');
  });

  it('should render settings icon', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const settingsIcon = screen.getByLabelText('Settings');
    expect(settingsIcon).toBeInTheDocument();
  });

  it('should open settings panel when settings icon is clicked', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const settingsIcon = screen.getByLabelText('Settings');
    fireEvent.click(settingsIcon);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/设置|Settings/i)).toBeInTheDocument();
  });

  it('should close settings panel when backdrop is clicked', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const settingsIcon = screen.getByLabelText('Settings');
    fireEvent.click(settingsIcon);

    const backdrop = screen.getByTestId('settings-backdrop');
    fireEvent.click(backdrop);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show language selector in settings panel', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const settingsIcon = screen.getByLabelText('Settings');
    fireEvent.click(settingsIcon);

    // Language selector should be in the settings panel
    const languageButton = screen.getByRole('button', { name: /English|中文|语言|Language/i });
    expect(languageButton).toBeInTheDocument();
  });
});
