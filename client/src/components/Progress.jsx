import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { TrendingUp, Target, Award, Zap, Clock, Calendar as CalendarIcon, BookOpen, Layers } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, subDays } from 'date-fns';
import * as api from '../services/api';

const Progress = () => {
  const [stats, setStats] = useState({ activities: [], streak: null });
  const [goals, setGoals] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Chart selection: 'weekly' or 'monthly'
  const [chartRange, setChartRange] = useState('weekly');

  useEffect(() => {
    const loadAllStats = async () => {
      try {
        const [statsRes, goalsRes, tasksRes, subjectsRes] = await Promise.all([
          api.getStats(),
          api.getGoals(),
          api.getTasks(),
          api.getSubjects()
        ]);
        setStats(statsRes.data);
        setGoals(goalsRes.data);
        setTasks(tasksRes.data);
        setSubjects(subjectsRes.data);
      } catch (err) {
        console.error('Failed to load progress stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAllStats();
  }, []);

  if (loading) {
    return <div className="text-center font-bold opacity-50 py-20">Loading progress analytics...</div>;
  }

  // Derive Goals Progress
  const totalGoals = goals.length;
  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const goalsPercentage = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Derive Topic Progress per Subject
  const subjectProgressList = subjects.map(sub => {
    const subTasks = tasks.filter(t => t.subject && (t.subject._id === sub._id || t.subject === sub._id));
    const compCount = subTasks.filter(t => t.status === 'completed').length;
    const totalCount = subTasks.length;
    const percentage = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;
    return {
      id: sub._id,
      name: sub.name,
      completed: compCount,
      total: totalCount,
      percentage
    };
  });

  // Calculate stats
  const totalStudyMinutes = stats.activities.reduce((acc, a) => acc + a.duration, 0);
  const totalHours = totalStudyMinutes / 60;
  const currentStreak = stats.streak?.currentStreak || 0;
  const longestStreak = stats.streak?.longestStreak || 0;
  const totalCompletedTopics = tasks.filter(t => t.status === 'completed').length;

  // Calculate subject distribution data for PieChart
  const subjectMap = {};
  stats.activities.forEach(a => {
    if (a.subject && a.subject.name) {
      if (!subjectMap[a.subject.name]) subjectMap[a.subject.name] = 0;
      subjectMap[a.subject.name] += a.duration;
    }
  });

  const totalDurationWithSubject = Object.values(subjectMap).reduce((a, b) => a + b, 0);
  const colors = ['#000000', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  
  const subjectData = Object.keys(subjectMap).map((name, i) => ({
    name,
    value: totalDurationWithSubject > 0 ? Math.round((subjectMap[name] / totalDurationWithSubject) * 100) : 0,
    color: colors[i % colors.length]
  }));

  if (subjectData.length === 0) {
    subjectData.push({ name: 'Uncategorized', value: 100, color: '#CCCCCC' });
  }

  // Calculate Weekly chart data (last 7 days of activities)
  const getWeeklyData = () => {
    const days = eachDayOfInterval({ 
      start: subDays(new Date(), 6), 
      end: new Date() 
    });
    return days.map(day => {
      const dayActivities = stats.activities.filter(a => isSameDay(new Date(a.date), day));
      const hours = dayActivities.reduce((acc, a) => acc + (a.duration / 60), 0);
      return { 
        name: format(day, 'EEE (dd)'), 
        hours: Number(hours.toFixed(1)) 
      };
    });
  };

  // Calculate Monthly chart data (last 30 days of activities)
  const getMonthlyData = () => {
    const days = eachDayOfInterval({ 
      start: subDays(new Date(), 29), 
      end: new Date() 
    });
    return days.map(day => {
      const dayActivities = stats.activities.filter(a => isSameDay(new Date(a.date), day));
      const hours = dayActivities.reduce((acc, a) => acc + (a.duration / 60), 0);
      return { 
        name: format(day, 'MMM dd'), 
        hours: Number(hours.toFixed(1)) 
      };
    });
  };

  const chartData = chartRange === 'weekly' ? getWeeklyData() : getMonthlyData();

  return (
    <div className="space-y-12 py-10">
      <header>
        <h2 className="text-4xl font-black tracking-tight mb-2">Progress Analytics</h2>
        <p className="text-foreground/50 font-medium text-lg">Measure your learning velocity and study stats.</p>
      </header>

      {/* Primary Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Goals Progress Card */}
        <div className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Learning Goals Progress
            </h3>
            <span className="text-2xl font-black">{goalsPercentage}%</span>
          </div>

          <p className="text-sm text-foreground/50 font-semibold leading-relaxed">
            You've achieved <strong className="text-foreground font-black">{completedGoals}</strong> of your <strong className="text-foreground font-black">{totalGoals}</strong> high level milestones. Keep checking them off!
          </p>

          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground rounded-full transition-all duration-500" 
              style={{ width: `${goalsPercentage}%` }}
            />
          </div>
        </div>

        {/* Milestone Badge Card */}
        <div className="p-8 rounded-[2.5rem] border border-border bg-foreground text-background shadow-xl shadow-foreground/5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <Award className="w-8 h-8 text-background fill-current" />
            <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50">Milestone Achievement</div>
          </div>
          <div>
            <h4 className="text-2xl font-black mb-1">Scholar Ranking</h4>
            <p className="text-sm font-semibold opacity-70">
              Completed <strong className="font-black text-background">{totalCompletedTopics} topics</strong> across all learning subjects!
            </p>
          </div>
        </div>

      </div>

      {/* Progress Switcher Chart */}
      <div className="p-10 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h3 className="text-xl font-black flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Study Time Velocity
            </h3>
            <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mt-1">Hours spent learning daily</p>
          </div>
          <div className="flex bg-muted p-1.5 rounded-2xl gap-1.5 self-start">
            <button 
              onClick={() => setChartRange('weekly')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                chartRange === 'weekly' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button 
              onClick={() => setChartRange('monthly')}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                chartRange === 'monthly' ? 'bg-foreground text-background shadow-md' : 'text-foreground/50 hover:text-foreground'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
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
                tick={{fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.4}} 
                dy={15}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: 'currentColor', fontSize: 10, fontWeight: 700, opacity: 0.4}}
              />
              <Tooltip 
                contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px'}}
              />
              <Area 
                type="monotone" 
                dataKey="hours" 
                stroke="currentColor" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorHours)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Subject Topic Progress Bars */}
        <div className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            Subject Progress
          </h3>
          
          {subjects.length === 0 ? (
            <p className="text-sm font-bold text-foreground/40 text-center py-6">No subjects created yet.</p>
          ) : (
            <div className="space-y-6">
              {subjectProgressList.map((sub, index) => (
                <div key={sub.id} className="space-y-2">
                  <div className="flex justify-between items-end text-xs font-bold">
                    <span className="flex items-center gap-1.5 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-foreground/30" />
                      {sub.name}
                    </span>
                    <span className="text-foreground/45 uppercase tracking-wide text-[10px]">
                      {sub.completed}/{sub.total} topics • {sub.percentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foreground rounded-full transition-all duration-300"
                      style={{ width: `${sub.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Learning Distribution PieChart */}
        <div className="p-8 rounded-[2.5rem] border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Learning Distribution
          </h3>

          <div className="h-[240px] w-full flex items-center gap-6">
            <div className="flex-1 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
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
            
            <div className="space-y-3 min-w-[140px] max-h-[220px] overflow-y-auto pr-2">
              {subjectData.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-2 truncate">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="truncate max-w-[90px]">{item.name}</span>
                  </div>
                  <span className="font-black text-foreground/70">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Aggregate Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Deep Hours', value: `${totalHours.toFixed(1)}h`, icon: Clock },
          { label: 'Current Streak', value: `${currentStreak}d`, icon: Zap },
          { label: 'Longest Streak', value: `${longestStreak}d`, icon: Award },
        ].map((item, i) => (
          <div 
            key={i}
            className="p-8 rounded-[2rem] border border-border bg-card hover:bg-muted transition-colors cursor-pointer"
          >
            <item.icon className="w-6 h-6 mb-4 text-foreground/40" />
            <div className="text-3xl font-black mb-1">{item.value}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
