import { useState, useEffect, useCallback } from 'react';

// Time constants in milliseconds
const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;

const UPDATE_INTERVAL_MS = 1000;

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isComplete: boolean;
}

const INITIAL_TIME: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isComplete: false,
};

/**
 * Custom hook for countdown timer logic
 * @param targetDate - The date to count down to
 * @returns TimeLeft object with days, hours, minutes, seconds, and completion status
 */
export function useCountdown(targetDate: Date): TimeLeft {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(INITIAL_TIME);

  const calculateTimeLeft = useCallback((): TimeLeft => {
    const now = Date.now();
    const distance = targetDate.getTime() - now;

    if (distance <= 0) {
      return { ...INITIAL_TIME, isComplete: true };
    }

    return {
      days: Math.floor(distance / MS_PER_DAY),
      hours: Math.floor((distance % MS_PER_DAY) / MS_PER_HOUR),
      minutes: Math.floor((distance % MS_PER_HOUR) / MS_PER_MINUTE),
      seconds: Math.floor((distance % MS_PER_MINUTE) / MS_PER_SECOND),
      isComplete: false,
    };
  }, [targetDate]);

  useEffect(() => {
    // Calculate immediately on mount
    setTimeLeft(calculateTimeLeft());

    // Update every second
    const intervalId = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, UPDATE_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [calculateTimeLeft]);

  return timeLeft;
}

