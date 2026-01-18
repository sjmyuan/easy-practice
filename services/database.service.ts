// services/database.service.ts - Simplified database service for sessions only
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { Session } from '@/types';

export class DatabaseService {
  /**
   * Save a session to localStorage
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
  }): string {
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

    storage.sessions.save(session);
    return sessionId;
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
