// components/NextProblemButton.tsx
'use client';

import React from 'react';

interface NextProblemButtonProps {
  onClick: () => void;
  disabled: boolean;
  isLoading?: boolean;
}

export function NextProblemButton({ onClick, disabled, isLoading = false }: NextProblemButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`h-12 px-8 rounded-lg font-medium transition-colors ${
        disabled || isLoading
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 text-white hover:bg-blue-700'
      }`}
    >
      {isLoading ? 'Loading...' : 'Next Problem'}
    </button>
  );
}
