import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Clock, BookOpen, Save, Zap, Timer as TimerIcon } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

const Pomodoro = () => {
  const {
    timerMode, setTimerMode,
    isActive,
    presetMinutes,
    countdownDisplay, setCountdownDisplay,
    totalDurationRef,
    stopwatchDisplay, setStopwatchDisplay,
    selectedCategory, setSelectedCategory,
    isSaving, successMsg, setSuccessMsg, errorMsg, setErrorMsg,
    recentSessions, loadingStats,
    toggleTimer, resetTimer, changePreset, handleStopAndSave, handlePartialSave, formatTime,
    countdownRef, stopwatchRef
  } = useTimer();

  const categories = ['Study', 'Revision', 'Practice', 'Project', 'Reading', 'Other'];
  const [customMinInput, setCustomMinInput] = useState('');

  const handleCustomTimeSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(customMinInput, 10);
    if (!isNaN(mins) && mins > 0 && mins <= 480) {
      changePreset(mins);
      setCustomMinInput('');
    }
  };

  const getProgress = () => {
    if (timerMode === 'countdown') {
      if (totalDurationRef.current === 0) return 0;
      return ((totalDurationRef.current - countdownDisplay) / totalDurationRef.current) * 100;
    }
    // Stopwatch: cycle progress every 30 mins
    return (stopwatchDisplay % 1800) / 1800 * 100;
  };

  const circumference = 930;
  const progress = getProgress();
  const dashOffset = circumference - (circumference * progress) / 100;

  return (
    <div className="max-w-4xl mx-auto py-6 md:py-10 space-y-8 md:space-y-12">
      <header>
        <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-2">Study Timer</h2>
        <p className="text-sm md:text-base text-foreground/50 font-medium">Start studying – your time is automatically logged.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ─── Left: Settings ─── */}
        <div className="lg:col-span-1 space-y-5">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <TimerIcon className="w-5 h-5 text-foreground/60" />
              Timer Settings
            </h3>

            {/* Mode toggle */}
            <div className="flex bg-muted p-1 rounded-2xl">
              {['countdown', 'stopwatch'].map(mode => (
                <button
                  key={mode}
                  onClick={() => {
                    if (isActive) return;
                    setTimerMode(mode);
                    setSuccessMsg('');
                    setErrorMsg('');
                    if (mode === 'countdown') {
                      countdownRef.current = presetMinutes * 60;
                      setCountdownDisplay(presetMinutes * 60);
                    } else {
                      stopwatchRef.current = 0;
                      setStopwatchDisplay(0);
                    }
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                    timerMode === mode
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-foreground/40 hover:text-foreground'
                  } ${isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {mode === 'countdown' ? 'Countdown' : 'Stopwatch'}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-sm cursor-pointer"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Countdown presets */}
            {timerMode === 'countdown' && (
              <div className="space-y-4 pt-2 border-t border-border/50">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                  Preset Durations
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 25, 45, 60].map(mins => (
                    <button
                      key={mins}
                      onClick={() => changePreset(mins)}
                      disabled={isActive}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        presetMinutes === mins
                          ? 'border-foreground bg-foreground text-background font-black shadow-md'
                          : 'border-border hover:bg-muted text-foreground/70'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <form onSubmit={handleCustomTimeSubmit} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">
                    Custom (max 480 min)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={customMinInput}
                      onChange={(e) => setCustomMinInput(e.target.value)}
                      placeholder="e.g. 90"
                      min="1"
                      max="480"
                      disabled={isActive}
                      className="flex-1 px-3 py-2 rounded-xl border border-border bg-muted text-xs font-bold focus:ring-2 focus:ring-foreground outline-none disabled:opacity-50"
                    />
                    <button
                      type="submit"
                      disabled={isActive || !customMinInput}
                      className="px-4 py-2 bg-foreground text-background rounded-xl text-xs font-black hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
                    >
                      Set
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Current session info */}
          <div className="p-4 rounded-2xl border border-border bg-muted/30 space-y-1.5 text-xs">
            <div className="flex justify-between items-center font-bold text-foreground/50 uppercase tracking-wider text-[10px]">
              <span>Mode</span>
              <span className="text-foreground font-black capitalize">{timerMode}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-foreground/50 uppercase tracking-wider text-[10px]">
              <span>Category</span>
              <span className="text-foreground font-black truncate max-w-[120px]">{selectedCategory}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-foreground/50 uppercase tracking-wider text-[10px]">
              <span>Status</span>
              <span className={`font-black ${isActive ? 'text-green-500' : 'text-foreground/40'}`}>
                {isActive ? '● Running' : '○ Paused'}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Right: Circular Timer ─── */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-border bg-card shadow-lg relative min-h-[400px] md:min-h-[520px] overflow-hidden">

          {/* Notifications */}
          <AnimatePresence>
            {(successMsg || errorMsg) && (
              <motion.div
                key="notif"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`absolute top-6 left-6 right-6 p-3.5 rounded-2xl text-xs font-bold border text-center ${
                  successMsg
                    ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400'
                    : 'bg-red-500/10 border-red-500/20 text-red-500'
                }`}
              >
                {successMsg || errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ring + time display */}
          <div className="flex flex-col items-center justify-center pt-4 scale-75 md:scale-100">
            <div className="w-[300px] h-[300px] rounded-full border-[12px] border-muted flex items-center justify-center relative">
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 300 300">
                <circle
                  cx="150" cy="150" r="139"
                  fill="transparent"
                  stroke={timerMode === 'countdown' ? '#22c55e' : '#3b82f6'}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear' }}
                />
              </svg>

              <div className="text-center z-10 select-none">
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30 mb-2">
                  {timerMode === 'countdown' ? `${presetMinutes}m Focus` : 'Elapsed Time'}
                </div>
                <div className="text-5xl font-black tracking-tighter tabular-nums leading-none mb-6 text-foreground">
                  {timerMode === 'countdown'
                    ? formatTime(countdownDisplay)
                    : formatTime(stopwatchDisplay)}
                </div>
                <div className="flex justify-center gap-3">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={toggleTimer}
                    className="w-14 h-14 rounded-full bg-foreground text-background flex items-center justify-center shadow-xl shadow-foreground/15 cursor-pointer"
                  >
                    {isActive
                      ? <Pause className="w-5 h-5 fill-current" />
                      : <Play className="w-5 h-5 ml-1 fill-current" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.94 }}
                    onClick={resetTimer}
                    className="w-14 h-14 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer text-foreground/50 hover:text-foreground"
                    title="Reset timer"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Stopwatch: stop & save */}
          {timerMode === 'stopwatch' && stopwatchDisplay > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleStopAndSave}
              disabled={isSaving}
              className="mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
            >
              {isSaving
                ? <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Save className="w-4 h-4" /> Stop &amp; Log Session</>}
            </motion.button>
          )}

          {/* Countdown: manual early save */}
          {timerMode === 'countdown' && !isActive && countdownDisplay < totalDurationRef.current && countdownDisplay > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handlePartialSave}
              disabled={isSaving}
              className="mt-6 px-5 py-2.5 border border-green-500/40 text-green-600 dark:text-green-400 rounded-xl text-xs font-bold hover:bg-green-500/10 transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              Save partial session ({Math.max(1, Math.round((totalDurationRef.current - countdownDisplay) / 60))}m studied)
            </motion.button>
          )}

          {/* Category label */}
          <p className="mt-5 text-[11px] text-foreground/35 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" />
            Studying: {selectedCategory}
          </p>
        </div>
      </div>

      {/* ─── Recent Sessions ─── */}
      <div className="p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-border bg-card shadow-sm space-y-6">
        <h3 className="text-lg md:text-xl font-black flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500 fill-current" />
          Recent Sessions
        </h3>

        {loadingStats ? (
          <div className="flex justify-center py-6">
            <div className="w-6 h-6 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : recentSessions.length === 0 ? (
          <div className="text-center text-foreground/40 text-sm py-6">
            No sessions logged yet. Start the timer and study!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSessions.slice(0, 6).map((session) => (
              <div
                key={session._id}
                className="p-4 rounded-2xl border border-border bg-muted/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center text-sm font-black shrink-0">
                    {(session.category || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-sm truncate">{session.category || 'Study'}</div>
                    <div className="text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                      {new Date(session.date).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-black bg-background border border-border px-3 py-1.5 rounded-xl shrink-0">
                  <Clock className="w-3.5 h-3.5 opacity-40" />
                  {session.duration >= 60
                    ? `${Math.floor(session.duration / 60)}h ${session.duration % 60}m`
                    : `${session.duration}m`}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Total totals */}
        {recentSessions.length > 0 && (
          <div className="pt-4 border-t border-border flex items-center justify-between">
            <span className="text-xs font-black text-foreground/40 uppercase tracking-widest">Total Recorded (All Time)</span>
            <span className="text-lg font-black">
              {(() => {
                const total = recentSessions.reduce((a, s) => a + s.duration, 0);
                const h = Math.floor(total / 60);
                const m = total % 60;
                return h > 0 ? `${h}h ${m}m` : `${m}m`;
              })()}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pomodoro;
