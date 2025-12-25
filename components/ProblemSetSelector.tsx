import type { ProblemSet } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { t } = useLanguage();
  
  const enabledProblemSets = problemSets
    .filter((set) => set.enabled)
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'accent' })
    );

  if (enabledProblemSets.length === 0) {
    return (
      <div className="space-y-6 py-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900">
          {t('landing.title')}
        </h2>
        <p className="text-gray-600">{t('landing.noProblemSets')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-center text-3xl font-bold text-gray-800">
        {t('landing.title')}
      </h2>

      <div className="grid gap-4">
        {enabledProblemSets.map((problemSet) => (
          <button
            key={problemSet.id}
            onClick={() => onSelect(problemSet.id!)}
            disabled={disabled}
            className="h-auto min-h-20 w-full rounded-2xl border-2 border-[#FFB7B2] bg-white p-6 text-left shadow-md transition-all hover:border-[#FF9AA2] hover:bg-[#FFF5F4] hover:shadow-xl hover:scale-102 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
            aria-label={problemSet.name}
          >
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">
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
