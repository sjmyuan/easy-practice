// components/SummaryView.tsx
'use client';

import React, { useState } from 'react';
import type { StruggledProblemSummary } from '@/types';

interface SummaryViewProps {
  problems: StruggledProblemSummary[];
  onClose: () => void;
}

export function SummaryView({ problems, onClose }: SummaryViewProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(
    null
  );

  if (problems.length === 0) {
    return (
      <div
        className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        role="region"
        aria-label="Summary of struggled problems"
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              Struggled Problems
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Close summary"
            >
              ×
            </button>
          </div>
          <p className="py-8 text-center text-gray-500">
            No struggled problems found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      role="region"
      aria-label="Summary of struggled problems"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            Struggled Problems
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Close summary"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {problems.map((problem) => (
            <div
              key={problem.problemId}
              className="rounded-lg border border-gray-200 p-4"
            >
              <button
                onClick={() =>
                  setSelectedProblemId(
                    selectedProblemId === problem.problemId
                      ? null
                      : problem.problemId
                  )
                }
                className="w-full text-left"
                aria-label={`View details for ${problem.problem}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-900">
                      {problem.problem} = {problem.answer}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      Failed {problem.failCount}{' '}
                      {problem.failCount === 1 ? 'time' : 'times'} (
                      {Math.round(problem.failureRate * 100)}%)
                    </p>
                  </div>
                  <div className="ml-4">
                    <span className="text-xs text-gray-500">
                      {selectedProblemId === problem.problemId ? '▼' : '▶'}
                    </span>
                  </div>
                </div>
              </button>

              {selectedProblemId === problem.problemId && (
                <div className="mt-4 space-y-2 border-t border-gray-200 pt-4">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Total Attempts:</span>{' '}
                    {problem.totalAttempts}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Pass Count:</span>{' '}
                    {problem.totalAttempts - problem.failCount}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Problem Set:</span>{' '}
                    {problem.problemSetKey}
                  </p>
                  {problem.lastAttemptedAt && (
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Last Attempted:</span>{' '}
                      {new Date(problem.lastAttemptedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
