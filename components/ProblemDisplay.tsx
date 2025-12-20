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
        className="flex items-center justify-center min-h-[200px] p-8"
        role="region"
        aria-label="Current math problem"
      >
        <p className="text-xl text-gray-500 text-center">
          Select a problem type to begin
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex items-center justify-center min-h-[200px] p-8"
      role="region"
      aria-label="Current math problem"
    >
      <p className="text-6xl font-bold text-gray-900 text-center">
        {problem.problem}
      </p>
    </div>
  );
}
