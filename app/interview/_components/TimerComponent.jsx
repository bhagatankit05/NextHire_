"use client"

import React, { useEffect, useRef, useState } from 'react';

const TimerComponent = ({ isRunning, onTick }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);
  const onTickRef = useRef(onTick);

  // Keep onTick reference up to date without triggering re-renders
  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isRunning) return;

    // Start the interval
    intervalRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);

  // Call onTick whenever seconds changes (in a separate effect)
  useEffect(() => {
    if (seconds > 0 && onTickRef.current) {
      onTickRef.current(seconds);
    }
  }, [seconds]);

  // Format time as HH:MM:SS
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <span className="font-mono">
      {formatTime(seconds)}
    </span>
  );
};

export default TimerComponent;