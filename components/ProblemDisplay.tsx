// components/ProblemDisplay.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import type { Problem } from '@/types';

interface ProblemDisplayProps {
  problem: Problem | null;
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  // Reset toggle state when problem changes
  useEffect(() => {
    setShowAnswer(false);
  }, [problem?.id]);

  if (!problem) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center p-8"
        role="region"
        aria-label="Current math problem"
      >
        <p className="text-center text-xl text-gray-500">
          Select a problem type to begin
        </p>
      </div>
    );
  }

  return (
    <div
      className="relative flex min-h-[200px] flex-col items-center justify-center p-8"
      role="region"
      aria-label="Current math problem"
    >
      <button
        onClick={() => setShowAnswer(!showAnswer)}
        className="absolute top-4 right-4 rounded-lg p-2 transition-colors hover:bg-gray-100"
        aria-label={showAnswer ? 'Hide answer' : 'Show answer'}
        type="button"
      >
        {showAnswer ? (
          <EyeOff className="h-6 w-6 text-gray-600" />
        ) : (
          <Eye className="h-6 w-6 text-gray-600" />
        )}
      </button>
      <p className="text-center text-6xl font-bold text-gray-900">
        {problem.problem}
      </p>
      {showAnswer && (
        <p className="mt-4 text-center text-2xl font-medium text-green-600">
          {problem.answer}
        </p>
      )}
    </div>
  );
}
