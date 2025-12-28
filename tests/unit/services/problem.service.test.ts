// tests/unit/services/problem.service.test.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { problemService } from '@/services';
import { db } from '@/lib/db';
import type { ProblemStatistics } from '@/types';

// Mock the database
vi.mock('@/lib/db', () => ({
  db: {
    problems: {
      where: vi.fn(),
      toArray: vi.fn(),
    },
    statistics: {
      get: vi.fn<(id: string) => Promise<ProblemStatistics | undefined>>(),
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

  describe('loadDefaultProblemSets', () => {
    it('should import sets and then remove those not in manifest', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Keep Set',
            problemSetKey: 'keep-set',
            version: '1.0',
            path: '/problem-sets/keep-set.json',
          },
        ],
      };

      // Mock fetch for manifest and for the single problem set file
      (global as any).fetch = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockManifest })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            version: '1.0',
            problemSet: {
              name: 'Keep Set',
              problemSetKey: 'keep-set',
            },
            problems: [{ problem: '1 + 1', answer: '2' }],
          }),
        });

      // Spy on database service methods
      const { databaseService } = await import('@/services/database.service');
      const getVersionSpy = vi
        .spyOn(databaseService, 'getProblemSetVersion')
        .mockResolvedValue(null); // Problem set doesn't exist, so it should be imported
      const importSpy = vi
        .spyOn(databaseService, 'importProblemsFromJSON')
        .mockResolvedValue();
      const cleanupSpy = vi
        .spyOn(databaseService, 'deleteProblemSetsNotInManifest')
        .mockResolvedValue();

      // Call the method
      await (
        await import('@/services')
      ).problemService.loadDefaultProblemSets();

      expect(importSpy).toHaveBeenCalled();
      expect(cleanupSpy).toHaveBeenCalledWith(mockManifest as any);

      // Restore spies
      getVersionSpy.mockRestore();
      importSpy.mockRestore();
      cleanupSpy.mockRestore();
    });

    it('should not fetch problem set when local version matches manifest version', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Same Version Set',
            problemSetKey: 'same-version-set',
            version: '2.0',
            path: '/problem-sets/same-version-set.json',
          },
        ],
      };

      // Mock fetch for manifest only (problem set should NOT be fetched)
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockManifest });
      (global as any).fetch = fetchMock;

      // Mock database service methods
      const { databaseService } = await import('@/services/database.service');
      const getVersionSpy = vi
        .spyOn(databaseService, 'getProblemSetVersion')
        .mockResolvedValue('2.0'); // Same version as manifest
      const importSpy = vi
        .spyOn(databaseService, 'importProblemsFromJSON')
        .mockResolvedValue();
      const cleanupSpy = vi
        .spyOn(databaseService, 'deleteProblemSetsNotInManifest')
        .mockResolvedValue();

      // Call the method
      await (
        await import('@/services')
      ).problemService.loadDefaultProblemSets();

      // Should check version
      expect(getVersionSpy).toHaveBeenCalledWith('same-version-set');
      
      // Should NOT fetch the problem set file (only manifest)
      expect(fetchMock).toHaveBeenCalledTimes(1);
      
      // Should NOT import the problem set
      expect(importSpy).not.toHaveBeenCalled();
      
      // Should still run cleanup
      expect(cleanupSpy).toHaveBeenCalledWith(mockManifest as any);

      // Restore spies
      getVersionSpy.mockRestore();
      importSpy.mockRestore();
      cleanupSpy.mockRestore();
    });

    it('should fetch and import problem set when manifest version is higher', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Upgraded Set',
            problemSetKey: 'upgraded-set',
            version: '2.0',
            path: '/problem-sets/upgraded-set.json',
          },
        ],
      };

      const mockProblemSetData = {
        version: '2.0',
        problemSet: {
          name: 'Upgraded Set',
          problemSetKey: 'upgraded-set',
        },
        problems: [{ problem: '2 + 2', answer: '4' }],
      };

      // Mock fetch for manifest and problem set file
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockManifest })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProblemSetData,
        });
      (global as any).fetch = fetchMock;

      // Mock database service methods
      const { databaseService } = await import('@/services/database.service');
      const getVersionSpy = vi
        .spyOn(databaseService, 'getProblemSetVersion')
        .mockResolvedValue('1.0'); // Lower version than manifest
      const importSpy = vi
        .spyOn(databaseService, 'importProblemsFromJSON')
        .mockResolvedValue();
      const cleanupSpy = vi
        .spyOn(databaseService, 'deleteProblemSetsNotInManifest')
        .mockResolvedValue();

      // Call the method
      await (
        await import('@/services')
      ).problemService.loadDefaultProblemSets();

      // Should check version
      expect(getVersionSpy).toHaveBeenCalledWith('upgraded-set');
      
      // Should fetch both manifest and problem set file
      expect(fetchMock).toHaveBeenCalledTimes(2);
      
      // Should import the problem set
      expect(importSpy).toHaveBeenCalledWith(mockProblemSetData);
      
      // Should run cleanup
      expect(cleanupSpy).toHaveBeenCalledWith(mockManifest as any);

      // Restore spies
      getVersionSpy.mockRestore();
      importSpy.mockRestore();
      cleanupSpy.mockRestore();
    });

    it('should fetch and import problem set when it does not exist locally', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'New Set',
            problemSetKey: 'new-set',
            version: '1.0',
            path: '/problem-sets/new-set.json',
          },
        ],
      };

      const mockProblemSetData = {
        version: '1.0',
        problemSet: {
          name: 'New Set',
          problemSetKey: 'new-set',
        },
        problems: [{ problem: '3 + 3', answer: '6' }],
      };

      // Mock fetch for manifest and problem set file
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({ ok: true, json: async () => mockManifest })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProblemSetData,
        });
      (global as any).fetch = fetchMock;

      // Mock database service methods
      const { databaseService } = await import('@/services/database.service');
      const getVersionSpy = vi
        .spyOn(databaseService, 'getProblemSetVersion')
        .mockResolvedValue(null); // Problem set doesn't exist locally
      const importSpy = vi
        .spyOn(databaseService, 'importProblemsFromJSON')
        .mockResolvedValue();
      const cleanupSpy = vi
        .spyOn(databaseService, 'deleteProblemSetsNotInManifest')
        .mockResolvedValue();

      // Call the method
      await (
        await import('@/services')
      ).problemService.loadDefaultProblemSets();

      // Should check version
      expect(getVersionSpy).toHaveBeenCalledWith('new-set');
      
      // Should fetch both manifest and problem set file
      expect(fetchMock).toHaveBeenCalledTimes(2);
      
      // Should import the problem set
      expect(importSpy).toHaveBeenCalledWith(mockProblemSetData);
      
      // Should run cleanup
      expect(cleanupSpy).toHaveBeenCalledWith(mockManifest as any);

      // Restore spies
      getVersionSpy.mockRestore();
      importSpy.mockRestore();
      cleanupSpy.mockRestore();
    });
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

    it('should include all problems regardless of success ratios', async () => {
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
      (vi.mocked(db.statistics.get).mockImplementation as any)(
        async (problemId: string) => {
          if (problemId === 'p1') {
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
          if (problemId === 'p2') {
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
          if (problemId === 'p3') {
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
        }
      );

      const queue = await problemService.generateSessionQueue('addition');

      // Should include all problems regardless of success ratios
      expect(queue).toHaveLength(3);
      expect(queue).toContain('p1');
      expect(queue).toContain('p2');
      expect(queue).toContain('p3');
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

    it('should filter to top 30% of problems when coverage is 30', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      // Create 10 problems
      const mockProblems = Array.from({ length: 10 }, (_, i) => ({
        id: `p${i + 1}`,
        problemSetId: 'ps1',
        problem: `${i} + ${i}`,
        answer: `${i * 2}`,
        createdAt: Date.now(),
      }));

      // Mock statistics with different priorities
      const mockStats = mockProblems.map((p, i) => ({
        problemId: p.id!,
        priority: 100 - i * 10, // Descending priority
        totalAttempts: 10,
        passCount: 5,
        failCount: 5,
        lastAttemptedAt: Date.now(),
        lastResult: 'pass' as const,
        failureRate: 0.5,
      }));

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

      // Mock statistics calls
      (vi.mocked(db.statistics.get) as any).mockImplementation(
        async (id: string) => {
          const stat = mockStats.find((s) => s.problemId === id);
          return stat || null;
        }
      );

      const queue = await problemService.generateSessionQueue(
        'addition-within-20',
        false,
        30
      );

      // 30% of 10 problems = 3 problems
      expect(queue).toHaveLength(3);
    });

    it('should filter to top 50% of problems when coverage is 50', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = Array.from({ length: 10 }, (_, i) => ({
        id: `p${i + 1}`,
        problemSetId: 'ps1',
        problem: `${i} + ${i}`,
        answer: `${i * 2}`,
        createdAt: Date.now(),
      }));

      const mockStats = mockProblems.map((p, i) => ({
        problemId: p.id!,
        priority: 100 - i * 10,
        totalAttempts: 10,
        passCount: 5,
        failCount: 5,
        lastAttemptedAt: Date.now(),
        lastResult: 'pass' as const,
        failureRate: 0.5,
      }));

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

      (vi.mocked(db.statistics.get) as any).mockImplementation(
        async (id: string) => {
          const stat = mockStats.find((s) => s.problemId === id);
          return stat || null;
        }
      );

      const queue = await problemService.generateSessionQueue(
        'addition-within-20',
        false,
        50
      );

      // 50% of 10 problems = 5 problems
      expect(queue).toHaveLength(5);
    });

    it('should filter to top 80% of problems when coverage is 80', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = Array.from({ length: 10 }, (_, i) => ({
        id: `p${i + 1}`,
        problemSetId: 'ps1',
        problem: `${i} + ${i}`,
        answer: `${i * 2}`,
        createdAt: Date.now(),
      }));

      const mockStats = mockProblems.map((p, i) => ({
        problemId: p.id!,
        priority: 100 - i * 10,
        totalAttempts: 10,
        passCount: 5,
        failCount: 5,
        lastAttemptedAt: Date.now(),
        lastResult: 'pass' as const,
        failureRate: 0.5,
      }));

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

      (vi.mocked(db.statistics.get) as any).mockImplementation(
        async (id: string) => {
          const stat = mockStats.find((s) => s.problemId === id);
          return stat || null;
        }
      );

      const queue = await problemService.generateSessionQueue(
        'addition-within-20',
        false,
        80
      );

      // 80% of 10 problems = 8 problems
      expect(queue).toHaveLength(8);
    });

    it('should include all problems when coverage is 100', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      const mockProblems = Array.from({ length: 10 }, (_, i) => ({
        id: `p${i + 1}`,
        problemSetId: 'ps1',
        problem: `${i} + ${i}`,
        answer: `${i * 2}`,
        createdAt: Date.now(),
      }));

      const mockStats = mockProblems.map((p, i) => ({
        problemId: p.id!,
        priority: 100 - i * 10,
        totalAttempts: 10,
        passCount: 5,
        failCount: 5,
        lastAttemptedAt: Date.now(),
        lastResult: 'pass' as const,
        failureRate: 0.5,
      }));

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

      (vi.mocked(db.statistics.get) as any).mockImplementation(
        async (id: string) => {
          const stat = mockStats.find((s) => s.problemId === id);
          return stat || null;
        }
      );

      const queue = await problemService.generateSessionQueue(
        'addition-within-20',
        false,
        100
      );

      // 100% of 10 problems = 10 problems
      expect(queue).toHaveLength(10);
    });

    it('should prioritize problems with higher priority when filtering', async () => {
      const mockProblemSets = [
        {
          id: 'ps1',
          name: 'Addition',
          problemSetKey: 'addition-within-20',
          enabled: true,
          createdAt: Date.now(),
        },
      ];

      // Create problems with specific priorities
      const mockProblems = [
        {
          id: 'p1',
          problemSetId: 'ps1',
          problem: '1+1',
          answer: '2',
          createdAt: Date.now(),
        },
        {
          id: 'p2',
          problemSetId: 'ps1',
          problem: '2+2',
          answer: '4',
          createdAt: Date.now(),
        },
        {
          id: 'p3',
          problemSetId: 'ps1',
          problem: '3+3',
          answer: '6',
          createdAt: Date.now(),
        },
        {
          id: 'p4',
          problemSetId: 'ps1',
          problem: '4+4',
          answer: '8',
          createdAt: Date.now(),
        },
      ];

      // Assign priorities: p3 > p1 > p4 > p2
      const mockStats = [
        {
          problemId: 'p1',
          priority: 70,
          totalAttempts: 10,
          passCount: 5,
          failCount: 5,
          lastAttemptedAt: Date.now(),
          lastResult: 'fail' as const,
          failureRate: 0.5,
        },
        {
          problemId: 'p2',
          priority: 40,
          totalAttempts: 10,
          passCount: 8,
          failCount: 2,
          lastAttemptedAt: Date.now(),
          lastResult: 'pass' as const,
          failureRate: 0.2,
        },
        {
          problemId: 'p3',
          priority: 90,
          totalAttempts: 10,
          passCount: 3,
          failCount: 7,
          lastAttemptedAt: Date.now(),
          lastResult: 'fail' as const,
          failureRate: 0.7,
        },
        {
          problemId: 'p4',
          priority: 60,
          totalAttempts: 10,
          passCount: 6,
          failCount: 4,
          lastAttemptedAt: Date.now(),
          lastResult: 'pass' as const,
          failureRate: 0.4,
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

      (vi.mocked(db.statistics.get) as any).mockImplementation(
        async (id: string) => {
          const stat = mockStats.find((s) => s.problemId === id);
          return stat || null;
        }
      );

      const queue = await problemService.generateSessionQueue(
        'addition-within-20',
        false,
        50 // Take top 50% (2 out of 4 problems)
      );

      // Should include top 2 problems by priority: p3 and p1
      expect(queue).toHaveLength(2);
      expect(queue).toContain('p3');
      expect(queue).toContain('p1');
      expect(queue).not.toContain('p2');
      expect(queue).not.toContain('p4');
    });
  });

  describe('loadManifest', () => {
    it('should fetch and parse manifest file', async () => {
      const mockManifest = {
        problemSets: [
          {
            problemSetKey: 'addition-within-20',
            version: '1.0',
            path: '/problem-sets/addition-within-20.json',
            name: 'Addition within 20',
            description: 'Practice addition with sums up to 20',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      const manifest = await problemService.loadManifest();

      expect(manifest).toEqual(mockManifest);
      expect(global.fetch).toHaveBeenCalledWith('/problem-sets/manifest.json');
    });

    it('should throw error when manifest fetch fails', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(problemService.loadManifest()).rejects.toThrow(
        'Failed to load manifest'
      );
    });
  });
});
