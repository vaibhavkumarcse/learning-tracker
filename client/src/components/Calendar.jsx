import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(currentDate)),
    end: endOfWeek(endOfMonth(currentDate)),
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Calendar</h2>
        <div className="flex items-center gap-4">
          <span className="font-bold text-lg">{format(currentDate, 'MMMM yyyy')}</span>
          <div className="flex gap-1">
            <button onClick={prevMonth} className="p-2 border border-border rounded-lg hover:bg-muted"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={nextMonth} className="p-2 border border-border rounded-lg hover:bg-muted"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      <div className="border border-border rounded-2xl overflow-hidden bg-background">
        <div className="grid grid-cols-7 border-b border-border bg-muted/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-foreground/40 uppercase tracking-widest">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, i) => (
            <div 
              key={i} 
              className={`min-h-[120px] p-3 border-r border-b border-border group transition-colors hover:bg-muted/30 ${!isSameMonth(day, currentDate) ? 'text-foreground/20' : ''}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-sm font-bold ${isSameDay(day, new Date()) ? 'w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center' : ''}`}>
                  {format(day, 'd')}
                </span>
              </div>
              <div className="space-y-1">
                {/* Mock tasks for visual */}
                {isSameDay(day, new Date()) && (
                  <div className="text-[10px] p-1.5 bg-foreground text-background rounded-md font-medium truncate">
                    React Dashboard
                  </div>
                )}
                {isSameDay(day, new Date()) && (
                  <div className="text-[10px] p-1.5 border border-border rounded-md font-medium truncate">
                    Subject: Math
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
