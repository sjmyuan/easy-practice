// components/ResetDataButton.tsx
'use client';

import React from 'react';

interface ResetDataButtonProps {
  onReset: () => void;
  selectedProblemSetKey?: string;
}

export function ResetDataButton({
  onReset,
  selectedProblemSetKey,
}: ResetDataButtonProps) {
  const handleClick = () => {
    const message = selectedProblemSetKey
      ? `Are you sure you want to reset all performance data for ${selectedProblemSetKey} problems? This action cannot be undone.`
      : 'Are you sure you want to reset all performance data? This action cannot be undone.';

    const confirmed = window.confirm(message);

    if (confirmed) {
      onReset();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="h-12 w-full rounded-lg bg-red-500 px-6 font-medium text-white transition-colors hover:bg-red-600"
      aria-label="Reset Data"
    >
      Reset Data
    </button>
  );
}
