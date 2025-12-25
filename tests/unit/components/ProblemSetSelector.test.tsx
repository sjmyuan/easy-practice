import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProblemSetSelector } from '@/components/ProblemSetSelector';
import type { ProblemSet } from '@/types';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('ProblemSetSelector', () => {
  const mockProblemSets: ProblemSet[] = [
    {
      id: '1',
      name: 'Addition within 20',
      description: 'Practice addition with sums up to 20',
      problemSetKey: 'addition-within-20',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: '2',
      name: 'Subtraction within 20',
      description: 'Practice subtraction with results up to 20',
      problemSetKey: 'subtraction-within-20',
      enabled: true,
      createdAt: Date.now(),
    },
    {
      id: '3',
      name: 'Mixed Operations',
      description: 'Practice both addition and subtraction',
      problemSetKey: 'mixed-operations',
      enabled: false,
      createdAt: Date.now(),
    },
  ];

  describe('Rendering', () => {
    it('should render the component title', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText(/Choose a Problem Set|选择题集/)).toBeInTheDocument();
    });

    it('should render all enabled problem sets', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText('Addition within 20')).toBeInTheDocument();
      expect(screen.getByText('Subtraction within 20')).toBeInTheDocument();
    });

    it('should not render disabled problem sets', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.queryByText('Mixed Operations')).not.toBeInTheDocument();
    });

    it('should render problem set descriptions', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(
        screen.getByText('Practice addition with sums up to 20')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Practice subtraction with results up to 20')
      ).toBeInTheDocument();
    });

    it('should render empty state when no problem sets available', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={[]} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText(/No problem sets available|没有可用的题集/)).toBeInTheDocument();
    });

    it('should render empty state when all problem sets are disabled', () => {
      const disabledSets = mockProblemSets.map((set) => ({
        ...set,
        enabled: false,
      }));

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={disabledSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText(/No problem sets available|没有可用的题集/)).toBeInTheDocument();
    });
  });

  describe('Interaction', () => {
    it('should call onSelect when a problem set is clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={onSelect} />
        </LanguageProvider>
      );

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });
      await user.click(additionButton);

      expect(onSelect).toHaveBeenCalledWith('1');
      expect(onSelect).toHaveBeenCalledTimes(1);
    });

    it('should call onSelect with correct problem set id when different sets are clicked', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={onSelect} />
        </LanguageProvider>
      );

      const subtractionButton = screen.getByRole('button', {
        name: /Subtraction within 20/i,
      });
      await user.click(subtractionButton);

      expect(onSelect).toHaveBeenCalledWith('2');
    });

    it('should not call onSelect when disabled', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <LanguageProvider>
          <ProblemSetSelector
            problemSets={mockProblemSets}
            onSelect={onSelect}
            disabled={true}
          />
        </LanguageProvider>
      );

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });
      await user.click(additionButton);

      expect(onSelect).not.toHaveBeenCalled();
    });
  });

  describe('Styling and Accessibility', () => {
    it('should have proper button styling for mobile touch targets', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toHaveClass('h-auto'); // Auto height for multi-line content
        expect(button).toHaveClass('min-h-20'); // Minimum 80px height for touch
      });
    });

    it('should have accessible button labels', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });
      const subtractionButton = screen.getByRole('button', {
        name: /Subtraction within 20/i,
      });

      expect(additionButton).toBeInTheDocument();
      expect(subtractionButton).toBeInTheDocument();
    });

    it('should disable all buttons when disabled prop is true', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector
            problemSets={mockProblemSets}
            onSelect={vi.fn()}
            disabled={true}
          />
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button).toBeDisabled();
      });
    });

    it('should have hover states for interactive feedback', () => {
      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        expect(button.className).toMatch(/transition-(colors|all)/)
      });
    });
  });

  describe('Edge Cases', () => {
    it('should render problem sets in case-insensitive alphabetical order by name', () => {
      const unorderedSets: ProblemSet[] = [
        {
          id: '1',
          name: 'zebra',
          description: 'Zebra set',
          problemSetKey: 'zebra',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: '2',
          name: 'apple',
          description: 'Apple set',
          problemSetKey: 'apple',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: '3',
          name: 'Banana',
          description: 'Banana set',
          problemSetKey: 'banana',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={unorderedSets} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button');
      // Extract the heading (problem set name) from each button
      const names = buttons.map((btn) => {
        const heading = btn.querySelector('h3');
        return heading ? heading.textContent?.trim() : '';
      });
      expect(names).toEqual(['apple', 'Banana', 'zebra']);
    });
    it('should handle problem sets without descriptions', () => {
      const setsWithoutDesc: ProblemSet[] = [
        {
          id: '1',
          name: 'Addition within 20',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={setsWithoutDesc} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText('Addition within 20')).toBeInTheDocument();
    });

    it('should handle single problem set', () => {
      const singleSet = [mockProblemSets[0]];

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={singleSet} onSelect={vi.fn()} />
        </LanguageProvider>
      );

      expect(screen.getByText('Addition within 20')).toBeInTheDocument();
      expect(
        screen.queryByText('Subtraction within 20')
      ).not.toBeInTheDocument();
    });

    it('should handle multiple clicks on the same problem set', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      render(
        <LanguageProvider>
          <ProblemSetSelector problemSets={mockProblemSets} onSelect={onSelect} />
        </LanguageProvider>
      );

      const additionButton = screen.getByRole('button', {
        name: /Addition within 20/i,
      });

      await user.click(additionButton);
      await user.click(additionButton);

      expect(onSelect).toHaveBeenCalledTimes(2);
      expect(onSelect).toHaveBeenCalledWith('1');
    });
  });
});
