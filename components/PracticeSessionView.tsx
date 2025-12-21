'use client';

import { ProblemDisplay } from '@/components/ProblemDisplay';
import { AnswerButtons } from '@/components/AnswerButtons';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { SessionTimer } from '@/components/SessionTimer';
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
  return (
    <>
      {/* Session Timer */}
      {isSessionActive && (
        <SessionTimer
          sessionStartTime={sessionStartTime}
          isSessionActive={isSessionActive}
        />
      )}

      {/* Progress Indicator */}
      <ProgressIndicator
        completed={sessionCompletedCount}
        total={sessionQueueLength}
      />

      <ProblemDisplay problem={currentProblem} />

      {currentProblem && (
        <AnswerButtons onPass={onPass} onFail={onFail} disabled={isLoading} />
      )}
    </>
  );
}
