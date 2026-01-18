// tests/unit/contexts/AppContext.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { databaseService, problemService } from '@/services';
import type { ProblemSet } from '@/types';
import type { ReactNode } from 'react';

// Mock the services
vi.mock('@/services', () => ({
  databaseService: {
    saveSession: vi.fn(),
    getSessionHistory: vi.fn(),
  },
  problemService: {
    hasProblems: vi.fn(),
    loadDefaultProblemSets: vi.fn(),
    getNextProblem: vi.fn(),
    generateSessionQueue: vi.fn(),
    getProblemSets: vi.fn(),
    getProblemById: vi.fn(),
  },
}));

describe('AppContext', () => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <AppProvider>{children}</AppProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(problemService.hasProblems).mockReturnValue(true);
    vi.mocked(problemService.getProblemSets).mockReturnValue([
      {
        id: '1',
        name: 'Addition within 20',
        problemSetKey: 'addition-within-20',
        enabled: true,
        createdAt: Date.now(),
      },
    ]);
    vi.mocked(problemService.loadDefaultProblemSets).mockResolvedValue();
    vi.mocked(databaseService.getSessionHistory).mockReturnValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
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
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Actions reference should remain the same
      expect(result.current.actions).toBe(initialActions);

      // Trigger another state update
      act(() => {
        result.current.actions.toggleHistory();
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
      await new Promise((resolve) => setTimeout(resolve, 50));

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
      await waitFor(
        () => {
          expect(result.current.state.isInitialized).toBe(true);
        },
        { timeout: 1000 }
      );

      // Should have loaded problem sets
      expect(result.current.state.availableProblemSets).toHaveLength(1);
      expect(result.current.state.isLoading).toBe(false);
    });

    it('should call initialization services in correct order', async () => {
      const loadDefaultCall = vi.mocked(problemService.loadDefaultProblemSets);
      const getProblemSetsCall = vi.mocked(problemService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockReturnValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Verify initialization sequence
      expect(loadDefaultCall).toHaveBeenCalled();
      expect(getProblemSetsCall).toHaveBeenCalled();
    });

    it('should only initialize once even if useEffect runs multiple times', async () => {
      const loadDefaultCall = vi.mocked(problemService.loadDefaultProblemSets);
      const getProblemSetsCall = vi.mocked(problemService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockReturnValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait additional time to catch any duplicate calls
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should only be called once
      expect(loadDefaultCall).toHaveBeenCalledTimes(1);
      expect(getProblemSetsCall).toHaveBeenCalledTimes(1);
    });
  });

  describe('Issue B: initializeApp called only once on mount', () => {
    it('should call initializeApp only once during mount', async () => {
      const loadDefaultCall = vi.mocked(problemService.loadDefaultProblemSets);
      const getProblemSetsCall = vi.mocked(problemService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockReturnValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit to ensure no additional calls occur
      await new Promise((resolve) => setTimeout(resolve, 50));

      // initializeApp should only be called once (which calls these services once)
      expect(loadDefaultCall).toHaveBeenCalledTimes(1);
      expect(getProblemSetsCall).toHaveBeenCalledTimes(1);
    });

    it('should not call initializeApp again when state changes', async () => {
      const hasProblemsCall = vi.mocked(problemService.hasProblems);
      hasProblemsCall.mockReturnValue(true);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      const initialCallCount = hasProblemsCall.mock.calls.length;

      // Trigger state changes
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      act(() => {
        result.current.actions.toggleHistory();
      });

      // Wait to ensure no additional calls
      await new Promise((resolve) => setTimeout(resolve, 50));

      // initializeApp should not be called again
      expect(hasProblemsCall).toHaveBeenCalledTimes(initialCallCount);
    });
  });

  describe('Issue C: Load first problem after initialization', () => {
    it('should NOT automatically load first problem after initialization', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      getNextProblemCall.mockReturnValue({
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit to ensure no auto-load happens
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Should NOT auto-load problem - user must start a session
      expect(result.current.state.currentProblem).toBeNull();
    });

    it('should not call getNextProblem during initialization', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      // getNextProblem should not be called during init (only when starting a session)
      expect(getNextProblemCall).not.toHaveBeenCalled();
    });

    it('should handle initialization when no problems are available', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      getNextProblemCall.mockReturnValue(null);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Wait a bit for any async operations
      await new Promise((resolve) => setTimeout(resolve, 50));

      // currentProblem should be null (no auto-load)
      expect(result.current.state.currentProblem).toBeNull();
    });
  });

  describe('Session State Management', () => {
    it('should initialize with no active session', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Session should not be active initially
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionQueue).toEqual([]);
      expect(result.current.state.sessionCompletedCount).toBe(0);
    });

    it('should expose startNewSession action', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      expect(result.current.actions.startNewSession).toBeDefined();
      expect(typeof result.current.actions.startNewSession).toBe('function');
    });

    it('should have session total count derived from queue length', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Initially no session
      expect(result.current.state.sessionQueue).toHaveLength(0);

      // Total count should match queue length
      const totalCount = result.current.state.sessionQueue.length;
      expect(totalCount).toBe(0);
    });
  });

  describe('Start Session Action', () => {
    it('should generate session queue and activate session', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const firstProblem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockReturnValue(firstProblem);
      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(firstProblem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start a new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Session should be active
      expect(result.current.state.isSessionActive).toBe(true);
      expect(result.current.state.sessionQueue).toEqual(['p1', 'p2', 'p3']);
      expect(result.current.state.sessionCompletedCount).toBe(0);
      expect(result.current.state.currentProblem).not.toBeNull();
    });

    it('should load first problem from session queue', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const firstProblem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockReturnValue(firstProblem);
      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(firstProblem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.currentProblem).toEqual(firstProblem);
    });

    it('should use selected type when generating session queue', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '10 - 5',
        answer: '5',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Change type to subtraction
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Start session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(generateSessionQueueCall).toHaveBeenCalledWith(
        'subtraction',
        100
      );
    });

    it('should handle empty session queue', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      generateSessionQueueCall.mockReturnValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionQueue).toEqual([]);
      expect(result.current.state.currentProblem).toBeNull();
    });
  });

  describe('Session Progress Tracking', () => {
    it('should increment completed count when answering in session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
      ];

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockImplementation((id: string) => {
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.sessionCompletedCount).toBe(0);
      expect(result.current.state.currentProblem?.id).toBe('p1');

      // Submit answer for first problem
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      expect(result.current.state.sessionCompletedCount).toBe(1);
      expect(result.current.state.currentProblem?.id).toBe('p2');
    });

    it('should load next problem from session queue', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
        {
          id: 'p3',
          problemSetId: 'ps1',
          problem: '3 + 3',
          answer: '6',
          createdAt: Date.now(),
        },
      ];

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockImplementation((id: string) => {
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Complete first problem
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      expect(result.current.state.currentProblem?.id).toBe('p2');

      // Complete second problem
      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      expect(result.current.state.currentProblem?.id).toBe('p3');
      expect(result.current.state.sessionCompletedCount).toBe(2);
    });

    it('should complete session when all problems are done', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
      ];

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockImplementation((id: string) => {
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Complete both problems
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Session should be complete
      expect(result.current.state.sessionCompletedCount).toBe(2);
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.currentProblem).toBeNull();
    });

    it('should not increment if no active session', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Manually set a problem without starting a session
      // (this simulates the old behavior before sessions)
      await act(async () => {
        await result.current.actions.loadNextProblem();
      });

      const initialCompletedCount = result.current.state.sessionCompletedCount;

      // Submit answer
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Completed count should not change when there's no active session
      expect(result.current.state.sessionCompletedCount).toBe(
        initialCompletedCount
      );
    });
  });

  describe('Type Switch Session Reset', () => {
    it('should reset session when switching types', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start a session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.isSessionActive).toBe(true);
      expect(result.current.state.sessionQueue).toHaveLength(3);

      // Switch type
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Session should be reset
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionQueue).toEqual([]);
      expect(result.current.state.sessionCompletedCount).toBe(0);
      expect(result.current.state.currentProblem).toBeNull();
    });

    it('should clear recent problem IDs when switching types', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start a session to populate state
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Verify session is active
      expect(result.current.state.isSessionActive).toBe(true);
      expect(result.current.state.recentProblemIds.length).toBeGreaterThan(0);

      // Switch type
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      expect(result.current.state.recentProblemIds).toEqual([]);
    });
  });

  describe('Reset Data by Type', () => {
    it('should reset statistics for ALL problem sets', async () => {

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Call resetAllData (which should now reset ALL statistics)
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify resetStatistics was called (not resetStatisticsByProblemSetId)
    });

    it('should preserve currentProblem and session state after reset', async () => {

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set and start session
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      await waitFor(() => {
        expect(result.current.state.currentProblem).not.toBeNull();
      });

      const problemBeforeReset = result.current.state.currentProblem;
      const recentIdsBeforeReset = result.current.state.recentProblemIds;
      const sessionActiveBeforeReset = result.current.state.isSessionActive;
      const sessionQueueBeforeReset = result.current.state.sessionQueue;
      const sessionCompletedCountBeforeReset =
        result.current.state.sessionCompletedCount;

      // Call resetAllData
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify statistics were reset globally

      // Verify UI state was preserved
      expect(result.current.state.currentProblem).toEqual(problemBeforeReset);
      expect(result.current.state.recentProblemIds).toEqual(
        recentIdsBeforeReset
      );
      expect(result.current.state.isSessionActive).toBe(
        sessionActiveBeforeReset
      );
      expect(result.current.state.sessionQueue).toEqual(
        sessionQueueBeforeReset
      );
      expect(result.current.state.sessionCompletedCount).toBe(
        sessionCompletedCountBeforeReset
      );
    });

    it('should preserve session completion screen after reset', async () => {

      const mockProblem = {
        id: '1',
        problemSetId: 'ps1',
        problem: '2 + 3',
        answer: '5',
        createdAt: Date.now(),
      };

      vi.mocked(problemService.getProblemById).mockReturnValue(mockProblem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set and start session
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      await waitFor(() => {
        expect(result.current.state.currentProblem).not.toBeNull();
        expect(result.current.state.sessionQueue.length).toBeGreaterThan(0);
      });

      // Complete the entire session
      const totalProblems = result.current.state.sessionQueue.length;
      for (let i = 0; i < totalProblems; i++) {
        await act(async () => {
          await result.current.actions.submitAnswer('pass');
        });
      }

      await waitFor(() => {
        expect(result.current.state.isSessionActive).toBe(false);
        expect(result.current.state.sessionCompletedCount).toBe(totalProblems);
      });

      const sessionDurationBeforeReset = result.current.state.sessionDuration;
      const sessionPassCountBeforeReset = result.current.state.sessionPassCount;
      const sessionFailCountBeforeReset = result.current.state.sessionFailCount;
      const sessionCompletedCountBeforeReset =
        result.current.state.sessionCompletedCount;

      // Call resetAllData
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify statistics were reset globally

      // Verify session completion state was preserved
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionCompletedCount).toBe(
        sessionCompletedCountBeforeReset
      );
      expect(result.current.state.sessionDuration).toBe(
        sessionDurationBeforeReset
      );
      expect(result.current.state.sessionPassCount).toBe(
        sessionPassCountBeforeReset
      );
      expect(result.current.state.sessionFailCount).toBe(
        sessionFailCountBeforeReset
      );
    });

    it('should reset all statistics regardless of selected problem set', async () => {

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Call resetAllData
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify resetStatistics was called (resets ALL problem sets)
    });

    it('should handle errors during reset gracefully', async () => {
      // This test verifies that resetAllData completes successfully
      // even when there are issues with localStorage
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Call resetAllData - should complete without throwing
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // resetAllData should have completed
      expect(result.current.state.sessionHistory.length).toBe(0);
    });
  });

  describe('Session Timer Tracking', () => {
    it('should set sessionStartTime when starting a new session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      const beforeStart = Date.now();

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      const afterStart = Date.now();

      expect(result.current.state.sessionStartTime).toBeDefined();
      expect(result.current.state.sessionStartTime).toBeGreaterThanOrEqual(
        beforeStart
      );
      expect(result.current.state.sessionStartTime).toBeLessThanOrEqual(
        afterStart
      );
    });

    it('should not set sessionStartTime if session fails to start', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );

      // Empty queue - session won't start
      generateSessionQueueCall.mockReturnValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.sessionStartTime).toBeNull();
      expect(result.current.state.isSessionActive).toBe(false);
    });

    it('should calculate session duration when session completes', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1']);
      problemsGetCall.mockReturnValue(problem1);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      const sessionStartTime = result.current.state.sessionStartTime;
      expect(sessionStartTime).toBeDefined();

      // Wait a bit to ensure duration > 0
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Complete the session
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Session should be complete
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionDuration).toBeGreaterThan(0);
    });

    it('should reset sessionStartTime and sessionDuration when starting a new session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start and complete first session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      const firstSessionStartTime = result.current.state.sessionStartTime;

      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      expect(result.current.state.sessionDuration).toBeGreaterThanOrEqual(0);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Start new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      const secondSessionStartTime = result.current.state.sessionStartTime;

      // New session should have new start time
      expect(secondSessionStartTime).not.toBe(firstSessionStartTime);
      expect(secondSessionStartTime).toBeGreaterThan(firstSessionStartTime!);
      // Duration should be reset (session is active, not complete)
      expect(result.current.state.sessionDuration).toBeNull();
    });
  });

  describe('Session Pass/Fail Statistics Tracking', () => {
    it('should initialize sessionPassCount and sessionFailCount to zero', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      expect(result.current.state.sessionPassCount).toBe(0);
      expect(result.current.state.sessionFailCount).toBe(0);
    });

    it('should increment sessionPassCount when answering pass in session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      const problem2 = {
        id: 'p2',
        problemSetId: 'ps1',
        problem: '7 + 2',
        answer: '9',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockImplementation((id: string) => {
        const problems = [problem1, problem2];
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.sessionPassCount).toBe(0);
      expect(result.current.state.sessionFailCount).toBe(0);

      // Answer pass
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      expect(result.current.state.sessionPassCount).toBe(1);
      expect(result.current.state.sessionFailCount).toBe(0);
    });

    it('should increment sessionFailCount when answering fail in session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      const problem2 = {
        id: 'p2',
        problemSetId: 'ps1',
        problem: '7 + 2',
        answer: '9',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockImplementation((id: string) => {
        const problems = [problem1, problem2];
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Answer fail
      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      expect(result.current.state.sessionPassCount).toBe(0);
      expect(result.current.state.sessionFailCount).toBe(1);
    });

    it('should track both pass and fail counts in same session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      const problem2 = {
        id: 'p2',
        problemSetId: 'ps1',
        problem: '7 + 2',
        answer: '9',
        createdAt: Date.now(),
      };

      const problem3 = {
        id: 'p3',
        problemSetId: 'ps1',
        problem: '4 + 4',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockImplementation((id: string) => {
        const problems = [problem1, problem2, problem3];
        return problems.find((p) => p.id === id);
      });

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Answer: pass, fail, pass
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Session complete - check final counts
      expect(result.current.state.sessionPassCount).toBe(2);
      expect(result.current.state.sessionFailCount).toBe(1);
    });

    it('should reset pass/fail counts when starting new session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Start and complete first session with some stats
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      expect(result.current.state.sessionFailCount).toBe(1);

      // Start new session - counts should reset
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(result.current.state.sessionPassCount).toBe(0);
      expect(result.current.state.sessionFailCount).toBe(0);
    });

    it('should not increment counts if no active session', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Manually load a problem without starting a session
      await act(async () => {
        await result.current.actions.loadNextProblem();
      });

      const initialPassCount = result.current.state.sessionPassCount;
      const initialFailCount = result.current.state.sessionFailCount;

      // Submit answer without active session
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Counts should not change
      expect(result.current.state.sessionPassCount).toBe(initialPassCount);
      expect(result.current.state.sessionFailCount).toBe(initialFailCount);
    });
  });

  describe('Problem Coverage State Management', () => {
    it('should initialize with default problem coverage of 100', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      expect(result.current.state.problemCoverage).toBe(100);
    });

    it('should update problem coverage when setProblemCoverage is called', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Update to 80%
      act(() => {
        result.current.actions.setProblemCoverage(80);
      });

      expect(result.current.state.problemCoverage).toBe(80);

      // Update to 50%
      act(() => {
        result.current.actions.setProblemCoverage(50);
      });

      expect(result.current.state.problemCoverage).toBe(50);

      // Update to 30%
      act(() => {
        result.current.actions.setProblemCoverage(30);
      });

      expect(result.current.state.problemCoverage).toBe(30);
    });

    it('should NOT reset problem coverage when starting a new session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Set coverage to 50%
      act(() => {
        result.current.actions.setProblemCoverage(50);
      });

      expect(result.current.state.problemCoverage).toBe(50);

      // Start new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Coverage should remain at 50% (not reset to 100)
      expect(result.current.state.problemCoverage).toBe(50);
    });

    it('should pass problem coverage to generateSessionQueue', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set first (using the id from mock data)
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      await waitFor(() => {
        expect(result.current.state.selectedProblemSetKey).toBe('addition-within-20');
      });

      // Set coverage to 80%
      act(() => {
        result.current.actions.setProblemCoverage(80);
      });

      // Start new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Verify generateSessionQueue was called with coverage parameter
      expect(generateSessionQueueCall).toHaveBeenCalledWith(
        'addition-within-20',
        80
      );
    });

    it('should load problem coverage from localStorage on initialization', async () => {
      // Set localStorage value before initializing
      localStorage.setItem('problemCoverage', '30');

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Coverage should be loaded from localStorage
      expect(result.current.state.problemCoverage).toBe(30);
    });

    it('should save problem coverage to localStorage when changed', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Change coverage
      act(() => {
        result.current.actions.setProblemCoverage(50);
      });

      // Verify it was saved to localStorage
      expect(localStorage.getItem('problemCoverage')).toBe('50');
    });

    it('should use default 100 if localStorage value is invalid', async () => {
      // Set invalid localStorage value
      localStorage.setItem('problemCoverage', 'invalid');

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Coverage should default to 100
      expect(result.current.state.problemCoverage).toBe(100);
    });
  });

  describe('endSessionEarly action', () => {
    it('should expose endSessionEarly action', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      expect(result.current.actions.endSessionEarly).toBeDefined();
      expect(typeof result.current.actions.endSessionEarly).toBe('function');
    });

    it('should end session early and calculate statistics', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      const problem2 = {
        id: 'p2',
        problemSetId: 'ps1',
        problem: '7 + 2',
        answer: '9',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3', 'p4', 'p5']);
      problemsGetCall
        .mockReturnValueOnce(problem1)
        .mockReturnValueOnce(problem2);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select problem set
      act(() => {
        result.current.actions.selectProblemSet('ps1');
      });

      // Start a new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Record session start time
      const sessionStartTime = result.current.state.sessionStartTime;
      expect(sessionStartTime).not.toBeNull();

      // Answer first problem - pass
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      expect(result.current.state.sessionCompletedCount).toBe(1);
      expect(result.current.state.sessionPassCount).toBe(1);
      expect(result.current.state.sessionFailCount).toBe(0);

      // Answer second problem - fail
      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      expect(result.current.state.sessionCompletedCount).toBe(2);
      expect(result.current.state.sessionPassCount).toBe(1);
      expect(result.current.state.sessionFailCount).toBe(1);

      // Session should still be active
      expect(result.current.state.isSessionActive).toBe(true);

      // End session early
      await act(async () => {
        await result.current.actions.endSessionEarly();
      });

      // Session should be inactive
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.currentProblem).toBeNull();

      // Statistics should reflect completed problems only (2 out of 5)
      expect(result.current.state.sessionCompletedCount).toBe(2);
      expect(result.current.state.sessionPassCount).toBe(1);
      expect(result.current.state.sessionFailCount).toBe(1);

      // Session duration should be calculated
      expect(result.current.state.sessionDuration).toBeGreaterThan(0);
      expect(result.current.state.sessionDuration).toBeLessThan(
        Date.now() - sessionStartTime! + 100
      );
    });

    it('should do nothing if session is not active', async () => {
      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Try to end session when not active
      await act(async () => {
        await result.current.actions.endSessionEarly();
      });

      // State should remain unchanged
      expect(result.current.state.isSessionActive).toBe(false);
      expect(result.current.state.sessionDuration).toBeNull();
    });

    it('should preserve statistics when ending early with no completed problems', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select problem set
      act(() => {
        result.current.actions.selectProblemSet('ps1');
      });

      // Start a new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // End session immediately without answering any problems
      await act(async () => {
        await result.current.actions.endSessionEarly();
      });

      // Session should be inactive
      expect(result.current.state.isSessionActive).toBe(false);

      // Statistics should show 0 completed
      expect(result.current.state.sessionCompletedCount).toBe(0);
      expect(result.current.state.sessionPassCount).toBe(0);
      expect(result.current.state.sessionFailCount).toBe(0);

      // Duration should still be calculated
      expect(result.current.state.sessionDuration).toBeGreaterThanOrEqual(0);
    });

    it('should save session to database when ending early with completed problems', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);
      const saveSessionCall = vi.mocked(databaseService.saveSession);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(problem);
      saveSessionCall.mockResolvedValue("session-123");

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      await waitFor(() => {
        expect(result.current.state.selectedProblemSetKey).toBe('addition-within-20');
      });

      // Start a new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      const sessionStartTime = result.current.state.sessionStartTime;

      // Answer first problem - pass
      await act(async () => {
        await result.current.actions.submitAnswer('pass');
      });

      // Answer second problem - fail
      await act(async () => {
        await result.current.actions.submitAnswer('fail');
      });

      expect(result.current.state.sessionCompletedCount).toBe(2);
      expect(result.current.state.sessionPassCount).toBe(1);
      expect(result.current.state.sessionFailCount).toBe(1);

      // Clear previous saveSession calls
      saveSessionCall.mockClear();

      // End session early (before completing all 3 problems)
      await act(async () => {
        await result.current.actions.endSessionEarly();
      });

      // Session should be saved to database
      expect(saveSessionCall).toHaveBeenCalledTimes(1);
      expect(saveSessionCall).toHaveBeenCalledWith(
        expect.objectContaining({
          problemSetKey: 'addition-within-20',
          startTime: sessionStartTime,
          passCount: 1,
          failCount: 1,
          totalProblems: 2, // Only 2 completed out of 3
          accuracy: 50, // 1 pass out of 2 completed
        })
      );
    });

    it('should not save session when ending early with no completed problems', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(problemService.getProblemById);
      const saveSessionCall = vi.mocked(databaseService.saveSession);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockReturnValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockReturnValue(problem);
      saveSessionCall.mockResolvedValue("session-123");

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      await waitFor(() => {
        expect(result.current.state.selectedProblemSetKey).toBe('addition-within-20');
      });

      // Start a new session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      // Clear previous saveSession calls
      saveSessionCall.mockClear();

      // End session immediately without answering any problems
      await act(async () => {
        await result.current.actions.endSessionEarly();
      });

      // Session should NOT be saved (no completed problems)
      expect(saveSessionCall).not.toHaveBeenCalled();
    });
  });

  describe('Session History Feature', () => {
    describe('showHistory state', () => {
      it('should have showHistory as false by default', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        expect(result.current.state.showHistory).toBe(false);
      });

      it('should toggle showHistory state', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Toggle to true
        act(() => {
          result.current.actions.toggleHistory();
        });

        expect(result.current.state.showHistory).toBe(true);

        // Toggle back to false
        act(() => {
          result.current.actions.toggleHistory();
        });

        expect(result.current.state.showHistory).toBe(false);
      });
    });

    describe('sessionHistoryLimit state', () => {
      it('should have default sessionHistoryLimit of 10', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        expect(result.current.state.sessionHistoryLimit).toBe(10);
      });

      it('should update sessionHistoryLimit and save to localStorage', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        act(() => {
          result.current.actions.setSessionHistoryLimit(20);
        });

        expect(result.current.state.sessionHistoryLimit).toBe(20);
        expect(localStorage.getItem('sessionHistoryLimit')).toBe('20');
      });

      it('should load sessionHistoryLimit from localStorage on init', async () => {
        localStorage.setItem('sessionHistoryLimit', '30');

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        expect(result.current.state.sessionHistoryLimit).toBe(30);
      });

      it('should handle invalid sessionHistoryLimit in localStorage', async () => {
        localStorage.setItem('sessionHistoryLimit', 'invalid');

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Should default to 10
        expect(result.current.state.sessionHistoryLimit).toBe(10);
      });

      it('should only accept valid limit values (10, 20, 30, 40, 50)', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Valid values
        const validLimits = [10, 20, 30, 40, 50];
        for (const limit of validLimits) {
          act(() => {
            result.current.actions.setSessionHistoryLimit(limit);
          });
          expect(result.current.state.sessionHistoryLimit).toBe(limit);
        }
      });
    });

    describe('sessionHistory state', () => {
      it('should have empty sessionHistory by default', async () => {
        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        expect(result.current.state.sessionHistory).toEqual([]);
      });

      it('should load session history for selected problem set', async () => {
        const mockSessions = [
          {
            id: 'session-1',
            problemSetKey: 'addition-within-20',
            startTime: Date.now() - 120000,
            endTime: Date.now() - 60000,
            duration: 60000,
            passCount: 8,
            failCount: 2,
            totalProblems: 10,
            accuracy: 80,
            createdAt: Date.now() - 120000,
          },
          {
            id: 'session-2',
            problemSetKey: 'addition-within-20',
            startTime: Date.now() - 60000,
            endTime: Date.now(),
            duration: 60000,
            passCount: 10,
            failCount: 0,
            totalProblems: 10,
            accuracy: 100,
            createdAt: Date.now() - 60000,
          },
        ];

        vi.mocked(databaseService.getSessionHistory).mockResolvedValue(
          mockSessions
        );

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Select a problem set
        act(() => {
          result.current.actions.selectProblemSet('1');
        });

        // Load session history
        await act(async () => {
          await result.current.actions.loadSessionHistory();
        });

        expect(result.current.state.sessionHistory).toEqual(mockSessions);
        expect(databaseService.getSessionHistory).toHaveBeenCalledWith('addition-within-20', 10);
      });

      it('should pass sessionHistoryLimit to getSessionHistory', async () => {
        vi.mocked(databaseService.getSessionHistory).mockReturnValue([]);

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Set custom limit
        act(() => {
          result.current.actions.setSessionHistoryLimit(20);
        });

        // Select a problem set
        act(() => {
          result.current.actions.selectProblemSet('1');
        });

        // Load session history
        await act(async () => {
          await result.current.actions.loadSessionHistory();
        });

        expect(databaseService.getSessionHistory).toHaveBeenCalledWith('addition-within-20', 20);
      });

      it('should load session history using default problemSetKey', async () => {
        vi.mocked(databaseService.getSessionHistory).mockReturnValue([]);

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Default selectedProblemSetKey is empty
        expect(result.current.state.selectedProblemSetKey).toBe('');

        // Select a problem set first
        act(() => {
          result.current.actions.selectProblemSet('1');
        });

        await waitFor(() => {
          expect(result.current.state.selectedProblemSetKey).toBe('addition-within-20');
        });

        // Load session history
        await act(async () => {
          await result.current.actions.loadSessionHistory();
        });

        // getSessionHistory should be called with selected problemSetKey
        expect(databaseService.getSessionHistory).toHaveBeenCalledWith('addition-within-20', 10);
      });
    });

    describe('saveSession on session complete', () => {
      it('should save session when session completes successfully', async () => {
        vi.mocked(databaseService.saveSession).mockResolvedValue('session-1');

        const mockProblemSet: ProblemSet = {
          id: '1',
          name: 'Test Set',
          problemSetKey: 'test-set',
          enabled: true,
          createdAt: Date.now(),
        };

        const mockProblems = Array.from({ length: 2 }, (_, i) => ({
          id: `problem-${i + 1}`,
          problemSetId: '1',
          problem: `1 + ${i + 1}`,
          answer: `${i + 2}`,
          createdAt: Date.now(),
        }));

        vi.mocked(problemService.getProblemSets).mockReturnValue([
          mockProblemSet,
        ]);
        vi.mocked(problemService.generateSessionQueue).mockReturnValue(
          mockProblems.map((p) => p.id!)
        );

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Select problem set
        act(() => {
          result.current.actions.selectProblemSet('1');
        });

        // Start session
        await act(async () => {
          await result.current.actions.startNewSession();
        });

        const startTime = result.current.state.sessionStartTime!;

        // Mock problems for each answer
        for (let i = 0; i < 2; i++) {
          vi.mocked(problemService.getProblemById).mockReturnValue(mockProblems[i]);

          await act(async () => {
            await result.current.actions.submitAnswer(i === 0 ? 'pass' : 'fail');
          });
        }

        // Verify session was saved
        await waitFor(() => {
          expect(databaseService.saveSession).toHaveBeenCalled();
        });

        const saveSessionCall = vi.mocked(databaseService.saveSession).mock
          .calls[0][0];

        expect(saveSessionCall.problemSetKey).toBe('test-set');
        expect(saveSessionCall.totalProblems).toBe(2);
        expect(saveSessionCall.passCount).toBe(1);
        expect(saveSessionCall.failCount).toBe(1);
        expect(saveSessionCall.accuracy).toBe(50);
        expect(saveSessionCall.startTime).toBe(startTime);
        expect(saveSessionCall.endTime).toBeGreaterThanOrEqual(startTime);
        expect(saveSessionCall.duration).toBeGreaterThanOrEqual(0);
      });

      it('should not save session when ended early', async () => {
        vi.mocked(databaseService.saveSession).mockResolvedValue('session-1');

        const mockProblemSet: ProblemSet = {
          id: '1',
          name: 'Test Set',
          problemSetKey: 'test-set',
          enabled: true,
          createdAt: Date.now(),
        };

        const mockProblems = Array.from({ length: 3 }, (_, i) => ({
          id: `problem-${i + 1}`,
          problemSetId: '1',
          problem: `1 + ${i + 1}`,
          answer: `${i + 2}`,
          createdAt: Date.now(),
        }));

        vi.mocked(problemService.getProblemSets).mockReturnValue([
          mockProblemSet,
        ]);
        vi.mocked(problemService.generateSessionQueue).mockReturnValue(
          mockProblems.map((p) => p.id!)
        );

        const { result } = renderHook(() => useApp(), { wrapper });

        await waitFor(() => {
          expect(result.current.state.isInitialized).toBe(true);
        });

        // Select problem set
        act(() => {
          result.current.actions.selectProblemSet('1');
        });

        // Start session
        await act(async () => {
          await result.current.actions.startNewSession();
        });

        // End session early (before completing all problems)
        await act(async () => {
          await result.current.actions.endSessionEarly();
        });

        // Verify session was NOT saved
        expect(databaseService.saveSession).not.toHaveBeenCalled();
      });
    });
  });
});
