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
            className="h-12 w-full rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            View Summary
          </button>
        </div>
      </div>
    </div>
  );
}
