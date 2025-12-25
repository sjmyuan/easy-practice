'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LoadingView() {
  const { t } = useLanguage();
  
  return (
    <div className="flex min-h-screen items-center justify-center" data-testid="loading-view">
      <p className="text-xl text-gray-500">{t('loading.title')}</p>
    </div>
  );
}
