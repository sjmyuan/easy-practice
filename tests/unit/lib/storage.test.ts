// tests/unit/lib/storage.test.ts - localStorage wrapper tests
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { storage } from '@/lib/storage';
import type { Session } from '@/types';

describe('storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('sessions', () => {
    const mockSession: Session = {
      id: 'session-1',
      problemSetKey: 'test-set',
      startTime: 1000,
      endTime: 2000,
      duration: 1000,
      passCount: 8,
      failCount: 2,
      totalProblems: 10,
      accuracy: 0.8,
      createdAt: Date.now(),
    };

    it('should save a session', () => {
      storage.sessions.save(mockSession);
      const saved = storage.sessions.getAll();
      expect(saved).toHaveLength(1);
      expect(saved[0]).toEqual(mockSession);
    });

    it('should get all sessions', () => {
      storage.sessions.save(mockSession);
      storage.sessions.save({ ...mockSession, id: 'session-2' });
      
      const sessions = storage.sessions.getAll();
      expect(sessions).toHaveLength(2);
    });

    it('should get sessions by problemSetKey', () => {
      storage.sessions.save(mockSession);
      storage.sessions.save({ ...mockSession, id: 'session-2', problemSetKey: 'other-set' });
      
      const sessions = storage.sessions.getByProblemSetKey('test-set');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].problemSetKey).toBe('test-set');
    });

    it('should get session by id', () => {
      storage.sessions.save(mockSession);
      
      const session = storage.sessions.getById('session-1');
      expect(session).toEqual(mockSession);
    });

    it('should return null for non-existent session', () => {
      const session = storage.sessions.getById('non-existent');
      expect(session).toBeNull();
    });

    it('should clear all sessions', () => {
      storage.sessions.save(mockSession);
      storage.sessions.save({ ...mockSession, id: 'session-2' });
      
      storage.sessions.clear();
      const sessions = storage.sessions.getAll();
      expect(sessions).toHaveLength(0);
    });

    it('should return sessions sorted by createdAt descending', () => {
      const session1 = { ...mockSession, id: 'session-1', createdAt: 1000 };
      const session2 = { ...mockSession, id: 'session-2', createdAt: 3000 };
      const session3 = { ...mockSession, id: 'session-3', createdAt: 2000 };
      
      storage.sessions.save(session1);
      storage.sessions.save(session2);
      storage.sessions.save(session3);
      
      const sessions = storage.sessions.getAll();
      expect(sessions[0].id).toBe('session-2'); // newest first
      expect(sessions[1].id).toBe('session-3');
      expect(sessions[2].id).toBe('session-1');
    });

    it('should handle empty localStorage gracefully', () => {
      const sessions = storage.sessions.getAll();
      expect(sessions).toHaveLength(0);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('sessions', 'invalid json');
      
      const sessions = storage.sessions.getAll();
      expect(sessions).toHaveLength(0);
    });
  });
});
