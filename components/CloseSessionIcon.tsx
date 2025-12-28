// components/CloseSessionIcon.tsx
'use client';

import { X } from 'lucide-react';

interface CloseSessionIconProps {
  onClick: () => void;
}

export function CloseSessionIcon({ onClick }: CloseSessionIconProps) {
  return (
    <button
      onClick={onClick}
      className="min-h-[48px] rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:text-red-600"
      aria-label="Close session"
    >
      <X className="h-8 w-8" />
    </button>
  );
}
