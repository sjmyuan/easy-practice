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
        <div className="text-center space-y-4">
          <p className="text-xl text-red-600">Error: {state.initializationError}</p>
          <button
            onClick={() => actions.initializeApp()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
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
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 space-y-8">
        <h1 className="text-3xl font-bold text-center text-gray-900">
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
              <div className="text-center space-y-4 py-8">
                <div className="text-2xl font-bold text-green-600">
                  🎉 Session Complete!
                </div>
                <p className="text-gray-600">
                  You completed {state.sessionCompletedCount} problem{state.sessionCompletedCount !== 1 ? 's' : ''}
                </p>
                <StartSessionButton
                  onStart={actions.startNewSession}
                  disabled={state.isLoading}
                />
              </div>
            ) : (
              <div className="text-center space-y-4 py-8">
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

        <div className="flex justify-center gap-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              actions.loadStruggledProblems();
              actions.toggleSummary();
            }}
            className="px-4 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
          >
            View Summary
          </button>
          <ResetDataButton onReset={actions.resetAllData} />
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
