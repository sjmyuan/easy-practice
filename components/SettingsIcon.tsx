// components/SettingsIcon.tsx
'use client';

import { Settings } from 'lucide-react';

interface SettingsIconProps {
  onClick: () => void;
}

export function SettingsIcon({ onClick }: SettingsIconProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg p-2 text-gray-600 transition-all hover:scale-110 hover:text-blue-600"
      aria-label="Settings"
    >
      <Settings className="h-8 w-8" />
    </button>
  );
}
