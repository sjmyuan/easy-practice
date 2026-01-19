// services/problem.service.ts - Problem loading and management (in-memory)
import type { Problem, ProblemSet, ProblemSetJSON, ProblemSetManifest } from '@/types';
import { TOP_PROBLEMS_POOL } from '@/lib/constants';
import { generateId } from '@/lib/utils';

/**
 * In-memory problem service - loads problem sets from JSON files
 * No persistence - fresh data on each load
 */
export class ProblemService {
  private problemSets: Map<string, ProblemSet> = new Map();
  private problems: Map<string, Problem> = new Map();
  private problemSetProblems: Map<string, string[]> = new Map(); // problemSetId -> problemIds[]

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
   * Load default problem sets from public folder using manifest
   */
  async loadDefaultProblemSets(): Promise<void> {
    try {
      // Clear existing data
      this.problemSets.clear();
      this.problems.clear();
      this.problemSetProblems.clear();

      // Load manifest
      const manifest = await this.loadManifest();

      // Load each problem set from manifest
      for (const entry of manifest.problemSets) {
        try {
          const response = await fetch(entry.path);
          if (!response.ok) {
            console.warn(`Failed to load problem set from ${entry.path}: ${response.status}`);
            continue;
          }
          const jsonData: ProblemSetJSON = await response.json();
          this.importProblemsFromJSON(jsonData);
        } catch (error) {
          console.error(`Error loading problem set ${entry.name}:`, error);
        }
      }
    } catch (error) {
      console.error('Failed to load default problem sets:', error);
      throw new Error('Failed to initialize problem sets');
    }
  }

  /**
   * Import problems from JSON data into memory
   */
  private importProblemsFromJSON(jsonData: ProblemSetJSON): void {
    // Handle single problem set
    if (jsonData.problemSet && jsonData.problems) {
      this.importSingleProblemSet(jsonData.problemSet, jsonData.problems);
    }

    // Handle multiple problem sets
    if (jsonData.problemSets) {
      for (const ps of jsonData.problemSets) {
        this.importSingleProblemSet(ps, ps.problems);
      }
    }
  }

  /**
   * Import a single problem set into memory
   */
  private importSingleProblemSet(
    problemSetData: {
      name: string | { en: string; zh?: string };
      description?: string | { en: string; zh?: string };
      problemSetKey: string;
      difficulty?: string;
      metadata?: Record<string, unknown>;
    },
    problemsData: Array<{ 
      problem: string; 
      answer: string;
      problem_audio?: string;
      answer_audio?: string;
    }>
  ): void {
    const problemSetId = generateId();

    // Normalize name and description to LocalizedContent format
    const normalizeName = (val: string | { en: string; zh?: string }): string | { en: string; zh: string } => {
      if (typeof val === 'string') return val;
      return { en: val.en, zh: val.zh || val.en };
    };

    const normalizeDesc = (val?: string | { en: string; zh?: string }): string | { en: string; zh: string } | undefined => {
      if (!val) return undefined;
      if (typeof val === 'string') return val;
      return { en: val.en, zh: val.zh || val.en };
    };

    const problemSet: ProblemSet = {
      id: problemSetId,
      name: normalizeName(problemSetData.name),
      description: normalizeDesc(problemSetData.description),
      problemSetKey: problemSetData.problemSetKey,
      difficulty: problemSetData.difficulty,
      enabled: true,
      version: '1.0',
      createdAt: Date.now(),
      metadata: problemSetData.metadata,
    };

    this.problemSets.set(problemSetId, problemSet);

    const problemIds: string[] = [];
    for (const p of problemsData) {
      const problemId = generateId();
      const problem: Problem = {
        id: problemId,
        problemSetId: problemSetId,
        problem: p.problem,
        answer: p.answer,
        problemAudio: p.problem_audio,
        answerAudio: p.answer_audio,
        createdAt: Date.now(),
      };

      this.problems.set(problemId, problem);
      problemIds.push(problemId);
    }

    this.problemSetProblems.set(problemSetId, problemIds);
  }

  /**
   * Get all problem sets
   */
  getProblemSets(): ProblemSet[] {
    return Array.from(this.problemSets.values());
  }

  /**
   * Get problem sets by problemSetKey
   */
  getProblemSetsByKey(problemSetKey: string): ProblemSet[] {
    return Array.from(this.problemSets.values())
      .filter((ps) => ps.problemSetKey === problemSetKey && ps.enabled);
  }

  /**
   * Get problem by ID
   */
  getProblemById(id: string): Problem | undefined {
    return this.problems.get(id);
  }

  /**
   * Get all problems for a problem set
   */
  getProblemsForSet(problemSetId: string): Problem[] {
    const problemIds = this.problemSetProblems.get(problemSetId) || [];
    return problemIds
      .map((id) => this.problems.get(id))
      .filter((p): p is Problem => p !== undefined);
  }

  /**
   * Get all problems by problemSetKey
   */
  getProblemsByKey(problemSetKey: string): Problem[] {
    const sets = this.getProblemSetsByKey(problemSetKey);
    const allProblems: Problem[] = [];
    
    for (const set of sets) {
      if (set.id) {
        allProblems.push(...this.getProblemsForSet(set.id));
      }
    }
    
    return allProblems;
  }

  /**
   * Check if problems exist
   */
  hasProblems(): boolean {
    return this.problems.size > 0;
  }

  /**
   * Validate answer
   */
  validateAnswer(problem: Problem, userAnswer: string): boolean {
    return problem.answer.trim().toLowerCase() === userAnswer.trim().toLowerCase();
  }

  /**
   * Generate session queue with all problems in random order
   * @param problemSetKey - key for the problem set
   * @param coverage - percentage of problems to include (30, 50, 80, 100)
   */
  generateSessionQueue(
    problemSetKey: string,
    coverage: number = 100
  ): string[] {
    const problems = this.getProblemsByKey(problemSetKey);
    
    if (problems.length === 0) return [];

    // Apply coverage filter if less than 100%
    let filteredProblems = problems;
    if (coverage < 100) {
      // Calculate number of problems to include
      const problemCount = Math.round((problems.length * coverage) / 100);
      
      // Shuffle first, then take the specified count
      const shuffled = this.shuffleArray(problems);
      filteredProblems = shuffled.slice(0, problemCount);
    }

    // Collect all problem IDs
    const sessionProblems: string[] = filteredProblems
      .map((problem) => problem.id)
      .filter((id): id is string => id !== undefined);

    // Shuffle the array to randomize order
    return this.shuffleArray(sessionProblems);
  }

  /**
   * Get next problem from queue
   */
  getNextProblem(problemSetKey: string, excludeIds: string[] = []): Problem | null {
    const problems = this.getProblemsByKey(problemSetKey);
    
    if (problems.length === 0) return null;

    // Filter out excluded problems
    const available = problems.filter(
      (problem) => problem.id && !excludeIds.includes(problem.id)
    );

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

    return topProblems[randomIndex];
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
