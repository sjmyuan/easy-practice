import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { PracticeSessionView } from '../../../components/PracticeSessionView';
import type { Problem } from '../../../types';

const mockProblem: Problem = {
  id: '1',
  problemSetId: 'ps1',
  problem: '2 + 2',
  answer: '4',
  createdAt: Date.now(),
};

describe('PracticeSessionView', () => {
  it('should render session timer when session is active', () => {
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={() => {}}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    // SessionTimer renders a time element
    expect(screen.getByRole('time')).toBeInTheDocument();
  });

  it('should render progress indicator', () => {
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={() => {}}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    // Progress indicator shows "5 / 20"
    expect(screen.getByText('5', { exact: false })).toBeInTheDocument();
    expect(screen.getByText('20', { exact: false })).toBeInTheDocument();
  });

  it('should render problem display', () => {
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={() => {}}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    expect(screen.getByText('2 + 2')).toBeInTheDocument();
  });

  it('should render answer buttons when problem exists', () => {
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={() => {}}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    expect(screen.getByRole('button', { name: /mark as pass/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /mark as fail/i })).toBeInTheDocument();
  });

  it('should not render answer buttons when no problem exists', () => {
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={null}
        onPass={() => {}}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    expect(screen.queryByRole('button', { name: /mark as pass/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /mark as fail/i })).not.toBeInTheDocument();
  });

  it('should call onPass when pass button is clicked', () => {
    const onPass = vi.fn();
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={onPass}
        onFail={() => {}}
        isLoading={false}
      />
    );
    
    const passButton = screen.getByRole('button', { name: /mark as pass/i });
    passButton.click();
    
    expect(onPass).toHaveBeenCalledTimes(1);
  });

  it('should call onFail when fail button is clicked', () => {
    const onFail = vi.fn();
    render(
      <PracticeSessionView
        sessionStartTime={Date.now()}
        isSessionActive={true}
        sessionCompletedCount={5}
        sessionQueueLength={20}
        currentProblem={mockProblem}
        onPass={() => {}}
        onFail={onFail}
        isLoading={false}
      />
    );
    
    const failButton = screen.getByRole('button', { name: /mark as fail/i });
    failButton.click();
    
    expect(onFail).toHaveBeenCalledTimes(1);
  });
});
