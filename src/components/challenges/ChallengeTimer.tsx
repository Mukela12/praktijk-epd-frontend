import React, { useState, useEffect, useRef } from 'react';
import {
  PlayIcon,
  PauseIcon,
  StopIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  FireIcon
} from '@heroicons/react/24/outline';
import { realApiService } from '@/services/realApi';
import { useAlert } from '@/components/ui/CustomAlert';
import { PremiumCard, PremiumButton, StatusBadge } from '@/components/layout/PremiumLayout';
import { formatDuration } from '@/utils/dateFormatters';

interface ChallengeTimerProps {
  challengeId: string;
  challengeTitle: string;
  targetMinutes: number;
  onComplete: (duration: number) => void;
  instructions?: string[];
}

const ChallengeTimer: React.FC<ChallengeTimerProps> = ({
  challengeId,
  challengeTitle,
  targetMinutes,
  onComplete,
  instructions
}) => {
  const { success, error } = useAlert();
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [moodBefore, setMoodBefore] = useState<number | null>(null);
  const [moodAfter, setMoodAfter] = useState<number | null>(null);
  const [showMoodBefore, setShowMoodBefore] = useState(true);
  const [showCompletion, setShowCompletion] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);
  const [checkinId, setCheckinId] = useState<string | null>(null);

  const targetSeconds = targetMinutes * 60;
  const progress = Math.min((elapsedSeconds / targetSeconds) * 100, 100);
  const remainingSeconds = Math.max(targetSeconds - elapsedSeconds, 0);

  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    // Check if target time is reached
    if (elapsedSeconds >= targetSeconds && isRunning) {
      handleComplete();
    }
  }, [elapsedSeconds, targetSeconds, isRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = async () => {
    if (moodBefore === null) {
      error('Please rate your mood before starting');
      return;
    }

    try {
      // Start challenge check-in via API
      const today = new Date().toISOString().split('T')[0];
      const response = await realApiService.challenges.startCheckIn(challengeId, today, moodBefore);

      if (response.success && response.data) {
        // Store mood rating and checkin ID locally
        localStorage.setItem(`challenge-${challengeId}-mood`, moodBefore.toString());
        // Check for checkInId in nested data structure
        const responseData = response.data as any;
        const checkInId = responseData.data?.checkInId || responseData.checkInId || responseData.checkinId;
        setCheckinId(checkInId);
        setIsRunning(true);
        setIsPaused(false);
        setShowMoodBefore(false);
        startTimeRef.current = new Date();
        success('Challenge started! Stay focused and present.');
      }
    } catch (err) {
      error('Failed to start challenge. Please try again.');
    }
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (elapsedSeconds < 60) {
      error('Please complete at least 1 minute before stopping');
      return;
    }
    handleComplete();
  };

  const handleComplete = async () => {
    setIsRunning(false);
    setIsPaused(false);
    setShowCompletion(true);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const submitCompletion = async () => {
    if (moodAfter === null) {
      error('Please rate your mood after completing');
      return;
    }

    if (!checkinId) {
      error('No active check-in found');
      return;
    }

    try {
      // Get stored mood before rating
      const storedMoodBefore = localStorage.getItem(`challenge-${challengeId}-mood`);
      const notes = `Duration: ${Math.floor(elapsedSeconds / 60)} minutes. Mood before: ${storedMoodBefore || 'N/A'}, Mood after: ${moodAfter}. ${elapsedSeconds >= targetSeconds ? 'Completed successfully!' : 'Partial completion.'}`;
      
      const response = await realApiService.challenges.completeCheckIn(challengeId, checkinId, {
        notes,
        moodAfter: moodAfter,
        duration: Math.floor(elapsedSeconds / 60),
        completed: elapsedSeconds >= targetSeconds
      });

      if (response.success) {
        // Clean up local storage
        localStorage.removeItem(`challenge-${challengeId}-mood`);
        success('Challenge completed! Great job! 🎉');
        onComplete(elapsedSeconds);
      }
    } catch (err) {
      error('Failed to save progress. Please try again.');
    }
  };

  const MoodRating = ({ value, onChange, label }: { value: number | null; onChange: (v: number) => void; label: string }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex justify-center space-x-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <button
            key={num}
            onClick={() => onChange(num)}
            className={`
              w-10 h-10 rounded-lg font-medium transition-all
              ${value === num 
                ? 'bg-blue-600 text-white shadow-md transform scale-110' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }
            `}
          >
            {num}
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 text-center">1 = Very Low, 10 = Very High</p>
    </div>
  );

  if (showMoodBefore && !isRunning) {
    return (
      <PremiumCard>
        <div className="text-center space-y-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{challengeTitle}</h3>
            <p className="text-sm text-gray-600 mt-1">Duration: {targetMinutes} minutes</p>
          </div>

          {instructions && instructions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4 text-left">
              <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-block w-5 h-5 bg-blue-200 rounded-full text-blue-900 text-xs font-medium text-center mr-2 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <MoodRating 
            value={moodBefore} 
            onChange={setMoodBefore} 
            label="How are you feeling right now?"
          />

          <PremiumButton
            variant="primary"
            size="lg"
            icon={PlayIcon}
            onClick={handleStart}
            disabled={moodBefore === null}
            className="w-full max-w-xs mx-auto"
          >
            Start Challenge
          </PremiumButton>
        </div>
      </PremiumCard>
    );
  }

  if (showCompletion) {
    return (
      <PremiumCard>
        <div className="text-center space-y-6">
          <CheckCircleIcon className="w-20 h-20 text-green-600 mx-auto" />
          
          <div>
            <h3 className="text-2xl font-semibold text-gray-900">
              {elapsedSeconds >= targetSeconds ? 'Challenge Completed!' : 'Challenge Stopped'}
            </h3>
            <p className="text-lg text-gray-600 mt-2">
              You practiced for {formatTime(elapsedSeconds)}
            </p>
            {elapsedSeconds >= targetSeconds && (
              <div className="flex items-center justify-center mt-3 text-yellow-600">
                <TrophyIcon className="w-6 h-6 mr-1" />
                <span className="font-medium">Goal Achieved!</span>
              </div>
            )}
          </div>

          <MoodRating 
            value={moodAfter} 
            onChange={setMoodAfter} 
            label="How are you feeling now?"
          />

          {moodBefore !== null && moodAfter !== null && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">Mood Change:</p>
              <p className="text-2xl font-semibold">
                {moodBefore} → {moodAfter}
                {moodAfter > moodBefore && (
                  <span className="text-green-600 text-lg ml-2">↑ +{moodAfter - moodBefore}</span>
                )}
                {moodAfter < moodBefore && (
                  <span className="text-red-600 text-lg ml-2">↓ {moodAfter - moodBefore}</span>
                )}
                {moodAfter === moodBefore && (
                  <span className="text-gray-600 text-lg ml-2">→ No change</span>
                )}
              </p>
            </div>
          )}

          <PremiumButton
            variant="primary"
            size="lg"
            onClick={submitCompletion}
            disabled={moodAfter === null}
            className="w-full max-w-xs mx-auto"
          >
            Save Progress
          </PremiumButton>
        </div>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900">{challengeTitle}</h3>
          <p className="text-sm text-gray-600 mt-1">Stay focused and present</p>
        </div>

        {/* Timer Display */}
        <div className="relative w-48 h-48 mx-auto">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-gray-200"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
              className="text-blue-600 transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <ClockIcon className="w-8 h-8 text-gray-400 mb-2" />
            <p className="text-3xl font-bold text-gray-900">{formatTime(elapsedSeconds)}</p>
            <p className="text-sm text-gray-500">of {targetMinutes} min</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Progress</p>
            <p className="text-lg font-semibold text-gray-900">{Math.round(progress)}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Remaining</p>
            <p className="text-lg font-semibold text-gray-900">{formatTime(remainingSeconds)}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <StatusBadge 
              status={isPaused ? 'Paused' : 'Active'} 
              type={isPaused ? 'warning' : 'success'}
              size="sm"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex justify-center space-x-3">
          <PremiumButton
            variant={isPaused ? 'primary' : 'outline'}
            size="lg"
            icon={isPaused ? PlayIcon : PauseIcon}
            onClick={handlePause}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </PremiumButton>
          
          <PremiumButton
            variant="danger"
            size="lg"
            icon={StopIcon}
            onClick={handleStop}
          >
            {elapsedSeconds >= targetSeconds ? 'Finish' : 'Stop'}
          </PremiumButton>
        </div>

        {/* Motivational Message */}
        <div className="text-center">
          <p className="text-sm text-gray-600 italic">
            {elapsedSeconds < 60 && "You're doing great! Keep going..."}
            {elapsedSeconds >= 60 && elapsedSeconds < targetSeconds / 2 && "Excellent progress! You're building the habit."}
            {elapsedSeconds >= targetSeconds / 2 && elapsedSeconds < targetSeconds && "More than halfway there! Stay strong!"}
            {elapsedSeconds >= targetSeconds && "Amazing! You've reached your goal! 🎉"}
          </p>
        </div>
      </div>
    </PremiumCard>
  );
};

export default ChallengeTimer;