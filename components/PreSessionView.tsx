'use client';

import { StartSessionButton } from '@/components/StartSessionButton';

interface PreSessionViewProps {
  onStart: () => void;
  onViewSummary: () => void;
  isLoading: boolean;
}

export function PreSessionView({
  onStart,
  onViewSummary,
  isLoading,
}: PreSessionViewProps) {
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full max-w-xs flex-col gap-3">
          <StartSessionButton onStart={onStart} disabled={isLoading} />
          <button
            onClick={onViewSummary}
            disabled={isLoading}
            className="h-12 w-full rounded-2xl bg-[#4A90E2] px-6 font-medium text-white shadow-lg transition-all hover:bg-[#3A80D2] hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
}
