'use client';

import { useApp } from '@/contexts';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { SummaryView } from '@/components/SummaryView';
import { ResetDataButton } from '@/components/ResetDataButton';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { StartSessionButton } from '@/components/StartSessionButton';
import { SessionTimer } from '@/components/SessionTimer';
import { formatDuration } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PracticePage() {
  const { state, actions } = useApp();
  const router = useRouter();

  // Redirect to landing if no problem set is selected
  useEffect(() => {
    if (state.isInitialized && !state.selectedProblemSetId) {
      router.push('/');
    }
  }, [state.isInitialized, state.selectedProblemSetId, router]);

  const handleChangeProblemSet = () => {
    // Clear session and navigate back to landing
    actions.selectProblemSet('');
    router.push('/');
  };

  if (state.initializationError) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="space-y-4 text-center">
          <p className="text-xl text-red-600">
            Error: {state.initializationError}
          </p>
          <button
            onClick={() => actions.initializeApp()}
            className="h-12 rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!state.isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show loading while redirecting to landing if no problem set is selected
  if (!state.selectedProblemSetId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  // Get selected problem set name for display
  const selectedProblemSet = state.availableProblemSets.find(
    (ps) => ps.id === state.selectedProblemSetId
  );
  const pageTitle = selectedProblemSet?.name || 'Easy Practice';

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <button
          onClick={handleChangeProblemSet}
          className="w-full text-center text-3xl font-bold text-gray-900 transition-colors hover:text-blue-600"
          aria-label="Return to landing page"
        >
          {pageTitle}
        </button>

        {/* Session-based UI */}
        {state.isSessionActive ? (
          <>
            {/* Session Timer */}
            <SessionTimer
              sessionStartTime={state.sessionStartTime}
              isSessionActive={state.isSessionActive}
            />

            {/* Progress Indicator */}
            <ProgressIndicator
              completed={state.sessionCompletedCount}
              total={state.sessionQueue.length}
            />

            <ProblemDisplay problem={state.currentProblem} />

            {state.currentProblem && (
              <AnswerButtons
                onPass={() => actions.submitAnswer('pass')}
                onFail={() => actions.submitAnswer('fail')}
                disabled={state.isLoading}
              />
            )}
          </>
        ) : (
          <>
            {/* Session Complete or Not Started */}
            {state.sessionCompletedCount > 0 ? (
              <div className="space-y-4 py-8 text-center">
                <div className="text-2xl font-bold text-green-600">
                  🎉 Session Complete!
                </div>

                {/* Session Duration */}
                {state.sessionDuration !== null && (
                  <div className="text-xl font-semibold text-gray-700">
                    Duration: {formatDuration(state.sessionDuration)}
                  </div>
                )}

                {/* Session Statistics */}
                <div className="mx-auto grid max-w-md grid-cols-3 gap-4 text-center">
                  <div className="rounded-lg bg-green-50 p-3">
                    <div className="text-sm font-medium text-green-600">
                      Pass
                    </div>
                    <div className="text-2xl font-bold text-green-700">
                      {state.sessionPassCount}
                    </div>
                  </div>
                  <div className="rounded-lg bg-red-50 p-3">
                    <div className="text-sm font-medium text-red-600">Fail</div>
                    <div className="text-2xl font-bold text-red-700">
                      {state.sessionFailCount}
                    </div>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <div className="text-sm font-medium text-blue-600">
                      Total
                    </div>
                    <div className="text-2xl font-bold text-blue-700">
                      {state.sessionCompletedCount}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <div className="flex w-full max-w-xs flex-col gap-3">
                    <StartSessionButton
                      onStart={actions.startNewSession}
                      disabled={state.isLoading}
                    />
                    <button
                      onClick={() => {
                        actions.loadStruggledProblems();
                        actions.toggleSummary();
                      }}
                      className="h-12 w-full rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      View Summary
                    </button>
                    <ResetDataButton onReset={actions.resetAllData} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex w-full max-w-xs flex-col gap-3">
                    <StartSessionButton
                      onStart={actions.startNewSession}
                      disabled={state.isLoading}
                    />
                    <button
                      onClick={() => {
                        actions.loadStruggledProblems();
                        actions.toggleSummary();
                      }}
                      className="h-12 w-full rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600"
                    >
                      View Summary
                    </button>
                    <ResetDataButton onReset={actions.resetAllData} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {state.showSummary && (
        <SummaryView
          problems={state.struggledProblems}
          onClose={actions.toggleSummary}
        />
      )}
    </main>
  );
}
