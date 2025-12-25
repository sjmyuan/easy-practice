'use client';

import Image from 'next/image';
import { useState } from 'react';
import { ProblemSetSelector } from '@/components/ProblemSetSelector';
import { SettingsIcon } from '@/components/SettingsIcon';
import { SettingsPanel } from '@/components/SettingsPanel';
import { useApp } from '@/contexts';
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
  const { state, actions } = useApp();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#FF9AA2] via-[#FFDAC1] to-[#B5EAD7] p-8">
      <div className="relative w-full max-w-2xl space-y-8 rounded-3xl bg-white/95 p-8 shadow-2xl backdrop-blur-sm">
        {/* Settings Icon in top-right corner */}
        <div className="absolute top-4 right-4">
          <SettingsIcon onClick={() => setIsSettingsOpen(true)} />
        </div>

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
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        problemCoverage={state.problemCoverage}
        onProblemCoverageChange={actions.setProblemCoverage}
        onResetData={actions.resetAllData}
      />
    </main>
  );
}
