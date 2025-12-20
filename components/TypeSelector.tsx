// components/TypeSelector.tsx
'use client';

import React from 'react';

interface TypeSelectorProps {
  selectedType: string;
  onChange: (type: string) => void;
}

export function TypeSelector({ selectedType, onChange }: TypeSelectorProps) {
  const handleClick = (type: string) => {
    if (type !== selectedType) {
      onChange(type);
    }
  };

  return (
    <div className="flex gap-4">
      <button
        type="button"
        onClick={() => handleClick('addition')}
        className={`h-12 px-6 rounded-lg font-medium transition-colors ${
          selectedType === 'addition'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Addition
      </button>
      <button
        type="button"
        onClick={() => handleClick('subtraction')}
        className={`h-12 px-6 rounded-lg font-medium transition-colors ${
          selectedType === 'subtraction'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        Subtraction
      </button>
    </div>
  );
}
