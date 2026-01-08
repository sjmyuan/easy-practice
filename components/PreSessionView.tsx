'use client';

import { StartSessionButton } from '@/components/StartSessionButton';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  
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
            {t('preSession.viewHistory')}
          </button>
        </div>
      </div>
    </div>
  );
}
