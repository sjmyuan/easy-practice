// tests/unit/services/database.service.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '@/services/database.service';
import { db } from '@/lib/db';
import type { ProblemSetJSON } from '@/types';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    service = new DatabaseService();
    // Clear database before each test
    await db.problemSets.clear();
    await db.problems.clear();
    await db.attempts.clear();
    await db.statistics.clear();
  });

  afterEach(async () => {
    // Clean up after each test
    await db.problemSets.clear();
    await db.problems.clear();
    await db.attempts.clear();
    await db.statistics.clear();
  });

  it('should be instantiated', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DatabaseService);
  });

  it('should have required methods', () => {
    expect(typeof service.importProblemsFromJSON).toBe('function');
    expect(typeof service.getProblemSets).toBe('function');
    expect(typeof service.recordAttempt).toBe('function');
    expect(typeof service.getStruggledProblems).toBe('function');
  });

  describe('recordAttempt', () => {
    it('should record a pass attempt with proper date handling', async () => {
      // Setup: Create a problem first
      const problemSetData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          type: 'addition',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
        ],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      expect(problems.length).toBe(1);
      
      const problemId = problems[0].id!;

      // Record attempt
      await service.recordAttempt(problemId, 'pass');

      // Verify attempt was recorded
      const attempts = await db.attempts.where('problemId').equals(problemId).toArray();
      expect(attempts.length).toBe(1);
      expect(attempts[0].result).toBe('pass');
      expect(attempts[0].problemId).toBe(problemId);
      expect(attempts[0].attemptedAt).toBeDefined();
      expect(typeof attempts[0].attemptedAt).toBe('number');
      expect(attempts[0].id).toBeDefined();

      // Verify statistics were updated
      const stats = await db.statistics.get(problemId);
      expect(stats).toBeDefined();
      expect(stats!.totalAttempts).toBe(1);
      expect(stats!.passCount).toBe(1);
      expect(stats!.failCount).toBe(0);
      expect(stats!.lastResult).toBe('pass');
      expect(stats!.lastAttemptedAt).toBeDefined();
      expect(typeof stats!.lastAttemptedAt).toBe('number');
    });

    it('should record a fail attempt with proper date handling', async () => {
      // Setup: Create a problem first
      const problemSetData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          type: 'subtraction',
          difficulty: 'easy',
        },
        problems: [
          { problem: '5 - 3', answer: '2' },
        ],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      const problemId = problems[0].id!;

      // Record fail attempt
      await service.recordAttempt(problemId, 'fail');

      // Verify attempt was recorded
      const attempts = await db.attempts.where('problemId').equals(problemId).toArray();
      expect(attempts.length).toBe(1);
      expect(attempts[0].result).toBe('fail');

      // Verify statistics were updated
      const stats = await db.statistics.get(problemId);
      expect(stats!.totalAttempts).toBe(1);
      expect(stats!.passCount).toBe(0);
      expect(stats!.failCount).toBe(1);
      expect(stats!.lastResult).toBe('fail');
      expect(stats!.failureRate).toBe(1);
    });

    it('should handle multiple attempts correctly', async () => {
      // Setup
      const problemSetData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          type: 'addition',
          difficulty: 'easy',
        },
        problems: [
          { problem: '2 + 2', answer: '4' },
        ],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      const problemId = problems[0].id!;

      // Record multiple attempts
      await service.recordAttempt(problemId, 'fail');
      await service.recordAttempt(problemId, 'pass');
      await service.recordAttempt(problemId, 'pass');

      // Verify all attempts recorded
      const attempts = await db.attempts.where('problemId').equals(problemId).toArray();
      expect(attempts.length).toBe(3);

      // Verify statistics
      const stats = await db.statistics.get(problemId);
      expect(stats!.totalAttempts).toBe(3);
      expect(stats!.passCount).toBe(2);
      expect(stats!.failCount).toBe(1);
      expect(stats!.lastResult).toBe('pass');
      expect(stats!.failureRate).toBeCloseTo(1 / 3, 5);
    });
  });
});
