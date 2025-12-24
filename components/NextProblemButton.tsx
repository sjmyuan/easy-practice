// components/NextProblemButton.tsx
'use client';

import React from 'react';

interface NextProblemButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export function NextProblemButton({
  onClick,
  disabled,
  isLoading = false,
}: NextProblemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`h-12 rounded-2xl px-8 font-medium shadow-lg transition-all ${
        disabled || isLoading
          ? 'cursor-not-allowed bg-gray-300 text-gray-500 shadow-none'
          : 'bg-[#4A90E2] text-white hover:bg-[#3A80D2] hover:shadow-xl hover:scale-105'
      }`}
    >
      {isLoading ? 'Loading...' : 'Next Problem'}
    </button>
  );
}
