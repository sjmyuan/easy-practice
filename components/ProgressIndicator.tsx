// components/ProgressIndicator.tsx
'use client';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

export function ProgressIndicator({ completed, total }: ProgressIndicatorProps) {
  if (total === 0) return null;

  return (
    <div className="text-center text-gray-600 text-sm font-medium">
      {completed} / {total}
    </div>
  );
}
