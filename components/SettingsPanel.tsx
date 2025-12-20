// components/SettingsPanel.tsx
'use client';

import { X } from 'lucide-react';
import { ProblemCoverageSlider } from './ProblemCoverageSlider';
import { ResetDataButton } from './ResetDataButton';

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
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        data-testid="settings-backdrop"
        className="fixed inset-0 z-40 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel */}
      <div
        role="dialog"
        aria-labelledby="settings-title"
        className="fixed right-0 top-0 z-50 h-full w-96 transform bg-white shadow-2xl transition-transform duration-300 ease-in-out translate-x-0"
      >
        <div className="flex h-full flex-col p-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <h2 id="settings-title" className="text-2xl font-bold text-gray-900">
              Settings
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
