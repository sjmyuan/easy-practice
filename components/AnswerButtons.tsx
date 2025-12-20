// components/AnswerButtons.tsx
'use client';

import React from 'react';

interface AnswerButtonsProps {
  onPass: () => void;
  onFail: () => void;
  disabled: boolean;
}

export function AnswerButtons({ onPass, onFail, disabled }: AnswerButtonsProps) {
  return (
    <div className="flex gap-4 justify-center">
      <button
        onClick={onPass}
        disabled={disabled}
        className="h-12 px-8 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Mark as Pass"
      >
        Pass
      </button>
      <button
        onClick={onFail}
        disabled={disabled}
        className="h-12 px-8 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        aria-label="Mark as Fail"
      >
        Fail
      </button>
    </div>
  );
}
