import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Award, Zap, Clock, Calendar as CalendarIcon } from 'lucide-react';

import * as api from '../services/api';

const Progress = () => {
  const [stats, setStats] = React.useState({ activities: [], streak: null });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.getStats();
        setStats(data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const totalHours = stats.activities.reduce((acc, a) => acc + (a.duration / 60), 0);
  const currentStreak = stats.streak?.currentStreak || 0;
  const longestStreak = stats.streak?.longestStreak || 0;

  // Calculate subject distribution
  const subjectMap = {};
  stats.activities.forEach(a => {
    if (a.subject && a.subject.name) {
      if (!subjectMap[a.subject.name]) subjectMap[a.subject.name] = 0;
      subjectMap[a.subject.name] += a.duration;
    }
  });

  const totalDurationWithSubject = Object.values(subjectMap).reduce((a, b) => a + b, 0);
  
  const colors = ['#000000', '#444444', '#888888', '#CCCCCC', '#222222'];
  const subjectData = Object.keys(subjectMap).map((name, i) => ({
    name,
    value: totalDurationWithSubject > 0 ? Math.round((subjectMap[name] / totalDurationWithSubject) * 100) : 0,
    color: colors[i % colors.length]
  }));

  // Fallback if no subject data
  if (subjectData.length === 0) {
    subjectData.push({ name: 'Uncategorized', value: 100, color: '#CCCCCC' });
  }

  const pomodoroSessions = stats.activities.filter(a => a.type === 'pomodoro').length;
  return (
    <div className="space-y-12 py-10">
      <header>
        <h2 className="text-4xl font-black tracking-tight mb-2">Advanced Analytics</h2>
        <p className="text-foreground/50 font-medium text-lg">Detailed breakdown of your learning journey and efficiency metrics.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="lg:col-span-2 p-10 rounded-[2.5rem] border border-border bg-background shadow-sm"
        >
          <h3 className="text-xl font-black mb-10 flex items-center gap-3">
            <TrendingUp className="w-6 h-6" />
            Learning Distribution
          </h3>
          <div className="h-[400px] w-full flex flex-col md:flex-row items-center gap-10">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={140}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-6 min-w-[200px]">
              {subjectData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="font-bold text-sm">{item.name}</span>
                  </div>
                  <span className="text-sm font-black">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="space-y-8">
          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             className="p-8 rounded-[2rem] border border-border bg-foreground text-background shadow-xl shadow-foreground/10"
          >
            <div className="flex justify-between items-start mb-6">
              <Award className="w-8 h-8" />
              <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Milestone</div>
            </div>
            <h4 className="text-2xl font-black mb-2">Pro Scholar</h4>
            <p className="text-sm font-medium opacity-60 mb-6">You've completed {pomodoroSessions} deep work sessions!</p>
            <div className="w-full h-1.5 bg-background/20 rounded-full overflow-hidden">
              <div className="h-full bg-background rounded-full" style={{ width: `${Math.min((pomodoroSessions / 100) * 100, 100)}%` }} />
            </div>
          </motion.div>

        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Learning', value: `${totalHours.toFixed(1)}h`, icon: Clock },
          { label: 'Longest Streak', value: `${longestStreak}d`, icon: Zap },
          { label: 'Current Streak', value: `${currentStreak}d`, icon: CalendarIcon },
        ].map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-8 rounded-[2rem] border border-border bg-background hover:bg-muted transition-colors cursor-pointer"
          >
            <item.icon className="w-6 h-6 mb-4 text-foreground/40" />
            <div className="text-3xl font-black mb-1">{item.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{item.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
