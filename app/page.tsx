'use client';

import { useApp } from '@/contexts';
import { ProblemSetSelector } from '@/components/ProblemSetSelector';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { state, actions } = useApp();
  const router = useRouter();

  const handleProblemSetSelect = (problemSetId: string) => {
    actions.selectProblemSet(problemSetId);
    router.push('/practice');
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Easy Practice
        </h1>

        <ProblemSetSelector
          problemSets={state.availableProblemSets}
          onSelect={handleProblemSetSelect}
          disabled={state.isLoading}
        />
      </div>
    </main>
  );
}
