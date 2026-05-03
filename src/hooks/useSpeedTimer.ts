import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';

export type TimerState = 'idle' | 'inspecting' | 'holding' | 'running' | 'finished';

interface TimerOptions {
  isInspectionEnabled: boolean;
  onFinish?: (time: number) => void;
}

/**
 * useSpeedTimer: Custom hook that encapsulates speedcubing timer logic.
 * Handles states, intervals, and web keyboard listeners.
 */
export function useSpeedTimer({ isInspectionEnabled, onFinish }: TimerOptions) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [displayTime, setDisplayTime] = useState(0); // Stores the final time after a solve
  const [runningTime, setRunningTime] = useState(0); // Tracks current time during execution
  const [inspectionTime, setInspectionTime] = useState(15);
  const [hasPenalty, setHasPenalty] = useState(false);

  // Refs for logic consistency and preventing stale closures in listeners
  const stateRef = useRef<TimerState>('idle');
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inspectionRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hasPenaltyRef = useRef(false);

  const setTimerStateSync = useCallback((state: TimerState) => {
    stateRef.current = state;
    setTimerState(state);
  }, []);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startInspection = useCallback(() => {
    setTimerStateSync('inspecting');
    setInspectionTime(15);
    hasPenaltyRef.current = false;
    setHasPenalty(false);

    if (inspectionRef.current) clearInterval(inspectionRef.current);
    inspectionRef.current = setInterval(() => {
      setInspectionTime((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          hasPenaltyRef.current = true;
          setHasPenalty(true);
        }
        return next;
      });
    }, 1000);
  }, [setTimerStateSync]);

  const onPressDown = useCallback(() => {
    const currentState = stateRef.current;

    // Reset if finished
    if (currentState === 'finished') {
      setDisplayTime(0);
      setRunningTime(0);
      hasPenaltyRef.current = false;
      setHasPenalty(false);
      setTimerStateSync('idle');
      return;
    }

    if (currentState === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
      } else {
        hasPenaltyRef.current = false;
        setHasPenalty(false);
        setTimerStateSync('holding');
      }
    } else if (currentState === 'inspecting') {
      if (inspectionRef.current) clearInterval(inspectionRef.current);
      setTimerStateSync('holding');
    } else if (currentState === 'running') {
      stopInterval();
      const elapsed = Date.now() - startTimeRef.current;
      const finalTime = hasPenaltyRef.current ? elapsed + 2000 : elapsed;
      setDisplayTime(finalTime);
      setRunningTime(0);
      setTimerStateSync('finished');
      if (onFinish) onFinish(finalTime);
    }
  }, [isInspectionEnabled, setTimerStateSync, startInspection, stopInterval, onFinish]);

  const onPressUp = useCallback(() => {
    if (stateRef.current !== 'holding') return;

    startTimeRef.current = Date.now();
    setRunningTime(0);
    setTimerStateSync('running');

    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setRunningTime(Date.now() - startTimeRef.current);
    }, 10); // 10ms for high precision
  }, [setTimerStateSync]);

  const resetTimer = useCallback(() => {
    stopInterval();
    if (inspectionRef.current) clearInterval(inspectionRef.current);
    setDisplayTime(0);
    setRunningTime(0);
    setInspectionTime(15);
    hasPenaltyRef.current = false;
    setHasPenalty(false);
    setTimerStateSync('idle');
  }, [stopInterval, setTimerStateSync]);

  const addPenalty = useCallback(() => {
    setDisplayTime((prev) => prev + 2000);
  }, []);

  // ─── Web Keyboard Handling ──────────────────────────────────────────
  const pressDownRef = useRef(onPressDown);
  const pressUpRef = useRef(onPressUp);

  useEffect(() => {
    pressDownRef.current = onPressDown;
    pressUpRef.current = onPressUp;
  }, [onPressDown, onPressUp]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (!e.repeat) pressDownRef.current();
      }
    };
    
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        pressUpRef.current();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  // Timer Cleanup
  useEffect(() => {
    return () => {
      stopInterval();
      if (inspectionRef.current) clearInterval(inspectionRef.current);
    };
  }, [stopInterval]);

  // Derive display text time
  const currentTime = timerState === 'running' ? runningTime 
    : timerState === 'inspecting' ? inspectionTime 
    : displayTime;

  return {
    timerState,
    displayTime: currentTime,
    isInspecting: timerState === 'inspecting',
    hasPenalty,
    inspectionTime,
    onPressDown,
    onPressUp,
    resetTimer,
    addPenalty,
    setFinalTime: setDisplayTime,
  };
}
