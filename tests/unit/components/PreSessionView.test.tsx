import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { PreSessionView } from '../../../components/PreSessionView';

describe('PreSessionView', () => {
  it('should render start session button', () => {
    render(
      <PreSessionView
        onStart={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(
      screen.getByRole('button', { name: /start new session/i })
    ).toBeInTheDocument();
  });

  it('should render view summary button', () => {
    render(
      <PreSessionView
        onStart={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    expect(
      screen.getByRole('button', { name: /view summary/i })
    ).toBeInTheDocument();
  });

  it('should call onStart when start button is clicked', () => {
    const onStart = vi.fn();
    render(
      <PreSessionView
        onStart={onStart}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    const startButton = screen.getByRole('button', {
      name: /start new session/i,
    });
    startButton.click();

    expect(onStart).toHaveBeenCalledTimes(1);
  });

  it('should call onViewSummary when view summary button is clicked', () => {
    const onViewSummary = vi.fn();
    render(
      <PreSessionView
        onStart={() => {}}
        onViewSummary={onViewSummary}
        isLoading={false}
      />
    );

    const viewSummaryButton = screen.getByRole('button', {
      name: /view summary/i,
    });
    viewSummaryButton.click();

    expect(onViewSummary).toHaveBeenCalledTimes(1);
  });

  it('should disable buttons when loading', () => {
    render(
      <PreSessionView
        onStart={() => {}}
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

  it('should render buttons in a vertical layout', () => {
    const { container } = render(
      <PreSessionView
        onStart={() => {}}
        onViewSummary={() => {}}
        isLoading={false}
      />
    );

    const buttonContainer = container.querySelector('.flex-col');
    expect(buttonContainer).toBeInTheDocument();
  });
});
