// contexts/AppContext.tsx - Global application state management
'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
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

  // UI State
  selectedType: string;
  availableProblemSets: ProblemSet[];
  isLoading: boolean;
  showSummary: boolean;

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

  // Problem Actions
  loadNextProblem: () => Promise<void>;
  submitAnswer: (result: 'pass' | 'fail') => Promise<void>;

  // Session Actions
  startNewSession: () => Promise<void>;

  // Type Selection Actions
  setType: (type: string) => void;

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
  selectedType: 'addition',
  availableProblemSets: [],
  isLoading: false,
  showSummary: false,
  struggledProblems: [],
  isInitialized: false,
  initializationError: null,
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
      setState((prev) => ({ ...prev, isLoading: true, initializationError: null }));

      const hasProblems = await problemService.hasProblems();

      if (!hasProblems) {
        await problemService.loadDefaultProblemSets();
      }

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
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize application';
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

  const importProblemSet = useCallback(async (file: File) => {
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
  }, [setLoading, loadProblemSets]);

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
      const { selectedType, recentProblemIds } = stateRef.current;
      
      const problem = await problemService.getNextProblem(
        selectedType,
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
        const { currentProblem, isSessionActive, sessionQueue, sessionCompletedCount } = stateRef.current;
        const problemId = currentProblem?.id;
        
        if (!problemId) return;

        // Record the attempt
        await databaseService.recordAttempt(problemId, result);

        // If session is active, handle session-based progression
        if (isSessionActive && sessionQueue.length > 0) {
          const newCompletedCount = sessionCompletedCount + 1;
          
          // Check if session is complete
          if (newCompletedCount >= sessionQueue.length) {
            // Session complete
            setState((prev) => ({
              ...prev,
              sessionCompletedCount: newCompletedCount,
              isSessionActive: false,
              currentProblem: null,
            }));
          } else {
            // Load next problem from session queue
            const nextProblemId = sessionQueue[newCompletedCount];
            const nextProblem = await db.problems.get(nextProblemId);
            
            setState((prev) => ({
              ...prev,
              sessionCompletedCount: newCompletedCount,
              currentProblem: nextProblem || null,
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

  const setType = useCallback((type: string) => {
    setState((prev) => ({
      ...prev,
      selectedType: type,
      recentProblemIds: [],
      currentProblem: null,
      // Reset session when switching types
      isSessionActive: false,
      sessionQueue: [],
      sessionCompletedCount: 0,
    }));
  }, []);

  const startNewSession = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current state from ref
      const { selectedType } = stateRef.current;
      
      // Generate session queue
      const queue = await problemService.generateSessionQueue(selectedType);
      
      // If no problems in queue, don't start session
      if (queue.length === 0) {
        setState((prev) => ({
          ...prev,
          isSessionActive: false,
          sessionQueue: [],
          sessionCompletedCount: 0,
          currentProblem: null,
        }));
        return;
      }
      
      // Load first problem from queue
      const firstProblemId = queue[0];
      const firstProblem = await db.problems.get(firstProblemId);
      
      // Update state with session info and first problem
      setState((prev) => ({
        ...prev,
        isSessionActive: true,
        sessionQueue: queue,
        sessionCompletedCount: 0,
        currentProblem: firstProblem || null,
        recentProblemIds: firstProblem?.id ? [firstProblem.id] : [],
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
      const problems = await databaseService.getStruggledProblems(20);
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
      await databaseService.resetStatistics();
      setState((prev) => ({
        ...prev,
        struggledProblems: [],
        recentProblemIds: [],
        currentProblem: null,
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
      loadNextProblem,
      submitAnswer,
      setType,
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
      loadNextProblem,
      submitAnswer,
      setType,
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

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
