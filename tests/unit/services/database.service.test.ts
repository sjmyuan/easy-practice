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

      // Get problem sets before reset
      const problemSets = await db.problemSets.toArray();
      const additionSet = problemSets.find(
        (ps) => ps.problemSetKey === 'addition-within-20'
      );
      const subtractionSet = problemSets.find(
        (ps) => ps.problemSetKey === 'subtraction-within-20'
      );

      // Reset only addition problems
      await service.resetStatisticsByProblemSetId(additionSet!.id!);

      // Get problems and their stats after reset
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

      // Get a non-existent problem set ID
      const nonExistentId = 'non-existent-id';

      // Reset non-existent problem set (should not affect anything)
      await service.resetStatisticsByProblemSetId(nonExistentId);

      // Verify addition statistics are unchanged
      const stats = await db.statistics.get(problems[0].id!);
      expect(stats!.totalAttempts).toBe(1);
      expect(stats!.passCount).toBe(1);
    });

    it('should reset multiple problem sets of the same type', async () => {
      // Setup: Create multiple problem sets of different types
      const additionSet: ProblemSetJSON = {
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

      const subtractionSet: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Subtraction Set',
          problemSetKey: 'subtraction-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '5 - 3', answer: '2' }],
      };

      await service.importProblemsFromJSON(additionSet);
      await service.importProblemsFromJSON(subtractionSet);

      const allProblems = await db.problems.toArray();
      expect(allProblems.length).toBe(3);

      // Record attempts for all
      for (const problem of allProblems) {
        await service.recordAttempt(problem.id!, 'fail');
        await service.recordAttempt(problem.id!, 'fail');
      }

      // Get problem sets before reset
      const problemSets = await db.problemSets.toArray();
      const additionSetId = problemSets.find(
        (ps) => ps.problemSetKey === 'addition-within-20'
      )!.id!;
      const subtractionSetId = problemSets.find(
        (ps) => ps.problemSetKey === 'subtraction-within-20'
      )!.id!;

      // Reset only addition problems
      await service.resetStatisticsByProblemSetId(additionSetId);

      // Verify addition problem statistics are reset
      const additionProblems = await db.problems
        .where('problemSetId')
        .equals(additionSetId)
        .toArray();

      for (const problem of additionProblems) {
        const stat = await db.statistics.get(problem.id!);
        expect(stat!.totalAttempts).toBe(0);
        expect(stat!.failCount).toBe(0);

        const attempts = await db.attempts
          .where('problemId')
          .equals(problem.id!)
          .toArray();
        expect(attempts.length).toBe(0);
      }

      // Verify subtraction statistics are NOT reset
      const subtractionProblems = await db.problems
        .where('problemSetId')
        .equals(subtractionSetId)
        .toArray();

      for (const problem of subtractionProblems) {
        const stat = await db.statistics.get(problem.id!);
        expect(stat!.totalAttempts).toBe(2);
        expect(stat!.failCount).toBe(2);
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

      // Get the addition problem set ID
      const problemSets = await db.problemSets.toArray();
      const additionSetId = problemSets.find(
        (ps) => ps.problemSetKey === 'addition-within-20'
      )!.id!;

      // Get struggled problems filtered by addition problem set ID
      const struggledProblems = await service.getStruggledProblems(
        20,
        additionSetId
      );

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

      // Get the subtraction problem set ID
      const problemSets = await db.problemSets.toArray();
      const subtractionSetId = problemSets.find(
        (ps) => ps.problemSetKey === 'subtraction-within-20'
      )!.id!;

      // Get struggled problems filtered by subtraction problem set ID
      const struggledProblems = await service.getStruggledProblems(
        20,
        subtractionSetId
      );

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
      const struggledProblems = await service.getStruggledProblems(
        20,
        'subtraction-within-20'
      );

      expect(struggledProblems.length).toBe(0);
    });
  });

  describe('Version field storage', () => {
    it('should store version field when importing problem set', async () => {
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

      const problemSets = await db.problemSets.toArray();
      expect(problemSets.length).toBe(1);
      expect(problemSets[0].version).toBe('1.0');
    });

    it('should store version field for multiple problem sets', async () => {
      const problemSetData: ProblemSetJSON = {
        version: '2.0',
        problemSets: [
          {
            name: 'Addition Set',
            problemSetKey: 'addition-within-20',
            difficulty: 'easy',
            problems: [{ problem: '1 + 1', answer: '2' }],
          },
          {
            name: 'Subtraction Set',
            problemSetKey: 'subtraction-within-20',
            difficulty: 'easy',
            problems: [{ problem: '5 - 3', answer: '2' }],
          },
        ],
      };

      await service.importProblemsFromJSON(problemSetData);

      const problemSets = await db.problemSets.toArray();
      expect(problemSets.length).toBe(2);
      expect(problemSets[0].version).toBe('2.0');
      expect(problemSets[1].version).toBe('2.0');
    });
  });

  describe('Versioned import logic', () => {
    it('should not re-import problem set with same version', async () => {
      const problemSetData: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      // Import once
      await service.importProblemsFromJSON(problemSetData);
      const firstImport = await db.problemSets.toArray();
      expect(firstImport.length).toBe(1);

      // Try to import same version again
      await service.importProblemsFromJSON(problemSetData);
      const secondImport = await db.problemSets.toArray();

      // Should still have only one problem set
      expect(secondImport.length).toBe(1);
    });

    it('should not import problem set with lower version', async () => {
      const problemSetV2: ProblemSetJSON = {
        version: '2.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '1 + 1', answer: '2' }],
      };

      const problemSetV1: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [{ problem: '2 + 2', answer: '4' }],
      };

      // Import version 2.0
      await service.importProblemsFromJSON(problemSetV2);
      const firstImport = await db.problemSets.toArray();
      expect(firstImport.length).toBe(1);
      expect(firstImport[0].version).toBe('2.0');

      // Try to import version 1.0
      await service.importProblemsFromJSON(problemSetV1);
      const secondImport = await db.problemSets.toArray();

      // Should still have only one problem set with version 2.0
      expect(secondImport.length).toBe(1);
      expect(secondImport[0].version).toBe('2.0');
    });

    it('should upgrade problem set when higher version is imported', async () => {
      const problemSetV1: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      const problemSetV2: ProblemSetJSON = {
        version: '2.0',
        problemSet: {
          name: 'Test Set Updated',
          problemSetKey: 'addition-within-20',
          difficulty: 'medium',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '3 + 3', answer: '6' },
        ],
      };

      // Import version 1.0
      await service.importProblemsFromJSON(problemSetV1);
      const firstImport = await db.problemSets.toArray();
      expect(firstImport.length).toBe(1);
      expect(firstImport[0].version).toBe('1.0');

      const firstProblems = await db.problems.toArray();
      expect(firstProblems.length).toBe(2);

      // Import version 2.0
      await service.importProblemsFromJSON(problemSetV2);
      const secondImport = await db.problemSets.toArray();

      // Should still have only one problem set, but updated
      expect(secondImport.length).toBe(1);
      expect(secondImport[0].version).toBe('2.0');
      expect(secondImport[0].name).toBe('Test Set Updated');
      expect(secondImport[0].difficulty).toBe('medium');

      // Problems should be replaced
      const secondProblems = await db.problems.toArray();
      expect(secondProblems.length).toBe(2);
      expect(secondProblems.map((p) => p.problem)).toContain('1 + 1');
      expect(secondProblems.map((p) => p.problem)).toContain('3 + 3');
      expect(secondProblems.map((p) => p.problem)).not.toContain('2 + 2');
    });

    it('should preserve statistics for matching problems when upgrading', async () => {
      const problemSetV1: ProblemSetJSON = {
        version: '1.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      // Import version 1.0
      await service.importProblemsFromJSON(problemSetV1);
      const problems = await db.problems.toArray();
      const problem1 = problems.find((p) => p.problem === '1 + 1');
      const problem2 = problems.find((p) => p.problem === '2 + 2');

      // Record attempts for both problems
      await service.recordAttempt(problem1!.id!, 'pass');
      await service.recordAttempt(problem1!.id!, 'pass');
      await service.recordAttempt(problem2!.id!, 'fail');

      // Verify statistics before upgrade
      const stats1Before = await db.statistics.get(problem1!.id!);
      expect(stats1Before!.totalAttempts).toBe(2);
      expect(stats1Before!.passCount).toBe(2);

      // Import version 2.0 with same problem
      const problemSetV2: ProblemSetJSON = {
        version: '2.0',
        problemSet: {
          name: 'Test Set',
          problemSetKey: 'addition-within-20',
          difficulty: 'easy',
        },
        problems: [
          { problem: '1 + 1', answer: '2' }, // Same problem
          { problem: '3 + 3', answer: '6' }, // New problem
        ],
      };

      await service.importProblemsFromJSON(problemSetV2);

      // Find the problem after upgrade
      const problemsAfter = await db.problems.toArray();
      const problem1After = problemsAfter.find((p) => p.problem === '1 + 1');
      const problem3After = problemsAfter.find((p) => p.problem === '3 + 3');

      // Statistics for '1 + 1' should be preserved
      const stats1After = await db.statistics.get(problem1After!.id!);
      expect(stats1After!.totalAttempts).toBe(2);
      expect(stats1After!.passCount).toBe(2);

      // Statistics for '3 + 3' should be new
      const stats3After = await db.statistics.get(problem3After!.id!);
      expect(stats3After!.totalAttempts).toBe(0);

      // '2 + 2' should no longer exist
      const problem2After = problemsAfter.find((p) => p.problem === '2 + 2');
      expect(problem2After).toBeUndefined();
    });

    describe('deleteProblemSetsNotInManifest', () => {
      it('should remove problem sets (and associated data) not listed in manifest', async () => {
        const removeData: ProblemSetJSON = {
          version: '1.0',
          problemSet: {
            name: 'Remove Set',
            problemSetKey: 'remove-set',
            difficulty: 'easy',
          },
          problems: [{ problem: '9 + 9', answer: '18' }],
        };

        const keepData: ProblemSetJSON = {
          version: '1.0',
          problemSet: {
            name: 'Keep Set',
            problemSetKey: 'keep-set',
            difficulty: 'easy',
          },
          problems: [{ problem: '1 + 1', answer: '2' }],
        };

        // Import both sets
        await service.importProblemsFromJSON(removeData);
        await service.importProblemsFromJSON(keepData);

        // Ensure both exist
        const allProblemSets = await db.problemSets.toArray();
        const removeSet = allProblemSets.find(
          (ps) => ps.problemSetKey === 'remove-set'
        );
        const keepSet = allProblemSets.find(
          (ps) => ps.problemSetKey === 'keep-set'
        );

        expect(removeSet).toBeDefined();
        expect(keepSet).toBeDefined();

        // Capture problem IDs of the set to be removed
        const removedProblems = await db.problems
          .where('problemSetId')
          .equals(removeSet!.id!)
          .toArray();
        const removedProblemIds = removedProblems.map((p) => p.id!);

        // Build manifest that only includes the 'keep-set'
        const manifest: import('@/types').ProblemSetManifest = {
          problemSets: [
            {
              problemSetKey: 'keep-set',
              version: '1.0',
              path: '/problem-sets/keep-set.json',
              name: 'Keep Set',
            },
          ],
        };

        // Run cleanup
        await service.deleteProblemSetsNotInManifest(manifest);

        // Verify 'remove-set' is gone
        const finalProblemSets = await db.problemSets.toArray();
        expect(
          finalProblemSets.some((ps) => ps.problemSetKey === 'remove-set')
        ).toBe(false);
        expect(
          finalProblemSets.some((ps) => ps.problemSetKey === 'keep-set')
        ).toBe(true);

        // Verify problems removed
        for (const id of removedProblemIds) {
          const p = await db.problems.get(id);
          expect(p).toBeUndefined();

          const s = await db.statistics.get(id);
          expect(s).toBeUndefined();

          const attempts = await db.attempts
            .where('problemId')
            .equals(id)
            .toArray();
          expect(attempts.length).toBe(0);
        }
      });
    });
  });
});
