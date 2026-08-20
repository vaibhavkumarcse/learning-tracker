import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTimer } from '../context/TimerContext';
import { Play, Pause, Maximize2 } from 'lucide-react';

const GlobalTimer = ({ activeTab, setActiveTab }) => {
  const {
    isActive,
    timerMode,
    countdownDisplay,
    stopwatchDisplay,
    formatTime,
    toggleTimer
  } = useTimer();

  // Only show the global timer if it's running (or has some active state) 
  // AND we are NOT on the pomodoro page.
  const isVisible = (isActive || (timerMode === 'countdown' && countdownDisplay > 0)) && activeTab !== 'pomodoro';
  
  // Actually, we might just want to show it when it's active or if it was started. 
  // Let's just show it if activeTab !== 'pomodoro' AND (isActive or we have some time).
  // But maybe strictly when isActive is true is better, or always when not on pomodoro but it has been used.
  // We'll show it if it's active, or if it's a stopwatch that has started, or countdown that is paused.
  const hasStarted = (timerMode === 'countdown' && countdownDisplay < 25 * 60) || (timerMode === 'stopwatch' && stopwatchDisplay > 0) || isActive;
  const shouldShow = activeTab !== 'pomodoro' && hasStarted;

  return (
    <AnimatePresence>
      {shouldShow && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-50 flex items-center gap-3 md:gap-4 bg-card border border-border p-2 md:p-3 rounded-full shadow-2xl shadow-black/20"
        >
          <div className="flex flex-col ml-2 md:ml-3 select-none">
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">
              {timerMode === 'countdown' ? 'Focus' : 'Elapsed'}
            </span>
            <span className="text-xl font-black tabular-nums leading-none">
              {timerMode === 'countdown' ? formatTime(countdownDisplay) : formatTime(stopwatchDisplay)}
            </span>
          </div>

          <div className="flex items-center gap-2 mr-1">
            <button
              onClick={toggleTimer}
              className="w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
            >
              {isActive ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 ml-0.5 fill-current" />}
            </button>
            <button
              onClick={() => setActiveTab('pomodoro')}
              className="w-10 h-10 rounded-full border border-border bg-muted flex items-center justify-center hover:scale-105 transition-transform text-foreground/60 hover:text-foreground"
              title="Open full timer"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalTimer;
