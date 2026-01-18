// components/HistoryView.tsx
'use client';

import React, { useEffect } from 'react';
import type { Session } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration } from '@/lib/utils';

interface HistoryViewProps {
  sessions: Session[];
  onClose: () => void;
}

export function HistoryView({ sessions, onClose }: HistoryViewProps) {
  const { t } = useLanguage();

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Focus trap and initial focus
  useEffect(() => {
    const modal = document.querySelector('[role="region"][aria-label="Session history"]');
    if (!modal) return;

    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    // Focus first element (close button) when modal opens
    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (focusableElements.length === 1) {
        // Only one focusable element, prevent tabbing away
        e.preventDefault();
        return;
      }

      if (e.shiftKey) {
        // Shift + Tab: move backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: move forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [sessions]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (sessions.length === 0) {
    return (
      <div
        className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
        role="region"
        aria-label="Session history"
      >
        <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('history.title')}
            </h2>
            <button
              onClick={onClose}
              className="text-2xl text-gray-500 transition-colors hover:text-gray-700"
              aria-label="Close history"
            >
              ×
            </button>
          </div>
          <p className="py-8 text-center text-gray-500">
            {t('history.noSessions')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
      role="region"
      aria-label="Session history"
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {t('history.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-2xl text-gray-500 transition-colors hover:text-gray-700"
            aria-label="Close history"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {sessions.map((session, index) => (
            <div
              key={session.id || index}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {t('history.session')} #{sessions.length - index}
                </h3>
                <span className="text-sm text-gray-500">
                  {formatDate(session.endTime)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">
                    {t('history.accuracy')}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {session.accuracy}%
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    {t('history.duration')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDuration(session.duration)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    {t('history.problems')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.totalProblems}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">
                    {t('history.passed')} / {t('history.failed')}
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {session.passCount} / {session.failCount}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
