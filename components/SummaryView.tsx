// components/SummaryView.tsx
'use client';

import React, { useState } from 'react';
import type { StruggledProblemSummary } from '@/types';

interface SummaryViewProps {
  problems: StruggledProblemSummary[];
  onClose: () => void;
}

export function SummaryView({ problems, onClose }: SummaryViewProps) {
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  if (problems.length === 0) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        role="region"
        aria-label="Summary of struggled problems"
      >
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Struggled Problems</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
              aria-label="Close summary"
            >
              ×
            </button>
          </div>
          <p className="text-center text-gray-500 py-8">No struggled problems found.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="region"
      aria-label="Summary of struggled problems"
    >
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Struggled Problems</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Close summary"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {problems.map((problem) => (
            <div key={problem.problemId} className="border border-gray-200 rounded-lg p-4">
              <button
                onClick={() =>
                  setSelectedProblemId(
                    selectedProblemId === problem.problemId ? null : problem.problemId
                  )
                }
                className="w-full text-left"
                aria-label={`View details for ${problem.problem}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-xl font-semibold text-gray-900">
                      {problem.problem} = {problem.answer}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Failed {problem.failCount} {problem.failCount === 1 ? 'time' : 'times'} ({Math.round(problem.failureRate * 100)}%)
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
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Total Attempts:</span> {problem.totalAttempts}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Pass Count:</span>{' '}
                    {problem.totalAttempts - problem.failCount}
                  </p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Category:</span>{' '}
                    {problem.category.charAt(0).toUpperCase() + problem.category.slice(1)}
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
