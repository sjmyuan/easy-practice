'use client';

import { useApp } from '@/contexts';
import { TypeSelector } from '@/components/TypeSelector';
import { ProblemDisplay } from '@/components/ProblemDisplay';
import { NextProblemButton } from '@/components/NextProblemButton';
import { useEffect } from 'react';

export default function Home() {
  const { state, actions } = useApp();

  useEffect(() => {
    if (!state.isInitialized) {
      actions.initializeApp();
    }
  }, [state.isInitialized, actions]);

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

        <div className="flex justify-center">
          <NextProblemButton
            onClick={actions.loadNextProblem}
            disabled={state.isLoading}
            isLoading={state.isLoading}
          />
        </div>
      </div>
    </main>
  );
}
