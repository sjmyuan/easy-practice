// tests/unit/lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { calculatePriority, formatPercentage, cn } from '@/lib/utils';

describe('Utils', () => {
  describe('calculatePriority', () => {
    it('should return 50 for new problems', () => {
      const priority = calculatePriority({
        totalAttempts: 0,
        passCount: 0,
        failCount: 0,
      });
      expect(priority).toBe(50);
    });

    it('should return higher priority for failed problems', () => {
      const priority = calculatePriority({
        totalAttempts: 3,
        passCount: 0,
        failCount: 3,
      });
      expect(priority).toBe(100);
    });

    it('should reduce priority for mastered problems', () => {
      const priority = calculatePriority({
        totalAttempts: 4,
        passCount: 3,
        failCount: 1,
      });
      expect(priority).toBeLessThan(25);
    });
  });

  describe('formatPercentage', () => {
    it('should format decimal as percentage', () => {
      expect(formatPercentage(0.5)).toBe('50%');
      expect(formatPercentage(0.75)).toBe('75%');
      expect(formatPercentage(1)).toBe('100%');
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });
  });
});
