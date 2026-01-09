// Type definitions for Problem entities

// Localized string type for bilingual content
export type LocalizedString = string | { en: string; zh: string };

// Localized content stored in database
export type LocalizedContent = { en: string; zh: string };

export interface ProblemSet {
  id?: string;
  name: string | LocalizedContent; // Can be plain string or localized object
  description?: string | LocalizedContent;
  problemSetKey: string;
  difficulty?: string;
  enabled: boolean;
  version?: string;
  createdAt: number; // timestamp
  metadata?: Record<string, unknown>;
}

export interface Problem {
  id?: string;
  problemSetId: string;
  problem: string;
  answer: string;
  problemAudio?: string; // Audio filename for problem
  answerAudio?: string; // Audio filename for answer
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
  problemSetKey: string;
  failCount: number;
  totalAttempts: number;
  failureRate: number;
  lastAttemptedAt: number | null; // timestamp
  priority: number;
}

export interface Session {
  id?: string;
  problemSetKey: string;
  startTime: number; // timestamp
  endTime: number; // timestamp
  duration: number; // milliseconds
  passCount: number;
  failCount: number;
  totalProblems: number;
  accuracy: number; // percentage
  createdAt: number; // timestamp
}

// JSON Import Format
export interface ProblemSetJSON {
  version: string;
  problemSet?: {
    name: LocalizedString;
    description?: LocalizedString;
    problemSetKey: string;
    difficulty?: string;
    metadata?: Record<string, unknown>;
  };
  problemSets?: Array<{
    name: LocalizedString;
    description?: LocalizedString;
    problemSetKey: string;
    difficulty?: string;
    metadata?: Record<string, unknown>;
    problems: Array<{
      problem: string;
      answer: string;
      problem_audio?: string;
      answer_audio?: string;
    }>;
  }>;
  problems?: Array<{
    problem: string;
    answer: string;
    problem_audio?: string;
    answer_audio?: string;
  }>;
}

// Manifest Format
export interface ProblemSetManifestEntry {
  problemSetKey: string;
  version: string;
  path: string;
  name: LocalizedString;
  description?: LocalizedString;
}

export interface ProblemSetManifest {
  problemSets: ProblemSetManifestEntry[];
}
