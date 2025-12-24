import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { LandingView } from '../../../components/LandingView';
import type { ProblemSet } from '../../../types';

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
      />
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
      />
    );

    // ProblemSetSelector should render problem set buttons
    expect(screen.getByText('Addition within 10')).toBeInTheDocument();
    expect(screen.getByText('Subtraction within 10')).toBeInTheDocument();
  });

  it('should call onSelect when a problem set is selected', () => {
    const onSelect = vi.fn();
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={onSelect}
        isLoading={false}
      />
    );

    const button = screen.getByText('Addition within 10');
    button.click();

    expect(onSelect).toHaveBeenCalledWith('1');
  });

  it('should disable selection when loading', () => {
    render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={true}
      />
    );

    const button = screen.getByRole('button', {
      name: 'Addition within 10',
    });
    expect(button).toBeDisabled();
  });

  it('should have correct layout styling', () => {
    const { container } = render(
      <LandingView
        problemSets={mockProblemSets}
        onSelect={() => {}}
        isLoading={false}
      />
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
      />
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
      />
    );

    const mainElement = container.querySelector('main');
    expect(mainElement).toHaveClass('bg-gradient-to-br');
  });
});
