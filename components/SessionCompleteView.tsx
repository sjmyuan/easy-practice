'use client';

import { StartSessionButton } from '@/components/StartSessionButton';
import { formatDuration } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  
  return (
    <div className="space-y-4 py-8 text-center">
      <div className="text-2xl font-bold text-[#6ECEDA]">
        🎉 {t('sessionComplete.title')}
      </div>

      {/* Session Duration */}
      {sessionDuration !== null && (
        <div className="text-xl font-semibold text-gray-700">
          {t('sessionComplete.duration')}: {formatDuration(sessionDuration)}
        </div>
      )}

      {/* Session Statistics */}
      <div className="mx-auto grid max-w-md grid-cols-3 gap-4 text-center">
        <div className="rounded-2xl bg-[#E2F0CB] p-3 shadow-md">
          <div className="text-sm font-medium text-gray-700">{t('sessionComplete.passed')}</div>
          <div className="text-2xl font-bold text-gray-800">{passCount}</div>
        </div>
        <div className="rounded-2xl bg-[#FFB7B2] p-3 shadow-md">
          <div className="text-sm font-medium text-gray-700">{t('sessionComplete.failed')}</div>
          <div className="text-2xl font-bold text-gray-800">{failCount}</div>
        </div>
        <div className="rounded-2xl bg-[#B5EAD7] p-3 shadow-md">
          <div className="text-sm font-medium text-gray-700">{t('sessionComplete.totalProblems')}</div>
          <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex w-full max-w-xs flex-col gap-3">
          <StartSessionButton
            onStart={onStartNewSession}
            disabled={isLoading}
          />
          <button
            onClick={onViewSummary}
            disabled={isLoading}
            className="h-12 w-full rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {t('preSession.viewSummary')}
          </button>
        </div>
      </div>
    </div>
  );
}
