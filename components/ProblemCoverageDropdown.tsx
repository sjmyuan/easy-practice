// components/ProblemCoverageDropdown.tsx
'use client';

import { ChangeEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProblemCoverageDropdownProps {
  value: number; // 30, 50, 80, or 100
  onChange: (coverage: number) => void;
}

const COVERAGE_VALUES = [30, 50, 80, 100];

export function ProblemCoverageDropdown({
  value,
  onChange,
}: ProblemCoverageDropdownProps) {
  const { t } = useLanguage();

  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const coverageValue = parseInt(e.target.value, 10);
    onChange(coverageValue);
  };

  return (
    <div className="w-full">
      <label
        htmlFor="coverage-dropdown"
        className="mb-3 block text-lg font-medium text-gray-700"
      >
        {t('settings.problemCoverage')}
      </label>
      <select
        id="coverage-dropdown"
        aria-label="Problem coverage percentage"
        value={value}
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-all hover:border-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {COVERAGE_VALUES.map((coverageValue) => (
          <option key={coverageValue} value={coverageValue}>
            {coverageValue}%
          </option>
        ))}
      </select>
    </div>
  );
}
