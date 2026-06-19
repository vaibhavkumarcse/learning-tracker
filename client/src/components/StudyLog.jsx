import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, BookOpen, FileText, Plus, Calendar, Bookmark, Zap, Activity as ActivityIcon } from 'lucide-react';
import * as api from '../services/api';

const StudyLog = () => {
  const [logs, setLogs] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  
  // Form states
  const [duration, setDuration] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [notes, setNotes] = useState('');
  const [topicsCoveredInput, setTopicsCoveredInput] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, subjectsRes, tasksRes] = await Promise.all([
        api.getStats(),
        api.getSubjects(),
        api.getTasks()
      ]);
      
      // Filter out activities that represent focus sessions or custom study logs
      // Actually we show all 'study_log' types and 'pomodoro' types as study logs!
      const studyLogs = statsRes.data.activities.filter(a => a.type === 'study_log' || a.type === 'pomodoro');
      // Sort by date descending
      studyLogs.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setLogs(studyLogs);
      setSubjects(subjectsRes.data);
      setTasks(tasksRes.data);

      if (subjectsRes.data.length > 0) {
        setSelectedSubjectId(subjectsRes.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch study logs data:', err);
      setError('Could not load logs data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogSession = async (e) => {
    e.preventDefault();
    if (!duration || !selectedSubjectId) return;
    setError('');
    setSuccess('');

    // Parse topics covered
    const topicsCovered = topicsCoveredInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    // If a task is selected, append its title to topics covered
    let taskId = undefined;
    if (selectedTopicId) {
      const matchedTask = tasks.find(t => t._id === selectedTopicId);
      if (matchedTask) {
        topicsCovered.push(matchedTask.title);
        taskId = matchedTask._id;
      }
    }

    try {
      const payload = {
        type: 'study_log',
        duration: Number(duration),
        date: new Date(date),
        subject: selectedSubjectId,
        taskId,
        notes,
        topicsCovered
      };

      await api.logActivity(payload);
      
      setSuccess('Session logged successfully!');
      setDuration('');
      setNotes('');
      setTopicsCoveredInput('');
      setSelectedTopicId('');
      
      // Refresh
      fetchData();
    } catch (err) {
      console.error('Failed to log session:', err);
      setError(err.response?.data?.message || 'Failed to log study session');
    }
  };

  // Filter tasks to only show topics under the selected subject
  const currentSubjectTasks = tasks.filter(t => 
    t.subject && (t.subject._id === selectedSubjectId || t.subject === selectedSubjectId)
  );

  const totalStudyMinutes = logs.reduce((acc, log) => acc + log.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Daily Study Log</h2>
          <p className="text-foreground/50 font-medium">Log your study hours and write summaries of topics covered.</p>
        </div>
      </header>

      {/* Aggregate Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-muted rounded-2xl text-foreground">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{totalStudyHours}h</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Logged Time</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-muted rounded-2xl text-foreground">
            <ActivityIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">{logs.length}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Study Sessions</div>
          </div>
        </div>

        <div className="p-6 rounded-3xl border border-border bg-card shadow-sm flex items-center gap-4">
          <div className="p-3 bg-muted rounded-2xl text-foreground">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black">
              {logs.filter(l => l.type === 'pomodoro').length}
            </div>
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Pomodoro Focus Blocks</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Logger Form */}
        <div className="lg:col-span-1">
          <div className="p-6 rounded-3xl border border-border bg-card shadow-md space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Log Session
            </h3>

            {error && <div className="p-3 text-xs text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
            {success && <div className="p-3 text-xs text-green-500 bg-green-500/10 rounded-lg">{success}</div>}

            <form onSubmit={handleLogSession} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Subject</label>
                <select 
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                  required
                >
                  {subjects.length === 0 ? (
                    <option value="">No subjects - Add one first!</option>
                  ) : (
                    subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Duration (Minutes)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 45, 90" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  min="1"
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Covering Specific Topic (Optional)</label>
                <select 
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-semibold text-xs"
                >
                  <option value="">-- Select Topic --</option>
                  {currentSubjectTasks.map(t => (
                    <option key={t._id} value={t._id}>{t.title} ({t.status === 'completed' ? 'Done' : 'Pending'})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Topics Covered (Comma separated tags)</label>
                <input 
                  type="text" 
                  placeholder="e.g. React hooks, arrays" 
                  value={topicsCoveredInput}
                  onChange={(e) => setTopicsCoveredInput(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-semibold text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Session Notes</label>
                <textarea 
                  placeholder="What did you learn today?" 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none text-sm font-medium"
                />
              </div>

              <button 
                type="submit" 
                disabled={subjects.length === 0}
                className="w-full py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity text-sm cursor-pointer shadow-md"
              >
                Log Session
              </button>
            </form>
          </div>
        </div>

        {/* History Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-black">History Log</h3>

          {loading ? (
            <div className="text-center font-bold opacity-50 py-10">Loading timeline...</div>
          ) : logs.length === 0 ? (
            <div className="text-center p-12 border border-dashed border-border rounded-3xl text-foreground/40 font-bold">
              No sessions logged yet. Log your first session!
            </div>
          ) : (
            <div className="relative border-l border-border pl-6 ml-3 space-y-8 py-4">
              <AnimatePresence>
                {logs.map((log) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    key={log._id}
                    className="relative group"
                  >
                    {/* Timeline Node Icon */}
                    <div className="absolute -left-[37px] top-1.5 w-6 h-6 rounded-full border-4 border-background bg-foreground text-background flex items-center justify-center shadow-md">
                      <Bookmark className="w-2.5 h-2.5 fill-current" />
                    </div>

                    <div className="p-6 rounded-[2rem] border border-border bg-card shadow-sm hover:border-foreground/20 hover:shadow-md transition-all space-y-4">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-xs text-foreground/40 uppercase tracking-widest">
                              {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              log.type === 'pomodoro' ? 'bg-red-500/10 text-red-500' : 'bg-foreground/5 text-foreground/50'
                            }`}>
                              {log.type === 'pomodoro' ? 'Pomodoro' : 'Study Log'}
                            </span>
                          </div>
                          <h4 className="text-lg font-bold tracking-tight mt-1 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-foreground/30" />
                            {log.subject?.name || 'Uncategorized'}
                          </h4>
                        </div>
                        <div className="px-3 py-1.5 bg-muted rounded-xl text-xs font-black flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-foreground/40" />
                          {log.duration} mins
                        </div>
                      </div>

                      {log.notes && (
                        <p className="text-sm font-semibold text-foreground/60 leading-relaxed italic">
                          "{log.notes}"
                        </p>
                      )}

                      {/* Display topics covered tags */}
                      {log.topicsCovered && log.topicsCovered.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {log.topicsCovered.map((topic, index) => (
                            <span key={index} className="text-[10px] font-bold bg-muted px-2.5 py-1 rounded-full text-foreground/55 border border-border">
                              #{topic}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyLog;
