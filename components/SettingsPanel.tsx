// components/SettingsPanel.tsx
'use client';

import { X } from 'lucide-react';
import { ProblemCoverageSlider } from './ProblemCoverageSlider';
import { ResetDataButton } from './ResetDataButton';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  problemCoverage: number;
  onProblemCoverageChange: (coverage: number) => void;
  totalProblems: number;
  onResetData: () => void;
  selectedProblemSetKey?: string;
}

export function SettingsPanel({
  isOpen,
  onClose,
  problemCoverage,
  onProblemCoverageChange,
  totalProblems,
  onResetData,
  selectedProblemSetKey,
}: SettingsPanelProps) {
  const { t } = useLanguage();
  
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="settings-backdrop"
        className="bg-opacity-50 fixed inset-0 z-40 bg-black opacity-100 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Centered Modal */}
      <div
        role="dialog"
        aria-labelledby="settings-title"
        className="fixed top-1/2 left-1/2 z-50 h-full w-full -translate-x-1/2 -translate-y-1/2 scale-100 transform bg-white opacity-100 shadow-2xl transition-all duration-300 ease-in-out max-sm:h-full max-sm:w-full sm:h-auto sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl"
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2
              id="settings-title"
              className="text-2xl font-bold text-gray-900"
            >
              {t('settings.title')}
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close settings"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 space-y-6 overflow-y-auto">
            {/* Problem Coverage Slider */}
            <div>
              <ProblemCoverageSlider
                value={problemCoverage}
                onChange={onProblemCoverageChange}
                totalProblems={totalProblems}
              />
            </div>

            {/* Reset Data Button */}
            <div>
              <ResetDataButton
                onReset={onResetData}
                selectedProblemSetKey={selectedProblemSetKey}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
