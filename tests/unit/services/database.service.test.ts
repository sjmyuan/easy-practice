// tests/unit/services/database.service.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '@/services/database.service';

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(() => {
    service = new DatabaseService();
  });

  it('should be instantiated', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(DatabaseService);
  });

  it('should have required methods', () => {
    expect(typeof service.importProblemsFromJSON).toBe('function');
    expect(typeof service.getProblemSets).toBe('function');
    expect(typeof service.recordAttempt).toBe('function');
    expect(typeof service.getStruggledProblems).toBe('function');
  });
});
