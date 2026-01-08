// tests/unit/lib/db.test.ts - Database schema tests
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MathPracticeDB } from '@/lib/db';

describe('MathPracticeDB Schema', () => {
  let testDb: MathPracticeDB;

  beforeEach(() => {
    testDb = new MathPracticeDB();
  });

  afterEach(async () => {
    await testDb.delete();
    await testDb.close();
  });

  describe('sessions table', () => {
    it('should have sessions table defined', () => {
      expect(testDb.sessions).toBeDefined();
    });

    it('should allow adding a session record', async () => {
      const sessionData = {
        id: 'test-session-1',
        problemSetId: 'problem-set-1',
        startTime: Date.now(),
        endTime: Date.now() + 60000,
        duration: 60000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 80,
        createdAt: Date.now(),
      };

      await testDb.sessions.add(sessionData);

      const retrieved = await testDb.sessions.get('test-session-1');
      expect(retrieved).toBeDefined();
      expect(retrieved?.problemSetId).toBe('problem-set-1');
      expect(retrieved?.passCount).toBe(8);
      expect(retrieved?.failCount).toBe(2);
      expect(retrieved?.accuracy).toBe(80);
    });

    it('should allow querying sessions by problemSetId', async () => {
      const session1 = {
        id: 'session-1',
        problemSetId: 'problem-set-1',
        startTime: Date.now(),
        endTime: Date.now() + 60000,
        duration: 60000,
        passCount: 10,
        failCount: 0,
        totalProblems: 10,
        accuracy: 100,
        createdAt: Date.now(),
      };

      const session2 = {
        id: 'session-2',
        problemSetId: 'problem-set-1',
        startTime: Date.now(),
        endTime: Date.now() + 120000,
        duration: 120000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 80,
        createdAt: Date.now(),
      };

      const session3 = {
        id: 'session-3',
        problemSetId: 'problem-set-2',
        startTime: Date.now(),
        endTime: Date.now() + 90000,
        duration: 90000,
        passCount: 7,
        failCount: 3,
        totalProblems: 10,
        accuracy: 70,
        createdAt: Date.now(),
      };

      await testDb.sessions.add(session1);
      await testDb.sessions.add(session2);
      await testDb.sessions.add(session3);

      const problemSet1Sessions = await testDb.sessions
        .where('problemSetId')
        .equals('problem-set-1')
        .toArray();

      expect(problemSet1Sessions).toHaveLength(2);
      expect(problemSet1Sessions[0].problemSetId).toBe('problem-set-1');
      expect(problemSet1Sessions[1].problemSetId).toBe('problem-set-1');
    });

    it('should allow sorting sessions by createdAt', async () => {
      const now = Date.now();
      const session1 = {
        id: 'session-1',
        problemSetId: 'problem-set-1',
        startTime: now,
        endTime: now + 60000,
        duration: 60000,
        passCount: 10,
        failCount: 0,
        totalProblems: 10,
        accuracy: 100,
        createdAt: now,
      };

      const session2 = {
        id: 'session-2',
        problemSetId: 'problem-set-1',
        startTime: now + 120000,
        endTime: now + 180000,
        duration: 60000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 80,
        createdAt: now + 120000,
      };

      await testDb.sessions.add(session1);
      await testDb.sessions.add(session2);

      const sessions = await testDb.sessions
        .where('problemSetId')
        .equals('problem-set-1')
        .reverse()
        .sortBy('createdAt');

      expect(sessions).toHaveLength(2);
      expect(sessions[0].id).toBe('session-2');
      expect(sessions[1].id).toBe('session-1');
    });

    it('should allow limiting number of sessions returned', async () => {
      const now = Date.now();

      // Add 15 sessions
      for (let i = 0; i < 15; i++) {
        await testDb.sessions.add({
          id: `session-${i}`,
          problemSetId: 'problem-set-1',
          startTime: now + i * 60000,
          endTime: now + (i + 1) * 60000,
          duration: 60000,
          passCount: 10,
          failCount: 0,
          totalProblems: 10,
          accuracy: 100,
          createdAt: now + i * 60000,
        });
      }

      const sessions = await testDb.sessions
        .where('problemSetId')
        .equals('problem-set-1')
        .reverse()
        .sortBy('createdAt');

      const last10Sessions = sessions.slice(0, 10);

      expect(last10Sessions).toHaveLength(10);
      expect(last10Sessions[0].id).toBe('session-14');
      expect(last10Sessions[9].id).toBe('session-5');
    });
  });
});
