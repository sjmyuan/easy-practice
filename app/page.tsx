'use client';

import { useApp } from '@/contexts';
import { useLanguage } from '@/contexts/LanguageContext';
import { ErrorView } from '@/components/ErrorView';
import { LoadingView } from '@/components/LoadingView';
import { LandingView } from '@/components/LandingView';
import { PreSessionView } from '@/components/PreSessionView';
import { SessionCompleteView } from '@/components/SessionCompleteView';
import { PracticeSessionView } from '@/components/PracticeSessionView';
import { SummaryView } from '@/components/SummaryView';
import { SettingsIcon } from '@/components/SettingsIcon';
import { SettingsPanel } from '@/components/SettingsPanel';
import { ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import type { LocalizedContent } from '@/types';

/**
 * Get localized text from a string or LocalizedContent object
 */
function getLocalizedText(
  text: string | LocalizedContent | undefined,
  language: 'en' | 'zh'
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language] || text.en || text.zh || '';
}

export default function Home() {
  const { state, actions } = useApp();
  const { language } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleChangeProblemSet = () => {
    // Clear session and return to landing
    actions.selectProblemSet('');
  };

  const handleViewSummary = () => {
    actions.loadStruggledProblems();
    actions.toggleSummary();
  };

  if (state.initializationError) {
    return (
      <ErrorView
        message={state.initializationError}
        onRetry={() => actions.initializeApp()}
      />
    );
  }

  if (!state.isInitialized) {
    return <LoadingView />;
  }

  // Landing view - no problem set selected
  if (!state.selectedProblemSetId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
        <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
          <div className="space-y-4">
            {/* Settings Icon for Landing View */}
            <div className="flex items-center justify-end">
              <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
            </div>
            <h1
              className="text-center text-4xl font-bold bg-gradient-to-r from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] bg-clip-text text-transparent drop-shadow-md"
              data-testid="landing-title"
            >
              Easy Practice
            </h1>
            <LandingView
              problemSets={state.availableProblemSets}
              onSelect={(problemSetId) => actions.selectProblemSet(problemSetId)}
              isLoading={state.isLoading}
            />
          </div>
        </div>

        <SettingsPanel
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          problemCoverage={state.problemCoverage}
          onProblemCoverageChange={actions.setProblemCoverage}
          onResetData={actions.resetAllData}
        />
      </main>
    );
  }

  // Get selected problem set name for display
  const selectedProblemSet = state.availableProblemSets.find(
    (ps) => ps.id === state.selectedProblemSetId
  );
  const pageTitle = getLocalizedText(selectedProblemSet?.name, language) || 'Easy Practice';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        <div className="space-y-4">
          {/* Navigation Row */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleChangeProblemSet}
              className="rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:text-blue-600"
              aria-label="Back to landing page"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
            {!state.isSessionActive && (
              <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
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

      {state.showSummary && (
        <SummaryView
          problems={state.struggledProblems}
          onClose={actions.toggleSummary}
        />
      )}

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        problemCoverage={state.problemCoverage}
        onProblemCoverageChange={actions.setProblemCoverage}
        onResetData={actions.resetAllData}
        selectedProblemSetKey={state.selectedProblemSetKey}
      />
    </main>
  );
}
