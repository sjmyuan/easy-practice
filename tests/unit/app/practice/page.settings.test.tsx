// tests/unit/app/practice/page.settings.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PracticePage from '@/app/practice/page';
import * as AppContext from '@/contexts/AppContext';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('PracticePage - Settings Integration', () => {
  const mockActions = {
    initializeApp: vi.fn(),
    selectProblemSet: vi.fn(),
    startNewSession: vi.fn(),
    submitAnswer: vi.fn(),
    toggleSummary: vi.fn(),
    loadStruggledProblems: vi.fn(),
    resetAllData: vi.fn(),
    setProblemCoverage: vi.fn(),
    importProblemSet: vi.fn(),
    loadProblemSets: vi.fn(),
    toggleProblemSet: vi.fn(),
    loadNextProblem: vi.fn(),
    setProblemSetKey: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
  };

  const mockState = {
    isInitialized: true,
    isLoading: false,
    initializationError: null,
    selectedProblemSetId: 'addition-within-10',
    selectedProblemSetKey: 'addition-within-10',
    availableProblemSets: [
      { id: 'addition-within-10', name: 'Addition Within 10', key: 'addition-within-10', problemSetKey: 'addition-within-10', enabled: true, createdAt: Date.now() },
    ],
    isSessionActive: false,
    sessionStartTime: null,
    sessionDuration: null,
    sessionQueue: [],
    currentProblem: null,
    sessionCompletedCount: 0,
    sessionPassCount: 0,
    sessionFailCount: 0,
    showSummary: false,
    struggledProblems: [],
    problemCoverage: 50,
    recentProblemIds: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show settings icon when session is not active (pre-session)', () => {
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('should show settings icon when session is complete', () => {
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: {
        ...mockState,
        sessionCompletedCount: 10,
        sessionPassCount: 8,
        sessionFailCount: 2,        recentProblemIds: [],      },
      actions: mockActions,
    });

    render(<PracticePage />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    expect(settingsButton).toBeInTheDocument();
  });

  it('should NOT show settings icon when session is active', () => {
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: {
        ...mockState,
        isSessionActive: true,
        currentProblem: { id: '1', problem: '1+1', answer: '2', problemSetId: 'test', createdAt: Date.now() },
        recentProblemIds: [],
      },
      actions: mockActions,
    });

    render(<PracticePage />);

    const settingsButton = screen.queryByRole('button', { name: /settings/i });
    expect(settingsButton).not.toBeInTheDocument();
  });

  it('should open settings panel when settings icon is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });
  });

  it('should close settings panel when backdrop is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close by clicking backdrop
    const backdrop = screen.getByTestId('settings-backdrop');
    await user.click(backdrop);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should close settings panel when close button is clicked', async () => {
    const user = userEvent.setup();
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    // Close by clicking close button
    const closeButton = screen.getByRole('button', { name: /close settings/i });
    await user.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should NOT show Problem Coverage Slider in main view', () => {
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Settings panel should be closed by default
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Slider should not be in main view
    const sliders = screen.queryAllByRole('slider');
    expect(sliders).toHaveLength(0);
  });

  it('should NOT show Reset Data Button in main view', () => {
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Settings panel should be closed by default
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    // Reset Data button should not be visible in main view
    const resetButton = screen.queryByRole('button', { name: /reset data/i });
    expect(resetButton).not.toBeInTheDocument();
  });

  it('should show Problem Coverage Slider inside settings panel', async () => {
    const user = userEvent.setup();
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByLabelText(/problem coverage/i)).toBeInTheDocument();
    });
  });

  it('should show Reset Data Button inside settings panel', async () => {
    const user = userEvent.setup();
    vi.spyOn(AppContext, 'useApp').mockReturnValue({
      state: mockState,
      actions: mockActions,
    });

    render(<PracticePage />);

    // Open settings
    const settingsButton = screen.getByRole('button', { name: /settings/i });
    await user.click(settingsButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /reset data/i })).toBeInTheDocument();
    });
  });
});
