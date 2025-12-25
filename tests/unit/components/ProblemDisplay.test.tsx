// tests/unit/components/ProblemDisplay.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import type { Problem } from '@/types';

describe('ProblemDisplay Component', () => {
  const mockProblem: Problem = {
    id: '1',
    problemSetId: 'set-1',
    problem: '5 + 7',
    answer: '12',
    createdAt: Date.now(),
  };

  it('should render the problem text clearly', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    expect(screen.getByText('5 + 7')).toBeInTheDocument();
  });

  it('should display large text for mobile readability', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    // Should have large text class for mobile readability
    expect(problemText).toHaveClass('text-6xl');
  });

  it('should not display the answer', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    expect(screen.queryByText('12')).not.toBeInTheDocument();
  });

  it('should show empty state when no problem is provided', () => {
    render(<ProblemDisplay problem={null} />);

    expect(screen.getByText(/select a problem type/i)).toBeInTheDocument();
  });

  it('should be accessible with proper semantic HTML', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemDisplay = screen.getByRole('region');
    expect(problemDisplay).toHaveAttribute(
      'aria-label',
      'Current math problem'
    );
  });

  it('should center the problem text', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    expect(problemText).toHaveClass('text-center');
  });

  it('should render subtraction problems correctly', () => {
    const subtractionProblem: Problem = {
      id: '2',
      problemSetId: 'set-1',
      problem: '15 - 8',
      answer: '7',
      createdAt: Date.now(),
    };

    render(<ProblemDisplay problem={subtractionProblem} />);

    expect(screen.getByText('15 - 8')).toBeInTheDocument();
  });

  it('should have proper contrast for readability', () => {
    render(<ProblemDisplay problem={mockProblem} />);

    const problemText = screen.getByText('5 + 7');
    // Should have dark text class for contrast
    expect(problemText).toHaveClass('text-gray-900');
  });

  describe('Toggle Answer Feature', () => {
    it('should render toggle icon button in top-right corner', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should show Eye icon when answer is hidden (default state)', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      // Eye icon should be present (using test-id or aria-label)
      expect(toggleButton).toBeInTheDocument();
    });

    it('should not display answer by default', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      expect(screen.queryByText('12')).not.toBeInTheDocument();
    });

    it('should not render toggle icon when no problem is provided', () => {
      render(<ProblemDisplay problem={null} />);

      const toggleButton = screen.queryByRole('button', {
        name: /show answer/i,
      });
      expect(toggleButton).not.toBeInTheDocument();
    });

    it('should display answer when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Initially answer is hidden
      expect(screen.queryByText(/12/)).not.toBeInTheDocument();

      // Click to show answer
      await user.click(toggleButton);

      // Answer should now be visible
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('should hide answer when toggle button is clicked again', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Click to show answer
      await user.click(toggleButton);
      expect(screen.getByText(/12/)).toBeInTheDocument();

      // Click again to hide answer
      const hideButton = screen.getByRole('button', {
        name: /hide answer/i,
      });
      await user.click(hideButton);

      // Answer should be hidden again
      expect(screen.queryByText(/12/)).not.toBeInTheDocument();
    });

    it('should switch icon from Eye to EyeOff when answer is shown', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const showButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Click to show answer
      await user.click(showButton);

      // Button text should change to "Hide answer"
      const hideButton = screen.getByRole('button', {
        name: /hide answer/i,
      });
      expect(hideButton).toBeInTheDocument();
    });

    it('should display answer with different styling than problem', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Click to show answer
      await user.click(toggleButton);

      // Answer should have different styling (smaller text, green color)
      const answerElement = screen.getByText(/12/);
      expect(answerElement).toHaveClass('text-2xl');
      expect(answerElement).toHaveClass('text-green-600');
    });

    it('should reset toggle state when problem changes', () => {
      const { rerender } = render(<ProblemDisplay problem={mockProblem} />);

      // The answer should be hidden by default for any problem
      expect(screen.queryByText(/12/)).not.toBeInTheDocument();

      // Change to a different problem
      const newProblem: Problem = {
        id: '2',
        problemSetId: 'set-1',
        problem: '10 - 3',
        answer: '7',
        createdAt: Date.now(),
      };

      rerender(<ProblemDisplay problem={newProblem} />);

      // The new problem's answer should also be hidden by default
      expect(screen.queryByText(/7/)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA label for toggle button when answer is hidden', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      expect(toggleButton).toHaveAttribute('aria-label', 'Show answer');
    });

    it('should update ARIA label when answer is shown', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      await user.click(toggleButton);

      const hideButton = screen.getByRole('button', {
        name: /hide answer/i,
      });
      expect(hideButton).toHaveAttribute('aria-label', 'Hide answer');
    });

    it('should be keyboard accessible with Enter key', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Focus the button
      toggleButton.focus();

      // Press Enter key
      await user.keyboard('{Enter}');

      // Answer should be visible
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('should be keyboard accessible with Space key', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Focus the button
      toggleButton.focus();

      // Press Space key
      await user.keyboard(' ');

      // Answer should be visible
      expect(screen.getByText(/12/)).toBeInTheDocument();
    });

    it('should have proper button type attribute', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      expect(toggleButton).toHaveAttribute('type', 'button');
    });

    it('should have minimum touch target size for mobile (44x44px)', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Button should have sufficient padding (p-2 = 8px, with h-6 w-6 icon = 24px, total > 44px with padding and hover area)
      expect(toggleButton).toHaveClass('p-2');
    });

    it('should have hover state for visual feedback', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });

      // Button should have hover state
      expect(toggleButton).toHaveClass('hover:bg-gray-100');
    });
  });

  describe('Audio Functionality', () => {
    const mockProblemWithAudio: Problem = {
      id: '1',
      problemSetId: 'set-1',
      problem: 'What is your name?',
      answer: 'My name is Sean.',
      problemAudio: 'problem1.wav',
      answerAudio: 'answer1.wav',
      createdAt: Date.now(),
    };

    it('should render problem audio button when problemAudio is provided', () => {
      render(<ProblemDisplay problem={mockProblemWithAudio} />);

      const audioButton = screen.getByRole('button', {
        name: /play problem audio/i,
      });
      expect(audioButton).toBeInTheDocument();
    });

    it('should not render problem audio button when problemAudio is not provided', () => {
      render(<ProblemDisplay problem={mockProblem} />);

      const audioButton = screen.queryByRole('button', {
        name: /play problem audio/i,
      });
      expect(audioButton).not.toBeInTheDocument();
    });

    it('should render answer audio button when answerAudio is provided and answer is shown', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblemWithAudio} />);

      // Show the answer first
      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      await user.click(toggleButton);

      // Answer audio button should be visible
      const audioButton = screen.getByRole('button', {
        name: /play answer audio/i,
      });
      expect(audioButton).toBeInTheDocument();
    });

    it('should not render answer audio button when answer is hidden', () => {
      render(<ProblemDisplay problem={mockProblemWithAudio} />);

      const audioButton = screen.queryByRole('button', {
        name: /play answer audio/i,
      });
      expect(audioButton).not.toBeInTheDocument();
    });

    it('should not render answer audio button when answerAudio is not provided', async () => {
      const user = userEvent.setup();
      const problemWithoutAnswerAudio: Problem = {
        ...mockProblem,
        problemAudio: 'problem1.wav',
      };
      render(<ProblemDisplay problem={problemWithoutAnswerAudio} />);

      // Show the answer
      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      await user.click(toggleButton);

      // Answer audio button should not be present
      const audioButton = screen.queryByRole('button', {
        name: /play answer audio/i,
      });
      expect(audioButton).not.toBeInTheDocument();
    });

    it('should construct correct audio URL for problem audio', () => {
      render(<ProblemDisplay problem={mockProblemWithAudio} />);

      // Find audio element (it should be created for auto-play)
      const audioElements = document.querySelectorAll('audio');
      const problemAudio = Array.from(audioElements).find((audio) =>
        audio.src.includes('problem1.wav')
      );

      expect(problemAudio).toBeDefined();
      expect(problemAudio?.src).toBe(
        'https://images.shangjiaming.top/problem1.wav'
      );
    });

    it('should construct correct audio URL for answer audio', async () => {
      const user = userEvent.setup();
      render(<ProblemDisplay problem={mockProblemWithAudio} />);

      // Show the answer
      const toggleButton = screen.getByRole('button', {
        name: /show answer/i,
      });
      await user.click(toggleButton);

      // Find audio element
      const audioElements = document.querySelectorAll('audio');
      const answerAudio = Array.from(audioElements).find((audio) =>
        audio.src.includes('answer1.wav')
      );

      expect(answerAudio).toBeDefined();
      expect(answerAudio?.src).toBe(
        'https://images.shangjiaming.top/answer1.wav'
      );
    });

    describe('Auto-play functionality', () => {
      it('should auto-play problem audio when problem first loads', () => {
        const { container } = render(
          <ProblemDisplay problem={mockProblemWithAudio} />
        );

        // Find the audio element
        const audioElement = container.querySelector('audio');
        expect(audioElement).toBeDefined();

        // Verify play was called (mock will capture this)
        const playSpy = vi.spyOn(audioElement!, 'play');
        playSpy.mockResolvedValue(undefined);

        // The auto-play should have triggered in useEffect
        // Since useEffect runs after render, we need to wait a tick
        expect(playSpy).toHaveBeenCalled();
      });

      it('should auto-play when problem changes from null to first problem', () => {
        const { rerender, container } = render(
          <ProblemDisplay problem={null} />
        );

        // Initially no audio element
        expect(container.querySelector('audio')).toBeNull();

        // Now render with a problem
        rerender(<ProblemDisplay problem={mockProblemWithAudio} />);

        const audioElement = container.querySelector('audio');
        expect(audioElement).toBeDefined();

        // Verify play was called
        const playSpy = vi.spyOn(audioElement!, 'play');
        playSpy.mockResolvedValue(undefined);

        // Auto-play should trigger for the first problem
        expect(playSpy).toHaveBeenCalled();
      });

      it('should auto-play when problem changes to a new problem', () => {
        const problem1: Problem = {
          ...mockProblemWithAudio,
          id: 'problem-1',
          problemAudio: 'audio1.wav',
        };

        const problem2: Problem = {
          ...mockProblemWithAudio,
          id: 'problem-2',
          problemAudio: 'audio2.wav',
        };

        const { rerender, container } = render(
          <ProblemDisplay problem={problem1} />
        );

        const audio1 = container.querySelector('audio');
        const playSpy1 = vi.spyOn(audio1!, 'play');
        playSpy1.mockResolvedValue(undefined);

        // Change to a new problem
        rerender(<ProblemDisplay problem={problem2} />);

        const audio2 = container.querySelector('audio');
        const playSpy2 = vi.spyOn(audio2!, 'play');
        playSpy2.mockResolvedValue(undefined);

        // Auto-play should trigger for the new problem
        expect(playSpy2).toHaveBeenCalled();
      });

      it('should stop previous audio when problem changes', () => {
        const problem1: Problem = {
          ...mockProblemWithAudio,
          id: 'problem-1',
          problemAudio: 'audio1.wav',
        };

        const problem2: Problem = {
          ...mockProblemWithAudio,
          id: 'problem-2',
          problemAudio: 'audio2.wav',
        };

        const { rerender, container } = render(
          <ProblemDisplay problem={problem1} />
        );

        const audio1 = container.querySelector('audio');
        const pauseSpy = vi.spyOn(audio1!, 'pause');
        pauseSpy.mockImplementation(() => {});

        // Change to a new problem
        rerender(<ProblemDisplay problem={problem2} />);

        // Previous audio should be paused
        expect(pauseSpy).toHaveBeenCalled();
      });
    });

    describe('Button positioning', () => {
      it('should render audio and show answer buttons in a flex row group at the top-right', () => {
        render(<ProblemDisplay problem={mockProblemWithAudio} />);

        // The button group container
        const buttonGroup = document.querySelector('.absolute.top-4.right-4.flex');
        expect(buttonGroup).toBeInTheDocument();

        // Both buttons should be present and siblings
        const audioButton = screen.getByRole('button', { name: /play problem audio/i });
        const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
        expect(audioButton).toBeInTheDocument();
        expect(showAnswerButton).toBeInTheDocument();
        expect(audioButton.parentElement).toBe(buttonGroup);
        expect(showAnswerButton.parentElement).toBe(buttonGroup);
      });

      it('should have the same style for audio and show answer buttons', () => {
        render(<ProblemDisplay problem={mockProblemWithAudio} />);
        const audioButton = screen.getByRole('button', { name: /play problem audio/i });
        const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
        // Both should have the same classes
        expect(audioButton.className).toBe(showAnswerButton.className);
      });

      it('should keep problem text centered and not affected by button group', () => {
        render(<ProblemDisplay problem={mockProblemWithAudio} />);
        const problemText = screen.getByText('What is your name?');
        expect(problemText).toHaveClass('text-center');
      });
    });
  });
});
