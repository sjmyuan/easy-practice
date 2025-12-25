// components/ProblemCoverageSlider.tsx
'use client';

import { ChangeEvent } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProblemCoverageSliderProps {
  value: number; // 30, 50, 80, or 100
  onChange: (coverage: number) => void;
  totalProblems: number;
}

const COVERAGE_VALUES = [30, 50, 80, 100];

export function ProblemCoverageSlider({
  value,
  onChange,
  totalProblems,
}: ProblemCoverageSliderProps) {
  const { t } = useLanguage();
  
  // Map percentage value to slider step (0-3)
  const valueToStep = (val: number): number => {
    return COVERAGE_VALUES.indexOf(val);
  };

  // Map slider step (0-3) to percentage value
  const stepToValue = (step: number): number => {
    return COVERAGE_VALUES[step];
  };

  const currentStep = valueToStep(value);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const step = parseInt(e.target.value, 10);
    const coverageValue = stepToValue(step);
    onChange(coverageValue);
  };

  // Calculate number of problems for current coverage
  const problemCount = Math.round((totalProblems * value) / 100);

  return (
    <div className="w-full space-y-3">
      <label
        htmlFor="coverage-slider"
        className="block text-lg font-medium text-gray-700"
      >
        {t('settings.problemCoverage')}
      </label>

      <div className="flex items-center gap-4">
        <input
          id="coverage-slider"
          type="range"
          min="0"
          max="3"
          step="1"
          value={currentStep}
          onChange={handleChange}
          aria-label="Problem coverage percentage"
          className="h-3 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200 transition-all outline-none hover:bg-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 [&::-moz-range-thumb]:h-6 [&::-moz-range-thumb]:w-6 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-blue-500 [&::-moz-range-thumb]:transition-all [&::-moz-range-thumb]:hover:scale-110 [&::-moz-range-thumb]:hover:bg-blue-600 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-blue-500 [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:hover:scale-110 [&::-webkit-slider-thumb]:hover:bg-blue-600"
        />
      </div>

      <div className="flex justify-between text-sm text-gray-600">
        <span>30%</span>
        <span>50%</span>
        <span>80%</span>
        <span>100%</span>
      </div>

      <div className="text-center text-base font-medium text-gray-800">
        {value}% ({problemCount}/{totalProblems} {t('preSession.estimatedProblems').toLowerCase()})
      </div>
    </div>
  );
}
