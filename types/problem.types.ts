// Type definitions for Problem entities
export interface ProblemSet {
  id?: string;
  name: string;
  description?: string;
  type: string;
  difficulty?: string;
  enabled: boolean;
  createdAt: number; // timestamp
  metadata?: Record<string, unknown>;
}

export interface Problem {
  id?: string;
  problemSetId: string;
  problem: string;
  answer: string;
  createdAt: number; // timestamp
}

export interface ProblemAttempt {
  id?: string;
  problemId: string;
  result: 'pass' | 'fail';
  attemptedAt: number; // timestamp
}

export interface ProblemStatistics {
  problemId: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  lastAttemptedAt: number | null; // timestamp
  lastResult: 'pass' | 'fail' | null;
  failureRate: number;
  priority: number;
}

export interface StruggledProblemSummary {
  problemId: string;
  problem: string;
  answer: string;
  category: string;
  failCount: number;
  totalAttempts: number;
  failureRate: number;
  lastAttemptedAt: number | null; // timestamp
  priority: number;
}

// JSON Import Format
export interface ProblemSetJSON {
  version: string;
  problemSet?: {
    name: string;
    description?: string;
    type: string;
    difficulty?: string;
    metadata?: Record<string, unknown>;
  };
  problemSets?: Array<{
    name: string;
    description?: string;
    type: string;
    difficulty?: string;
    metadata?: Record<string, unknown>;
    problems: Array<{
      problem: string;
      answer: string;
    }>;
  }>;
  problems?: Array<{
    problem: string;
    answer: string;
  }>;
}
