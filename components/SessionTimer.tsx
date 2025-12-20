// components/SessionTimer.tsx
'use client';

import React, { useState, useEffect } from 'react';

interface SessionTimerProps {
  sessionStartTime: number | null;
  isSessionActive: boolean;
}

export function SessionTimer({
  sessionStartTime,
  isSessionActive,
}: SessionTimerProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isSessionActive || !sessionStartTime) {
      return;
    }

    // Update function to calculate and set elapsed time
    const updateElapsedTime = () => {
      setElapsedTime(Date.now() - sessionStartTime);
    };

    // Initial update
    updateElapsedTime();

    // Update every second
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [sessionStartTime, isSessionActive]);

  // Don't render if session is not active or start time is null
  if (!isSessionActive || !sessionStartTime) {
    return null;
  }

  // Format elapsed time as HH:MM:SS
  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, '0'))
      .join(':');
  };

  return (
    <div
      className="text-center text-2xl font-semibold text-gray-700"
      aria-label="Session elapsed time"
    >
      <time>{formatTime(elapsedTime)}</time>
    </div>
  );
}
