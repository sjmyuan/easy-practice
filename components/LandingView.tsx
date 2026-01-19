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
    <>
      <ProblemSetSelector
        problemSets={problemSets}
        onSelect={onSelect}
        disabled={isLoading}
      />
    </>
  );
}
