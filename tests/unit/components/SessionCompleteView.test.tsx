import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { SessionCompleteView } from '../../../components/SessionCompleteView';

describe('SessionCompleteView', () => {
  it('should render completion message', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText(/session complete/i)).toBeInTheDocument();
  });

  it('should render session duration', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText(/duration:/i)).toBeInTheDocument();
  });

  it('should render pass count', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText('Pass')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should render fail count', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText('Fail')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render total count', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should call onStartNewSession when start button is clicked', () => {
    const onStartNewSession = vi.fn();
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={onStartNewSession}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    const button = screen.getByRole('button', { name: /start new session/i });
    button.click();

    expect(onStartNewSession).toHaveBeenCalledTimes(1);
  });

  it('should call onViewSummary when view summary button is clicked', () => {
    const onViewSummary = vi.fn();
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={onViewSummary}
        isLoading={false}
      />
    );

    const button = screen.getByRole('button', { name: /view summary/i });
    button.click();

    expect(onViewSummary).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <SessionCompleteView
        sessionDuration={120000}
        passCount={15}
        failCount={5}
        totalCount={20}
        onStartNewSession={() => {}}
        onViewSummary={() => {}}
        isLoading={true}
      />
    );

    const startButton = screen.getByRole('button', {
      name: /start new session/i,
    });
    const viewSummaryButton = screen.getByRole('button', {
      name: /view summary/i,
    });

    expect(startButton).toBeDisabled();
    expect(viewSummaryButton).toBeDisabled();
  });
});
