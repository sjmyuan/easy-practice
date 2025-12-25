'use client';

import Image from 'next/image';
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
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/logo.svg"
          alt="Easy Practice Logo"
          width={160}
          height={120}
          priority
          className="drop-shadow-lg"
        />
        <h1
          className="text-center text-4xl font-bold bg-gradient-to-r from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] bg-clip-text text-transparent drop-shadow-md"
          data-testid="landing-title"
        >
          Easy Practice
        </h1>
      </div>

      <ProblemSetSelector
        problemSets={problemSets}
        onSelect={onSelect}
        disabled={isLoading}
      />
    </>
  );
}
