// lib/db.ts - IndexedDB schema with Dexie
import Dexie, { type EntityTable } from 'dexie';
import type {
  ProblemSet,
  Problem,
  ProblemAttempt,
  ProblemStatistics,
  Session,
} from '@/types';

export class MathPracticeDB extends Dexie {
  problemSets!: EntityTable<ProblemSet, 'id'>;
  problems!: EntityTable<Problem, 'id'>;
  attempts!: EntityTable<ProblemAttempt, 'id'>;
  statistics!: EntityTable<ProblemStatistics, 'problemId'>;
  sessions!: EntityTable<Session, 'id'>;

  constructor() {
    super('MathPracticeDB');

    this.version(1).stores({
      problemSets: 'id, problemSetKey, enabled, createdAt',
      problems: 'id, problemSetId, createdAt',
      attempts: 'id, problemId, attemptedAt, result',
      statistics: 'problemId, priority, failureRate, lastAttemptedAt',
    });

    // Version 2: Add sessions table
    this.version(2).stores({
      problemSets: 'id, problemSetKey, enabled, createdAt',
      problems: 'id, problemSetId, createdAt',
      attempts: 'id, problemId, attemptedAt, result',
      statistics: 'problemId, priority, failureRate, lastAttemptedAt',
      sessions: 'id, problemSetKey, createdAt',
    });
  }
}

export const db = new MathPracticeDB();
