// components/StartSessionButton.tsx
'use client';

interface StartSessionButtonProps {
  onStart: () => void;
  disabled?: boolean;
}

export function StartSessionButton({ onStart, disabled = false }: StartSessionButtonProps) {
  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
    >
      Start New Session
    </button>
  );
}
