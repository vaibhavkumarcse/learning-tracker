import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, MoreVertical, Filter, Search, ChevronRight, Calendar as CalendarIcon, MessageSquare } from 'lucide-react';
import * as api from '../services/api';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to fetch tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = tasks.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    
    const task = { title: newTask, status: 'todo', priority: 'medium' };
    try {
      const { data } = await api.createTask(task);
      setTasks([data, ...tasks]);
      setNewTask('');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Backlog</h2>
          <p className="text-foreground/50 font-medium">You have <span className="text-foreground font-bold">{tasks.filter(t => t.status !== 'completed').length} pending</span> assignments.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Filter tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-muted rounded-xl border-none focus:ring-2 focus:ring-foreground/10 text-sm font-medium outline-none transition-all"
            />
          </div>
          <button className="p-2 bg-muted rounded-xl hover:bg-border transition-colors">
            <Filter className="w-5 h-5" />
          </button>
        </div>
      </header>

      <form onSubmit={handleAddTask} className="relative group">
        <input
          type="text"
          placeholder="What needs to be done?"
          className="w-full p-6 pl-14 rounded-2xl bg-muted border-none focus:ring-4 focus:ring-foreground/5 text-lg font-bold outline-none transition-all placeholder:text-foreground/20"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />
        <Plus className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-foreground transition-colors" />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
          Add Task
        </button>
      </form>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={task._id} 
              className={`group p-6 rounded-3xl border border-border bg-background transition-all hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/5 ${task.status === 'completed' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-6">
                  <button className="mt-1 text-foreground/20 hover:text-foreground transition-colors">
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-8 h-8 text-foreground" />
                    ) : (
                      <Circle className="w-8 h-8" />
                    )}
                  </button>
                  <div className="space-y-2">
                    <div className={`text-xl font-bold tracking-tight ${task.status === 'completed' ? 'line-through text-foreground/30' : ''}`}>
                      {task.title}
                    </div>
                    {task.notes && (
                      <p className="text-sm text-foreground/50 font-medium">{task.notes}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4">
                      <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                        task.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/5 text-foreground/40'
                      }`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                          <CalendarIcon className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                        <MessageSquare className="w-3 h-3" />
                        2 Comments
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                  <button className="p-3 hover:bg-muted rounded-2xl text-red-500 transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button className="p-3 hover:bg-muted rounded-2xl transition-colors">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskBoard;
