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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
      <div className="w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Image
            src="/logo.svg"
            alt="Easy Practice Logo"
            width={160}
            height={120}
            priority
            className="drop-shadow-lg"
          />
          <h1 className="text-center text-4xl font-bold text-gray-800">
            Easy Practice
          </h1>
        </div>

        <ProblemSetSelector
          problemSets={problemSets}
          onSelect={onSelect}
          disabled={isLoading}
        />
      </div>
    </main>
  );
}
