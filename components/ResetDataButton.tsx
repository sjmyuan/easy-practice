// components/ResetDataButton.tsx
'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResetDataButtonProps {
  onReset: () => void;
  selectedProblemSetKey?: string;
}

export function ResetDataButton({
  onReset,
}: ResetDataButtonProps) {
  const { t } = useLanguage();
  
  const handleClick = () => {
    const confirmed = window.confirm(t('settings.resetConfirm'));

    if (confirmed) {
      onReset();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="h-12 w-full rounded-2xl bg-[#FF6F61] px-6 font-medium text-white shadow-lg transition-all hover:bg-[#FF5A4F] hover:shadow-xl hover:scale-105"
      aria-label="Reset Data"
    >
      {t('settings.resetData')}
    </button>
  );
}
