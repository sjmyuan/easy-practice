// components/ResetDataButton.tsx
'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ResetDataButtonProps {
  onReset: () => Promise<void> | void;
  selectedProblemSetKey?: string;
}

export function ResetDataButton({
  onReset,
}: ResetDataButtonProps) {
  const { t } = useLanguage();
  const [isResetting, setIsResetting] = useState(false);
  
  const handleClick = async () => {
    const confirmed = window.confirm(t('settings.resetConfirm'));

    if (confirmed) {
      setIsResetting(true);
      try {
        await onReset();
      } finally {
        setIsResetting(false);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isResetting}
      className="h-12 w-full rounded-2xl bg-[#FF6F61] px-6 font-medium text-white shadow-lg transition-all hover:bg-[#FF5A4F] hover:shadow-xl hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
      aria-label="Reset Data"
    >
      {isResetting ? t('loading.pleaseWait') : t('settings.resetData')}
    </button>
  );
}
