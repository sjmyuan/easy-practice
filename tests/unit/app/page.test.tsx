// tests/unit/app/page.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';

// Mock the context
vi.mock('@/contexts', () => ({
  useApp: () => ({
    state: {
      currentProblem: null,
      selectedType: 'addition',
      isLoading: false,
      isInitialized: true,
    },
    actions: {
      initializeApp: vi.fn(),
      loadNextProblem: vi.fn(),
      setType: vi.fn(),
    },
  }),
}));

describe('Home Page', () => {
  it('should render the main page with problem generator', () => {
    render(<Home />);

    expect(screen.getByText(/math practice/i)).toBeInTheDocument();
  });

  it('should display type selector buttons', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /addition/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /subtraction/i })).toBeInTheDocument();
  });

  it('should display Next Problem button', () => {
    render(<Home />);

    expect(screen.getByRole('button', { name: /next problem/i })).toBeInTheDocument();
  });

  it('should display problem display area', () => {
    render(<Home />);

    expect(screen.getByRole('region', { name: /current math problem/i })).toBeInTheDocument();
  });

  it('should be responsive on mobile viewports', () => {
    render(<Home />);

    const container = screen.getByRole('main');
    expect(container).toHaveClass('min-h-screen');
  });
});
