// contexts/AppContext.tsx - Global application state management
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import type { Problem, ProblemSet, StruggledProblemSummary } from '@/types';
import { databaseService, problemService } from '@/services';
import { db } from '@/lib/db';
import { RECENT_PROBLEMS_LIMIT } from '@/lib/constants';

export interface AppState {
  // Current Problem State
  currentProblem: Problem | null;
  recentProblemIds: string[];

  // Session State
  isSessionActive: boolean;
  sessionQueue: string[]; // Array of problem IDs in the session
  sessionCompletedCount: number;
  selectedProblemSetId: string | null; // Currently selected problem set
  sessionStartTime: number | null; // Timestamp when session started
  sessionDuration: number | null; // Duration in milliseconds when session completed
  sessionPassCount: number; // Number of pass answers in current session
  sessionFailCount: number; // Number of fail answers in current session

  // UI State
  selectedProblemSetKey: string;
  availableProblemSets: ProblemSet[];
  isLoading: boolean;
  showSummary: boolean;
  problemCoverage: number; // Percentage of problems to include (30, 50, 80, 100)

  // Statistics
  struggledProblems: StruggledProblemSummary[];

  // Initialization
  isInitialized: boolean;
  initializationError: string | null;
}

export interface AppActions {
  // Problem Set Actions
  importProblemSet: (file: File) => Promise<void>;
  loadProblemSets: () => Promise<void>;
  toggleProblemSet: (id: string, enabled: boolean) => Promise<void>;
  selectProblemSet: (problemSetId: string) => void;

  // Problem Actions
  loadNextProblem: () => Promise<void>;
  submitAnswer: (result: 'pass' | 'fail') => Promise<void>;

  // Session Actions
  startNewSession: () => Promise<void>;

  // Problem Set Key Selection Actions
  setProblemSetKey: (problemSetKey: string) => void;

  // Problem Coverage Actions
  setProblemCoverage: (coverage: number) => void;

  // Summary Actions
  loadStruggledProblems: () => Promise<void>;
  toggleSummary: () => void;

  // Data Management Actions
  resetAllData: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;

  // Initialization
  initializeApp: () => Promise<void>;
}

export interface AppContextValue {
  state: AppState;
  actions: AppActions;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const initialState: AppState = {
  currentProblem: null,
  recentProblemIds: [],
  isSessionActive: false,
  sessionQueue: [],
  sessionCompletedCount: 0,
  selectedProblemSetId: null,
  sessionStartTime: null,
  sessionDuration: null,
  sessionPassCount: 0,
  sessionFailCount: 0,
  selectedProblemSetKey: 'addition-within-20',
  availableProblemSets: [],
  isLoading: false,
  showSummary: false,
  struggledProblems: [],
  isInitialized: false,
  initializationError: null,
  problemCoverage: 100,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(initialState);
  const stateRef = useRef<AppState>(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        initializationError: null,
      }));

      // Always load default problem sets to ensure updates are applied
      await problemService.loadDefaultProblemSets();

      const problemSets = await databaseService.getProblemSets();

      setState((prev) => ({
        ...prev,
        availableProblemSets: problemSets,
        isInitialized: true,
        isLoading: false,
      }));

      // No longer auto-load first problem - user must start a session
    } catch (error) {
      console.error('Failed to initialize app:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to initialize application';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        initializationError: errorMessage,
        isInitialized: false,
      }));
    }
  }, []);

  const loadProblemSets = useCallback(async () => {
    const problemSets = await databaseService.getProblemSets();
    setState((prev) => ({ ...prev, availableProblemSets: problemSets }));
  }, []);

  const importProblemSet = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        await problemService.loadProblemSetFromFile(file);
        await loadProblemSets();
      } catch (error) {
        console.error('Failed to import problem set:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, loadProblemSets]
  );

  const toggleProblemSet = useCallback(
    async (id: string, enabled: boolean) => {
      try {
        await databaseService.toggleProblemSet(id, enabled);
        await loadProblemSets();
      } catch (error) {
        console.error('Failed to toggle problem set:', error);
        throw error;
      }
    },
    [loadProblemSets]
  );

  const loadNextProblem = useCallback(async () => {
    try {
      setLoading(true);

      // Get current state values from ref
      const { selectedProblemSetKey, recentProblemIds } = stateRef.current;

      const problem = await problemService.getNextProblem(
        selectedProblemSetKey,
        recentProblemIds
      );

      if (problem && problem.id) {
        setState((prev) => ({
          ...prev,
          currentProblem: problem,
          recentProblemIds: [
            problem.id!,
            ...prev.recentProblemIds.slice(0, RECENT_PROBLEMS_LIMIT - 1),
          ],
        }));
      } else {
        setState((prev) => ({ ...prev, currentProblem: null }));
      }
    } catch (error) {
      console.error('Failed to load next problem:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const submitAnswer = useCallback(
    async (result: 'pass' | 'fail') => {
      try {
        // Get current state from ref
        const {
          currentProblem,
          isSessionActive,
          sessionQueue,
          sessionCompletedCount,
          sessionStartTime,
          sessionPassCount,
          sessionFailCount,
        } = stateRef.current;
        const problemId = currentProblem?.id;

        if (!problemId) return;

        // Record the attempt
        await databaseService.recordAttempt(problemId, result);

        // If session is active, handle session-based progression
        if (isSessionActive && sessionQueue.length > 0) {
          const newCompletedCount = sessionCompletedCount + 1;

          // Update pass/fail counts
          const newPassCount =
            result === 'pass' ? sessionPassCount + 1 : sessionPassCount;
          const newFailCount =
            result === 'fail' ? sessionFailCount + 1 : sessionFailCount;

          // Check if session is complete
          if (newCompletedCount >= sessionQueue.length) {
            // Calculate session duration
            const duration = sessionStartTime
              ? Date.now() - sessionStartTime
              : 0;

            // Session complete
            setState((prev) => ({
              ...prev,
              sessionCompletedCount: newCompletedCount,
              isSessionActive: false,
              currentProblem: null,
              sessionDuration: duration,
              sessionPassCount: newPassCount,
              sessionFailCount: newFailCount,
            }));
          } else {
            // Load next problem from session queue
            const nextProblemId = sessionQueue[newCompletedCount];
            const nextProblem = await db.problems.get(nextProblemId);

            setState((prev) => ({
              ...prev,
              sessionCompletedCount: newCompletedCount,
              currentProblem: nextProblem || null,
              sessionPassCount: newPassCount,
              sessionFailCount: newFailCount,
            }));
          }
        } else {
          // No active session, use old behavior
          await loadNextProblem();
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
        throw error;
      }
    },
    [loadNextProblem]
  );

  const setProblemSetKey = useCallback((problemSetKey: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        selectedProblemSetKey: problemSetKey,
        recentProblemIds: [],
        currentProblem: null,
        // Reset session when switching problem set keys
        isSessionActive: false,
        sessionQueue: [],
        sessionCompletedCount: 0,
        sessionStartTime: null,
        sessionDuration: null,
        sessionPassCount: 0,
        sessionFailCount: 0,
        // Clear struggled problems cache when switching problem set keys
        struggledProblems: [],
      };
      // Update stateRef synchronously within setState updater
      stateRef.current = newState;
      return newState;
    });
  }, []);

  const setProblemCoverage = useCallback((coverage: number) => {
    setState((prev) => ({ ...prev, problemCoverage: coverage }));
  }, []);

  const selectProblemSet = useCallback((problemSetId: string) => {
    setState((prev) => {
      // Find the selected problem set to get its problemSetKey
      const selectedSet = prev.availableProblemSets.find(
        (ps) => ps.id === problemSetId
      );
      const problemSetKey =
        selectedSet?.problemSetKey || prev.selectedProblemSetKey;

      const newState = {
        ...prev,
        selectedProblemSetId: problemSetId,
        selectedProblemSetKey: problemSetKey, // Update problemSetKey to match selected set
        recentProblemIds: [],
        currentProblem: null,
        // Reset session when selecting problem set
        isSessionActive: false,
        sessionQueue: [],
        sessionCompletedCount: 0,
        sessionStartTime: null,
        sessionDuration: null,
        sessionPassCount: 0,
        sessionFailCount: 0,
        // Clear struggled problems cache
        struggledProblems: [],
      };
      // Update stateRef synchronously within setState updater
      stateRef.current = newState;
      return newState;
    });
  }, []);

  const startNewSession = useCallback(async () => {
    try {
      setLoading(true);

      // Get current state from ref
      const { selectedProblemSetKey, selectedProblemSetId, problemCoverage } =
        stateRef.current;

      // Generate session queue based on selected problem set or problemSetKey
      const queue = selectedProblemSetId
        ? await problemService.generateSessionQueue(
            selectedProblemSetId,
            true,
            problemCoverage
          )
        : await problemService.generateSessionQueue(
            selectedProblemSetKey,
            false,
            problemCoverage
          );

      // If no problems in queue, don't start session
      if (queue.length === 0) {
        setState((prev) => ({
          ...prev,
          isSessionActive: false,
          sessionQueue: [],
          sessionCompletedCount: 0,
          currentProblem: null,
          sessionStartTime: null,
          sessionDuration: null,
          sessionPassCount: 0,
          sessionFailCount: 0,
          problemCoverage: 100, // Reset to default
        }));
        return;
      }

      // Load first problem from queue
      const firstProblemId = queue[0];
      const firstProblem = await db.problems.get(firstProblemId);

      // Capture session start time
      const startTime = Date.now();

      // Update state with session info and first problem
      setState((prev) => ({
        ...prev,
        isSessionActive: true,
        sessionQueue: queue,
        sessionCompletedCount: 0,
        currentProblem: firstProblem || null,
        recentProblemIds: firstProblem?.id ? [firstProblem.id] : [],
        sessionStartTime: startTime,
        sessionDuration: null, // Reset duration for new session
        sessionPassCount: 0, // Reset counts for new session
        sessionFailCount: 0,
        problemCoverage: 100, // Reset to default after starting session
      }));
    } catch (error) {
      console.error('Failed to start new session:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const loadStruggledProblems = useCallback(async () => {
    try {
      setLoading(true);
      const { selectedProblemSetId } = stateRef.current;

      const problems = await databaseService.getStruggledProblems(
        20,
        selectedProblemSetId || undefined
      );
      setState((prev) => ({ ...prev, struggledProblems: problems }));
    } catch (error) {
      console.error('Failed to load struggled problems:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const toggleSummary = useCallback(() => {
    setState((prev) => ({ ...prev, showSummary: !prev.showSummary }));
  }, []);

  const resetAllData = useCallback(async () => {
    try {
      setLoading(true);
      const { selectedProblemSetId } = stateRef.current;

      // Reset statistics only for the currently selected problem set
      if (selectedProblemSetId) {
        await databaseService.resetStatisticsByProblemSetId(
          selectedProblemSetId
        );
      }
      // Only clear the struggled problems cache, preserve UI state
      setState((prev) => ({
        ...prev,
        struggledProblems: [],
      }));
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const exportData = useCallback(async () => {
    try {
      const jsonData = await databaseService.exportData();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `math-practice-export-${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
      throw error;
    }
  }, []);

  const importData = useCallback(
    async (file: File) => {
      try {
        setLoading(true);
        const text = await file.text();
        await databaseService.importData(text);
        await initializeApp();
      } catch (error) {
        console.error('Failed to import data:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, initializeApp]
  );

  // Initialize app on mount
  useEffect(() => {
    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(
    () => ({
      importProblemSet,
      loadProblemSets,
      toggleProblemSet,
      selectProblemSet,
      loadNextProblem,
      submitAnswer,
      setProblemSetKey,
      setProblemCoverage,
      startNewSession,
      loadStruggledProblems,
      toggleSummary,
      resetAllData,
      exportData,
      importData,
      initializeApp,
    }),
    [
      importProblemSet,
      loadProblemSets,
      toggleProblemSet,
      selectProblemSet,
      loadNextProblem,
      submitAnswer,
      setProblemSetKey,
      setProblemCoverage,
      startNewSession,
      loadStruggledProblems,
      toggleSummary,
      resetAllData,
      exportData,
      importData,
      initializeApp,
    ]
  );

  const contextValue: AppContextValue = useMemo(
    () => ({
      state,
      actions,
    }),
    [state, actions]
  );

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
