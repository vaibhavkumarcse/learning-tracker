import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, Coffee, Brain, ChevronRight, Zap } from 'lucide-react';

import * as api from '../services/api';

const Pomodoro = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); 
  const [sessions, setSessions] = useState(0);

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const remainingSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(async () => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setIsActive(false);
          const nextMode = mode === 'work' ? 'break' : 'work';
          if (mode === 'work') {
            setSessions(s => s + 1);
            try {
              await api.logActivity({ type: 'pomodoro', duration: 25 });
            } catch (err) {
              console.error('Failed to log pomodoro:', err);
            }
          }
          setMode(nextMode);
          setMinutes(nextMode === 'work' ? 25 : 5);
          setSeconds(0);
        }
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds, minutes, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? 25 : 5);
    setSeconds(0);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-xs font-black uppercase tracking-[0.3em] text-foreground/40 mb-4 block">Focus Mode</span>
        <h2 className="text-5xl font-black tracking-tighter mb-4">
          {mode === 'work' ? 'Deep Work Session' : 'Rest & Recharge'}
        </h2>
        <div className="flex items-center justify-center gap-2 text-foreground/50 font-bold">
          <Zap className="w-4 h-4" />
          <span>Session #{sessions + 1}</span>
        </div>
      </motion.div>

      <div className="relative group">
        {/* Progress Ring */}
        <div className="w-[450px] h-[450px] rounded-full border-[16px] border-muted flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <motion.circle
              cx="225"
              cy="225"
              r="209"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="16"
              strokeDasharray="1313"
              animate={{ strokeDashoffset: 1313 - (1313 * progress) / 100 }}
              transition={{ duration: 1, ease: "linear" }}
              className="text-foreground transition-all duration-300"
              strokeLinecap="round"
            />
          </svg>

          <div className="text-center z-10">
            <motion.div 
              key={minutes + seconds}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-[120px] font-black tracking-tighter tabular-nums leading-none mb-4"
            >
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </motion.div>
            
            <div className="flex justify-center gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className="w-24 h-24 rounded-full bg-foreground text-background flex items-center justify-center shadow-2xl shadow-foreground/20"
              >
                {isActive ? <Pause className="w-10 h-10 fill-current" /> : <Play className="w-10 h-10 ml-2 fill-current" />}
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="w-24 h-24 rounded-full border-2 border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <RotateCcw className="w-8 h-8" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16 flex gap-12">
        {[
          { label: 'Completed', value: sessions, icon: CheckCircle },
          { label: 'Intensity', value: 'High', icon: TrendingUp },
          { label: 'Efficiency', value: '94%', icon: Zap },
        ].map((stat, i) => (
          <div key={i} className="flex flex-col items-center">
            <div className="text-2xl font-black mb-1">{stat.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CheckCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const TrendingUp = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
  </svg>
);

export default Pomodoro;
