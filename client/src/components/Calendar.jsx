import React, { useState, useEffect } from 'react';
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock } from 'lucide-react';
import { useData } from '../context/DataContext';
import { useTimer } from '../context/TimerContext';

const Calendar = () => {
  const { tasks, stats, loading } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);

  // Local fetch logic removed, now handled by DataContext
  const activities = stats?.activities || [];
  
  const { timerMode, countdownDisplay, stopwatchDisplay, totalDurationRef } = useTimer();

  const getUnsavedMinutes = () => {
    if (timerMode === 'countdown') {
      const elapsed = totalDurationRef.current - countdownDisplay;
      return elapsed > 0 ? Math.floor(elapsed / 60) : 0;
    } else {
      return Math.floor(stopwatchDisplay / 60);
    }
  };
  const unsavedMinutes = getUnsavedMinutes();

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getTasksForDay = (day) =>
    tasks.filter(task => task.dueDate && isSameDay(new Date(task.dueDate), day));

  const getStudyTimeForDay = (day) => {
    const dayActs = activities.filter(
      act => act.date && isSameDay(new Date(act.date), day) && act.type === 'pomodoro'
    );
    const totalMinutes = dayActs.reduce((sum, act) => sum + (act.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return { totalMinutes, hours, minutes, count: dayActs.length };
  };

  const getHeatmapBg = (totalMinutes) => {
    if (totalMinutes <= 0)   return '';
    if (totalMinutes <= 30)  return 'bg-green-200/60 dark:bg-green-900/30';
    if (totalMinutes <= 60)  return 'bg-green-300/60 dark:bg-green-800/40';
    if (totalMinutes <= 120) return 'bg-green-400/50 dark:bg-green-700/50';
    if (totalMinutes <= 240) return 'bg-green-500/50 dark:bg-green-600/55';
    return 'bg-green-600/60 dark:bg-green-500/60';
  };

  const formatStudyTime = ({ hours, minutes }) => {
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Calendar</h2>
          <p className="text-foreground/50 font-medium">Daily study heatmap · task deadlines.</p>
        </div>
        <div className="flex items-center gap-4 self-start sm:self-auto">
          <span className="font-black text-lg">{format(currentDate, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <button
              onClick={prevMonth}
              className="p-2 border border-border rounded-xl hover:bg-muted cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-2 border border-border rounded-xl hover:bg-muted cursor-pointer text-xs font-bold transition-colors"
            >
              Today
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border border-border rounded-xl hover:bg-muted cursor-pointer transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center gap-3 py-20">
          <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <p className="text-sm font-bold text-foreground/40">Loading calendar...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Calendar Grid */}
          <div className="border border-border rounded-3xl overflow-hidden bg-card shadow-lg">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-border bg-muted/30">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="py-4 text-center text-xs font-black text-foreground/40 uppercase tracking-widest">
                  {d}
                </div>
              ))}
            </div>

            {/* Days */}
            <div className="grid grid-cols-7">
              {days.map((day, i) => {
                const dayTasks = getTasksForDay(day);
                const isToday = isSameDay(day, new Date());
                const baseStudyTime = getStudyTimeForDay(day);
                const totalMinutes = baseStudyTime.totalMinutes + (isToday ? unsavedMinutes : 0);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;
                const studyTime = { totalMinutes, hours, minutes, count: baseStudyTime.count };
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const heatmapBg = getHeatmapBg(studyTime.totalMinutes);

                return (
                  <div
                    key={i}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`min-h-[80px] md:min-h-[120px] p-1 md:p-2.5 border-r border-b border-border transition-all flex flex-col cursor-pointer
                      ${!isCurrentMonth ? 'opacity-30 bg-muted/5' : ''}
                      ${isToday ? 'bg-foreground/5' : ''}
                      ${heatmapBg}
                      ${isSelected ? 'ring-2 ring-inset ring-foreground/30' : ''}
                      hover:bg-muted/20
                    `}
                  >
                    {/* Date number */}
                    <div className="flex justify-between items-start mb-1">
                      <span className={`text-[10px] md:text-xs font-black leading-none ${
                        isToday
                          ? 'w-5 h-5 md:w-6 md:h-6 rounded-full bg-foreground text-background flex items-center justify-center shadow-sm'
                          : 'text-foreground/60 p-0.5 md:p-1'
                      }`}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-[8px] font-black bg-foreground/10 text-foreground/70 px-1.5 py-0.5 rounded-md">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>

                    {/* Study time badge */}
                    {studyTime.totalMinutes > 0 && (
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className="w-2.5 h-2.5 text-green-600 dark:text-green-400 shrink-0" />
                        <span className="text-[10px] font-black text-green-700 dark:text-green-400 leading-none">
                          {formatStudyTime(studyTime)}
                        </span>
                      </div>
                    )}

                    {/* Tasks */}
                    <div className="flex-1 space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task._id}
                          className={`text-[8px] px-1.5 py-1 rounded-lg border font-bold truncate ${
                            task.status === 'completed'
                              ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400 line-through'
                              : task.status === 'in-progress'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400'
                              : 'bg-muted/50 border-border text-foreground/60'
                          }`}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <div className="text-[8px] font-black text-foreground/40">
                          +{dayTasks.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heatmap Legend */}
          <div className="flex flex-wrap justify-center md:justify-end items-center gap-2 md:gap-3 text-[10px] md:text-xs font-bold text-foreground/50 px-2 mt-4 md:mt-0">
            <span>Less studied</span>
            <div className="flex gap-1 md:gap-1.5 items-center">
              <div className="w-3 h-3 md:w-4 md:h-4 rounded border border-border bg-card" title="No study" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-200/60 dark:bg-green-900/30" title="1–30 min" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-300/60 dark:bg-green-800/40" title="31–60 min" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-400/50 dark:bg-green-700/50" title="61–120 min" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-500/50 dark:bg-green-600/55" title="121–240 min" />
              <div className="w-3 h-3 md:w-4 md:h-4 rounded bg-green-600/60 dark:bg-green-500/60" title=">240 min" />
            </div>
            <span>More studied</span>
          </div>

          {/* Selected Day Detail */}
          {selectedDay && (() => {
            const dayTasks = getTasksForDay(selectedDay);
            const isToday = isSameDay(selectedDay, new Date());
            const baseStudyTime = getStudyTimeForDay(selectedDay);
            const totalMinutes = baseStudyTime.totalMinutes + (isToday ? unsavedMinutes : 0);
            const hours = Math.floor(totalMinutes / 60);
            const minutes = totalMinutes % 60;
            const studyTime = { totalMinutes, hours, minutes, count: baseStudyTime.count };
            
            const dayActivities = activities.filter(
              act => act.date && isSameDay(new Date(act.date), selectedDay) && act.type === 'pomodoro'
            );

            return (
              <div className="p-6 rounded-3xl border border-border bg-card space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-black">
                    {format(selectedDay, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  {studyTime.totalMinutes > 0 && (
                    <div className="flex items-center gap-1.5 text-sm font-black text-green-600 dark:text-green-400">
                      <Clock className="w-4 h-4" />
                      {formatStudyTime(studyTime)} studied
                    </div>
                  )}
                </div>

                {/* Study sessions */}
                {dayActivities.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/40">Study Sessions</p>
                    {dayActivities.map((act) => (
                      <div key={act._id} className="flex items-center justify-between p-3 rounded-xl bg-green-500/5 border border-green-500/20">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-sm font-bold">{act.subject?.name || 'General'}</span>
                        </div>
                        <span className="text-xs font-black text-green-600 dark:text-green-400">
                          {act.duration >= 60
                            ? `${Math.floor(act.duration / 60)}h ${act.duration % 60}m`
                            : `${act.duration}m`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tasks due */}
                {dayTasks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-black uppercase tracking-widest text-foreground/40">Tasks Due</p>
                    {dayTasks.map((task) => (
                      <div key={task._id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border">
                        {task.status === 'completed'
                          ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          : <Circle className="w-4 h-4 text-foreground/30 shrink-0" />}
                        <span className={`text-sm font-bold flex-1 ${task.status === 'completed' ? 'line-through text-foreground/40' : ''}`}>
                          {task.title}
                        </span>
                        {task.subject && (
                          <span className="text-[10px] font-black text-foreground/40 uppercase tracking-wider">
                            {task.subject.name}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {dayActivities.length === 0 && dayTasks.length === 0 && (
                  <p className="text-sm text-foreground/40 font-medium py-2">
                    No study sessions or tasks scheduled for this day.
                  </p>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default Calendar;
