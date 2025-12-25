// tests/unit/contexts/AppContext.test.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor, cleanup } from '@testing-library/react';
import { AppProvider, useApp } from '@/contexts/AppContext';
import { databaseService, problemService } from '@/services';
import { db } from '@/lib/db';
import type { ReactNode } from 'react';

// Mock the services
vi.mock('@/services', () => ({
  databaseService: {
    getProblemSets: vi.fn(),
    toggleProblemSet: vi.fn(),
    recordAttempt: vi.fn(),
    getStruggledProblems: vi.fn(),
    resetStatistics: vi.fn(),
    resetStatisticsByProblemSetId: vi.fn(),
    exportData: vi.fn(),
    importData: vi.fn(),
  },
  problemService: {
    hasProblems: vi.fn(),
    loadDefaultProblemSets: vi.fn(),
    getNextProblem: vi.fn(),
    loadProblemSetFromFile: vi.fn(),
    generateSessionQueue: vi.fn(),
  },
}));

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    problems: {
      get: vi.fn(),
    },
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
        problemSetKey: 'addition-within-20',
        enabled: true,
        createdAt: Date.now(),
      },
    ]);
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
      const getProblemSetsCall = vi.mocked(databaseService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockResolvedValue([]);

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
      const getProblemSetsCall = vi.mocked(databaseService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockResolvedValue([]);

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
      const getProblemSetsCall = vi.mocked(databaseService.getProblemSets);

      loadDefaultCall.mockResolvedValue(undefined);
      getProblemSetsCall.mockResolvedValue([]);

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
      hasProblemsCall.mockResolvedValue(true);

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
        result.current.actions.toggleSummary();
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

      getNextProblemCall.mockResolvedValue({
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
      getNextProblemCall.mockResolvedValue(null);

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const firstProblem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockResolvedValue(firstProblem);
      generateSessionQueueCall.mockResolvedValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockResolvedValue(firstProblem);

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const firstProblem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockResolvedValue(firstProblem);
      generateSessionQueueCall.mockResolvedValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockResolvedValue(firstProblem);

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '10 - 5',
        answer: '5',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      problemsGetCall.mockResolvedValue(problem);

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
        false,
        100
      );
    });

    it('should handle empty session queue', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      generateSessionQueueCall.mockResolvedValue([]);

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      (problemsGetCall as any).mockImplementation(async (criteria: any) => {
        return problems.find((p) => p.id === criteria) || null;
      });
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2', 'p3']);
      (problemsGetCall as any).mockImplementation(async (criteria: any) => {
        return problems.find((p) => p.id === criteria) || null;
      });
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      (problemsGetCall as any).mockImplementation(async (criteria: any) => {
        return problems.find((p) => p.id === criteria) || null;
      });
      recordAttemptCall.mockResolvedValue();

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
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockResolvedValue(problem);
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2', 'p3']);
      problemsGetCall.mockResolvedValue(problem);

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      problemsGetCall.mockResolvedValue(problem);

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

  describe('Issue C: Clear struggled problems cache on type switch', () => {
    it('should clear struggledProblems array when switching types', async () => {
      const mockStruggledProblems = [
        {
          problemId: '1',
          problem: '1 + 1',
          answer: '2',
          problemSetKey: 'addition-within-20',
          failCount: 2,
          totalAttempts: 5,
          failureRate: 0.4,
          lastAttemptedAt: Date.now(),
          priority: 60,
        },
      ];

      vi.mocked(databaseService.getStruggledProblems).mockResolvedValue(
        mockStruggledProblems
      );

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Load struggled problems for addition
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify struggled problems are loaded
      expect(result.current.state.struggledProblems).toHaveLength(1);
      expect(result.current.state.struggledProblems[0].problemSetKey).toBe(
        'addition-within-20'
      );

      // Switch type to subtraction
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Struggled problems should be cleared
      expect(result.current.state.struggledProblems).toEqual([]);
    });

    it('should clear struggledProblems when switching from subtraction to addition', async () => {
      const mockStruggledProblems = [
        {
          problemId: '2',
          problem: '10 - 5',
          answer: '5',
          problemSetKey: 'subtraction-within-20',
          failCount: 3,
          totalAttempts: 7,
          failureRate: 0.43,
          lastAttemptedAt: Date.now(),
          priority: 70,
        },
      ];

      vi.mocked(databaseService.getStruggledProblems).mockResolvedValue(
        mockStruggledProblems
      );

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Switch to subtraction first
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Load struggled problems for subtraction
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify struggled problems are loaded
      expect(result.current.state.struggledProblems).toHaveLength(1);
      expect(result.current.state.struggledProblems[0].problemSetKey).toBe(
        'subtraction-within-20'
      );

      // Switch type back to addition
      act(() => {
        result.current.actions.setProblemSetKey('addition');
      });

      // Struggled problems should be cleared
      expect(result.current.state.struggledProblems).toEqual([]);
    });

    it('should require loading struggled problems after switching types', async () => {
      const additionProblems = [
        {
          problemId: '1',
          problem: '1 + 1',
          answer: '2',
          problemSetKey: 'addition-within-20',
          failCount: 2,
          totalAttempts: 5,
          failureRate: 0.4,
          lastAttemptedAt: Date.now(),
          priority: 60,
        },
      ];

      const subtractionProblems = [
        {
          problemId: '2',
          problem: '10 - 5',
          answer: '5',
          problemSetKey: 'subtraction-within-20',
          failCount: 3,
          totalAttempts: 7,
          failureRate: 0.43,
          lastAttemptedAt: Date.now(),
          priority: 70,
        },
      ];

      const getStruggledProblemsCall = vi.mocked(
        databaseService.getStruggledProblems
      );
      getStruggledProblemsCall
        .mockResolvedValueOnce(additionProblems)
        .mockResolvedValueOnce(subtractionProblems);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Load addition struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      expect(result.current.state.struggledProblems).toEqual(additionProblems);

      // Switch to subtraction
      act(() => {
        result.current.actions.setProblemSetKey('subtraction');
      });

      // Struggled problems should be cleared
      expect(result.current.state.struggledProblems).toEqual([]);

      // Load subtraction struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Should now have subtraction problems
      expect(result.current.state.struggledProblems).toEqual(
        subtractionProblems
      );
    });
  });

  describe('Reset Data by Type', () => {
    it('should reset statistics for ALL problem sets', async () => {
      const resetStatisticsCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatistics = resetStatisticsCall;

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
      expect(resetStatisticsCall).toHaveBeenCalledTimes(1);

      // Verify only struggledProblems cache was cleared
      expect(result.current.state.struggledProblems).toEqual([]);
    });

    it('should preserve currentProblem and session state after reset', async () => {
      const resetStatisticsCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatistics = resetStatisticsCall;

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
      expect(resetStatisticsCall).toHaveBeenCalledTimes(1);
      expect(result.current.state.struggledProblems).toEqual([]);

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
      const resetStatisticsCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatistics = resetStatisticsCall;

      const mockProblem = {
        id: '1',
        problem: '2 + 3',
        answer: 5,
        problemSetKey: 'addition-within-10',
      };

      vi.mocked(db.problems.get).mockResolvedValue(mockProblem);

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
      expect(resetStatisticsCall).toHaveBeenCalledTimes(1);
      expect(result.current.state.struggledProblems).toEqual([]);

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
      const resetStatisticsCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatistics = resetStatisticsCall;

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
      expect(resetStatisticsCall).toHaveBeenCalledTimes(1);
    });

    it('should handle errors during reset gracefully', async () => {
      const resetStatisticsCall = vi
        .fn()
        .mockRejectedValue(new Error('Reset failed'));
      vi.mocked(databaseService).resetStatistics = resetStatisticsCall;

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Call resetAllData which should throw
      await expect(
        act(async () => {
          await result.current.actions.resetAllData();
        })
      ).rejects.toThrow('Reset failed');

      // Verify error was logged
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Failed to reset data:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Issue B: loadStruggledProblems passes selectedProblemSetId to database', () => {
    it('should call getStruggledProblems with the selected problem set ID when loading struggled problems', async () => {
      const getStruggledProblemsCall = vi.mocked(
        databaseService.getStruggledProblems
      );
      getStruggledProblemsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify getStruggledProblems was called with the problem set ID
      expect(getStruggledProblemsCall).toHaveBeenCalledWith(20, '1');
    });

    it('should call getStruggledProblems without ID when no problem set is selected', async () => {
      const getStruggledProblemsCall = vi.mocked(
        databaseService.getStruggledProblems
      );
      getStruggledProblemsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // No problem set selected (selectedProblemSetId is null)
      expect(result.current.state.selectedProblemSetId).toBeNull();

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify getStruggledProblems was called without a problem set ID (all problems)
      expect(getStruggledProblemsCall).toHaveBeenCalledWith(20, undefined);
    });

    it('should update struggledProblems state with filtered results', async () => {
      const mockStruggledProblems = [
        {
          problemId: '1',
          problem: '5 - 3',
          answer: '2',
          problemSetKey: 'subtraction-within-20',
          failCount: 2,
          totalAttempts: 5,
          failureRate: 0.4,
          lastAttemptedAt: Date.now(),
          priority: 60,
        },
      ];

      vi.mocked(databaseService.getStruggledProblems).mockResolvedValue(
        mockStruggledProblems
      );

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Select a problem set
      act(() => {
        result.current.actions.selectProblemSet('1');
      });

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify state was updated with filtered results
      expect(result.current.state.struggledProblems).toEqual(
        mockStruggledProblems
      );
    });
  });

  describe('Session Timer Tracking', () => {
    it('should set sessionStartTime when starting a new session', async () => {
      const generateSessionQueueCall = vi.mocked(
        problemService.generateSessionQueue
      );
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      problemsGetCall.mockResolvedValue(problem);

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
      generateSessionQueueCall.mockResolvedValue([]);

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

      const problem1 = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1']);
      problemsGetCall.mockResolvedValue(problem1);
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1']);
      problemsGetCall.mockResolvedValue(problem);
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      (problemsGetCall as any).mockImplementation((criteria: any) => {
        const problems = [problem1, problem2];
        return Promise.resolve(problems.find((p) => p.id === criteria) || null);
      });
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      (problemsGetCall as any).mockImplementation((criteria: any) => {
        const problems = [problem1, problem2];
        return Promise.resolve(problems.find((p) => p.id === criteria) || null);
      });
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

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

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2', 'p3']);
      (problemsGetCall as any).mockImplementation((criteria: any) => {
        const problems = [problem1, problem2, problem3];
        return Promise.resolve(problems.find((p) => p.id === criteria) || null);
      });
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1']);
      problemsGetCall.mockResolvedValue(problem);
      recordAttemptCall.mockResolvedValue();

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
      const recordAttemptCall = vi.mocked(databaseService.recordAttempt);
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      getNextProblemCall.mockResolvedValue(problem);
      recordAttemptCall.mockResolvedValue();

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      problemsGetCall.mockResolvedValue(problem);

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
      const problemsGetCall = vi.mocked(db.problems.get);

      const problem = {
        id: 'p1',
        problemSetId: 'ps1',
        problem: '5 + 3',
        answer: '8',
        createdAt: Date.now(),
      };

      generateSessionQueueCall.mockResolvedValue(['p1', 'p2']);
      problemsGetCall.mockResolvedValue(problem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
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
        false,
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
});
