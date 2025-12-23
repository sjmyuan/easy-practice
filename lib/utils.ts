// lib/utils.ts - Utility functions
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with clsx
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calculate priority score for a problem
 */
export function calculatePriority(stats: {
  totalAttempts: number;
  failCount: number;
}): number {
  if (stats.totalAttempts === 0) {
    return 50; // Default priority for new problems
  }

  const failureRate = stats.failCount / stats.totalAttempts;
  let priority = failureRate * 100;

  // Boost for new problems
  if (stats.totalAttempts === 0) {
    priority += 50;
  }

  return Math.max(0, Math.min(100, priority));
}

/**
 * Generate a simple UUID
 */
export function generateId(): string {
  return crypto.randomUUID();
}

/**
 * Format date for display
 */
export function formatDate(date: number | null): string {
  if (!date) return 'Never';
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`;
}

/**
 * Format duration in milliseconds to HH:MM:SS format
 */
export function formatDuration(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/**
 * Compare two semantic version strings
 * @returns 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
export function compareVersions(
  version1: string | undefined,
  version2: string | undefined
): number {
  if (version1 === undefined && version2 === undefined) return 0;
  if (version1 === undefined) return -1;
  if (version2 === undefined) return 1;

  const v1Parts = version1.split('.').map(Number);
  const v2Parts = version2.split('.').map(Number);
  const maxLength = Math.max(v1Parts.length, v2Parts.length);

  for (let i = 0; i < maxLength; i++) {
    const v1Part = v1Parts[i] || 0;
    const v2Part = v2Parts[i] || 0;

    if (v1Part > v2Part) return 1;
    if (v1Part < v2Part) return -1;
  }

  return 0;
}
