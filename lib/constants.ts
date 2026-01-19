// lib/constants.ts - Application constants

export const APP_CONFIG = {
  name: 'Easy Practice',
  version: '1.0.0',
  description: 'Mobile-first practice app for children ages 3-9',
};

export const PROBLEM_TYPES = {
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
} as const;

export const RESULT_TYPES = {
  PASS: 'pass',
  FAIL: 'fail',
} as const;

// Problem selection constants
export const DEFAULT_PRIORITY = 50;
export const MASTERY_THRESHOLD = 3; // Number of passes to consider mastered
export const RECENT_PROBLEMS_LIMIT = 5; // How many recent problems to exclude
export const TOP_PROBLEMS_POOL = 10; // Select from top N priority problems

// Audio configuration
export const AUDIO_BASE_URL = 'https://images.shangjiaming.top';

// Problem coverage options (percentage values)
export const PROBLEM_COVERAGE_OPTIONS = [30, 50, 80, 100] as const;
export const DEFAULT_PROBLEM_COVERAGE = 100;

// Session history configuration
export const SESSION_HISTORY_LIMIT_OPTIONS = [10, 20, 30, 40, 50] as const;
export const DEFAULT_SESSION_HISTORY_LIMIT = 10;

// LocalStorage keys
export const STORAGE_KEYS = {
  PROBLEM_COVERAGE: 'problemCoverage',
  SESSION_HISTORY_LIMIT: 'sessionHistoryLimit',
  LANGUAGE: 'language',
  SESSIONS: 'sessions',
} as const;
