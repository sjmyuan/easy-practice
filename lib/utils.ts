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
  passCount: number;
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

  // Reduce priority for mastered problems (3+ passes)
  if (stats.passCount >= 3) {
    priority -= 20;
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
