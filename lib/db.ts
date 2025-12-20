// lib/db.ts - IndexedDB schema with Dexie
import Dexie, { type EntityTable } from 'dexie';
import type {
  ProblemSet,
  Problem,
  ProblemAttempt,
  ProblemStatistics,
} from '@/types';

export class MathPracticeDB extends Dexie {
  problemSets!: EntityTable<ProblemSet, 'id'>;
  problems!: EntityTable<Problem, 'id'>;
  attempts!: EntityTable<ProblemAttempt, 'id'>;
  statistics!: EntityTable<ProblemStatistics, 'problemId'>;

  constructor() {
    super('MathPracticeDB');

    this.version(1).stores({
      problemSets: 'id, type, enabled, createdAt',
      problems: 'id, problemSetId, createdAt',
      attempts: 'id, problemId, attemptedAt, result',
      statistics: 'problemId, priority, failureRate, lastAttemptedAt',
    });
  }
}

export const db = new MathPracticeDB();
