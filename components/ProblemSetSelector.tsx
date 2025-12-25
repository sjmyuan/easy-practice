import type { ProblemSet, LocalizedContent } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProblemSetSelectorProps {
  problemSets: ProblemSet[];
  onSelect: (problemSetId: string) => void;
  disabled?: boolean;
}

/**
 * Get localized text from a string or LocalizedContent object
 */
function getLocalizedText(
  text: string | LocalizedContent | undefined,
  language: 'en' | 'zh'
): string {
  if (!text) return '';
  if (typeof text === 'string') return text;
  return text[language] || text.en || text.zh || '';
}

export function ProblemSetSelector({
  problemSets,
  onSelect,
  disabled = false,
}: ProblemSetSelectorProps) {
  const { t, language } = useLanguage();
  
  const enabledProblemSets = problemSets
    .filter((set) => set.enabled)
    .sort((a, b) => {
      const nameA = getLocalizedText(a.name, language);
      const nameB = getLocalizedText(b.name, language);
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'accent' });
    });

  if (enabledProblemSets.length === 0) {
    return (
      <div className="space-y-6 py-8 text-center">
        <h2 className="text-3xl font-bold text-gray-900" data-testid="problem-set-selector-title">
          {t('landing.title')}
        </h2>
        <p className="text-gray-600">{t('landing.noProblemSets')}</p>
        <div data-testid="problem-set-list" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 
        className="text-center text-3xl font-bold text-gray-800"
        data-testid="problem-set-selector-title"
      >
        {t('landing.title')}
      </h2>

      <div className="grid gap-4" data-testid="problem-set-list">
        {enabledProblemSets.map((problemSet) => {
          const name = getLocalizedText(problemSet.name, language);
          const description = getLocalizedText(problemSet.description, language);

          return (
            <button
              key={problemSet.id}
              onClick={() => onSelect(problemSet.id!)}
              disabled={disabled}
              className="h-auto min-h-20 w-full rounded-2xl border-2 border-[#FFB7B2] bg-white p-6 text-left shadow-md transition-all hover:border-[#FF9AA2] hover:bg-[#FFF5F4] hover:shadow-xl hover:scale-102 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100"
              aria-label={name}
              data-testid={`problem-set-button-${problemSet.problemSetKey}`}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {name}
                </h3>
                <p className="text-sm text-gray-600">{description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
