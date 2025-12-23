// tests/unit/components/SessionTimer.test.tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { SessionTimer } from '@/components/SessionTimer';

describe('SessionTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Display and Formatting', () => {
    it('should render elapsed time in HH:MM:SS format', () => {
      const startTime = Date.now() - 3665000; // 1 hour, 1 minute, 5 seconds ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('01:01:05')).toBeInTheDocument();
    });

    it('should display 00:00:00 when session just started', () => {
      const startTime = Date.now();
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:00:00')).toBeInTheDocument();
    });

    it('should display time with leading zeros for single digits', () => {
      const startTime = Date.now() - 65000; // 1 minute, 5 seconds ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:01:05')).toBeInTheDocument();
    });

    it('should handle hours correctly when over 24 hours', () => {
      const startTime = Date.now() - 90000000; // 25 hours ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('25:00:00')).toBeInTheDocument();
    });
  });

  describe('Timer Updates', () => {
    it('should update timer every second', () => {
      const startTime = Date.now();
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:01')).toBeInTheDocument();

      // Advance time by another second
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:00:02')).toBeInTheDocument();
    });

    it('should continue updating across minute boundaries', () => {
      const startTime = Date.now() - 59000; // 59 seconds ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:00:59')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('00:01:00')).toBeInTheDocument();
    });

    it('should continue updating across hour boundaries', () => {
      const startTime = Date.now() - 3599000; // 59 minutes, 59 seconds ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:59:59')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(screen.getByText('01:00:00')).toBeInTheDocument();
    });
  });

  describe('Session State', () => {
    it('should not render when isSessionActive is false', () => {
      const startTime = Date.now();
      const { container } = render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={false} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when sessionStartTime is null', () => {
      const { container } = render(
        <SessionTimer sessionStartTime={null} isSessionActive={true} />
      );

      expect(container.firstChild).toBeNull();
    });

    it('should not render when both sessionStartTime is null and isSessionActive is false', () => {
      const { container } = render(
        <SessionTimer sessionStartTime={null} isSessionActive={false} />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('should clean up interval on unmount', () => {
      const startTime = Date.now();
      const { unmount } = render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      const intervalCount = vi.getTimerCount();
      unmount();

      expect(vi.getTimerCount()).toBeLessThan(intervalCount);
    });

    it('should clean up interval when session becomes inactive', () => {
      const startTime = Date.now();
      const { rerender } = render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByText('00:00:00')).toBeInTheDocument();

      rerender(
        <SessionTimer sessionStartTime={startTime} isSessionActive={false} />
      );

      const intervalCountBefore = vi.getTimerCount();
      vi.advanceTimersByTime(5000);
      const intervalCountAfter = vi.getTimerCount();

      // Timer should be cleaned up
      expect(intervalCountAfter).toBeLessThanOrEqual(intervalCountBefore);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA label', () => {
      const startTime = Date.now();
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      expect(screen.getByLabelText('Session elapsed time')).toBeInTheDocument();
    });

    it('should use semantic time element', () => {
      const startTime = Date.now() - 125000; // 2 minutes, 5 seconds ago
      render(
        <SessionTimer sessionStartTime={startTime} isSessionActive={true} />
      );

      const timeElement = screen.getByText('00:02:05');
      expect(timeElement.tagName).toBe('TIME');
    });
  });
});
