// components/ProblemDisplay.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Volume2 } from 'lucide-react';
import type { Problem } from '@/types';
import { AUDIO_BASE_URL } from '@/lib/constants';

interface ProblemDisplayProps {
  problem: Problem | null;
}

/**
 * Calculate responsive font size classes based on content length
 * @param text - The text content to measure
 * @param isAnswer - Whether this is for the answer (uses smaller sizes)
 * @returns Tailwind CSS classes for responsive font sizing
 */
function getResponsiveFontSize(text: string, isAnswer = false): string {
  const length = text.length;
  const isLong = length >= 50;

  if (isAnswer) {
    // Answer font sizes
    if (isLong) {
      return 'text-base sm:text-lg md:text-lg';
    }
    return 'text-xl sm:text-xl md:text-2xl';
  }

  // Problem font sizes
  if (isLong) {
    return 'text-2xl sm:text-3xl md:text-3xl';
  }
  return 'text-4xl sm:text-5xl md:text-6xl';
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isProblemAudioPlaying, setIsProblemAudioPlaying] = useState(false);
  const [isAnswerAudioPlaying, setIsAnswerAudioPlaying] = useState(false);
  const problemAudioRef = useRef<HTMLAudioElement>(null);
  const answerAudioRef = useRef<HTMLAudioElement>(null);

  // Auto-play and cleanup when problem changes
  useEffect(() => {
    // Stop any playing audio when problem changes
    if (problemAudioRef.current) {
      problemAudioRef.current.pause();
      problemAudioRef.current.currentTime = 0;
    }
    if (answerAudioRef.current) {
      answerAudioRef.current.pause();
      answerAudioRef.current.currentTime = 0;
    }

    // Auto-play problem audio if available
    if (problem?.problemAudio && problemAudioRef.current) {
      problemAudioRef.current.play().catch((error) => {
        console.error('Failed to auto-play problem audio:', error);
      });
    }
  }, [problem?.id, problem?.problemAudio]);

  const handleProblemAudioClick = () => {
    if (problemAudioRef.current) {
      if (isProblemAudioPlaying) {
        problemAudioRef.current.pause();
        problemAudioRef.current.currentTime = 0;
      } else {
        problemAudioRef.current.play().catch((error) => {
          console.error('Failed to play problem audio:', error);
        });
      }
    }
  };

  const handleAnswerAudioClick = () => {
    if (answerAudioRef.current) {
      if (isAnswerAudioPlaying) {
        answerAudioRef.current.pause();
        answerAudioRef.current.currentTime = 0;
      } else {
        answerAudioRef.current.play().catch((error) => {
          console.error('Failed to play answer audio:', error);
        });
      }
    }
  };

  if (!problem) {
    return (
      <div
        className="flex min-h-[200px] items-center justify-center p-8"
        role="region"
        aria-label="Current math problem"
      >
        <p className="text-center text-xl text-gray-500">
          Select a problem type to begin
        </p>
      </div>
    );
  }

  const problemAudioUrl = problem.problemAudio
    ? `${AUDIO_BASE_URL}/${problem.problemAudio}`
    : undefined;
  const answerAudioUrl = problem.answerAudio
    ? `${AUDIO_BASE_URL}/${problem.answerAudio}`
    : undefined;

  return (
    <div
      key={problem.id}
      className="relative flex w-full items-stretch justify-center p-8 bg-white rounded-lg shadow"
      role="region"
      aria-label="Current math problem"
    >
      {/*
        Top-right button group: audio (if any) and show answer
        Always fixed at the top right, does not move with content.
      */}
      <div className="absolute top-4 right-4 flex flex-row gap-2 z-10">
        {problemAudioUrl && (
          <>
            <button
              onClick={handleProblemAudioClick}
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Play problem audio"
              type="button"
            >
              <Volume2
                className={`h-6 w-6 ${
                  isProblemAudioPlaying ? 'text-blue-600' : 'text-gray-600'
                }`}
              />
            </button>
            <audio
              ref={problemAudioRef}
              src={problemAudioUrl}
              onPlay={() => setIsProblemAudioPlaying(true)}
              onPause={() => setIsProblemAudioPlaying(false)}
              onEnded={() => setIsProblemAudioPlaying(false)}
              onError={() => setIsProblemAudioPlaying(false)}
            />
          </>
        )}
        <button
          onClick={() => setShowAnswer(!showAnswer)}
          className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label={showAnswer ? 'Hide answer' : 'Show answer'}
          type="button"
        >
          {showAnswer ? (
            <EyeOff className="h-6 w-6 text-gray-600" />
          ) : (
            <Eye className="h-6 w-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Content area with responsive padding */}
      <div className="w-full flex flex-col items-center pt-16 pb-4 px-2">
        <p className={`text-center font-bold text-gray-900 break-words ${getResponsiveFontSize(problem.problem)}`}>
          {problem.problem}
        </p>

        {showAnswer && (
          <div className="mt-4 flex items-center gap-4 flex-wrap justify-center">
            <p className={`text-center font-medium text-green-600 break-words ${getResponsiveFontSize(problem.answer, true)}`}>
              {problem.answer}
            </p>
            {answerAudioUrl && (
              <>
                <button
                  onClick={handleAnswerAudioClick}
                  className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                  aria-label="Play answer audio"
                  type="button"
                >
                  <Volume2
                    className={`h-6 w-6 ${
                      isAnswerAudioPlaying ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  />
                </button>
                <audio
                  ref={answerAudioRef}
                  src={answerAudioUrl}
                  onPlay={() => setIsAnswerAudioPlaying(true)}
                  onPause={() => setIsAnswerAudioPlaying(false)}
                  onEnded={() => setIsAnswerAudioPlaying(false)}
                  onError={() => setIsAnswerAudioPlaying(false)}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
