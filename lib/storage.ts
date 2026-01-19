// lib/storage.ts - localStorage wrapper for session data
import type { Session } from '@/types';
import { STORAGE_KEYS } from '@/lib/constants';

/**
 * localStorage wrapper for session data
 * Provides simple CRUD operations for sessions with error handling
 */
class SessionStorage {
  private getSessionsFromStorage(): Session[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      if (!data) return [];
      return JSON.parse(data) as Session[];
    } catch (error) {
      console.error('Failed to read sessions from localStorage:', error);
      // Return empty array as fallback - errors will be caught at save time
      return [];
    }
  }

  /**
   * Save a session
   * @returns Object with success status and optional error message
   */
  save(session: Session): { success: boolean; error?: string } {
    try {
      const sessions = this.getSessionsFromStorage();
      sessions.push(session);
      
      const data = JSON.stringify(sessions);
      localStorage.setItem(STORAGE_KEYS.SESSIONS, data);
      return { success: true };
    } catch (error) {
      console.error('Failed to save session:', error);
      
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        return { success: false, error: 'Storage quota exceeded. Cannot save new sessions.' };
      } else if (error instanceof DOMException && error.name === 'SecurityError') {
        return { success: false, error: 'Storage access denied. You may be in private browsing mode.' };
      }
      return { success: false, error: 'Failed to save session data.' };
    }
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
