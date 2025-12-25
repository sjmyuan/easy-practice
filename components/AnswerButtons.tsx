// components/AnswerButtons.tsx
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnswerButtonsProps {
  onPass: () => void;
  onFail: () => void;
  disabled: boolean;
}

export function AnswerButtons({
  onPass,
  onFail,
  disabled,
}: AnswerButtonsProps) {
  const { t } = useLanguage();
  
  return (
    <div className="flex justify-center gap-4">
      <button
        onClick={onFail}
        disabled={disabled}
        className="h-12 rounded-2xl bg-[#FF6F61] px-8 font-semibold text-white shadow-lg transition-all hover:bg-[#FF5A4F] hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
        aria-label="Mark as Fail"
      >
        {t('session.fail')}
      </button>
      <button
        onClick={onPass}
        disabled={disabled}
        className="h-12 rounded-2xl bg-[#6ECEDA] px-8 font-semibold text-white shadow-lg transition-all hover:bg-[#5DD0C8] hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
        aria-label="Mark as Pass"
      >
        {t('session.pass')}
      </button>
    </div>
  );
}
