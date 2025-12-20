// components/ProgressIndicator.tsx
'use client';

interface ProgressIndicatorProps {
  completed: number;
  total: number;
}

export function ProgressIndicator({
  completed,
  total,
}: ProgressIndicatorProps) {
  if (total === 0) return null;

  return (
    <div className="text-center text-sm font-medium text-gray-600">
      {completed} / {total}
    </div>
  );
}
