// components/ProblemDisplay.tsx
'use client';

import React from 'react';
import type { Problem } from '@/types';

interface ProblemDisplayProps {
  problem: Problem | null;
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
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
      className="flex min-h-[200px] items-center justify-center p-8"
      role="region"
      aria-label="Current math problem"
    >
      <p className="text-center text-6xl font-bold text-gray-900">
        {problem.problem}
      </p>
    </div>
  );
}
