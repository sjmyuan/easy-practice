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
      className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition-colors"
      aria-label="Reset Data"
    >
      Reset Data
    </button>
  );
}
