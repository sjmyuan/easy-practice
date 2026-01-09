// components/SettingsPanel.tsx
'use client';

import { X } from 'lucide-react';
import { ProblemCoverageDropdown } from './ProblemCoverageDropdown';
import { ResetDataButton } from './ResetDataButton';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '@/contexts/LanguageContext';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  problemCoverage: number;
  onProblemCoverageChange: (coverage: number) => void;
  onResetData: () => void;
  selectedProblemSetKey?: string;
  sessionHistoryLimit?: number;
  onSessionHistoryLimitChange?: (limit: number) => void;
}

export function SettingsPanel({
  isOpen,
  onClose,
  problemCoverage,
  onProblemCoverageChange,
  onResetData,
  selectedProblemSetKey,
  sessionHistoryLimit,
  onSessionHistoryLimitChange,
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
            {/* Language Selector */}
            <div>
              <label className="mb-3 block text-lg font-medium text-gray-700">
                {t('settings.language')}
              </label>
              <LanguageSelector />
            </div>

            {/* Problem Coverage Dropdown */}
            <div>
              <ProblemCoverageDropdown
                value={problemCoverage}
                onChange={onProblemCoverageChange}
              />
            </div>

            {/* Session History Limit Dropdown */}
            {sessionHistoryLimit !== undefined && onSessionHistoryLimitChange && (
              <div>
                <label 
                  htmlFor="session-history-limit"
                  className="mb-3 block text-lg font-medium text-gray-700"
                >
                  {t('settings.sessionHistoryLimit')}
                </label>
                <select
                  id="session-history-limit"
                  aria-label="Session history limit"
                  value={sessionHistoryLimit}
                  onChange={(e) => onSessionHistoryLimitChange(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={40}>40</option>
                  <option value={50}>50</option>
                </select>
              </div>
            )}

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
