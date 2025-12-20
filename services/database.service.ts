// services/database.service.ts - Database operations
import { db } from '@/lib/db';
import { generateId, calculatePriority } from '@/lib/utils';
import type {
  ProblemSet,
  Problem,
  ProblemAttempt,
  ProblemStatistics,
  StruggledProblemSummary,
  ProblemSetJSON,
} from '@/types';

export class DatabaseService {
  /**
   * Import problems from JSON data
   */
  async importProblemsFromJSON(jsonData: ProblemSetJSON): Promise<void> {
    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.statistics,
      async () => {
        // Handle single problem set
        if (jsonData.problemSet && jsonData.problems) {
          const problemSetId = generateId();

          await db.problemSets.add({
            id: problemSetId,
            name: jsonData.problemSet.name,
            description: jsonData.problemSet.description,
            type: jsonData.problemSet.type,
            difficulty: jsonData.problemSet.difficulty,
            enabled: true,
            createdAt: Date.now(),
            metadata: jsonData.problemSet.metadata,
          });

          for (const p of jsonData.problems) {
            const problemId = generateId();
            await db.problems.add({
              id: problemId,
              problemSetId: problemSetId,
              problem: p.problem,
              answer: p.answer,
              createdAt: Date.now(),
            });

            await db.statistics.add({
              problemId: problemId,
              totalAttempts: 0,
              passCount: 0,
              failCount: 0,
              lastAttemptedAt: null,
              lastResult: null,
              failureRate: 0,
              priority: 50,
            });
          }
        }

        // Handle multiple problem sets
        if (jsonData.problemSets) {
          for (const ps of jsonData.problemSets) {
            const problemSetId = generateId();

            await db.problemSets.add({
              id: problemSetId,
              name: ps.name,
              description: ps.description,
              type: ps.type,
              difficulty: ps.difficulty,
              enabled: true,
              createdAt: Date.now(),
              metadata: ps.metadata,
            });

            for (const p of ps.problems) {
              const problemId = generateId();
              await db.problems.add({
                id: problemId,
                problemSetId: problemSetId,
                problem: p.problem,
                answer: p.answer,
                createdAt: Date.now(),
              });

              await db.statistics.add({
                problemId: problemId,
                totalAttempts: 0,
                passCount: 0,
                failCount: 0,
                lastAttemptedAt: null,
                lastResult: null,
                failureRate: 0,
                priority: 50,
              });
            }
          }
        }
      }
    );
  }

  /**
   * Get all problem sets
   */
  async getProblemSets(type?: string): Promise<ProblemSet[]> {
    if (type) {
      return await db.problemSets.where('type').equals(type).toArray();
    }
    return await db.problemSets.toArray();
  }

  /**
   * Get problem set by ID
   */
  async getProblemSetById(id: string): Promise<ProblemSet | undefined> {
    return await db.problemSets.get(id);
  }

  /**
   * Toggle problem set enabled state
   */
  async toggleProblemSet(id: string, enabled: boolean): Promise<void> {
    await db.problemSets.update(id, { enabled });
  }

  /**
   * Delete a problem set and its associated problems
   */
  async deleteProblemSet(id: string): Promise<void> {
    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.statistics,
      db.attempts,
      async () => {
        const problems = await db.problems
          .where('problemSetId')
          .equals(id)
          .toArray();

        for (const problem of problems) {
          if (problem.id) {
            await db.statistics.delete(problem.id);
            await db.attempts.where('problemId').equals(problem.id).delete();
            await db.problems.delete(problem.id);
          }
        }

        await db.problemSets.delete(id);
      }
    );
  }

  /**
   * Get all problems
   */
  async getProblems(problemSetId?: string): Promise<Problem[]> {
    if (problemSetId) {
      return await db.problems
        .where('problemSetId')
        .equals(problemSetId)
        .toArray();
    }
    return await db.problems.toArray();
  }

  /**
   * Get problems by type (addition/subtraction)
   */
  async getProblemsByType(type: string): Promise<Problem[]> {
    const problemSets = await db.problemSets
      .where('type')
      .equals(type)
      .and((ps) => ps.enabled)
      .toArray();

    if (problemSets.length === 0) return [];

    const problemSetIds = problemSets
      .map((ps) => ps.id)
      .filter((id): id is string => id !== undefined);

    return await db.problems
      .where('problemSetId')
      .anyOf(problemSetIds)
      .toArray();
  }

  /**
   * Get problem by ID
   */
  async getProblemById(id: string): Promise<Problem | undefined> {
    return await db.problems.get(id);
  }

  /**
   * Get statistics for a problem
   */
  async getStatistics(
    problemId: string
  ): Promise<ProblemStatistics | undefined> {
    return await db.statistics.get(problemId);
  }

  /**
   * Get all statistics
   */
  async getAllStatistics(): Promise<ProblemStatistics[]> {
    return await db.statistics.toArray();
  }

  /**
   * Record an attempt and update statistics
   */
  async recordAttempt(
    problemId: string,
    result: 'pass' | 'fail'
  ): Promise<void> {
    await db.transaction('rw', db.attempts, db.statistics, async () => {
      // Insert attempt
      await db.attempts.add({
        id: generateId(),
        problemId,
        result,
        attemptedAt: Date.now(),
      });

      // Update statistics
      const stats = await db.statistics.get(problemId);
      if (stats) {
        stats.totalAttempts += 1;
        if (result === 'pass') stats.passCount += 1;
        else stats.failCount += 1;
        stats.lastAttemptedAt = Date.now();
        stats.lastResult = result;
        stats.failureRate = stats.failCount / stats.totalAttempts;
        stats.priority = calculatePriority(stats);

        await db.statistics.put(stats);
      }
    });
  }

  /**
   * Get attempt history for a problem
   */
  async getAttemptHistory(problemId: string): Promise<ProblemAttempt[]> {
    return await db.attempts
      .where('problemId')
      .equals(problemId)
      .reverse()
      .sortBy('attemptedAt');
  }

  /**
   * Get all attempts
   */
  async getAllAttempts(): Promise<ProblemAttempt[]> {
    return await db.attempts.toArray();
  }

  /**
   * Get struggled problems summary
   */
  async getStruggledProblems(
    limit = 20,
    type?: string
  ): Promise<StruggledProblemSummary[]> {
    const stats = await db.statistics
      .where('failureRate')
      .above(0)
      .reverse()
      .sortBy('priority');

    const summaries: StruggledProblemSummary[] = [];

    for (const stat of stats) {
      const problem = await db.problems.get(stat.problemId);
      if (problem) {
        const problemSet = await db.problemSets.get(problem.problemSetId);
        
        // Filter by type if specified
        if (type && problemSet?.type !== type) {
          continue;
        }

        summaries.push({
          problemId: stat.problemId,
          problem: problem.problem,
          answer: problem.answer,
          category: problemSet?.type || 'unknown',
          failCount: stat.failCount,
          totalAttempts: stat.totalAttempts,
          failureRate: stat.failureRate,
          lastAttemptedAt: stat.lastAttemptedAt,
          priority: stat.priority,
        });

        // Stop if we've reached the limit
        if (summaries.length >= limit) {
          break;
        }
      }
    }

    return summaries;
  }

  /**
   * Reset all statistics
   */
  async resetStatistics(): Promise<void> {
    await db.transaction('rw', db.attempts, db.statistics, async () => {
      await db.attempts.clear();
      await db.statistics.toCollection().modify({
        totalAttempts: 0,
        passCount: 0,
        failCount: 0,
        lastAttemptedAt: null,
        lastResult: null,
        failureRate: 0,
        priority: 50,
      });
    });
  }

  /**
   * Reset statistics for problems of a specific type
   */
  async resetStatisticsByType(type: string): Promise<void> {
    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.attempts,
      db.statistics,
      async () => {
        // Get all problem sets of the specified type
        const problemSets = await db.problemSets
          .where('type')
          .equals(type)
          .toArray();

        // Get all problem IDs for these problem sets
        const problemIds: string[] = [];
        for (const problemSet of problemSets) {
          const problems = await db.problems
            .where('problemSetId')
            .equals(problemSet.id!)
            .toArray();
          problemIds.push(...problems.map((p) => p.id!));
        }

        // Delete attempts for these problems
        for (const problemId of problemIds) {
          await db.attempts.where('problemId').equals(problemId).delete();
        }

        // Reset statistics for these problems
        for (const problemId of problemIds) {
          await db.statistics.update(problemId, {
            totalAttempts: 0,
            passCount: 0,
            failCount: 0,
            lastAttemptedAt: null,
            lastResult: null,
            failureRate: 0,
            priority: 50,
          });
        }
      }
    );
  }

  /**
   * Clear all data
   */
  async clearAllData(): Promise<void> {
    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.attempts,
      db.statistics,
      async () => {
        await db.attempts.clear();
        await db.statistics.clear();
        await db.problems.clear();
        await db.problemSets.clear();
      }
    );
  }

  /**
   * Export all data as JSON
   */
  async exportData(): Promise<string> {
    const problemSets = await db.problemSets.toArray();
    const problems = await db.problems.toArray();
    const attempts = await db.attempts.toArray();
    const statistics = await db.statistics.toArray();

    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        problemSets,
        problems,
        attempts,
        statistics,
      },
      null,
      2
    );
  }

  /**
   * Import data from JSON
   */
  async importData(jsonData: string): Promise<void> {
    const data = JSON.parse(jsonData);

    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.attempts,
      db.statistics,
      async () => {
        if (data.problemSets) {
          await db.problemSets.bulkAdd(data.problemSets);
        }
        if (data.problems) {
          await db.problems.bulkAdd(data.problems);
        }
        if (data.attempts) {
          await db.attempts.bulkAdd(data.attempts);
        }
        if (data.statistics) {
          await db.statistics.bulkAdd(data.statistics);
        }
      }
    );
  }
}

export const databaseService = new DatabaseService();
