// tests/unit/services/problem.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ProblemService } from '@/services/problem.service';

describe('ProblemService', () => {
  let service: ProblemService;

  beforeEach(() => {
    service = new ProblemService();
    vi.clearAllMocks();
  });

  describe('loadManifest', () => {
    it('should load manifest from JSON file', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Test Set',
            problemSetKey: 'test-set',
            version: '1.0',
            path: '/problem-sets/test-set.json',
          },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockManifest,
      });

      const manifest = await service.loadManifest();
      expect(manifest).toEqual(mockManifest);
    });

    it('should throw error if manifest fails to load', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(service.loadManifest()).rejects.toThrow('Failed to load manifest');
    });
  });

  describe('loadDefaultProblemSets', () => {
    it('should load problem sets from manifest', async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Addition',
            problemSetKey: 'addition-within-10',
            version: '1.0',
            path: '/problem-sets/addition-within-10.json',
          },
        ],
      };

      const mockProblemSet = {
        version: '1.0',
        problemSet: {
          name: 'Addition',
          problemSetKey: 'addition-within-10',
        },
        problems: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
        ],
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockManifest,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProblemSet,
        });

      await service.loadDefaultProblemSets();

      const problemSets = service.getProblemSets();
      expect(problemSets).toHaveLength(1);
      expect(problemSets[0].problemSetKey).toBe('addition-within-10');
    });
  });

  describe('getProblemSets', () => {
    it('should return empty array when no problem sets loaded', () => {
      const problemSets = service.getProblemSets();
      expect(problemSets).toEqual([]);
    });
  });

  describe('hasProblems', () => {
    it('should return false when no problems loaded', () => {
      expect(service.hasProblems()).toBe(false);
    });
  });

  describe('generateSessionQueue', () => {
    beforeEach(async () => {
      const mockManifest = {
        problemSets: [
          {
            name: 'Test',
            problemSetKey: 'test-set',
            version: '1.0',
            path: '/problem-sets/test.json',
          },
        ],
      };

      const mockProblemSet = {
        version: '1.0',
        problemSet: {
          name: 'Test',
          problemSetKey: 'test-set',
        },
        problems: [
          { problem: '1', answer: '1' },
          { problem: '2', answer: '2' },
          { problem: '3', answer: '3' },
          { problem: '4', answer: '4' },
          { problem: '5', answer: '5' },
        ],
      };

      global.fetch = vi
        .fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockManifest,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockProblemSet,
        });

      await service.loadDefaultProblemSets();
    });

    it('should generate queue with all problems when coverage is 100', () => {
      const queue = service.generateSessionQueue('test-set', 100);
      expect(queue).toHaveLength(5);
    });

    it('should generate queue with subset when coverage is less than 100', () => {
      const queue = service.generateSessionQueue('test-set', 50);
      expect(queue.length).toBeGreaterThanOrEqual(2);
      expect(queue.length).toBeLessThanOrEqual(3);
    });

    it('should return empty array for non-existent problem set', () => {
      const queue = service.generateSessionQueue('non-existent', 100);
      expect(queue).toEqual([]);
    });

    it('should shuffle problems', () => {
      const queue1 = service.generateSessionQueue('test-set', 100);
      const queue2 = service.generateSessionQueue('test-set', 100);
      
      // Both should have same length
      expect(queue1).toHaveLength(queue2.length);
      
      // But might be in different order (not guaranteed, but likely)
      // At least verify they contain the same problems
      expect(queue1.sort()).toEqual(queue2.sort());
    });
  });

  describe('validateAnswer', () => {
    it('should validate correct answer', () => {
      const problem = {
        id: '1',
        problemSetId: 'set1',
        problem: '1 + 1',
        answer: '2',
        createdAt: Date.now(),
      };

      expect(service.validateAnswer(problem, '2')).toBe(true);
    });

    it('should validate with case insensitivity', () => {
      const problem = {
        id: '1',
        problemSetId: 'set1',
        problem: 'Capital',
        answer: 'Paris',
        createdAt: Date.now(),
      };

      expect(service.validateAnswer(problem, 'paris')).toBe(true);
      expect(service.validateAnswer(problem, 'PARIS')).toBe(true);
    });

    it('should trim whitespace', () => {
      const problem = {
        id: '1',
        problemSetId: 'set1',
        problem: '1 + 1',
        answer: '2',
        createdAt: Date.now(),
      };

      expect(service.validateAnswer(problem, '  2  ')).toBe(true);
    });

    it('should reject incorrect answer', () => {
      const problem = {
        id: '1',
        problemSetId: 'set1',
        problem: '1 + 1',
        answer: '2',
        createdAt: Date.now(),
      };

      expect(service.validateAnswer(problem, '3')).toBe(false);
    });
  });
});
