import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Clock, CheckCircle2, Book, TrendingUp, ArrowUpRight, Zap, Target } from 'lucide-react';

import * as api from '../services/api';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay } from 'date-fns';

const Dashboard = () => {
  const [stats, setStats] = React.useState({ activities: [], streak: null });
  const [goals, setGoals] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, goalsRes] = await Promise.all([
          api.getStats(),
          api.getGoals()
        ]);
        setStats(statsRes.data);
        setGoals(goalsRes.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getWeeklyActivity = () => {
    const days = eachDayOfInterval({ start: startOfWeek(new Date()), end: endOfWeek(new Date()) });
    return days.map(day => {
      const dayActivities = stats.activities.filter(a => isSameDay(new Date(a.date), day));
      const hours = dayActivities.reduce((acc, a) => acc + (a.duration / 60), 0);
      return { name: format(day, 'EEE'), hours: Number(hours.toFixed(1)) };
    });
  };

  const activityData = getWeeklyActivity();
  const totalHours = stats.activities.reduce((acc, a) => acc + (a.duration / 60), 0).toFixed(1);
  const totalTasks = stats.activities.filter(a => a.type === 'task').length;
  const currentStreak = stats.streak?.currentStreak || 0;
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
      <header className="flex justify-between items-end">
        <div>
          <motion.h2 variants={item} className="text-4xl font-black tracking-tight mb-2">Overview</motion.h2>
          <motion.p variants={item} className="text-foreground/50 font-medium">Your learning velocity is up <span className="text-foreground font-bold">12%</span> this week.</motion.p>
        </div>
        <motion.div variants={item} className="flex gap-3">
          <div className="flex -space-x-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] font-bold">
                {String.fromCharCode(64 + i)}
              </div>
            ))}
          </div>
          <button className="text-xs font-bold uppercase tracking-widest px-4 py-2 bg-muted rounded-lg hover:bg-border transition-colors">
            Share Stats
          </button>
        </motion.div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Deep Work', value: `${totalHours}h`, icon: Zap, color: 'text-yellow-500' },
          { label: 'Tasks Done', value: totalTasks, icon: Target, color: 'text-blue-500' },
          { label: 'Active Streak', value: `${currentStreak}d`, icon: TrendingUp, color: 'text-red-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i} 
            variants={item}
            className="p-8 rounded-[2rem] border border-border bg-background hover:border-foreground/20 transition-all group relative overflow-hidden shadow-sm hover:shadow-xl hover:shadow-black/5"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={item} className="lg:col-span-2 p-10 rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-10">
            <h3 className="text-xl font-black">Performance Analytics</h3>
            <div className="flex gap-2">
              <button className="text-[10px] font-bold uppercase tracking-tighter px-3 py-1 bg-foreground text-background rounded-full">Hours</button>
              <button className="text-[10px] font-bold uppercase tracking-tighter px-3 py-1 bg-muted rounded-full">Tasks</button>
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
                <Tooltip 
                  contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px'}}
                />
                <Area 
                  type="monotone" 
                  dataKey="hours" 
                  stroke="currentColor" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorHours)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div variants={item} className="p-10 rounded-[2.5rem] border border-border bg-background shadow-sm flex flex-col">
          <h3 className="text-xl font-black mb-10">Activity Heatmap</h3>
          <div className="flex-1 grid grid-cols-7 gap-2 overflow-hidden">
            {Array.from({ length: 35 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - (34 - i));
              const dayActivities = stats.activities.filter(a => isSameDay(new Date(a.date), d));
              const count = dayActivities.length;
              return (
                <div 
                  key={i} 
                  className={`aspect-square rounded-md transition-all hover:scale-110 cursor-pointer ${
                    count > 4 ? 'bg-foreground' : 
                    count > 2 ? 'bg-foreground/40' : 
                    count > 0 ? 'bg-foreground/10' : 'bg-muted'
                  }`}
                  title={`${count} activities on ${format(d, 'MMM d')}`}
                />
              );
            })}
          </div>
          <div className="mt-8 flex items-center justify-between text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
            <span>Less</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-sm bg-muted" />
              <div className="w-2 h-2 rounded-sm bg-foreground/10" />
              <div className="w-2 h-2 rounded-sm bg-foreground/40" />
              <div className="w-2 h-2 rounded-sm bg-foreground" />
            </div>
            <span>More</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={item} className="p-10 rounded-[2.5rem] border border-border bg-background shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black">Focus Sessions</h3>
            <span className="text-xs font-bold text-foreground/40">TODAY</span>
          </div>
          <div className="space-y-6">
            {stats.activities.filter(a => a.type === 'pomodoro').slice(0, 3).map((session, i) => (
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
            {stats.activities.filter(a => a.type === 'pomodoro').length === 0 && (
              <div className="text-sm text-foreground/50 text-center py-4">No focus sessions today yet.</div>
            )}
          </div>
        </motion.div>

        <motion.div variants={item} className="p-10 rounded-[2.5rem] border border-border bg-background shadow-sm">
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
