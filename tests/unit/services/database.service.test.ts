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
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      expect(problems.length).toBe(1);

      const problemId = problems[0].id!;

      // Record attempt
      await service.recordAttempt(problemId, 'pass');

      // Verify attempt was recorded
      const attempts = await db.attempts
        .where('problemId')
        .equals(problemId)
        .toArray();
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
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '5 - 3', answer: '2' }],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      const problemId = problems[0].id!;

      // Record fail attempt
      await service.recordAttempt(problemId, 'fail');

      // Verify attempt was recorded
      const attempts = await db.attempts
        .where('problemId')
        .equals(problemId)
        .toArray();
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
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '2 + 2', answer: '4' }],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      const problemId = problems[0].id!;

      // Record multiple attempts
      await service.recordAttempt(problemId, 'fail');
      await service.recordAttempt(problemId, 'pass');
      await service.recordAttempt(problemId, 'pass');

      // Verify all attempts recorded
      const attempts = await db.attempts
        .where('problemId')
        .equals(problemId)
        .toArray();
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

  describe('resetStatisticsByProblemSetKey', () => {
    it('should reset statistics only for problems of the specified type', async () => {
      // Setup: Create problem sets of different types
      const additionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      const subtractionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Subtraction Set',
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '5 - 3', answer: '2' },
          { problem: '10 - 4', answer: '6' },
        ],
      };

      await service.importProblemsFromJSON(additionData);
      await service.importProblemsFromJSON(subtractionData);

      const allProblems = await db.problems.toArray();
      expect(allProblems.length).toBe(4);

      // Record attempts for all problems
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'pass');
        await service.recordAttempt(problem.id!, 'fail');
      }

      // Verify all problems have statistics
      const allStats = await db.statistics.toArray();
      expect(allStats.length).toBe(4);
      allStats.forEach((stat) => {
        expect(stat.totalAttempts).toBe(2);
        expect(stat.passCount).toBe(1);
        expect(stat.failCount).toBe(1);
      });

      // Reset only addition problems
      await service.resetStatisticsByProblemSetKey('addition-within-20');

      // Get problems and their stats after reset
      const problemSets = await db.problemSets.toArray();
      const additionSet = problemSets.find((ps) => ps.problemSetKey === 'addition-within-20');
      const subtractionSet = problemSets.find((ps) => ps.problemSetKey === 'subtraction-within-20');

      const additionProblems = await db.problems
        .where('problemSetId')
        .equals(additionSet!.id!)
        .toArray();
      const subtractionProblems = await db.problems
        .where('problemSetId')
        .equals(subtractionSet!.id!)
        .toArray();

      // Check addition statistics are reset
      for (const problem of additionProblems) {
        const stat = await db.statistics.get(problem.id!);
        expect(stat!.totalAttempts).toBe(0);
        expect(stat!.passCount).toBe(0);
        expect(stat!.failCount).toBe(0);
        expect(stat!.lastAttemptedAt).toBeNull();
        expect(stat!.lastResult).toBeNull();
        expect(stat!.failureRate).toBe(0);
        expect(stat!.priority).toBe(50);

        // Check attempts are cleared
        const attempts = await db.attempts
          .where('problemId')
          .equals(problem.id!)
          .toArray();
        expect(attempts.length).toBe(0);
      }

      // Check subtraction statistics are unchanged
      for (const problem of subtractionProblems) {
        const stat = await db.statistics.get(problem.id!);
        expect(stat!.totalAttempts).toBe(2);
        expect(stat!.passCount).toBe(1);
        expect(stat!.failCount).toBe(1);

        // Check attempts are still there
        const attempts = await db.attempts
          .where('problemId')
          .equals(problem.id!)
          .toArray();
        expect(attempts.length).toBe(2);
      }
    });

    it('should handle non-existent problem type gracefully', async () => {
      // Setup: Create a problem set
      const problemSetData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      await service.importProblemsFromJSON(problemSetData);
      const problems = await db.problems.toArray();
      await service.recordAttempt(problems[0].id!, 'pass');

      // Reset non-existent type
      await service.resetStatisticsByProblemSetKey('multiplication');

      // Verify addition statistics are unchanged
      const stats = await db.statistics.get(problems[0].id!);
      expect(stats!.totalAttempts).toBe(1);
      expect(stats!.passCount).toBe(1);
    });

    it('should reset multiple problem sets of the same type', async () => {
      // Setup: Create multiple problem sets of the same type
      const additionSet1: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set 1',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      const additionSet2: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set 2',
          problemSetKey: 'addition-within-20',
          difficulty: 'hard',
        },
        problems: [{ problem: '50 + 50', answer: '100' }],
      };

      await service.importProblemsFromJSON(additionSet1);
      await service.importProblemsFromJSON(additionSet2);

      const allProblems = await db.problems.toArray();
      expect(allProblems.length).toBe(2);

      // Record attempts for both
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'fail');
        await service.recordAttempt(problem.id!, 'fail');
      }

      // Reset all addition problems
      await service.resetStatisticsByProblemSetKey('addition-within-20');

      // Verify both problem sets' statistics are reset
      for (const problem of allProblems) {
        const stat = await db.statistics.get(problem.id!);
        expect(stat!.totalAttempts).toBe(0);
        expect(stat!.failCount).toBe(0);

        const attempts = await db.attempts
          .where('problemId')
          .equals(problem.id!)
          .toArray();
        expect(attempts.length).toBe(0);
      }
    });
  });

  describe('getStruggledProblems', () => {
    it('should return all struggled problems when no type is specified', async () => {
      // Setup: Create problem sets of different types with statistics
      const additionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      const subtractionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Subtraction Set',
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '5 - 3', answer: '2' },
          { problem: '10 - 4', answer: '6' },
        ],
      };

      await service.importProblemsFromJSON(additionData);
      await service.importProblemsFromJSON(subtractionData);

      const allProblems = await db.problems.toArray();

      // Record failures for all problems
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'fail');
        await service.recordAttempt(problem.id!, 'pass');
      }

      // Get struggled problems without type filter
      const struggledProblems = await service.getStruggledProblems();

      expect(struggledProblems.length).toBe(4);
      const categories = struggledProblems.map((p) => p.problemSetKey);
      expect(categories).toContain('addition-within-20');
      expect(categories).toContain('subtraction-within-20');
    });

    it('should return only addition problems when type is "addition"', async () => {
      // Setup: Create problem sets of different types
      const additionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      const subtractionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Subtraction Set',
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '5 - 3', answer: '2' },
          { problem: '10 - 4', answer: '6' },
        ],
      };

      await service.importProblemsFromJSON(additionData);
      await service.importProblemsFromJSON(subtractionData);

      const allProblems = await db.problems.toArray();

      // Record failures for all problems
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'fail');
        await service.recordAttempt(problem.id!, 'pass');
      }

      // Get struggled problems filtered by addition type
      const struggledProblems = await service.getStruggledProblems(20, 'addition-within-20');

      expect(struggledProblems.length).toBe(2);
      struggledProblems.forEach((problem) => {
        expect(problem.problemSetKey).toBe('addition-within-20');
        expect(problem.problem).toMatch(/\+/);
      });
    });

    it('should return only subtraction problems when type is "subtraction"', async () => {
      // Setup: Create problem sets of different types
      const additionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      const subtractionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Subtraction Set',
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '5 - 3', answer: '2' },
          { problem: '10 - 4', answer: '6' },
        ],
      };

      await service.importProblemsFromJSON(additionData);
      await service.importProblemsFromJSON(subtractionData);

      const allProblems = await db.problems.toArray();

      // Record failures for all problems
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'fail');
        await service.recordAttempt(problem.id!, 'pass');
      }

      // Get struggled problems filtered by subtraction type
      const struggledProblems = await service.getStruggledProblems(20, 'subtraction-within-20');

      expect(struggledProblems.length).toBe(2);
      struggledProblems.forEach((problem) => {
        expect(problem.problemSetKey).toBe('subtraction-within-20');
        expect(problem.problem).toMatch(/-/);
      });
    });

    it('should return empty array when type has no struggled problems', async () => {
      // Setup: Create only addition problems
      const additionData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Addition Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      await service.importProblemsFromJSON(additionData);
      const problems = await db.problems.toArray();

      // Record failure for addition problem
      await service.recordAttempt(problems[0].id!, 'fail');

      // Try to get subtraction struggled problems
      const struggledProblems = await service.getStruggledProblems(20, 'subtraction-within-20');

      expect(struggledProblems.length).toBe(0);
    });
  });
});
