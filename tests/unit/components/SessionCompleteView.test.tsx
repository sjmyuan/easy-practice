import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { SessionCompleteView } from '../../../components/SessionCompleteView';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('SessionCompleteView', () => {
  it('should render completion message', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/session complete|练习完成/i)).toBeInTheDocument();
  });

  it('should render session duration', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/(Duration|用时):/i)).toBeInTheDocument();
  });

  it('should render pass count', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Passed|通过/)).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('should render fail count', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/(Failed|失败)/)).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should render total count', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(screen.getByText(/Total Problems|总题数/)).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
  });

  it('should call onStartNewSession when start button is clicked', () => {
    const onStartNewSession = vi.fn();
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={onStartNewSession}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /start new session|开始新练习/i });
    button.click();

    expect(onStartNewSession).toHaveBeenCalledTimes(1);
  });

  it('should call onViewSummary when view summary button is clicked', () => {
    const onViewSummary = vi.fn();
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={onViewSummary}
          isLoading={false}
        />
      </LanguageProvider>
    );

    const button = screen.getByRole('button', { name: /view summary|查看总结/i });
    button.click();

    expect(onViewSummary).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <LanguageProvider>
        <SessionCompleteView
          sessionDuration={120000}
          passCount={15}
          failCount={5}
          totalCount={20}
          onStartNewSession={() => {}}
          onViewSummary={() => {}}
          isLoading={true}
        />
      </LanguageProvider>
    );

    const startButton = screen.getByRole('button', {
      name: /start new session|开始新练习/i,
    });
    const viewSummaryButton = screen.getByRole('button', {
      name: /view summary|查看总结/i,
    });

    expect(startButton).toBeDisabled();
    expect(viewSummaryButton).toBeDisabled();
  });
});
