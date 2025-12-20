'use client';

import { useApp } from '@/contexts';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { SummaryView } from '@/components/SummaryView';
import { ResetDataButton } from '@/components/ResetDataButton';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { StartSessionButton } from '@/components/StartSessionButton';
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

  // Auto-start session when problem set is selected
  useEffect(() => {
    if (
      state.isInitialized &&
      state.selectedProblemSetId &&
      !state.isSessionActive &&
      state.sessionCompletedCount === 0
    ) {
      actions.startNewSession();
    }
  }, [
    state.isInitialized,
    state.selectedProblemSetId,
    state.isSessionActive,
    state.sessionCompletedCount,
    actions,
  ]);

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Math Practice
        </h1>

        {/* Session-based UI */}
        {state.isSessionActive ? (
          <>
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

            {/* Change Problem Set button during session */}
            <div className="flex justify-center border-t border-gray-200 pt-4">
              <button
                onClick={handleChangeProblemSet}
                className="h-12 rounded-lg bg-gray-500 px-6 font-medium text-white transition-colors hover:bg-gray-600"
              >
                Change Problem Set
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Session Complete or Not Started */}
            {state.sessionCompletedCount > 0 ? (
              <div className="space-y-4 py-8 text-center">
                <div className="text-2xl font-bold text-green-600">
                  🎉 Session Complete!
                </div>
                <p className="text-gray-600">
                  You completed {state.sessionCompletedCount} problem
                  {state.sessionCompletedCount !== 1 ? 's' : ''}
                </p>
                <div className="flex justify-center gap-4">
                  <StartSessionButton
                    onStart={actions.startNewSession}
                    disabled={state.isLoading}
                  />
                  <button
                    onClick={handleChangeProblemSet}
                    className="h-12 rounded-lg bg-gray-500 px-8 font-semibold text-white transition-colors hover:bg-gray-600"
                  >
                    Change Problem Set
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <p className="text-gray-600">Loading session...</p>
              </div>
            )}
          </>
        )}

        {/* Bottom Actions */}
        <div className="flex justify-center gap-4 border-t border-gray-200 pt-4">
          <button
            onClick={() => {
              actions.loadStruggledProblems();
              actions.toggleSummary();
            }}
            className="h-12 rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600"
          >
            View Summary
          </button>
          <ResetDataButton
            onReset={actions.resetAllData}
            selectedType={state.selectedType}
          />
        </div>
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
