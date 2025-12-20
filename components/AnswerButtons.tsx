// components/AnswerButtons.tsx
'use client';

import React from 'react';

interface AnswerButtonsProps {
  onPass: () => void;
  onFail: () => void;
  disabled: boolean;
}

export function AnswerButtons({
  onPass,
  onFail,
  disabled,
}: AnswerButtonsProps) {
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={onPass}
        disabled={disabled}
        className="h-12 rounded-lg bg-green-500 px-8 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Mark as Pass"
      >
        Pass
      </button>
      <button
        onClick={onFail}
        disabled={disabled}
        className="h-12 rounded-lg bg-red-500 px-8 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Mark as Fail"
      >
        Fail
      </button>
    </div>
  );
}
