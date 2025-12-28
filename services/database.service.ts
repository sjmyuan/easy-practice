// services/database.service.ts - Database operations
import { db } from '@/lib/db';
import { generateId, calculatePriority, compareVersions } from '@/lib/utils';
import type {
  ProblemSet,
  Problem,
  ProblemAttempt,
  ProblemStatistics,
  StruggledProblemSummary,
  ProblemSetJSON,
  LocalizedString,
  LocalizedContent,
} from '@/types';

/**
 * Convert localized string to localized content for storage
 * Store as { en, zh } object to support multiple languages
 */
function toLocalizedContent(value: LocalizedString): string | LocalizedContent {
  if (typeof value === 'string') {
    // If it's a plain string, store it as-is for backwards compatibility
    return value;
  }
  // If it's already an object, store the full object
  return value;
}

export class DatabaseService {
  /**
   * Import problems from JSON data with version checking
   */
  async importProblemsFromJSON(jsonData: ProblemSetJSON): Promise<void> {
    await db.transaction(
      'rw',
      db.problemSets,
      db.problems,
      db.statistics,
      db.attempts,
      async () => {
        // Handle single problem set
        if (jsonData.problemSet && jsonData.problems) {
          const { name, description, ...rest } = jsonData.problemSet;
          await this.importSingleProblemSet(
            {
              ...rest,
              name: toLocalizedContent(name),
              description: description ? toLocalizedContent(description) : undefined,
            },
            jsonData.problems,
            jsonData.version
          );
        }

        // Handle multiple problem sets
        if (jsonData.problemSets) {
          for (const ps of jsonData.problemSets) {
            const { name, description, ...rest } = ps;
            await this.importSingleProblemSet(
              {
                ...rest,
                name: toLocalizedContent(name),
                description: description ? toLocalizedContent(description) : undefined,
              },
              ps.problems,
              jsonData.version
            );
          }
        }
      }
    );
  }

  /**
   * Import a single problem set with version checking
   */
  private async importSingleProblemSet(
    problemSetData: {
      name: string | LocalizedContent;
      description?: string | LocalizedContent;
      problemSetKey: string;
      difficulty?: string;
      metadata?: Record<string, unknown>;
    },
    problems: Array<{ 
      problem: string; 
      answer: string;
      problem_audio?: string;
      answer_audio?: string;
    }>,
    version: string
  ): Promise<void> {
    // Check if problem set already exists
    const existing = await db.problemSets
      .where('problemSetKey')
      .equals(problemSetData.problemSetKey)
      .first();

    // If exists, check version
    if (existing) {
      const versionComparison = compareVersions(version, existing.version);

      // Skip if same version or lower version
      if (versionComparison <= 0) {
        return;
      }

      // Upgrade: Replace old problem set with new one
      await this.upgradeProblemSet(
        existing.id!,
        problemSetData,
        problems,
        version
      );
    } else {
      // New problem set: Add it
      await this.addNewProblemSet(problemSetData, problems, version);
    }
  }

  /**
   * Add a new problem set
   */
  private async addNewProblemSet(
    problemSetData: {
      name: LocalizedString;
      description?: LocalizedString;
      problemSetKey: string;
      difficulty?: string;
      metadata?: Record<string, unknown>;
    },
    problems: Array<{ 
      problem: string; 
      answer: string;
      problem_audio?: string;
      answer_audio?: string;
    }>,
    version: string
  ): Promise<void> {
    const problemSetId = generateId();

    await db.problemSets.add({
      id: problemSetId,
      name: toLocalizedContent(problemSetData.name),
      description: problemSetData.description
        ? toLocalizedContent(problemSetData.description)
        : undefined,
      problemSetKey: problemSetData.problemSetKey,
      difficulty: problemSetData.difficulty,
      enabled: true,
      version: version,
      createdAt: Date.now(),
      metadata: problemSetData.metadata,
    });

    for (const p of problems) {
      const problemId = generateId();
      await db.problems.add({
        id: problemId,
        problemSetId: problemSetId,
        problem: p.problem,
        answer: p.answer,
        problemAudio: p.problem_audio,
        answerAudio: p.answer_audio,
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

  /**
   * Upgrade an existing problem set
   */
  private async upgradeProblemSet(
    problemSetId: string,
    problemSetData: {
      name: LocalizedString;
      description?: LocalizedString;
      problemSetKey: string;
      difficulty?: string;
      metadata?: Record<string, unknown>;
    },
    newProblems: Array<{ 
      problem: string; 
      answer: string;
      problem_audio?: string;
      answer_audio?: string;
    }>,
    version: string
  ): Promise<void> {
    // Get existing problems
    const existingProblems = await db.problems
      .where('problemSetId')
      .equals(problemSetId)
      .toArray();

    // Build a map of existing statistics by problem+answer
    const existingStatsMap = new Map<string, ProblemStatistics>();
    for (const problem of existingProblems) {
      const key = `${problem.problem}|${problem.answer}`;
      const stats = await db.statistics.get(problem.id!);
      if (stats) {
        existingStatsMap.set(key, stats);
      }
    }

    // Delete old problems, attempts, and statistics
    for (const problem of existingProblems) {
      if (problem.id) {
        await db.statistics.delete(problem.id);
        await db.attempts.where('problemId').equals(problem.id).delete();
        await db.problems.delete(problem.id);
      }
    }

    // Update problem set metadata
    await db.problemSets.update(problemSetId, {
      name: toLocalizedContent(problemSetData.name),
      description: problemSetData.description
        ? toLocalizedContent(problemSetData.description)
        : undefined,
      difficulty: problemSetData.difficulty,
      version: version,
      metadata: problemSetData.metadata,
    });

    // Add new problems
    for (const p of newProblems) {
      const problemId = generateId();
      await db.problems.add({
        id: problemId,
        problemSetId: problemSetId,
        problem: p.problem,
        answer: p.answer,
        problemAudio: p.problem_audio,
        answerAudio: p.answer_audio,
        createdAt: Date.now(),
      });

      // Check if this problem existed before
      const key = `${p.problem}|${p.answer}`;
      const oldStats = existingStatsMap.get(key);

      if (oldStats) {
        // Preserve old statistics
        await db.statistics.add({
          ...oldStats,
          problemId: problemId,
        });
      } else {
        // Create new statistics
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

  /**
   * Get all problem sets
   */
  async getProblemSets(problemSetKey?: string): Promise<ProblemSet[]> {
    if (problemSetKey) {
      return await db.problemSets
        .where('problemSetKey')
        .equals(problemSetKey)
        .toArray();
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
   * Get the version of a problem set by its problemSetKey
   * Returns the version string if found, null if not found, or undefined if no version is set
   */
  async getProblemSetVersion(problemSetKey: string): Promise<string | null | undefined> {
    const problemSet = await db.problemSets
      .where('problemSetKey')
      .equals(problemSetKey)
      .first();
    
    if (!problemSet) {
      return null;
    }
    
    return problemSet.version;
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
   * Delete problem sets that are not listed in the provided manifest.
   * This will remove the problem set records and all associated problems, attempts and statistics.
   */
  async deleteProblemSetsNotInManifest(manifest: {
    problemSets: { problemSetKey: string }[];
  }): Promise<void> {
    const manifestKeys = new Set(
      manifest.problemSets.map((p) => p.problemSetKey)
    );

    const allProblemSets = await db.problemSets.toArray();

    for (const ps of allProblemSets) {
      if (!manifestKeys.has(ps.problemSetKey)) {
        if (ps.id) {
          await this.deleteProblemSet(ps.id);
        }
      }
    }
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
   * Get problems by problem set key
   */
  async getProblemsByProblemSetKey(problemSetKey: string): Promise<Problem[]> {
    const problemSets = await db.problemSets
      .where('problemSetKey')
      .equals(problemSetKey)
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
    problemSetId?: string
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
        // Filter by problemSetId if specified
        if (problemSetId && problem.problemSetId !== problemSetId) {
          continue;
        }

        const problemSet = await db.problemSets.get(problem.problemSetId);

        summaries.push({
          problemId: stat.problemId,
          problem: problem.problem,
          answer: problem.answer,
          problemSetKey: problemSet?.problemSetKey || 'unknown',
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
   * Reset statistics for problems of a specific problem set
   */
  async resetStatisticsByProblemSetId(problemSetId: string): Promise<void> {
    await db.transaction(
      'rw',
      db.problems,
      db.attempts,
      db.statistics,
      async () => {
        // Get all problem IDs for this problem set
        const problems = await db.problems
          .where('problemSetId')
          .equals(problemSetId)
          .toArray();
        const problemIds = problems.map((p) => p.id!);

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
