'use client';

import { useApp } from '@/contexts';
import { useLanguage } from '@/contexts/LanguageContext';
import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { LandingView } from '@/components/LandingView';
import { PreSessionView } from '@/components/PreSessionView';
import { SessionCompleteView } from '@/components/SessionCompleteView';
import { PracticeSessionView } from '@/components/PracticeSessionView';
import { HistoryView } from '@/components/HistoryView';
import { SettingsIcon } from '@/components/SettingsIcon';
import { CloseSessionIcon } from '@/components/CloseSessionIcon';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ChevronLeft } from 'lucide-react';
import { useState, useCallback, useMemo, useEffect } from 'react';
import type { LocalizedContent } from '@/types';

/**
 * Get localized text from a string or LocalizedContent object
 * Memoized to avoid recreation on every render
 */
const getLocalizedText = (
  text: string | LocalizedContent | undefined,
  language: 'en' | 'zh'
): string => {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language] || text.en || text.zh || '';
};

export default function Home() {
  const { state, actions } = useApp();
  const { language, t } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Memoize callbacks to prevent unnecessary re-renders
  const handleChangeProblemSet = useCallback(() => {
    actions.selectProblemSet('');
  }, [actions]);

  const handleViewSummary = useCallback(() => {
    actions.loadSessionHistory();
    actions.toggleHistory();
  }, [actions]);

  const handleCloseSession = useCallback(() => {
    const confirmed = window.confirm(t('session.closeSessionConfirm'));
    if (confirmed) {
      actions.endSessionEarly();
    }
  }, [actions, t]);

  const handleSettingsOpen = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  // Memoize expensive computations
  const isLandingView = useMemo(
    () => !state.selectedProblemSetKey || state.selectedProblemSetKey === '',
    [state.selectedProblemSetKey]
  );

  const selectedProblemSet = useMemo(
    () => state.availableProblemSets.find(
      (ps) => ps.problemSetKey === state.selectedProblemSetKey
    ),
    [state.availableProblemSets, state.selectedProblemSetKey]
  );

  const pageTitle = useMemo(
    () => getLocalizedText(selectedProblemSet?.name, language) || 'Easy Practice',
    [selectedProblemSet?.name, language]
  );

  // Auto-dismiss non-critical error messages after 5 seconds
  // Don't auto-dismiss critical errors (initialization, storage) - require user acknowledgment
  useEffect(() => {
    if (state.errorMessage) {
      // Check if this is a critical error that should not be auto-dismissed
      const isCriticalError = 
        state.errorMessage.toLowerCase().includes('initialization') ||
        state.errorMessage.toLowerCase().includes('initialize') ||
        state.errorMessage.toLowerCase().includes('storage quota') ||
        state.errorMessage.toLowerCase().includes('storage access') ||
        state.errorMessage.toLowerCase().includes('private browsing');
      
      if (!isCriticalError) {
        const timer = setTimeout(() => {
          actions.clearError();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [state.errorMessage, actions]);

  if (state.initializationError) {
    return (
      <ErrorView
        message={state.initializationError}
        onRetry={() => actions.initializeApp()}
      />
    );  }

  if (!state.isInitialized) {
    return <LoadingView />;
  }

  // Landing view - when selectedProblemSetKey is empty
  if (isLandingView) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
        <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-4">
            {/* Settings Icon for Landing View */}
            <div className="flex items-center justify-end">
              <SettingsIcon onClick={handleSettingsOpen} />
            </div>
            <LandingView
              problemSets={state.availableProblemSets}
              onSelect={(problemSetId) => actions.selectProblemSet(problemSetId)}
              isLoading={state.isLoading}
            />
          </div>
        </div>

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          problemCoverage={state.problemCoverage}
          onProblemCoverageChange={actions.setProblemCoverage}
          onResetData={actions.resetAllData}
          sessionHistoryLimit={state.sessionHistoryLimit}
          onSessionHistoryLimitChange={actions.setSessionHistoryLimit}
        />
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
      {/* Error Notification Toast */}
      {state.errorMessage && (
        <div
          className="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform rounded-lg bg-red-500 px-6 py-3 text-white shadow-lg"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center gap-2">
            <span>{state.errorMessage}</span>
            <button
              onClick={actions.clearError}
              className="ml-2 rounded p-1 hover:bg-red-600"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        <div className="space-y-4">
          {/* Navigation Row */}
          <div className="flex items-center justify-between">
            {!state.isSessionActive && (
              <button
                onClick={handleChangeProblemSet}
                className="rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:text-blue-600"
                aria-label="Back to landing page"
              >
                <ChevronLeft className="h-8 w-8" />
              </button>
            )}
            {state.isSessionActive && <div />}
            {state.isSessionActive ? (
              <CloseSessionIcon onClick={handleCloseSession} />
            ) : (
              <SettingsIcon onClick={handleSettingsOpen} />
            )}
          </div>

          {/* Title Row */}
          <h1 className="text-center text-2xl font-bold text-gray-900 sm:text-3xl">
            {pageTitle}
          </h1>
        </div>

        {/* View-based UI */}
        {state.isSessionActive ? (
          <PracticeSessionView
            sessionStartTime={state.sessionStartTime}
            isSessionActive={state.isSessionActive}
            sessionCompletedCount={state.sessionCompletedCount}
            sessionQueueLength={state.sessionQueue.length}
            currentProblem={state.currentProblem}
            onPass={() => actions.submitAnswer('pass')}
            onFail={() => actions.submitAnswer('fail')}
            isLoading={state.isLoading}
          />
        ) : state.sessionCompletedCount > 0 ? (
          <SessionCompleteView
            sessionDuration={state.sessionDuration}
            passCount={state.sessionPassCount}
            failCount={state.sessionFailCount}
            totalCount={state.sessionCompletedCount}
            onStartNewSession={actions.startNewSession}
            onViewSummary={handleViewSummary}
            isLoading={state.isLoading}
          />
        ) : (
          <PreSessionView
            onStart={actions.startNewSession}
            onViewSummary={handleViewSummary}
            isLoading={state.isLoading}
          />
        )}
      </div>

      {/* Session History View */}
      {state.showHistory && (
        <HistoryView
          sessions={state.sessionHistory}
          onClose={actions.toggleHistory}
        />
      )}

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={handleSettingsClose}
        problemCoverage={state.problemCoverage}
        onProblemCoverageChange={actions.setProblemCoverage}
        onResetData={actions.resetAllData}
        selectedProblemSetKey={state.selectedProblemSetKey}
        sessionHistoryLimit={state.sessionHistoryLimit}
        onSessionHistoryLimitChange={actions.setSessionHistoryLimit}
      />
    </main>
  );
}
