import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, CheckCircle2, Book, TrendingUp, ArrowUpRight, Zap, Target } from 'lucide-react';

import * as api from '../services/api';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';
import { useData } from '../context/DataContext';

const Dashboard = () => {
  const { stats, goals, loading } = useData();

  // Local fetch logic removed, now handled by DataContext

  const getWeeklyActivity = () => {
    const days = eachDayOfInterval({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
    return days.map(day => {
      const dayActivities = stats.activities.filter(a => isSameDay(new Date(a.date), day) && a.type === 'pomodoro');
      const mins = dayActivities.reduce((acc, a) => acc + (a.duration || 0), 0);
      return { name: format(day, 'EEE'), mins };
    });
  };

  const formatMins = (totalMins) => {
    const h = Math.floor(totalMins / 60);
    const m = totalMins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-4 rounded-2xl shadow-xl">
          <p className="font-black text-foreground mb-1">{label}</p>
          <div className="flex items-center gap-2 text-sm font-bold text-foreground/70">
            <div className="w-2 h-2 rounded-full bg-foreground" />
            <span>Time Spent:</span>
            <span className="text-foreground font-black">{formatMins(payload[0].value)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const activityData = getWeeklyActivity();
  const deepWorkMins = (stats?.activities || [])
    .filter(a => a.type === 'pomodoro')
    .reduce((acc, a) => acc + (a.duration || 0), 0);
  const deepWorkFormatted = formatMins(deepWorkMins);
  const totalTasks = (stats?.activities || []).filter(a => a.type === 'task').length;
  const currentStreak = stats?.streak?.currentStreak || 0;
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-10 pb-10"
    >
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h2 variants={item} className="text-3xl md:text-4xl font-black tracking-tight mb-2">Overview</motion.h2>
        </div>
        <motion.div variants={item} className="text-left md:text-right">
          <div className="text-xl md:text-2xl font-black">{format(new Date(), 'MMMM d, yyyy')}</div>
          <div className="text-sm font-bold text-foreground/50 uppercase tracking-widest">{format(new Date(), 'EEEE')}</div>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Deep Work', value: deepWorkFormatted, icon: Zap, color: 'text-yellow-500' },
          { label: 'Tasks Done', value: totalTasks, icon: Target, color: 'text-blue-500' },
          { label: 'Active Streak', value: `${currentStreak}d`, icon: TrendingUp, color: 'text-red-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="p-6 md:p-8 rounded-3xl md:rounded-[2rem] border border-border bg-background hover:border-foreground/20 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-muted rounded-2xl group-hover:scale-110 transition-transform">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <ArrowUpRight className="w-5 h-5 text-foreground/20 group-hover:text-foreground transition-colors" />
            </div>
            <div className="text-3xl font-black mb-1">{stat.value}</div>
            <div className="text-sm font-bold text-foreground/40 uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div variants={item} className="lg:col-span-2 p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black">Performance Analytics</h3>
            <div className="flex gap-2">
              <button className="text-[10px] font-bold uppercase tracking-tighter px-3 py-1 bg-foreground text-background rounded-full">Time Spent (mins)</button>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="currentColor" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="currentColor" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'currentColor', fontSize: 12, fontWeight: 600, opacity: 0.4}} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'currentColor', fontSize: 12, fontWeight: 600, opacity: 0.4}}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
                <Area 
                  type="monotone" 
                  dataKey="mins" 
                  stroke="currentColor" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border bg-background shadow-sm flex flex-col">
          <h3 className="text-xl font-black mb-10">Activity Heatmap</h3>
          <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
            {Array.from({ length: 35 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (34 - i));
              const dayActivities = (stats?.activities || []).filter(a => isSameDay(new Date(a.date), d) && a.type === 'pomodoro');
              const totalMinutes = dayActivities.reduce((sum, act) => sum + (act.duration || 0), 0);
              
              const hours = Math.floor(totalMinutes / 60);
              const mins = totalMinutes % 60;
              let timeStr = "";
              if (hours > 0) timeStr += `${hours}h `;
              if (mins > 0 || hours === 0) timeStr += `${mins}m`;

              const bgClass = totalMinutes > 240 ? 'bg-green-600 dark:bg-green-500' :
                totalMinutes > 120 ? 'bg-green-500/80 dark:bg-green-500/70' :
                totalMinutes > 60 ? 'bg-green-400/70 dark:bg-green-400/60' :
                totalMinutes > 0 ? 'bg-green-300/60 dark:bg-green-400/30' : 'bg-muted';

              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md transition-all hover:scale-110 cursor-pointer ${bgClass}`}
                  title={`${timeStr} studied on ${format(d, 'MMM d')}`}
                />
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-sm bg-muted" title="0 mins" />
              <div className="w-2 h-2 rounded-sm bg-green-300/60" title="1-60 mins" />
              <div className="w-2 h-2 rounded-sm bg-green-400/70" title="61-120 mins" />
              <div className="w-2 h-2 rounded-sm bg-green-500/80" title="121-240 mins" />
              <div className="w-2 h-2 rounded-sm bg-green-600" title=">240 mins" />
            </div>
            <span>More</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <motion.div variants={item} className="p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Focus Sessions</h3>
            <span className="text-xs font-bold text-foreground/40">TODAY</span>
          </div>
          <div className="space-y-6">
            {(stats?.activities || []).filter(a => a.type === 'pomodoro').slice(0, 3).map((session, i) => (
              <div key={i} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center font-black text-xs group-hover:bg-foreground group-hover:text-background transition-colors">
                    {session.subject?.name?.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="font-bold">{session.subject?.name || 'Focus Session'}</div>
                    <div className="text-xs text-foreground/40 font-bold">{session.duration} mins</div>
                  </div>
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 border border-border rounded-full group-hover:border-foreground transition-colors">
                  {session.duration >= 60 ? 'High' : 'Medium'}
                </div>
              </div>
            ))}
            {(stats?.activities || []).filter(a => a.type === 'pomodoro').length === 0 && (
              <div className="text-sm text-foreground/50 text-center py-4">No focus sessions today yet.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Tasks Done</h3>
            <span className="text-xs font-bold text-foreground/40">RECENT</span>
          </div>
          <div className="space-y-6">
            {(stats?.activities || []).filter(a => a.type === 'task').slice(0, 3).map((taskAct, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-lg text-blue-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-bold truncate max-w-[120px]">{taskAct.taskId?.title || 'Completed Task'}</div>
                    <div className="text-xs text-foreground/45 font-bold">
                      {new Date(taskAct.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {(stats?.activities || []).filter(a => a.type === 'task').length === 0 && (
              <div className="text-sm text-foreground/50 text-center py-4">No tasks completed yet.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Active Goals</h3>
            <span className="text-xs font-bold text-foreground/40">TARGETS</span>
          </div>
          <div className="space-y-6">
            {goals.filter(g => g.status === 'active').slice(0, 3).map((goal, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-lg">
                    🎯
                  </div>
                  <div>
                    <div className="font-bold">{goal.title}</div>
                    <div className="text-xs text-foreground/45 font-bold">
                      Target: {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                  goal.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : 
                  goal.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                }`}>
                  {goal.difficulty}
                </span>
              </div>
            ))}
            {goals.filter(g => g.status === 'active').length === 0 && (
              <div className="text-sm text-foreground/50 text-center py-4">No active learning goals. Set one!</div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

const PlusCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);

export default Dashboard;
