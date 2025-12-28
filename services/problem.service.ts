// services/problem.service.ts - Problem selection and management
import { db } from '@/lib/db';
import { databaseService } from './database.service';
import type { Problem, ProblemSetJSON, ProblemSetManifest } from '@/types';
import { TOP_PROBLEMS_POOL } from '@/lib/constants';
import { compareVersions } from '@/lib/utils';

export class ProblemService {
  /**
   * Load manifest file listing all available problem sets
   */
  async loadManifest(): Promise<ProblemSetManifest> {
    try {
      const response = await fetch('/problem-sets/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to load manifest:', error);
      throw new Error('Failed to load manifest');
    }
  }

  /**
   * Load problem set from file
   */
  async loadProblemSetFromFile(file: File): Promise<void> {
    const text = await file.text();
    const jsonData: ProblemSetJSON = JSON.parse(text);
    await databaseService.importProblemsFromJSON(jsonData);
  }

  /**
   * Load default problem sets from public folder using manifest
   * Optimized to only fetch and import problem sets when:
   * 1. The problem set doesn't exist locally (null version)
   * 2. The manifest version is higher than the local version
   */
  async loadDefaultProblemSets(): Promise<void> {
    try {
      // Load manifest
      const manifest = await this.loadManifest();

      // Import each problem set from manifest only if needed
      for (const entry of manifest.problemSets) {
        try {
          // Check current version in database
          const localVersion = await databaseService.getProblemSetVersion(
            entry.problemSetKey
          );

          // Determine if we need to fetch and import
          const shouldImport =
            localVersion === null || // New problem set
            localVersion === undefined || // Problem set without version field
            compareVersions(entry.version, localVersion) > 0; // Newer version available

          if (!shouldImport) {
            // Skip fetching if local version is up to date
            continue;
          }

          // Fetch and import the problem set
          const response = await fetch(entry.path);
          if (!response.ok) {
            console.warn(
              `Failed to load problem set from ${entry.path}: ${response.status}`
            );
            continue;
          }
          const jsonData: ProblemSetJSON = await response.json();
          await databaseService.importProblemsFromJSON(jsonData);
        } catch (error) {
          console.error(`Error loading problem set ${entry.name}:`, error);
          // Continue with other problem sets even if one fails
        }
      }

      // Remove any problem sets in the local DB that are no longer listed in the manifest
      await databaseService.deleteProblemSetsNotInManifest(manifest);
    } catch (error) {
      console.error('Failed to load default problem sets:', error);
      throw new Error('Failed to initialize problem sets');
    }
  }

  /**
   * Get next problem to display based on priority
   */
  async getNextProblem(
    problemSetKey: string,
    excludeIds: string[] = []
  ): Promise<Problem | null> {
    // Get enabled problem sets of the selected problemSetKey
    const problemSets = await db.problemSets
      .where('problemSetKey')
      .equals(problemSetKey)
      .and((ps) => ps.enabled)
      .toArray();

    if (problemSets.length === 0) return null;

    const problemSetIds = problemSets
      .map((ps) => ps.id)
      .filter((id): id is string => id !== undefined);

    // Get problems from these sets
    const problems = await db.problems
      .where('problemSetId')
      .anyOf(problemSetIds)
      .toArray();

    if (problems.length === 0) return null;

    // Get statistics and filter by priority
    const problemsWithStats = await Promise.all(
      problems.map(async (p) => {
        const stats = await db.statistics.get(p.id!);
        return { problem: p, stats };
      })
    );

    // Filter out recently shown problems and sort by priority
    const available = problemsWithStats
      .filter(({ problem }) => problem.id && !excludeIds.includes(problem.id))
      .sort((a, b) => (b.stats?.priority || 0) - (a.stats?.priority || 0));

    if (available.length === 0) {
      // If all problems were excluded, clear the exclusion list
      return this.getNextProblem(problemSetKey, []);
    }

    // Select from top problems randomly to add variety
    const topProblems = available.slice(
      0,
      Math.min(TOP_PROBLEMS_POOL, available.length)
    );
    const randomIndex = Math.floor(Math.random() * topProblems.length);

    return topProblems[randomIndex].problem;
  }

  /**
   * Get ordered problem queue for display
   */
  async getOrderedProblemQueue(
    problemSetKey: string,
    limit = 10
  ): Promise<Problem[]> {
    const problemSets = await db.problemSets
      .where('problemSetKey')
      .equals(problemSetKey)
      .and((ps) => ps.enabled)
      .toArray();

    if (problemSets.length === 0) return [];

    const problemSetIds = problemSets
      .map((ps) => ps.id)
      .filter((id): id is string => id !== undefined);

    const problems = await db.problems
      .where('problemSetId')
      .anyOf(problemSetIds)
      .toArray();

    const problemsWithStats = await Promise.all(
      problems.map(async (p) => {
        const stats = await db.statistics.get(p.id!);
        return { problem: p, stats };
      })
    );

    return problemsWithStats
      .sort((a, b) => (b.stats?.priority || 0) - (a.stats?.priority || 0))
      .slice(0, limit)
      .map(({ problem }) => problem);
  }

  /**
   * Validate answer (for future use if needed)
   */
  validateAnswer(problem: Problem, userAnswer: string): boolean {
    return (
      problem.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase()
    );
  }

  /**
   * Check if problems exist in database
   */
  async hasProblems(): Promise<boolean> {
    const count = await db.problems.count();
    return count > 0;
  }

  /**
   * Generate session queue with all problems in random order
   * - Include all problems from the selected problem set
   * - Return shuffled array of problem IDs with no duplicates
   * @param typeOrProblemSetId - problemSetKey or problemSetId
   * @param useProblemSetId - if true, use problemSetId; otherwise use problemSetKey
   * @param coverage - percentage of problems to include (30, 50, 80, 100)
   */
  async generateSessionQueue(
    typeOrProblemSetId: string,
    useProblemSetId: boolean = false,
    coverage: number = 100
  ): Promise<string[]> {
    let problems: Problem[];

    if (useProblemSetId) {
      // Filter by specific problem set ID
      problems = await db.problems
        .where('problemSetId')
        .equals(typeOrProblemSetId)
        .toArray();
    } else {
      // Filter by problemSetKey (original behavior for backward compatibility)
      const problemSets = await db.problemSets
        .where('problemSetKey')
        .equals(typeOrProblemSetId)
        .and((ps) => ps.enabled)
        .toArray();

      if (problemSets.length === 0) return [];

      const problemSetIds = problemSets
        .map((ps) => ps.id)
        .filter((id): id is string => id !== undefined);

      // Get problems from these sets
      problems = await db.problems
        .where('problemSetId')
        .anyOf(problemSetIds)
        .toArray();
    }

    if (problems.length === 0) return [];

    // Apply coverage filter if less than 100%
    let filteredProblems = problems;
    if (coverage < 100) {
      // Get statistics for all problems to sort by priority
      const problemsWithStats = await Promise.all(
        problems.map(async (p) => {
          const stats = await db.statistics.get(p.id!);
          return { problem: p, stats };
        })
      );

      // Sort by priority (highest first)
      problemsWithStats.sort(
        (a, b) => (b.stats?.priority || 0) - (a.stats?.priority || 0)
      );

      // Calculate number of problems to include
      const problemCount = Math.round((problems.length * coverage) / 100);

      // Take top X% of problems
      filteredProblems = problemsWithStats
        .slice(0, problemCount)
        .map(({ problem }) => problem);
    }

    // Collect all problem IDs
    const sessionProblems: string[] = filteredProblems
      .map((problem) => problem.id)
      .filter((id): id is string => id !== undefined);

    // Shuffle the array to randomize order
    return this.shuffleArray(sessionProblems);
  }

  /**
   * Shuffle array using Fisher-Yates algorithm
   */
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export const problemService = new ProblemService();
