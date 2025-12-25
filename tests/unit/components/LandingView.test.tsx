import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { LandingView } from '../../../components/LandingView';
import { LanguageProvider } from '@/contexts/LanguageContext';
import type { ProblemSet } from '../../../types';
import type { ReactNode } from 'react';

// Wrapper component for tests
const Wrapper = ({ children }: { children: ReactNode }) => (
  <LanguageProvider>{children}</LanguageProvider>
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

  it('should render content without layout wrapper', () => {
    const { container } = render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    // LandingView should NOT have a main element - layout is managed by page.tsx
    const mainElement = container.querySelector('main');
    expect(mainElement).not.toBeInTheDocument();
  });

  it('should render logo and title without gradient background wrapper', () => {
    const { container } = render(
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

    // Gradient background should NOT be in LandingView (managed by page.tsx)
    const mainElement = container.querySelector('main');
    expect(mainElement).not.toBeInTheDocument();
  });

  it('should NOT render settings icon (managed by page.tsx)', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    const settingsIcon = screen.queryByLabelText('Settings');
    expect(settingsIcon).not.toBeInTheDocument();
  });

  it('should NOT manage settings panel state (managed by page.tsx)', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />,
      { wrapper: Wrapper }
    );

    // Settings panel should not be rendered by LandingView
    const settingsPanel = screen.queryByRole('dialog');
    expect(settingsPanel).not.toBeInTheDocument();
  });
});
