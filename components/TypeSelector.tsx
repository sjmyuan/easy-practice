// components/TypeSelector.tsx
'use client';

import React from 'react';

interface TypeSelectorProps {
  selectedProblemSetKey: string;
  onChange: (problemSetKey: string) => void;
}

export function TypeSelector({
  selectedProblemSetKey,
  onChange,
}: TypeSelectorProps) {
  const handleClick = (problemSetKey: string) => {
    if (problemSetKey !== selectedProblemSetKey) {
      onChange(problemSetKey);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => handleClick('addition-within-20')}
        className={`h-12 rounded-lg px-6 font-medium transition-colors ${
          selectedProblemSetKey === 'addition-within-20'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Addition
      </button>
      <button
        type="button"
        onClick={() => handleClick('subtraction-within-20')}
        className={`h-12 rounded-lg px-6 font-medium transition-colors ${
          selectedProblemSetKey === 'subtraction-within-20'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Subtraction
      </button>
    </div>
  );
}
