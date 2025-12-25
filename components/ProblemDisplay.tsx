// components/ProblemDisplay.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Volume2 } from 'lucide-react';
import type { Problem } from '@/types';

const AUDIO_BASE_URL = 'https://images.shangjiaming.top';

interface ProblemDisplayProps {
  problem: Problem | null;
}

export function ProblemDisplay({ problem }: ProblemDisplayProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const [isProblemAudioPlaying, setIsProblemAudioPlaying] = useState(false);
  const [isAnswerAudioPlaying, setIsAnswerAudioPlaying] = useState(false);
  const problemAudioRef = useRef<HTMLAudioElement>(null);
  const answerAudioRef = useRef<HTMLAudioElement>(null);
  const prevProblemIdRef = useRef<string | undefined>(undefined);

  // Auto-play and cleanup when problem changes
  useEffect(() => {
    // Check if problem actually changed
    if (problem?.id !== prevProblemIdRef.current) {
      prevProblemIdRef.current = problem?.id;

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
    }
  }, [problem]);

  // Reset showAnswer state when problem changes (using key prop instead)

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
      className="relative flex h-80 max-h-[28rem] min-h-[16rem] w-full items-stretch justify-center p-8 bg-white rounded-lg shadow overflow-hidden"
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

      {/* Add extra top padding to prevent overlap with the button group */}
      <div className="w-full flex flex-col items-center pt-16 overflow-y-auto">
        <p className="text-center text-6xl font-bold text-gray-900 break-words">
          {problem.problem}
        </p>

        {showAnswer && (
          <div className="mt-4 flex items-center gap-4">
            <p className="text-center text-2xl font-medium text-green-600 break-words">
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
