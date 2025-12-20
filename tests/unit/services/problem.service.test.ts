// tests/unit/services/problem.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { problemService } from '@/services';
import { db } from '@/lib/db';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    problems: {
      where: vi.fn(),
      toArray: vi.fn(),
    },
    statistics: {
      get: vi.fn(),
      toArray: vi.fn(),
    },
    problemSets: {
      where: vi.fn(),
      toArray: vi.fn(),
    },
  },
}));

describe('ProblemService - Session Queue Generation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateSessionQueue', () => {
    it('should include all problems when no statistics exist', async () => {
      // Mock problem sets
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      // Mock problems
      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
        {
          id: 'p3',
          problemSetId: 'ps1',
          problem: '3 + 3',
          answer: '6',
          createdAt: Date.now(),
        },
      ];

      // Setup mocks
      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockProblemSets),
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      vi.mocked(db.problems.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockProblems),
        }),
      } as unknown as ReturnType<typeof db.problems.where>);

      // Mock statistics - no statistics (all null)
      vi.mocked(db.statistics.get).mockResolvedValue(null);

      const queue = await problemService.generateSessionQueue('addition');

      // Should include all problems
      expect(queue).toHaveLength(3);
      expect(queue).toContain('p1');
      expect(queue).toContain('p2');
      expect(queue).toContain('p3');
    });

    it('should include all problems with success ratio < 90%', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
        {
          id: 'p3',
          problemSetId: 'ps1',
          problem: '3 + 3',
          answer: '6',
          createdAt: Date.now(),
        },
      ];

      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockProblemSets),
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      vi.mocked(db.problems.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockProblems),
        }),
      } as unknown as ReturnType<typeof db.problems.where>);

      // Mock statistics with different success ratios
      vi.mocked(db.statistics.get).mockImplementation(async (id: string) => {
        if (id === 'p1') {
          return {
            problemId: 'p1',
            totalAttempts: 10,
            passCount: 7, // 70% success rate
            failCount: 3,
            lastAttemptedAt: Date.now(),
            lastResult: 'pass',
            failureRate: 0.3,
            priority: 60,
          };
        }
        if (id === 'p2') {
          return {
            problemId: 'p2',
            totalAttempts: 10,
            passCount: 8, // 80% success rate
            failCount: 2,
            lastAttemptedAt: Date.now(),
            lastResult: 'pass',
            failureRate: 0.2,
            priority: 55,
          };
        }
        if (id === 'p3') {
          return {
            problemId: 'p3',
            totalAttempts: 10,
            passCount: 10, // 100% success rate
            failCount: 0,
            lastAttemptedAt: Date.now(),
            lastResult: 'pass',
            failureRate: 0,
            priority: 50,
          };
        }
        return null;
      });

      const queue = await problemService.generateSessionQueue('addition');

      // Should include p1 and p2 (< 90% success)
      expect(queue).toContain('p1');
      expect(queue).toContain('p2');

      // p3 might or might not be included (30% probability)
      // We can't test the probabilistic behavior deterministically
    });

    it('should only include problems from enabled problem sets', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition Set 1',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
        {
          id: 'ps2',
          name: 'Addition Set 2',
          problemSetKey: 'addition-within-20',
          enabled: false,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps2',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
      ];

      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([mockProblemSets[0]]), // Only enabled set
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      vi.mocked(db.problems.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue([mockProblems[0]]), // Only from enabled set
        }),
      } as unknown as ReturnType<typeof db.problems.where>);

      vi.mocked(db.statistics.get).mockResolvedValue(null);

      const queue = await problemService.generateSessionQueue('addition');

      expect(queue).toContain('p1');
      expect(queue).not.toContain('p2');
    });

    it('should only include problems of the selected type', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
      ];

      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockProblemSets),
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      vi.mocked(db.problems.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockProblems),
        }),
      } as unknown as ReturnType<typeof db.problems.where>);

      vi.mocked(db.statistics.get).mockResolvedValue(null);

      const queue = await problemService.generateSessionQueue('addition');

      expect(queue).toHaveLength(1);
      expect(queue).toContain('p1');

      // Verify the correct type was queried
      expect(db.problemSets.where).toHaveBeenCalledWith('problemSetKey');
    });

    it('should return unique problem IDs with no duplicates', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1 + 1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2 + 2',
          answer: '4',
          createdAt: Date.now(),
        },
        {
          id: 'p3',
          problemSetId: 'ps1',
          problem: '3 + 3',
          answer: '6',
          createdAt: Date.now(),
        },
      ];

      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue(mockProblemSets),
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      vi.mocked(db.problems.where).mockReturnValue({
        anyOf: vi.fn().mockReturnValue({
          toArray: vi.fn().mockResolvedValue(mockProblems),
        }),
      } as unknown as ReturnType<typeof db.problems.where>);

      vi.mocked(db.statistics.get).mockResolvedValue(null);

      const queue = await problemService.generateSessionQueue('addition');

      // Check for uniqueness
      const uniqueQueue = [...new Set(queue)];
      expect(queue).toHaveLength(uniqueQueue.length);
    });

    it('should return empty array when no problem sets are enabled', async () => {
      vi.mocked(db.problemSets.where).mockReturnValue({
        equals: vi.fn().mockReturnValue({
          and: vi.fn().mockReturnValue({
            toArray: vi.fn().mockResolvedValue([]), // No enabled sets
          }),
        }),
      } as unknown as ReturnType<typeof db.problemSets.where>);

      const queue = await problemService.generateSessionQueue('addition');

      expect(queue).toEqual([]);
    });
  });
});
