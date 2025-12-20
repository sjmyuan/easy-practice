// Type definitions for Problem entities
export interface ProblemSet {
  id?: string;
  name: string;
  description?: string;
  type: string;
  difficulty?: string;
  enabled: boolean;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface Problem {
  id?: string;
  problemSetId: string;
  problem: string;
  answer: string;
  createdAt: Date;
}

export interface ProblemAttempt {
  id?: string;
  problemId: string;
  result: 'pass' | 'fail';
  attemptedAt: Date;
}

export interface ProblemStatistics {
  problemId: string;
  totalAttempts: number;
  passCount: number;
  failCount: number;
  lastAttemptedAt: Date | null;
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
  lastAttemptedAt: Date | null;
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
    metadata?: Record<string, any>;
  };
  problemSets?: Array<{
    name: string;
    description?: string;
    type: string;
    difficulty?: string;
    metadata?: Record<string, any>;
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
