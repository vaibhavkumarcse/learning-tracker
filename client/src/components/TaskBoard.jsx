import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, CheckCircle2, Circle, MoreVertical, Filter, Search, Calendar as CalendarIcon, Edit3, X, BookOpen, Layers } from 'lucide-react';
import * as api from '../services/api';

const TaskBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'todo', 'in-progress', 'completed'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const categories = ['Study', 'Revision', 'Practice', 'Project', 'Reading', 'Other'];
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // New task form state
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('');

  // Editing task state (modal)
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editPriority, setEditPriority] = useState('medium');
  const [editStatus, setEditStatus] = useState('todo');
  const [editDueDate, setEditDueDate] = useState('');
  const [editCategory, setEditCategory] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const tasksRes = await api.getTasks();
      setTasks(tasksRes.data || []);
    } catch (err) {
      console.error('Failed to load board data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const payload = {
        title,
        description: notes,
        priority,
        dueDate: dueDate || undefined,
        category: category || 'Study',
        status: 'todo'
      };

      const { data } = await api.createTask(payload);
      // Refresh task list
      const tasksRes = await api.getTasks();
      setTasks(tasksRes.data);

      setTitle('');
      setNotes('');
      setPriority('medium');
      setDueDate('');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleToggleStatus = async (task) => {
    const nextStatus = task.status === 'completed' ? 'todo' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date() : null;

    try {
      const { data } = await api.updateTask(task._id, { status: nextStatus, completedAt });
      setTasks(tasks.map(t => t._id === task._id ? data : t));
    } catch (err) {
      console.error('Failed to toggle task status:', err);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await api.deleteTask(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditNotes(task.notes || task.description || '');
    setEditPriority(task.priority || 'medium');
    setEditStatus(task.status || 'todo');
    setEditDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    setEditCategory(task.category || 'Study');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTask || !editTitle.trim()) return;

    try {
      const payload = {
        title: editTitle,
        description: editNotes,
        priority: editPriority,
        status: editStatus,
        dueDate: editDueDate || null,
        category: editCategory || 'Study',
        completedAt: editStatus === 'completed' ? new Date() : null
      };

      await api.updateTask(editingTask._id, payload);
      setEditingTask(null);
      // Reload all tasks to populate subject references correctly
      const tasksRes = await api.getTasks();
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (task.notes && task.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  const pendingCount = tasks.filter(t => t.status !== 'completed').length;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Study Tasks</h2>
          <p className="text-foreground/50 font-medium">
            You have <span className="text-foreground font-bold">{pendingCount} pending</span> topics to cover.
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto items-center">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted rounded-xl border-none focus:ring-2 focus:ring-foreground/10 text-sm font-medium outline-none transition-all"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              showFilters ? 'bg-foreground text-background border-foreground' : 'bg-muted border-transparent hover:bg-border'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-3 bg-foreground text-background rounded-xl font-bold hover:opacity-90 transition-opacity cursor-pointer shadow-md flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </header>

      {/* Expanded filters panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="p-6 rounded-3xl border border-border bg-card shadow-md grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Status Filter</label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted text-xs font-bold"
              >
                <option value="all">All Statuses</option>
                <option value="todo">Not Started</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Category Filter</label>
              <select 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted text-xs font-bold"
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Creators form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAddTask}
            className="p-8 rounded-[2rem] border border-border bg-card shadow-lg space-y-6 overflow-hidden"
          >
            <h3 className="text-xl font-black">Create Task Topic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Task Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Set up Express routes" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Notes / Details</label>
                  <textarea 
                    placeholder="Describe task details, objectives..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Category</label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                  >
                    <option value="">-- General --</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Priority</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Due Date</label>
                    <input 
                      type="date" 
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-[10px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-5 py-3 hover:bg-muted font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-opacity text-xs uppercase tracking-widest cursor-pointer shadow-md"
              >
                Save Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Task List */}
      {loading ? (
        <div className="text-center font-bold opacity-50 py-10">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-3xl text-foreground/40 font-bold">
          No tasks found matching your filters.
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredTasks.map((task) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={task._id} 
                className={`group p-6 rounded-[2rem] border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/5 ${task.status === 'completed' ? 'opacity-60 bg-muted/10' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <button 
                      onClick={() => handleToggleStatus(task)}
                      className="mt-1 text-foreground/30 hover:text-foreground transition-colors cursor-pointer shrink-0"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-7 h-7 text-foreground fill-current bg-background" />
                      ) : (
                        <Circle className="w-7 h-7" />
                      )}
                    </button>
                    
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h4 className={`text-lg font-black tracking-tight truncate ${task.status === 'completed' ? 'line-through text-foreground/30' : ''}`}>
                          {task.title}
                        </h4>
                        
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                          task.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' : 'bg-foreground/5 text-foreground/40'
                        }`}>
                          {task.priority}
                        </span>

                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.status === 'completed' ? 'bg-green-500/10 text-green-500' : 
                          task.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500' : 'bg-muted text-foreground/40'
                        }`}>
                          {task.status === 'completed' ? 'Completed' : task.status === 'in-progress' ? 'In Progress' : 'Not Started'}
                        </span>
                      </div>

                      {(task.notes || task.description) && (
                        <p className="text-xs text-foreground/55 font-semibold leading-relaxed max-w-2xl">
                          {task.notes || task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-[9px] font-bold text-foreground/40 uppercase tracking-widest pt-1 flex-wrap">
                        {task.category && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="w-3.5 h-3.5 text-foreground/30" />
                            {task.category}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="w-3.5 h-3.5 text-foreground/30" />
                            Target: {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button 
                      onClick={() => openEditModal(task)}
                      className="p-2.5 hover:bg-muted text-foreground/30 hover:text-foreground rounded-xl transition-all cursor-pointer"
                      title="Edit Task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-2.5 hover:bg-red-500/10 text-foreground/30 hover:text-red-500 rounded-xl transition-all cursor-pointer"
                      title="Delete Task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Edit Task Modal */}
      <AnimatePresence>
        {editingTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <motion.form 
              initial={{ scale: 0.95, y: 15, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 15, opacity: 0 }}
              onSubmit={handleSaveEdit}
              className="w-full max-w-lg p-8 rounded-[2.5rem] border border-border bg-card shadow-2xl relative space-y-6"
            >
              <button 
                type="button" 
                onClick={() => setEditingTask(null)}
                className="absolute right-6 top-6 p-2 text-foreground/30 hover:text-foreground hover:bg-muted rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-2xl font-black">Modify Task details</h3>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Title</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Notes</label>
                  <textarea 
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Status</label>
                    <select 
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted text-xs font-bold"
                    >
                      <option value="todo">Not Started</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Category</label>
                    <select 
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted text-xs font-bold"
                    >
                      <option value="">-- General --</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Priority</label>
                    <select 
                      value={editPriority}
                      onChange={(e) => setEditPriority(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted text-xs font-bold"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Target Due Date</label>
                    <input 
                      type="date" 
                      value={editDueDate}
                      onChange={(e) => setEditDueDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setEditingTask(null)}
                  className="px-5 py-3 hover:bg-muted font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-opacity text-xs uppercase tracking-widest cursor-pointer shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default TaskBoard;
