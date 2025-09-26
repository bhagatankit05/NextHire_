"use client"

import React, { useEffect, useRef, useState } from 'react'

const TimerComponent = ({ isRunning=true, onTick }) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);

  useEffect(()=>{
    if (isRunning) {
      intervalRef.current = setInterval(()=>{
        setElapsed(prev => {
          const next = prev + 1;
          onTick && onTick(next);
          return next;
        });
      }, 1000);
    }
    return ()=>{
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  },[isRunning])

  const hh = String(Math.floor(elapsed/3600)).padStart(2,'0');
  const mm = String(Math.floor((elapsed%3600)/60)).padStart(2,'0');
  const ss = String(elapsed%60).padStart(2,'0');

  return <span>{hh}:{mm}:{ss}</span>
}

export default TimerComponent


