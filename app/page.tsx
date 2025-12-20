'use client';

import { useApp } from '@/contexts';
import { TypeSelector } from '@/components/TypeSelector';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { SummaryView } from '@/components/SummaryView';
import { ResetDataButton } from '@/components/ResetDataButton';

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

        <ProblemDisplay problem={state.currentProblem} />

        {state.currentProblem && (
          <AnswerButtons
            onPass={() => actions.submitAnswer('pass')}
            onFail={() => actions.submitAnswer('fail')}
            disabled={state.isLoading}
          />
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
