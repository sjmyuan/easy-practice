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
      className="h-12 w-full rounded-2xl bg-[#6ECEDA] px-8 font-semibold text-white shadow-lg transition-all hover:bg-[#5DD0C8] hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:bg-gray-400 disabled:scale-100 disabled:shadow-none"
    >
      Start New Session
    </button>
  );
}
