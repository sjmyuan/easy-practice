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
      className={`h-12 rounded-lg px-8 font-medium transition-colors ${
        disabled || isLoading
          ? 'cursor-not-allowed bg-gray-300 text-gray-500'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isLoading ? 'Loading...' : 'Next Problem'}
    </button>
  );
}
