'use client';

import { StartSessionButton } from '@/components/StartSessionButton';
import { formatDuration } from '@/lib/utils';

interface SessionCompleteViewProps {
  sessionDuration: number | null;
  passCount: number;
  failCount: number;
  totalCount: number;
  onStartNewSession: () => void;
  onViewSummary: () => void;
  isLoading: boolean;
}

export function SessionCompleteView({
  sessionDuration,
  passCount,
  failCount,
  totalCount,
  onStartNewSession,
  onViewSummary,
  isLoading,
}: SessionCompleteViewProps) {
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="text-2xl font-bold text-green-600">
        🎉 Session Complete!
      </div>

      {/* Session Duration */}
      {sessionDuration !== null && (
        <div className="text-xl font-semibold text-gray-700">
          Duration: {formatDuration(sessionDuration)}
        </div>
      )}

      {/* Session Statistics */}
      <div className="mx-auto grid max-w-md grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-green-50 p-3">
          <div className="text-sm font-medium text-green-600">Pass</div>
          <div className="text-2xl font-bold text-green-700">{passCount}</div>
        </div>
        <div className="rounded-lg bg-red-50 p-3">
          <div className="text-sm font-medium text-red-600">Fail</div>
          <div className="text-2xl font-bold text-red-700">{failCount}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-3">
          <div className="text-sm font-medium text-blue-600">Total</div>
          <div className="text-2xl font-bold text-blue-700">{totalCount}</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full max-w-xs flex-col gap-3">
          <StartSessionButton onStart={onStartNewSession} disabled={isLoading} />
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
