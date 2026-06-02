import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BookOpen } from 'lucide-react';
import * as api from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [newSubject, setNewSubject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data } = await api.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Failed to fetch subjects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    
    try {
      const { data } = await api.createSubject({ name: newSubject });
      setSubjects([...subjects, data]);
      setNewSubject('');
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
  };

  // Currently we only have API for get and create, not delete.
  // We'll just display them for now, but UI can be prepared.

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Subjects</h2>
          <p className="text-foreground/50 font-medium">Organize your learning into specific categories.</p>
        </div>
      </header>

      <form onSubmit={handleAddSubject} className="relative group">
        <input
          type="text"
          placeholder="Add a new subject..."
          className="w-full p-6 pl-14 rounded-2xl bg-muted border-none focus:ring-4 focus:ring-foreground/5 text-lg font-bold outline-none transition-all placeholder:text-foreground/20"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <Plus className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-foreground transition-colors" />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity">
          Add
        </button>
      </form>

      {loading ? (
        <div className="text-center font-bold opacity-50 py-10">Loading subjects...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center font-bold opacity-50 py-10">
          No subjects added yet. Add one above!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {subjects.map((subject) => (
              <motion.div 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={subject._id} 
                className="group p-6 rounded-3xl border border-border bg-background transition-all hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/5"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-muted rounded-2xl text-foreground">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-xl font-bold tracking-tight">
                      {subject.name}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Subjects;
