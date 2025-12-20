// tests/unit/contexts/AppContext.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
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
        type: 'addition',
        enabled: true,
        createdAt: Date.now(),
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
      await waitFor(
        () => {
          expect(result.current.state.isInitialized).toBe(true);
        },
        { timeout: 3000 }
      );

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
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Should NOT auto-load problem - user must start a session
      expect(result.current.state.currentProblem).toBeNull();
    });

    it('should not call getNextProblem during initialization', async () => {
      const getNextProblemCall = vi.mocked(problemService.getNextProblem);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      await new Promise((resolve) => setTimeout(resolve, 200));

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
      await new Promise((resolve) => setTimeout(resolve, 200));

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
        result.current.actions.setType('subtraction');
      });

      // Start session
      await act(async () => {
        await result.current.actions.startNewSession();
      });

      expect(generateSessionQueueCall).toHaveBeenCalledWith(
        'subtraction',
        false
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
      problemsGetCall.mockImplementation(async (id: string) => {
        return problems.find((p) => p.id === id) || null;
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
      problemsGetCall.mockImplementation(async (id: string) => {
        return problems.find((p) => p.id === id) || null;
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
      problemsGetCall.mockImplementation(async (id: string) => {
        return problems.find((p) => p.id === id) || null;
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
        result.current.actions.setType('subtraction');
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
        result.current.actions.setType('subtraction');
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
          category: 'addition',
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
      expect(result.current.state.struggledProblems[0].category).toBe('addition');

      // Switch type to subtraction
      act(() => {
        result.current.actions.setType('subtraction');
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
          category: 'subtraction',
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
        result.current.actions.setType('subtraction');
      });

      // Load struggled problems for subtraction
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify struggled problems are loaded
      expect(result.current.state.struggledProblems).toHaveLength(1);
      expect(result.current.state.struggledProblems[0].category).toBe('subtraction');

      // Switch type back to addition
      act(() => {
        result.current.actions.setType('addition');
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
          category: 'addition',
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
          category: 'subtraction',
          failCount: 3,
          totalAttempts: 7,
          failureRate: 0.43,
          lastAttemptedAt: Date.now(),
          priority: 70,
        },
      ];

      const getStruggledProblemsCall = vi.mocked(databaseService.getStruggledProblems);
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
        result.current.actions.setType('subtraction');
      });

      // Struggled problems should be cleared
      expect(result.current.state.struggledProblems).toEqual([]);

      // Load subtraction struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Should now have subtraction problems
      expect(result.current.state.struggledProblems).toEqual(subtractionProblems);
    });
  });

  describe('Reset Data by Type', () => {
    it('should reset statistics only for the selected problem type', async () => {
      const resetStatisticsByTypeCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatisticsByType =
        resetStatisticsByTypeCall;

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Set type to addition
      act(() => {
        result.current.actions.setType('addition');
      });

      // Call resetAllData (which should now reset by type)
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify resetStatisticsByType was called with the selected type
      expect(resetStatisticsByTypeCall).toHaveBeenCalledWith('addition');
      expect(resetStatisticsByTypeCall).toHaveBeenCalledTimes(1);

      // Verify state was cleared
      expect(result.current.state.struggledProblems).toEqual([]);
      expect(result.current.state.recentProblemIds).toEqual([]);
      expect(result.current.state.currentProblem).toBeNull();
    });

    it('should use the current selectedType when resetting', async () => {
      const resetStatisticsByTypeCall = vi.fn().mockResolvedValue(undefined);
      vi.mocked(databaseService).resetStatisticsByType =
        resetStatisticsByTypeCall;

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Set type to subtraction
      act(() => {
        result.current.actions.setType('subtraction');
      });

      // Call resetAllData
      await act(async () => {
        await result.current.actions.resetAllData();
      });

      // Verify resetStatisticsByType was called with subtraction
      expect(resetStatisticsByTypeCall).toHaveBeenCalledWith('subtraction');
    });

    it('should handle errors during reset gracefully', async () => {
      const resetStatisticsByTypeCall = vi
        .fn()
        .mockRejectedValue(new Error('Reset failed'));
      vi.mocked(databaseService).resetStatisticsByType =
        resetStatisticsByTypeCall;

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
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

  describe('Issue B: loadStruggledProblems passes selectedType to database', () => {
    it('should call getStruggledProblems with the selected type when loading struggled problems', async () => {
      const getStruggledProblemsCall = vi.mocked(databaseService.getStruggledProblems);
      getStruggledProblemsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Set type to subtraction
      act(() => {
        result.current.actions.setType('subtraction');
      });

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify getStruggledProblems was called with 'subtraction' type
      expect(getStruggledProblemsCall).toHaveBeenCalledWith(20, 'subtraction');
    });

    it('should call getStruggledProblems with addition type when addition is selected', async () => {
      const getStruggledProblemsCall = vi.mocked(databaseService.getStruggledProblems);
      getStruggledProblemsCall.mockResolvedValue([]);

      const { result } = renderHook(() => useApp(), { wrapper });

      await waitFor(() => {
        expect(result.current.state.isInitialized).toBe(true);
      });

      // Default type is 'addition'
      expect(result.current.state.selectedType).toBe('addition');

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify getStruggledProblems was called with 'addition' type
      expect(getStruggledProblemsCall).toHaveBeenCalledWith(20, 'addition');
    });

    it('should update struggledProblems state with filtered results', async () => {
      const mockStruggledProblems = [
        {
          problemId: '1',
          problem: '5 - 3',
          answer: '2',
          category: 'subtraction',
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

      // Set type to subtraction
      act(() => {
        result.current.actions.setType('subtraction');
      });

      // Load struggled problems
      await act(async () => {
        await result.current.actions.loadStruggledProblems();
      });

      // Verify state was updated with filtered results
      expect(result.current.state.struggledProblems).toEqual(mockStruggledProblems);
    });
  });
});
