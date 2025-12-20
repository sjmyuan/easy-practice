// components/ResetDataButton.tsx
'use client';

import React from 'react';

interface ResetDataButtonProps {
  onReset: () => void;
  selectedType?: string;
}

export function ResetDataButton({ onReset, selectedType }: ResetDataButtonProps) {
  const handleClick = () => {
    const message = selectedType
      ? `Are you sure you want to reset all performance data for ${selectedType} problems? This action cannot be undone.`
      : 'Are you sure you want to reset all performance data? This action cannot be undone.';

    const confirmed = window.confirm(message);

    if (confirmed) {
      onReset();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="h-12 rounded-lg bg-red-500 px-6 font-medium text-white transition-colors hover:bg-red-600"
      aria-label="Reset Data"
    >
      Reset Data
    </button>
  );
}
