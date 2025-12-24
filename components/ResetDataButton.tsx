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
      className="h-12 w-full rounded-2xl bg-[#FF6F61] px-6 font-medium text-white shadow-lg transition-all hover:bg-[#FF5A4F] hover:shadow-xl hover:scale-105"
      aria-label="Reset Data"
    >
      Reset Data
    </button>
  );
}
