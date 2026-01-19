// services/database.service.ts - Simplified database service for sessions only
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Session } from '@/types';

export class DatabaseService {
  /**
   * Save a session to localStorage
   * @returns Object with success status, optional sessionId, and optional error message
   */
  saveSession(sessionData: {
    problemSetKey: string;
    startTime: number;
    endTime: number;
    duration: number;
    passCount: number;
    failCount: number;
    totalProblems: number;
    accuracy: number;
  }): { success: boolean; sessionId?: string; error?: string } {
    const sessionId = generateId();
    
    const session: Session = {
      id: sessionId,
      problemSetKey: sessionData.problemSetKey,
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.duration,
      passCount: sessionData.passCount,
      failCount: sessionData.failCount,
      totalProblems: sessionData.totalProblems,
      accuracy: sessionData.accuracy,
      createdAt: Date.now(),
    };

    const result = storage.sessions.save(session);
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, sessionId };
  }

  /**
   * Get session history for a problem set
   * Returns sessions in descending order by createdAt (most recent first)
   */
  getSessionHistory(
    problemSetKey: string,
    limit: number = 10
  ): Session[] {
    const sessions = storage.sessions.getByProblemSetKey(problemSetKey);
    return sessions.slice(0, limit);
  }
}

export const databaseService = new DatabaseService();
