// tests/unit/contexts/AppContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { databaseService, problemService } from '@/services';
import type { ReactNode } from 'react';

// Mock the services
vi.mock('@/services', () => ({
  databaseService: {
    getProblemSets: vi.fn(),
    toggleProblemSet: vi.fn(),
    recordAttempt: vi.fn(),
    getStruggledProblems: vi.fn(),
    resetStatistics: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
  },
  problemService: {
    hasProblems: vi.fn(),
    loadDefaultProblemSets: vi.fn(),
    getNextProblem: vi.fn(),
    loadProblemSetFromFile: vi.fn(),
  },
}));

describe('AppContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(problemService.hasProblems).mockResolvedValue(true);
    vi.mocked(databaseService.getProblemSets).mockResolvedValue([
      {
        id: '1',
        name: 'Addition within 20',
        type: 'addition',
        enabled: true,
        createdAt: new Date(),
      },
    ]);
  });

  describe('Issue A: Actions object reference stability', () => {
    it('should maintain stable actions object reference across state updates', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Store initial actions reference
      const initialActions = result.current.actions;

      // Trigger state updates that should NOT recreate actions object
      act(() => {
        result.current.actions.setType('subtraction');
      });

      // Actions reference should remain the same
      expect(result.current.actions).toBe(initialActions);

      // Trigger another state update
      act(() => {
        result.current.actions.toggleSummary();
      });

      // Actions reference should still be the same
      expect(result.current.actions).toBe(initialActions);
    });

    it('should not cause infinite loops when actions is used as useEffect dependency', async () => {
      let renderCount = 0;
      const { result } = renderHook(
        () => {
          renderCount++;
          const context = useApp();
          
          // Simulate the pattern in page.tsx
          // This should not cause infinite re-renders
          return context;
        },
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit to ensure no additional renders occur
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Render count should be reasonable (not hundreds/thousands)
      // Initial render + initialization update = roughly 2-3 renders
      expect(renderCount).toBeLessThan(10);
    });
  });

  describe('Issue A: Initialization triggers properly', () => {
    it('should initialize on mount and set isInitialized to true', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      // Initially not initialized
      expect(result.current.state.isInitialized).toBe(false);

      // Wait for initialization to complete
      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      }, { timeout: 3000 });

      // Should have loaded problem sets
      expect(result.current.state.availableProblemSets).toHaveLength(1);
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should call initialization services in correct order', async () => {
      const hasProblemsCall = vi.mocked(problemService.hasProblems);
      const loadDefaultCall = vi.mocked(problemService.loadDefaultProblemSets);
      const getProblemSetsCall = vi.mocked(databaseService.getProblemSets);
      
      hasProblemsCall.mockResolvedValue(false);
      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Verify initialization sequence
      expect(hasProblemsCall).toHaveBeenCalled();
      expect(loadDefaultCall).toHaveBeenCalled();
      expect(getProblemSetsCall).toHaveBeenCalled();
    });

    it('should only initialize once even if useEffect runs multiple times', async () => {
      const hasProblemsCall = vi.mocked(problemService.hasProblems);
      hasProblemsCall.mockResolvedValue(true);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait additional time to catch any duplicate calls
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should only be called once
      expect(hasProblemsCall).toHaveBeenCalledTimes(1);
    });
  });

  describe('Issue B: initializeApp called only once on mount', () => {
    it('should call initializeApp only once during mount', async () => {
      const hasProblemsCall = vi.mocked(problemService.hasProblems);
      const loadDefaultCall = vi.mocked(problemService.loadDefaultProblemSets);
      const getProblemSetsCall = vi.mocked(databaseService.getProblemSets);
      
      hasProblemsCall.mockResolvedValue(false);
      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit to ensure no additional calls occur
      await new Promise((resolve) => setTimeout(resolve, 200));

      // initializeApp should only be called once (which calls these services once)
      expect(hasProblemsCall).toHaveBeenCalledTimes(1);
      expect(loadDefaultCall).toHaveBeenCalledTimes(1);
      expect(getProblemSetsCall).toHaveBeenCalledTimes(1);
    });

    it('should not call initializeApp again when state changes', async () => {
      const hasProblemsCall = vi.mocked(problemService.hasProblems);
      hasProblemsCall.mockResolvedValue(true);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      const initialCallCount = hasProblemsCall.mock.calls.length;

      // Trigger state changes
      act(() => {
        result.current.actions.setType('subtraction');
      });

      act(() => {
        result.current.actions.toggleSummary();
      });

      // Wait to ensure no additional calls
      await new Promise((resolve) => setTimeout(resolve, 100));

      // initializeApp should not be called again
      expect(hasProblemsCall).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Issue C: Load first problem after initialization', () => {
    it('should automatically load first problem after initialization completes', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      getNextProblemCall.mockResolvedValue({
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait for the first problem to load
      await waitFor(() => {
        expect(result.current.state.currentProblem).not.toBeNull();
      }, { timeout: 3000 });

      expect(result.current.state.currentProblem?.problem).toBe('5 + 3');
      expect(getNextProblemCall).toHaveBeenCalled();
    });

    it('should load problem for the default selected type', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      getNextProblemCall.mockResolvedValue({
        id: 'p1',
        problemSetId: 'ps1',
        problem: '10 + 5',
        answer: '15',
        createdAt: new Date(),
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await waitFor(() => {
        expect(result.current.state.currentProblem).not.toBeNull();
      });

      // Should call getNextProblem with the default type 'addition'
      expect(getNextProblemCall).toHaveBeenCalledWith('addition', []);
    });

    it('should handle case when no problems are available', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      getNextProblemCall.mockResolvedValue(null);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit for any async operations
      await new Promise((resolve) => setTimeout(resolve, 200));

      // currentProblem should remain null if no problems available
      expect(result.current.state.currentProblem).toBeNull();
      expect(getNextProblemCall).toHaveBeenCalled();
    });
  });
});
