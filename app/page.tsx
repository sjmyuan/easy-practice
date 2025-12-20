'use client';

import { useApp } from '@/contexts';
import { TypeSelector } from '@/components/TypeSelector';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { SummaryView } from '@/components/SummaryView';
import { ResetDataButton } from '@/components/ResetDataButton';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { StartSessionButton } from '@/components/StartSessionButton';

export default function Home() {
  const { state, actions } = useApp();

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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Math Practice
        </h1>

        <div className="flex justify-center">
          <TypeSelector
            selectedType={state.selectedType}
            onChange={actions.setType}
          />
        </div>

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
                <StartSessionButton
                  onStart={actions.startNewSession}
                  disabled={state.isLoading}
                />
              </div>
            ) : (
              <div className="space-y-4 py-8 text-center">
                <p className="text-gray-600">
                  Start a new practice session to begin
                </p>
                <StartSessionButton
                  onStart={actions.startNewSession}
                  disabled={state.isLoading}
                />
              </div>
            )}
          </>
        )}

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
