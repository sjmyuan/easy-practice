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
import type { Problem, ProblemSet, Session } from '@/types';
import { databaseService, problemService } from '@/services';
import { RECENT_PROBLEMS_LIMIT } from '@/lib/constants';

export interface AppState {
  // Current Problem State
  currentProblem: Problem | null;
  recentProblemIds: string[];

  // Session State
  isSessionActive: boolean;
  sessionQueue: string[]; // Array of problem IDs in the session
  sessionCompletedCount: number;
  sessionStartTime: number | null; // Timestamp when session started
  sessionDuration: number | null; // Duration in milliseconds when session completed
  sessionPassCount: number; // Number of pass answers in current session
  sessionFailCount: number; // Number of fail answers in current session

  // UI State
  selectedProblemSetKey: string;
  availableProblemSets: ProblemSet[];
  isLoading: boolean;
  showHistory: boolean;
  problemCoverage: number; // Percentage of problems to include (30, 50, 80, 100)
  sessionHistoryLimit: number; // Number of sessions to display (10, 20, 30, 40, 50)

  // Statistics
  sessionHistory: Session[];

  // Initialization
  isInitialized: boolean;
  initializationError: string | null;

  // Error Notifications
  errorMessage: string | null;
}

export interface AppActions {
  // Problem Set Actions
  selectProblemSet: (problemSetId: string) => void;

  // Problem Actions
  loadNextProblem: () => Promise<void>;
  submitAnswer: (result: 'pass' | 'fail') => Promise<void>;

  // Session Actions
  startNewSession: () => Promise<void>;
  endSessionEarly: () => Promise<void>;

  // Problem Set Key Selection Actions
  setProblemSetKey: (problemSetKey: string) => void;

  // Problem Coverage Actions
  setProblemCoverage: (coverage: number) => void;

  // History Actions
  loadSessionHistory: () => Promise<void>;
  toggleHistory: () => void;
  setSessionHistoryLimit: (limit: number) => void;

  // Data Management Actions
  resetAllData: () => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;

  // Initialization
  initializeApp: () => Promise<void>;

  // Error Handling
  clearError: () => void;
}

export interface AppContextValue {
  state: AppState;
  actions: AppActions;
}

import { 
  STORAGE_KEYS,
  DEFAULT_PROBLEM_COVERAGE,
  DEFAULT_SESSION_HISTORY_LIMIT,
  PROBLEM_COVERAGE_OPTIONS,
  SESSION_HISTORY_LIMIT_OPTIONS,
} from '@/lib/constants';

const PROBLEM_COVERAGE_KEY = STORAGE_KEYS.PROBLEM_COVERAGE;
const SESSION_HISTORY_LIMIT_KEY = STORAGE_KEYS.SESSION_HISTORY_LIMIT;

const AppContext = createContext<AppContextValue | undefined>(undefined);

// Load problem coverage from localStorage
function loadProblemCoverageFromStorage(): number {
  if (typeof window === 'undefined') {
    return 100; // Default for SSR
  }
  try {
    const stored = localStorage.getItem(PROBLEM_COVERAGE_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (PROBLEM_COVERAGE_OPTIONS.includes(parsed as typeof PROBLEM_COVERAGE_OPTIONS[number])) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load problem coverage from localStorage:', error);
  }
  return DEFAULT_PROBLEM_COVERAGE;
}

// Load session history limit from localStorage
function loadSessionHistoryLimitFromStorage(): number {
  if (typeof window === 'undefined') {
    return 10; // Default for SSR
  }
  try {
    const stored = localStorage.getItem(SESSION_HISTORY_LIMIT_KEY);
    if (stored) {
      const parsed = parseInt(stored, 10);
      if (SESSION_HISTORY_LIMIT_OPTIONS.includes(parsed as typeof SESSION_HISTORY_LIMIT_OPTIONS[number])) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load session history limit from localStorage:', error);
  }
  return DEFAULT_SESSION_HISTORY_LIMIT;
}

const initialState: AppState = {
  currentProblem: null,
  recentProblemIds: [],
  isSessionActive: false,
  sessionQueue: [],
  sessionCompletedCount: 0,
  sessionStartTime: null,
  sessionDuration: null,
  sessionPassCount: 0,
  sessionFailCount: 0,
  selectedProblemSetKey: '',
  availableProblemSets: [],
  isLoading: false,
  showHistory: false,
  sessionHistory: [],
  isInitialized: false,
  initializationError: null,
  problemCoverage: 100, // Default, will be overridden in AppProvider
  sessionHistoryLimit: 10, // Default, will be overridden in AppProvider
  errorMessage: null,
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  // Initialize state without localStorage (SSR-safe)
  const [state, setState] = useState<AppState>(initialState);
  const stateRef = useRef<AppState>(state);

  // Keep ref in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const setLoading = useCallback((isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((message: string) => {
    setState((prev) => ({ ...prev, errorMessage: message }));
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, errorMessage: null }));
  }, []);

  // Helper function to get reset session state
  const getResetSessionState = () => ({
    isSessionActive: false,
    sessionQueue: [],
    sessionCompletedCount: 0,
    sessionStartTime: null,
    sessionDuration: null,
    sessionPassCount: 0,
    sessionFailCount: 0,
  });

  const initializeApp = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: true,
        initializationError: null,
      }));

      // Always load default problem sets to ensure updates are applied
      await problemService.loadDefaultProblemSets();

      const problemSets = problemService.getProblemSets();

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
      // Prevent double submission  
      if (stateRef.current.isLoading) return;

      try {
        setLoading(true);

        // Capture current state values before setState
        const currentState = stateRef.current;
        const problemId = currentState.currentProblem?.id;
        
        if (!problemId || !currentState.isSessionActive || currentState.sessionQueue.length === 0) {
          return;
        }

        const newCompletedCount = currentState.sessionCompletedCount + 1;
        const newPassCount = result === 'pass' ? currentState.sessionPassCount + 1 : currentState.sessionPassCount;
        const newFailCount = result === 'fail' ? currentState.sessionFailCount + 1 : currentState.sessionFailCount;

        // Check if session is complete
        if (newCompletedCount >= currentState.sessionQueue.length) {
          const duration = currentState.sessionStartTime ? Date.now() - currentState.sessionStartTime : 0;
          const endTime = Date.now();
          const accuracy = currentState.sessionQueue.length > 0
            ? Math.round((newPassCount / currentState.sessionQueue.length) * 100)
            : 0;

          // Update state
          setState((prev) => ({
            ...prev,
            sessionCompletedCount: newCompletedCount,
            isSessionActive: false,
            currentProblem: null,
            sessionDuration: duration,
            sessionPassCount: newPassCount,
            sessionFailCount: newFailCount,
          }));

          // Save session to database
          if (currentState.selectedProblemSetKey && currentState.sessionStartTime) {
            const saveResult = databaseService.saveSession({
              problemSetKey: currentState.selectedProblemSetKey,
              startTime: currentState.sessionStartTime,
              endTime: endTime,
              duration: duration,
              passCount: newPassCount,
              failCount: newFailCount,
              totalProblems: currentState.sessionQueue.length,
              accuracy: accuracy,
            });
            
            if (!saveResult.success) {
              console.error('Failed to save session:', saveResult.error);
              setError(saveResult.error || 'Session completed but failed to save. Progress may be lost.');
            }
          }
        } else {
          // Load next problem from session queue
          const nextProblemId = currentState.sessionQueue[newCompletedCount];
          const nextProblem = problemService.getProblemById(nextProblemId);

          setState((prev) => ({
            ...prev,
            sessionCompletedCount: newCompletedCount,
            currentProblem: nextProblem || null,
            sessionPassCount: newPassCount,
            sessionFailCount: newFailCount,
          }));
        }
      } catch (error) {
        console.error('Failed to submit answer:', error);
        setError('Failed to submit answer. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [setLoading, setError]
  );

  const setProblemSetKey = useCallback((problemSetKey: string) => {
    setState((prev) => {
      const newState = {
        ...prev,
        selectedProblemSetKey: problemSetKey,
        recentProblemIds: [],
        currentProblem: null,
        ...getResetSessionState(),
      };
      // Update stateRef synchronously within setState updater
      stateRef.current = newState;
      return newState;
    });
  }, []);

  const setProblemCoverage = useCallback((coverage: number) => {
    // Save to localStorage
    try {
      localStorage.setItem(PROBLEM_COVERAGE_KEY, coverage.toString());
    } catch (error) {
      console.error('Failed to save problem coverage to localStorage:', error);
    }
    setState((prev) => ({ ...prev, problemCoverage: coverage }));
  }, []);

  const selectProblemSet = useCallback((problemSetId: string) => {
    setState((prev) => {
      // If empty problemSetId, clear selection (show landing view)
      if (!problemSetId || problemSetId === '') {
        const newState = {
          ...prev,
          selectedProblemSetKey: '',
          recentProblemIds: [],
          currentProblem: null,
          ...getResetSessionState(),
        };
        stateRef.current = newState;
        return newState;
      }

      // Find the selected problem set to get its problemSetKey
      const selectedSet = prev.availableProblemSets.find(
        (ps) => ps.id === problemSetId
      );
      const problemSetKey =
        selectedSet?.problemSetKey || prev.selectedProblemSetKey;

      const newState = {
        ...prev,
        selectedProblemSetKey: problemSetKey,
        recentProblemIds: [],
        currentProblem: null,
        ...getResetSessionState(),
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
      const { selectedProblemSetKey, problemCoverage } =
        stateRef.current;

      // Generate session queue based on selected problem set key
      const queue = problemService.generateSessionQueue(
        selectedProblemSetKey,
        problemCoverage
      );

      // If no problems in queue, don't start session
      if (queue.length === 0) {
        setState((prev) => ({
          ...prev,
          ...getResetSessionState(),
          currentProblem: null,
        }));
        setError('No problems available for this problem set.');
        return;
      }

      // Load first problem from queue
      const firstProblemId = queue[0];
      const firstProblem = problemService.getProblemById(firstProblemId);

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
        sessionDuration: null,
        sessionPassCount: 0,
        sessionFailCount: 0,
      }));
    } catch (error) {
      console.error('Failed to start new session:', error);
      setError('Failed to start session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const endSessionEarly = useCallback(async () => {
    try {
      setLoading(true);

      // Get current state from ref
      const {
        isSessionActive,
        sessionStartTime,
        sessionPassCount,
        sessionFailCount,
        sessionCompletedCount,
        selectedProblemSetKey,
      } = stateRef.current;

      // Only end if session is active
      if (!isSessionActive) {
        return;
      }

      // Calculate session duration
      const duration = sessionStartTime ? Date.now() - sessionStartTime : 0;
      const endTime = Date.now();
      const accuracy =
        sessionCompletedCount > 0
          ? Math.round((sessionPassCount / sessionCompletedCount) * 100)
          : 0;

      // Save session to database (even if incomplete)
      if (selectedProblemSetKey && sessionStartTime && sessionCompletedCount > 0) {
        const saveResult = databaseService.saveSession({
          problemSetKey: selectedProblemSetKey,
          startTime: sessionStartTime,
          endTime: endTime,
          duration: duration,
          passCount: sessionPassCount,
          failCount: sessionFailCount,
          totalProblems: sessionCompletedCount,
          accuracy: accuracy,
        });
        
        if (!saveResult.success) {
          console.error('Failed to save session:', saveResult.error);
          setError(saveResult.error || 'Session ended but failed to save. Progress may be lost.');
        }
      }

      // End session and preserve statistics
      setState((prev) => ({
        ...prev,
        isSessionActive: false,
        currentProblem: null,
        sessionDuration: duration,
      }));
    } catch (error) {
      console.error('Failed to end session early:', error);
      setError('Failed to end session. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError]);

  const loadSessionHistory = useCallback(async () => {
    try {
      setLoading(true);
      const { selectedProblemSetKey, sessionHistoryLimit } = stateRef.current;

      const sessions = await databaseService.getSessionHistory(
        selectedProblemSetKey,
        sessionHistoryLimit
      );
      setState((prev) => ({ ...prev, sessionHistory: sessions }));
    } catch (error) {
      console.error('Failed to load session history:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading]);

  const toggleHistory = useCallback(() => {
    setState((prev) => ({ ...prev, showHistory: !prev.showHistory }));
  }, []);

  const setSessionHistoryLimit = useCallback((limit: number) => {
    // Validate limit (must be one of the allowed values)
    if (![10, 20, 30, 40, 50].includes(limit)) {
      console.warn(`Invalid session history limit: ${limit}`);
      return;
    }

    // Save to localStorage
    localStorage.setItem(SESSION_HISTORY_LIMIT_KEY, limit.toString());

    // Update state
    setState((prev) => ({ ...prev, sessionHistoryLimit: limit }));
  }, []);

  const resetAllData = useCallback(async () => {
    try {
      setLoading(true);

      // Clear all session history from localStorage
      localStorage.removeItem('sessions');

      // Reload session history
      await loadSessionHistory();
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [setLoading, loadSessionHistory]);

  const exportData = useCallback(async () => {
    try {
      // Export only session data from localStorage
      const sessions = localStorage.getItem('sessions') || '[]';
      const exportData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        sessions: JSON.parse(sessions),
      };
      
      const jsonData = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `practice-sessions-${new Date().toISOString()}.json`;
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
        const data = JSON.parse(text);
        
        // Import sessions data
        if (data.sessions) {
          localStorage.setItem('sessions', JSON.stringify(data.sessions));
        }
        
        // Reload session history
        await loadSessionHistory();
      } catch (error) {
        console.error('Failed to import data:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [setLoading, loadSessionHistory]
  );

  // Initialize app on mount
  useEffect(() => {
    // Load localStorage values on mount (client-side only)
    setState((prev) => ({
      ...prev,
      problemCoverage: loadProblemCoverageFromStorage(),
      sessionHistoryLimit: loadSessionHistoryLimitFromStorage(),
    }));

    initializeApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const actions = useMemo(
    () => ({
      selectProblemSet,
      loadNextProblem,
      submitAnswer,
      setProblemSetKey,
      setProblemCoverage,
      startNewSession,
      endSessionEarly,
      loadSessionHistory,
      toggleHistory,
      setSessionHistoryLimit,
      resetAllData,
      exportData,
      importData,
      initializeApp,
      clearError,
    }),
    [
      selectProblemSet,
      loadNextProblem,
      submitAnswer,
      setProblemSetKey,
      setProblemCoverage,
      startNewSession,
      endSessionEarly,
      loadSessionHistory,
      toggleHistory,
      setSessionHistoryLimit,
      resetAllData,
      exportData,
      importData,
      initializeApp,
      clearError,
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
