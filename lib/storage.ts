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
      // Check if it's a quota exceeded error or other storage issue
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.notifyStorageError('Storage quota exceeded. Some data may not be saved.');
      } else {
        this.notifyStorageError('Failed to load session data. Using temporary storage.');
      }
      return [];
    }
  }

  private saveSessionsToStorage(sessions: Session[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
    } catch (error) {
      console.error('Failed to save sessions to localStorage:', error);
      // Check for quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        this.notifyStorageError('Storage quota exceeded. Cannot save new sessions. Consider clearing old data.');
      } else if (error instanceof DOMException && error.name === 'SecurityError') {
        this.notifyStorageError('Storage access denied. You may be in private browsing mode.');
      } else {
        this.notifyStorageError('Failed to save session data. Your progress may not be saved.');
      }
    }
  }

  /**
   * Notify user of storage errors
   * In production, this could be replaced with a toast notification system
   */
  private notifyStorageError(message: string): void {
    // For now, use alert in browser
    if (typeof window !== 'undefined') {
      // Use setTimeout to avoid blocking the current execution
      setTimeout(() => {
        alert(`Storage Warning: ${message}`);
      }, 100);
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
