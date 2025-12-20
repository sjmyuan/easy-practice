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
}

export const problemService = new ProblemService();
