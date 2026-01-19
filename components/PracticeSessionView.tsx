'use client';

import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { SessionTimer } from '@/components/SessionTimer';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Problem } from '@/types';

interface PracticeSessionViewProps {
  sessionStartTime: number | null;
  isSessionActive: boolean;
  sessionCompletedCount: number;
  sessionQueueLength: number;
  currentProblem: Problem | null;
  onPass: () => void;
  onFail: () => void;
  isLoading: boolean;
}

export function PracticeSessionView({
  sessionStartTime,
  isSessionActive,
  sessionCompletedCount,
  sessionQueueLength,
  currentProblem,
  onPass,
  onFail,
  isLoading,
}: PracticeSessionViewProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-full min-h-0 w-full">
      {/* Screen reader announcements for progress */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {t('session.progress')}: {sessionCompletedCount} {t('session.of')} {sessionQueueLength}
      </div>

      {/* Header: Session Timer & Progress Indicator */}
      <div className="flex flex-col items-center gap-1 py-2 px-2 bg-transparent text-xs opacity-70 select-none">
        {isSessionActive && (
          <SessionTimer
            sessionStartTime={sessionStartTime}
            isSessionActive={isSessionActive}
          />
        )}
        <ProgressIndicator
          completed={sessionCompletedCount}
          total={sessionQueueLength}
        />
      </div>

      {/* Main: ProblemDisplay */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ProblemDisplay problem={currentProblem} />
      </div>

      {/* Footer: AnswerButtons */}
      <div className="py-3 px-2 flex justify-center">
        {currentProblem && (
          <AnswerButtons onPass={onPass} onFail={onFail} disabled={isLoading} />
        )}
      </div>
    </div>
  );
}
