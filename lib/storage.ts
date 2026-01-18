// lib/storage.ts - localStorage wrapper for session data
import type { Session } from '@/types';

const STORAGE_KEYS = {
  SESSIONS: 'sessions',
} as const;

/**
 * localStorage wrapper for session data
 * Provides simple CRUD operations for sessions
 */
class SessionStorage {
  private getSessionsFromStorage(): Session[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      return JSON.parse(data) as Session[];
    } catch (error) {
      console.error('Failed to read sessions from localStorage:', error);
      return [];
    }
  }

  private saveSessionsToStorage(sessions: Session[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
    }
  }

  /**
   * Save a session
   */
  save(session: Session): void {
    const sessions = this.getSessionsFromStorage();
    sessions.push(session);
    this.saveSessionsToStorage(sessions);
  }

  /**
   * Get all sessions sorted by createdAt descending (newest first)
   */
  getAll(): Session[] {
    const sessions = this.getSessionsFromStorage();
    return sessions.sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get sessions by problemSetKey sorted by createdAt descending
   */
  getByProblemSetKey(problemSetKey: string): Session[] {
    const sessions = this.getSessionsFromStorage();
    return sessions
      .filter((s) => s.problemSetKey === problemSetKey)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get a session by ID
   */
  getById(id: string): Session | null {
    const sessions = this.getSessionsFromStorage();
    return sessions.find((s) => s.id === id) || null;
  }

  /**
   * Clear all sessions
   */
  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
  }
}

export const storage = {
  sessions: new SessionStorage(),
};
