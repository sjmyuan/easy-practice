// components/StartSessionButton.tsx
'use client';

interface StartSessionButtonProps {
  onStart: () => void;
  disabled?: boolean;
}

export function StartSessionButton({
  onStart,
  disabled = false,
}: StartSessionButtonProps) {
  return (
    <button
      onClick={onStart}
      disabled={disabled}
      className="h-12 w-full rounded-lg bg-green-500 px-8 font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
    >
      Start New Session
    </button>
  );
}
