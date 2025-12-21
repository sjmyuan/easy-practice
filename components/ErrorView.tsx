'use client';

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

export function ErrorView({ message, onRetry }: ErrorViewProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <p className="text-xl text-red-600">Error: {message}</p>
        <button
          onClick={onRetry}
          className="h-12 rounded-lg bg-blue-500 px-6 font-medium text-white transition-colors hover:bg-blue-600"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
