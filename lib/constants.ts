// lib/constants.ts - Application constants

export const APP_CONFIG = {
  name: 'Math Practice App',
  version: '1.0.0',
  description: 'Mobile-first math practice for children ages 3-9',
};

export const PROBLEM_TYPES = {
  ADDITION: 'addition',
  SUBTRACTION: 'subtraction',
} as const;

export const RESULT_TYPES = {
  PASS: 'pass',
  FAIL: 'fail',
} as const;

export const DEFAULT_PRIORITY = 50;
export const MASTERY_THRESHOLD = 3; // Number of passes to consider mastered
export const RECENT_PROBLEMS_LIMIT = 5; // How many recent problems to exclude
export const TOP_PROBLEMS_POOL = 10; // Select from top N priority problems

export const PROBLEM_SET_PATHS = {
  ADDITION: '/problem-sets/addition-within-20.json',
  SUBTRACTION: '/problem-sets/subtraction-within-20.json',
} as const;
