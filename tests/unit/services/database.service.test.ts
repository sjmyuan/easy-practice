// tests/unit/services/database.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseService } from '@/services/database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService();
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should be instantiated', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DatabaseService);
  });

  it('should have required session methods', () => {
    expect(typeof service.saveSession).toBe('function');
    expect(typeof service.getSessionHistory).toBe('function');
  });

  describe('saveSession', () => {
    it('should save a session and return session ID', () => {
      const sessionData = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      const result = service.saveSession(sessionData);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBeDefined();
      expect(typeof result.sessionId).toBe('string');
      expect(result.sessionId!.length).toBeGreaterThan(0);
    });

    it('should save multiple sessions', () => {
      const sessionData1 = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      const sessionData2 = {
        problemSetKey: 'subtraction-within-20',
        startTime: 3000,
        endTime: 4000,
        duration: 1000,
        passCount: 7,
        failCount: 3,
        totalProblems: 10,
        accuracy: 0.7,
      };

      const id1 = service.saveSession(sessionData1);
      const id2 = service.saveSession(sessionData2);

      expect(id1.success).toBe(true);
      expect(id2.success).toBe(true);
      expect(id1.sessionId).not.toBe(id2.sessionId);

      const sessions = service.getSessionHistory('addition-within-20');
      expect(sessions.length).toBeGreaterThan(0);
    });
  });

  describe('getSessionHistory', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = service.getSessionHistory('addition-within-20');
      expect(sessions).toEqual([]);
    });

    it('should return sessions for specific problem set', () => {
      const sessionData = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      service.saveSession(sessionData);
      service.saveSession({ ...sessionData, problemSetKey: 'subtraction-within-20' });

      const sessions = service.getSessionHistory('addition-within-20');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].problemSetKey).toBe('addition-within-20');
      expect(sessions[0].passCount).toBe(8);
      expect(sessions[0].failCount).toBe(2);
      expect(sessions[0].accuracy).toBe(0.8);
    });

    it('should return sessions sorted by createdAt descending', () => {
      const baseSession = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      // Save sessions at different times
      vi.setSystemTime(new Date(1000));
      service.saveSession(baseSession);
      
      vi.setSystemTime(new Date(3000));
      service.saveSession(baseSession);
      
      vi.setSystemTime(new Date(2000));
      service.saveSession(baseSession);

      const sessions = service.getSessionHistory('addition-within-20');
      expect(sessions).toHaveLength(3);
      // Most recent first
      expect(sessions[0].createdAt).toBe(3000);
      expect(sessions[1].createdAt).toBe(2000);
      expect(sessions[2].createdAt).toBe(1000);

      vi.useRealTimers();
    });

    it('should respect limit parameter', () => {
      const sessionData = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      // Save 5 sessions
      for (let i = 0; i < 5; i++) {
        service.saveSession(sessionData);
      }

      const sessions = service.getSessionHistory('addition-within-20', 3);
      expect(sessions).toHaveLength(3);
    });

    it('should default to 10 sessions when no limit specified', () => {
      const sessionData = {
        problemSetKey: 'addition-within-20',
        startTime: 1000,
        endTime: 2000,
        duration: 1000,
        passCount: 8,
        failCount: 2,
        totalProblems: 10,
        accuracy: 0.8,
      };

      // Save 15 sessions
      for (let i = 0; i < 15; i++) {
        service.saveSession(sessionData);
      }

      const sessions = service.getSessionHistory('addition-within-20');
      expect(sessions).toHaveLength(10);
    });
  });
});
