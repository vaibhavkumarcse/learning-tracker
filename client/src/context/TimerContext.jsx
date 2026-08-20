import React, { createContext, useState, useEffect, useRef, useCallback, useContext } from 'react';
import * as api from '../services/api';
import { useData } from './DataContext';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const { refreshStats } = useData();
  
  const [timerMode, setTimerMode] = useState('countdown');
  const [isActive, setIsActive] = useState(false);

  const [presetMinutes, setPresetMinutes] = useState(25);
  const countdownRef = useRef(25 * 60);
  const [countdownDisplay, setCountdownDisplay] = useState(25 * 60);
  const totalDurationRef = useRef(25 * 60);

  const stopwatchRef = useRef(0);
  const [stopwatchDisplay, setStopwatchDisplay] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('Study');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const saveSession = async (minutesStudied, mode) => {
    if (isSaving) return;
    setIsSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const payload = {
        type: 'pomodoro',
        duration: minutesStudied,
        date: new Date().toISOString(),
        category: selectedCategory,
        notes: `${mode} session – ${minutesStudied}m`
      };
      await api.logActivity(payload);
      setSuccessMsg(`✓ Saved ${minutesStudied}m ${mode.toLowerCase()} session!`);
      setTimeout(() => setSuccessMsg(''), 4000);
      refreshStats();
    } catch (err) {
      console.error('Failed to save session:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to log session. Try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCountdownComplete = async () => {
    const minutesStudied = Math.max(1, Math.round(totalDurationRef.current / 60));
    await saveSession(minutesStudied, 'Countdown');
    countdownRef.current = totalDurationRef.current;
    setCountdownDisplay(totalDurationRef.current);
  };

  const startInterval = useCallback(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      if (timerMode === 'countdown') {
        countdownRef.current -= 1;
        setCountdownDisplay(countdownRef.current);
        if (countdownRef.current <= 0) {
          clearInterval(intervalRef.current);
          setIsActive(false);
          handleCountdownComplete();
        }
      } else {
        stopwatchRef.current += 1;
        setStopwatchDisplay(stopwatchRef.current);
      }
    }, 1000);
  }, [timerMode]); // eslint-disable-line

  useEffect(() => {
    if (isActive) {
      startInterval();
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive, timerMode, startInterval]);

  const toggleTimer = () => setIsActive(prev => !prev);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsActive(false);
    setSuccessMsg('');
    setErrorMsg('');
    if (timerMode === 'countdown') {
      countdownRef.current = presetMinutes * 60;
      setCountdownDisplay(presetMinutes * 60);
    } else {
      stopwatchRef.current = 0;
      setStopwatchDisplay(0);
    }
  };

  const changePreset = (mins) => {
    if (isActive) return;
    setPresetMinutes(mins);
    countdownRef.current = mins * 60;
    totalDurationRef.current = mins * 60;
    setCountdownDisplay(mins * 60);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleStopAndSave = async () => {
    if (stopwatchRef.current < 10) {
      setErrorMsg('Study at least 10 seconds before saving.');
      return;
    }
    const minutesStudied = Math.max(1, Math.round(stopwatchRef.current / 60));
    clearInterval(intervalRef.current);
    setIsActive(false);
    stopwatchRef.current = 0;
    setStopwatchDisplay(0);
    await saveSession(minutesStudied, 'Stopwatch');
  };
  
  const handlePartialSave = async () => {
    const elapsed = totalDurationRef.current - countdownDisplay;
    const mins = Math.max(1, Math.round(elapsed / 60));
    await saveSession(mins, 'Countdown');
    changePreset(presetMinutes);
  };

  const formatTime = (totalSecs) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    if (h > 0) {
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <TimerContext.Provider
      value={{
        timerMode, setTimerMode,
        isActive, setIsActive,
        presetMinutes, setPresetMinutes,
        countdownDisplay, setCountdownDisplay,
        totalDurationRef,
        stopwatchDisplay, setStopwatchDisplay,
        selectedCategory, setSelectedCategory,
        isSaving, successMsg, setSuccessMsg, errorMsg, setErrorMsg,
        toggleTimer, resetTimer, changePreset, handleStopAndSave, handlePartialSave, formatTime,
        countdownRef, stopwatchRef
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};
