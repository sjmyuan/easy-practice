// components/ResetDataButton.tsx
'use client';

import React from 'react';

interface ResetDataButtonProps {
  onReset: () => void;
}

export function ResetDataButton({ onReset }: ResetDataButtonProps) {
  const handleClick = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset all performance data? This action cannot be undone.'
    );

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
