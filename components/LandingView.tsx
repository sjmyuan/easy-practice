'use client';

import { ProblemSetSelector } from '@/components/ProblemSetSelector';
import type { ProblemSet } from '@/types';

interface LandingViewProps {
  problemSets: ProblemSet[];
  onSelect: (problemSetId: string) => void;
  isLoading: boolean;
}

export function LandingView({
  problemSets,
  onSelect,
  isLoading,
}: LandingViewProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-center text-3xl font-bold text-gray-900">
          Easy Practice
        </h1>

        <ProblemSetSelector
          problemSets={problemSets}
          onSelect={onSelect}
          disabled={isLoading}
        />
      </div>
    </main>
  );
}
