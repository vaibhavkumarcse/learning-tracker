import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, Zap, Clock, BookOpen } from 'lucide-react';
import { format, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import { useData } from '../context/DataContext';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444'];

const Progress = () => {
  const { stats, goals, tasks, loading } = useData();
  const [chartRange, setChartRange] = useState('weekly');

  // Local fetch logic removed, now handled by DataContext

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
        <p className="text-sm font-bold text-foreground/40">Loading progress analytics...</p>
      </div>
    );
  }

  const activities = stats.activities || [];

  // ─── Derived Stats ────────────────────────────────────────────────────────────
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const goalsPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalStudyMinutes = activities.reduce((acc, a) => acc + (a.duration || 0), 0);
  const totalHours = totalStudyMinutes / 60;
  const currentStreak = stats.streak?.currentStreak || 0;
  const longestStreak = stats.streak?.longestStreak || 0;
  const totalCompletedTasks = tasks.filter(t => t.status === 'completed').length;

  // ─── Chart Data ───────────────────────────────────────────────────────────────
  const getChartData = (days) => {
    const interval = eachDayOfInterval({ start: subDays(new Date(), days - 1), end: new Date() });
    return interval.map(day => {
      const dayActs = activities.filter(a => isSameDay(new Date(a.date), day));
      const hours = dayActs.reduce((acc, a) => acc + (a.duration / 60), 0);
      return {
        name: days <= 7 ? format(day, 'EEE') : format(day, 'MMM d'),
        hours: Number(hours.toFixed(1))
      };
    });
  };

  const chartData = chartRange === 'weekly' ? getChartData(7) : getChartData(30);

  // ─── Subject Distribution (from activities) ────────────────────────────────
  const subjectMap = {};
  activities.forEach(a => {
    const key = a.subject?.name || 'General';
    if (!subjectMap[key]) subjectMap[key] = 0;
    subjectMap[key] += a.duration || 0;
  });
  const totalDur = Object.values(subjectMap).reduce((a, b) => a + b, 0);
  const subjectData = Object.keys(subjectMap).map((name, i) => ({
    name,
    value: totalDur > 0 ? Math.round((subjectMap[name] / totalDur) * 100) : 0,
    color: COLORS[i % COLORS.length]
  }));
  if (subjectData.length === 0) {
    subjectData.push({ name: 'No data yet', value: 100, color: '#e5e7eb' });
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-12 py-10">
      <header>
        <h2 className="text-4xl font-black tracking-tight mb-2">Progress Analytics</h2>
        <p className="text-foreground/50 font-medium text-lg">Measure your learning velocity and study stats.</p>
      </header>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[
          { label: 'Total Hours', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: 'text-green-500' },
          { label: 'Current Streak', value: `${currentStreak}d`, icon: Zap, color: 'text-yellow-500' },
          { label: 'Longest Streak', value: `${longestStreak}d`, icon: Award, color: 'text-purple-500' },
          { label: 'Tasks Done', value: totalCompletedTasks, icon: Target, color: 'text-blue-500' },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-6 rounded-[2rem] border border-border bg-card shadow-sm hover:shadow-lg hover:border-foreground/15 transition-all"
          >
            <item.icon className={`w-5 h-5 mb-4 ${item.color}`} />
            <div className="text-3xl font-black mb-1">{item.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-5">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Goals Progress
            </h3>
            <span className="text-2xl font-black">{goalsPercentage}%</span>
          </div>
          <p className="text-sm text-foreground/50 font-medium">
            <strong className="text-foreground font-black">{completedGoals}</strong> of{' '}
            <strong className="text-foreground font-black">{totalGoals}</strong> goals achieved.
          </p>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-foreground rounded-full transition-all duration-700"
              style={{ width: `${goalsPercentage}%` }}
            />
          </div>
          {goals.filter(g => g.status === 'active').length > 0 && (
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Active Goals</p>
              {goals.filter(g => g.status === 'active').slice(0, 3).map(goal => (
                <div key={goal._id} className="flex items-center gap-2 text-sm font-semibold text-foreground/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-foreground/30" />
                  {goal.title}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-8 rounded-[2.5rem] border border-border bg-foreground text-background shadow-xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Award className="w-8 h-8 fill-current opacity-80" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Achievement</span>
          </div>
          <div>
            <h4 className="text-2xl font-black mb-1">Scholar Ranking</h4>
            <p className="text-sm font-semibold opacity-70">
              Completed <strong className="font-black">{totalCompletedTasks} tasks</strong> and studied for{' '}
              <strong className="font-black">{totalHours.toFixed(1)} hours</strong> total!
            </p>
          </div>
        </div>
      </div>

      {/* Study Time Chart */}
      <div className="p-10 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Study Time Velocity
            </h3>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mt-1">Hours studied per day</p>
          </div>
          <div className="flex bg-muted p-1.5 rounded-2xl gap-1.5 self-start">
            {[['weekly', '7 Days'], ['monthly', '30 Days']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setChartRange(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                  chartRange === key ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:text-foreground'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="gradHours" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" strokeOpacity={0.05} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.4 }}
                dy={12}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.4 }}
              />
              <Tooltip
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.12)', padding: '16px' }}
                formatter={(v) => [`${v}h`, 'Hours Studied']}
              />
              <Area type="monotone" dataKey="hours" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#gradHours)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Learning Distribution */}
      {totalDur > 0 && (
        <div className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Distribution
          </h3>
          <div className="h-[220px] w-full flex items-center gap-8">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={subjectData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {subjectData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [`${v}%`, 'Share']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3 min-w-[130px]">
              {subjectData.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-semibold">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate max-w-[90px]">{item.name}</span>
                  <span className="font-black text-foreground/60 ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Progress;
