import type { ProblemSet } from '@/types';

interface ProblemSetSelectorProps {
  problemSets: ProblemSet[];
  onSelect: (problemSetId: string) => void;
  disabled?: boolean;
}

export function ProblemSetSelector({
  problemSets,
  onSelect,
  disabled = false,
}: ProblemSetSelectorProps) {
  const enabledProblemSets = problemSets.filter((set) => set.enabled);

  if (enabledProblemSets.length === 0) {
    return (
      <div className="space-y-6 py-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          Choose a Problem Set
        </h2>
        <p className="text-gray-600">No problem sets available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-center text-3xl font-bold text-gray-900">
        Choose a Problem Set
      </h2>

      <div className="grid gap-4">
        {enabledProblemSets.map((problemSet) => (
          <button
            key={problemSet.id}
            onClick={() => onSelect(problemSet.id!)}
            disabled={disabled}
            className="h-auto min-h-20 w-full rounded-lg border-2 border-gray-200 bg-white p-6 text-left transition-colors hover:border-blue-500 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={problemSet.name}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">
                {problemSet.name}
              </h3>
              {problemSet.description && (
                <p className="text-sm text-gray-600">
                  {problemSet.description}
                </p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
