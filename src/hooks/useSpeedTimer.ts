import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export type TimerState = 'idle' | 'inspecting' | 'holding' | 'running' | 'finished';

interface UseSpeedTimerProps {
  isInspectionEnabled: boolean;
  onFinish?: (time: number) => void;
}

export function useSpeedTimer({ isInspectionEnabled, onFinish }: UseSpeedTimerProps) {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [displayTime, setDisplayTime] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [hasPenalty, setHasPenalty] = useState(false);

  const stateRef = useRef<TimerState>('idle');
  const startTimeRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const inspectionIntervalRef = useRef<any>(null);

  const setTimerStateSync = (s: TimerState) => {
    console.log(`[Timer] State Change: ${stateRef.current} -> ${s}`);
    stateRef.current = s;
    setTimerState(s);
  };

  const updateRunningTime = useCallback(() => {
    if (stateRef.current === 'running') {
      const diff = Date.now() - startTimeRef.current;
      setDisplayTime(diff);
      rafRef.current = requestAnimationFrame(updateRunningTime);
    }
  }, []);

  const stopRAF = () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const startInspection = () => {
    let timeLeft = 15;
    setIsInspecting(true);
    setDisplayTime(timeLeft);
    setHasPenalty(false);

    if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current);
    inspectionIntervalRef.current = setInterval(() => {
      timeLeft -= 1;
      if (timeLeft <= 0) {
        if (timeLeft === 0) setDisplayTime(0);
        else if (timeLeft <= -1) {
          setHasPenalty(true);
          setDisplayTime(0);
        }
      } else {
        setDisplayTime(timeLeft);
      }
    }, 1000);
  };

  const stopInspection = () => {
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current);
      inspectionIntervalRef.current = null;
    }
    setIsInspecting(false);
  };

  const onPressDown = useCallback(() => {
    const currentState = stateRef.current;
    console.log('[Timer] onPressDown, current:', currentState);

    if (currentState === 'finished') {
      setDisplayTime(0);
      setHasPenalty(false);
      setTimerStateSync('idle');
      return;
    }

    if (currentState === 'idle') {
      if (isInspectionEnabled) {
        startInspection();
        setTimerStateSync('inspecting');
      } else {
        setTimerStateSync('holding');
      }
      return;
    }

    if (currentState === 'inspecting') {
      setTimerStateSync('holding');
      return;
    }

    if (currentState === 'running') {
      stopRAF();
      const finalTime = Date.now() - startTimeRef.current;
      setDisplayTime(finalTime);
      setTimerStateSync('finished');
      if (onFinish) onFinish(finalTime);
      return;
    }
  }, [isInspectionEnabled, onFinish]);

  const onPressUp = useCallback(() => {
    const currentState = stateRef.current;
    console.log('[Timer] onPressUp, current:', currentState);

    if (currentState === 'holding') {
      stopInspection();
      startTimeRef.current = Date.now();
      setTimerStateSync('running');
      rafRef.current = requestAnimationFrame(updateRunningTime);
    }
  }, [updateRunningTime]);

  const resetTimer = useCallback(() => {
    stopRAF();
    stopInspection();
    setDisplayTime(0);
    setHasPenalty(false);
    setTimerStateSync('idle');
  }, []);

  const addPenalty = useCallback(() => {
    if (stateRef.current === 'finished') {
      setHasPenalty(true);
      setDisplayTime(prev => prev + 2000);
    }
  }, []);

  const pressDownRef = useRef(onPressDown);
  const pressUpRef = useRef(onPressUp);
  useEffect(() => {
    pressDownRef.current = onPressDown;
    pressUpRef.current = onPressUp;
  }, [onPressDown, onPressUp]);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
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
      stopRAF();
      stopInspection();
    };
  }, []);

  return {
    timerState,
    displayTime,
    isInspecting,
    hasPenalty,
    onPressDown,
    onPressUp,
    resetTimer,
    addPenalty,
  };
}
