// services/problem.service.ts - Problem selection and management
import { db } from '@/lib/db';
import { databaseService } from './database.service';
import type { Problem, ProblemSetJSON } from '@/types';
import {
  RECENT_PROBLEMS_LIMIT,
  TOP_PROBLEMS_POOL,
  PROBLEM_SET_PATHS,
} from '@/lib/constants';

export class ProblemService {
  /**
   * Load problem set from file
   */
  async loadProblemSetFromFile(file: File): Promise<void> {
    const text = await file.text();
    const jsonData: ProblemSetJSON = JSON.parse(text);
    await databaseService.importProblemsFromJSON(jsonData);
  }

  /**
   * Load default problem sets from public folder
   */
  async loadDefaultProblemSets(): Promise<void> {
    try {
      const additionResponse = await fetch(PROBLEM_SET_PATHS.ADDITION);
      const additionData: ProblemSetJSON = await additionResponse.json();
      await databaseService.importProblemsFromJSON(additionData);

      const subtractionResponse = await fetch(PROBLEM_SET_PATHS.SUBTRACTION);
      const subtractionData: ProblemSetJSON = await subtractionResponse.json();
      await databaseService.importProblemsFromJSON(subtractionData);
    } catch (error) {
      console.error('Failed to load default problem sets:', error);
      throw new Error('Failed to initialize problem sets');
    }
  }

  /**
   * Get next problem to display based on priority
   */
  async getNextProblem(
    type: string,
    excludeIds: string[] = []
  ): Promise<Problem | null> {
    // Get enabled problem sets of the selected type
    const problemSets = await db.problemSets
      .where('type')
      .equals(type)
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
      .filter(
        ({ problem }) =>
          problem.id && !excludeIds.includes(problem.id)
      )
      .sort((a, b) => (b.stats?.priority || 0) - (a.stats?.priority || 0));

    if (available.length === 0) {
      // If all problems were excluded, clear the exclusion list
      return this.getNextProblem(type, []);
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
    type: string,
    limit = 10
  ): Promise<Problem[]> {
    const problemSets = await db.problemSets
      .where('type')
      .equals(type)
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
    return problem.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
  }

  /**
   * Check if problems exist in database
   */
  async hasProblems(): Promise<boolean> {
    const count = await db.problems.count();
    return count > 0;
  }

  /**
   * Generate session queue based on success ratios
   * - Include all problems with success ratio < 90%
   * - Include problems with success ratio >= 90% with 30% probability
   * - If no statistics exist, include all problems
   * - Return shuffled array of problem IDs
   */
  async generateSessionQueue(type: string): Promise<string[]> {
    // Get enabled problem sets of the selected type
    const problemSets = await db.problemSets
      .where('type')
      .equals(type)
      .and((ps) => ps.enabled)
      .toArray();

    if (problemSets.length === 0) return [];

    const problemSetIds = problemSets
      .map((ps) => ps.id)
      .filter((id): id is string => id !== undefined);

    // Get problems from these sets
    const problems = await db.problems
      .where('problemSetId')
      .anyOf(problemSetIds)
      .toArray();

    if (problems.length === 0) return [];

    // Get statistics for each problem and determine inclusion
    const sessionProblems: string[] = [];

    for (const problem of problems) {
      if (!problem.id) continue;

      const stats = await db.statistics.get(problem.id);

      // If no statistics, include all problems
      if (!stats || stats.totalAttempts === 0) {
        sessionProblems.push(problem.id);
        continue;
      }

      // Calculate success ratio
      const successRatio = stats.passCount / stats.totalAttempts;

      // Include if success ratio < 0.9 (90%)
      if (successRatio < 0.9) {
        sessionProblems.push(problem.id);
      } else {
        // Include with 30% probability if success ratio >= 90%
        if (Math.random() < 0.3) {
          sessionProblems.push(problem.id);
        }
      }
    }

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
