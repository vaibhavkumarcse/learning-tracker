import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar, Target, Award, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await api.getGoals();
      setGoals(data);
    } catch (err) {
      console.error('Failed to fetch goals:', err);
      setError('Could not load learning goals.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    if (!title.trim() || !targetDate) return;
    setError('');

    try {
      const { data } = await api.createGoal({
        title,
        description,
        targetDate,
        difficulty
      });
      setGoals([data, ...goals]);
      setTitle('');
      setDescription('');
      setTargetDate('');
      setDifficulty('medium');
      setShowAddForm(false);
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError(err.response?.data?.message || 'Failed to create goal');
    }
  };

  const handleToggleGoalStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'completed' : 'active';
    const completedAt = nextStatus === 'completed' ? new Date() : null;

    try {
      const { data } = await api.updateGoal(id, { status: nextStatus, completedAt });
      setGoals(goals.map(g => g._id === id ? data : g));
    } catch (err) {
      console.error('Failed to update goal status:', err);
    }
  };

  const handleDeleteGoal = async (id) => {
    try {
      await api.deleteGoal(id);
      setGoals(goals.filter(g => g._id !== id));
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  const completedCount = goals.filter(g => g.status === 'completed').length;
  const completionRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Learning Goals</h2>
          <p className="text-foreground/50 font-medium">Define high-level milestones for your skill development.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-5 py-3 bg-foreground text-background font-black rounded-2xl flex items-center gap-2 hover:opacity-90 transition-opacity cursor-pointer shadow-lg active:scale-95 text-sm"
        >
          <Plus className="w-4 h-4" />
          {showAddForm ? 'Close Creator' : 'New Goal'}
        </button>
      </header>

      {/* Progress Card */}
      {goals.length > 0 && (
        <div className="p-8 rounded-[2.5rem] border border-border bg-muted/20 flex flex-col md:flex-row md:items-center gap-8 shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-foreground text-background flex items-center justify-center font-black text-2xl shadow-xl shadow-foreground/10">
            {completionRate}%
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex justify-between items-end font-bold text-sm">
              <span className="uppercase tracking-widest text-foreground/40 text-xs">Milestone Status</span>
              <span>{completedCount} of {goals.length} Completed</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-foreground rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Form Toggle */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateGoal}
            className="p-8 rounded-3xl border border-border bg-card shadow-lg space-y-6 overflow-hidden"
          >
            <h3 className="text-xl font-black">Create Learning Goal</h3>
            {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Goal Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Learn React, Complete DSA" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-4 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold placeholder:font-normal"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Difficulty</label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Target Date</label>
                  <input 
                    type="date" 
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full p-4 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-foreground/50">Description (Optional)</label>
              <textarea 
                placeholder="What does success look like for this goal?" 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-medium"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowAddForm(false)}
                className="px-5 py-3 hover:bg-muted font-bold rounded-xl transition-colors text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-5 py-3 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer"
              >
                Create Goal
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {loading ? (
        <div className="text-center font-bold opacity-50 py-10">Loading learning goals...</div>
      ) : goals.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-3xl space-y-4">
          <div className="text-4xl text-foreground/20">🎯</div>
          <h4 className="text-lg font-bold">No goals added yet</h4>
          <p className="text-foreground/50 text-sm max-w-sm mx-auto">Set high level learning objectives like "Learn MERN" or "Complete DSA" with target completion dates.</p>
          <button 
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 border border-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-foreground hover:text-background transition-all"
          >
            Create Your First Goal
          </button>
        </div>
      ) : (
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {goals.map((goal) => {
              const isOverdue = new Date(goal.targetDate) < new Date() && goal.status === 'active';
              return (
                <motion.div 
                  layout
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={goal._id} 
                  className={`p-6 rounded-[2rem] border border-border bg-card transition-all hover:border-foreground/25 hover:shadow-xl hover:shadow-black/5 flex flex-col justify-between space-y-6 ${goal.status === 'completed' ? 'opacity-65' : ''}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <button 
                      onClick={() => handleToggleGoalStatus(goal._id, goal.status)}
                      className="mt-1 text-foreground/30 hover:text-foreground transition-colors cursor-pointer"
                    >
                      {goal.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-foreground fill-current bg-background" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div className="flex-1 space-y-1">
                      <h4 className={`text-xl font-bold tracking-tight ${goal.status === 'completed' ? 'line-through text-foreground/40' : ''}`}>
                        {goal.title}
                      </h4>
                      {goal.description && (
                        <p className="text-xs text-foreground/50 leading-relaxed font-medium">{goal.description}</p>
                      )}
                    </div>

                    <button 
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1.5 hover:bg-red-500/15 text-foreground/30 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs font-bold text-foreground/55">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-foreground/30" />
                      <span className={isOverdue ? 'text-red-500 font-extrabold flex items-center gap-1' : ''}>
                        {isOverdue && <AlertCircle className="w-3 h-3" />}
                        {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                        goal.difficulty === 'hard' ? 'bg-red-500/10 text-red-500' : 
                        goal.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                      }`}>
                        {goal.difficulty}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

export default Goals;
