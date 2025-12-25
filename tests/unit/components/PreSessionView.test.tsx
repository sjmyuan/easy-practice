import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { PreSessionView } from '../../../components/PreSessionView';
import { LanguageProvider } from '@/contexts/LanguageContext';

describe('PreSessionView', () => {
  it('should render start session button', () => {
    render(
      <LanguageProvider>
        <PreSessionView
          onStart={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(
      screen.getByRole('button', { name: /start new session|开始新练习/i })
    ).toBeInTheDocument();
  });

  it('should render view summary button', () => {
    render(
      <LanguageProvider>
        <PreSessionView
          onStart={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    expect(
      screen.getByRole('button', { name: /view summary|查看总结/i })
    ).toBeInTheDocument();
  });

  it('should call onStart when start button is clicked', () => {
    const onStart = vi.fn();
    render(
      <LanguageProvider>
        <PreSessionView
          onStart={onStart}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    const startButton = screen.getByRole('button', {
      name: /(start new session|开始新练习)/i,
    });
    startButton.click();

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('should call onViewSummary when view summary button is clicked', () => {
    const onViewSummary = vi.fn();
    render(
      <LanguageProvider>
        <PreSessionView
          onStart={() => {}}
          onViewSummary={onViewSummary}
          isLoading={false}
        />
      </LanguageProvider>
    );

    const viewSummaryButton = screen.getByRole('button', {
      name: /(view summary|查看总结)/i,
    });
    viewSummaryButton.click();

    expect(onViewSummary).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <LanguageProvider>
        <PreSessionView
          onStart={() => {}}
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

  it('should render buttons in a vertical layout', () => {
    const { container } = render(
      <LanguageProvider>
        <PreSessionView
          onStart={() => {}}
          onViewSummary={() => {}}
          isLoading={false}
        />
      </LanguageProvider>
    );

    const buttonContainer = container.querySelector('.flex-col');
    expect(buttonContainer).toBeInTheDocument();
  });
});
