import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BookOpen, ArrowLeft, Video, FileText, Compass, ExternalLink, Calendar, CheckSquare, Layers, Clock, AlertCircle } from 'lucide-react';
import * as api from '../services/api';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Form states for creating a topic
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicPriority, setNewTopicPriority] = useState('medium');
  const [newTopicDueDate, setNewTopicDueDate] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [resources, setResources] = useState([]); // [{ title, type, url }]
  
  // Resource inputs
  const [resTitle, setResTitle] = useState('');
  const [resType, setResType] = useState('youtube');
  const [resUrl, setResUrl] = useState('');

  // Editing resource input for an existing topic
  const [activeAddResTopicId, setActiveAddResTopicId] = useState(null);
  const [inlineResTitle, setInlineResTitle] = useState('');
  const [inlineResType, setInlineResType] = useState('youtube');
  const [inlineResUrl, setInlineResUrl] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subjectsRes, tasksRes] = await Promise.all([
        api.getSubjects(),
        api.getTasks()
      ]);
      setSubjects(subjectsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubject = async (e) => {
    e.preventDefault();
    if (!newSubjectName.trim()) return;
    try {
      const { data } = await api.createSubject({ name: newSubjectName });
      setSubjects([...subjects, data]);
      setNewSubjectName('');
    } catch (err) {
      console.error('Failed to create subject:', err);
    }
  };

  const handleDeleteSubject = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subject? All associated topics/tasks will also be deleted.")) return;
    try {
      await api.deleteSubject(id);
      setSubjects(subjects.filter(s => s._id !== id));
      if (selectedSubject && selectedSubject._id === id) {
        setSelectedSubject(null);
      }
    } catch (err) {
      console.error('Failed to delete subject:', err);
    }
  };

  const handleAddTopicResource = () => {
    if (!resTitle.trim() || !resUrl.trim()) return;
    setResources([...resources, { title: resTitle, type: resType, url: resUrl }]);
    setResTitle('');
    setResUrl('');
  };

  const handleRemoveTopicResource = (index) => {
    setResources(resources.filter((_, i) => i !== index));
  };

  const handleCreateTopic = async (e) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !selectedSubject) return;

    try {
      const { data } = await api.createTask({
        title: newTopicTitle,
        description: newTopicDesc,
        status: 'todo',
        priority: newTopicPriority,
        dueDate: newTopicDueDate || undefined,
        subject: selectedSubject._id,
        resources
      });

      setTasks([data, ...tasks]);
      setNewTopicTitle('');
      setNewTopicDesc('');
      setNewTopicPriority('medium');
      setNewTopicDueDate('');
      setResources([]);
    } catch (err) {
      console.error('Failed to create topic:', err);
    }
  };

  const handleUpdateTopicStatus = async (topicId, newStatus) => {
    try {
      const { data } = await api.updateTask(topicId, { status: newStatus });
      setTasks(tasks.map(t => t._id === topicId ? data : t));
    } catch (err) {
      console.error('Failed to update topic status:', err);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    try {
      await api.deleteTask(topicId);
      setTasks(tasks.filter(t => t._id !== topicId));
    } catch (err) {
      console.error('Failed to delete topic:', err);
    }
  };

  const handleAddInlineResource = async (topicId) => {
    if (!inlineResTitle.trim() || !inlineResUrl.trim()) return;
    const topic = tasks.find(t => t._id === topicId);
    if (!topic) return;

    const updatedResources = [...(topic.resources || []), {
      title: inlineResTitle,
      type: inlineResType,
      url: inlineResUrl
    }];

    try {
      const { data } = await api.updateTask(topicId, { resources: updatedResources });
      setTasks(tasks.map(t => t._id === topicId ? data : t));
      setInlineResTitle('');
      setInlineResUrl('');
      setActiveAddResTopicId(null);
    } catch (err) {
      console.error('Failed to add resource:', err);
    }
  };

  const getResourceIcon = (type) => {
    switch (type) {
      case 'youtube': return <Video className="w-4 h-4 text-red-500" />;
      case 'article': return <FileText className="w-4 h-4 text-blue-500" />;
      case 'course': return <Layers className="w-4 h-4 text-indigo-500" />;
      default: return <Compass className="w-4 h-4 text-foreground/40" />;
    }
  };

  // Filter tasks for the selected subject
  const currentSubjectTasks = selectedSubject
    ? tasks.filter(t => t.subject && (t.subject._id === selectedSubject._id || t.subject === selectedSubject._id))
    : [];

  const completedTopicsCount = currentSubjectTasks.filter(t => t.status === 'completed').length;
  const totalTopicsCount = currentSubjectTasks.length;
  const progressPercent = totalTopicsCount > 0 ? Math.round((completedTopicsCount / totalTopicsCount) * 100) : 0;

  if (selectedSubject) {
    return (
      <div className="max-w-4xl mx-auto py-10 space-y-10">
        {/* Detail Header */}
        <header className="flex flex-col gap-6">
          <button 
            onClick={() => { setSelectedSubject(null); loadData(); }}
            className="flex items-center gap-2 text-sm font-bold text-foreground/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Subjects
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-2">{selectedSubject.name}</h2>
              <p className="text-foreground/50 font-medium">Topic board and curated learning materials.</p>
            </div>
            <div className="flex items-center gap-6">
              <button
                onClick={() => handleDeleteSubject(selectedSubject._id)}
                className="px-4 py-2 border border-red-500/30 hover:border-red-500 text-red-500 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer bg-red-500/5 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Subject
              </button>
              <div className="text-right">
                <span className="text-2xl font-black">{progressPercent}%</span>
                <p className="text-xs font-bold text-foreground/40 uppercase tracking-wider mt-1">{completedTopicsCount} of {totalTopicsCount} completed</p>
              </div>
            </div>
          </div>

          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-foreground rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Creator panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="p-6 rounded-3xl border border-border bg-card space-y-6">
              <h3 className="text-lg font-black">Add Topic</h3>
              <form onSubmit={handleCreateTopic} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Topic Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Express Middleware" 
                    value={newTopicTitle}
                    onChange={(e) => setNewTopicTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Description</label>
                  <textarea 
                    placeholder="Topic notes or goals..." 
                    value={newTopicDesc}
                    onChange={(e) => setNewTopicDesc(e.target.value)}
                    rows={2}
                    className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none text-sm font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Difficulty</label>
                    <select 
                      value={newTopicPriority}
                      onChange={(e) => setNewTopicPriority(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                    >
                      <option value="low">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="high">Hard</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Target Date</label>
                    <input 
                      type="date" 
                      value={newTopicDueDate}
                      onChange={(e) => setNewTopicDueDate(e.target.value)}
                      className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-[10px]"
                    />
                  </div>
                </div>

                {/* Inline Resource Creator */}
                <div className="border-t border-border pt-4 space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Attach Resource</label>
                  <input 
                    type="text" 
                    placeholder="Resource Name (e.g. FreeCodeCamp course)" 
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-border bg-muted text-xs font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <select 
                      value={resType}
                      onChange={(e) => setResType(e.target.value)}
                      className="col-span-1 p-2 rounded-lg border border-border bg-muted text-[10px] font-bold"
                    >
                      <option value="youtube">YouTube</option>
                      <option value="article">Article</option>
                      <option value="course">Course</option>
                      <option value="other">Web</option>
                    </select>
                    <input 
                      type="url" 
                      placeholder="https://..." 
                      value={resUrl}
                      onChange={(e) => setResUrl(e.target.value)}
                      className="col-span-2 p-2 rounded-lg border border-border bg-muted text-xs"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddTopicResource}
                    className="w-full py-2 border border-foreground/10 hover:bg-muted text-xs font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Add Resource Link
                  </button>

                  {resources.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      {resources.map((res, i) => (
                        <div key={i} className="flex justify-between items-center bg-muted/50 p-2 rounded-lg text-xs">
                          <span className="font-bold truncate max-w-[120px]">{res.title}</span>
                          <span className="text-[9px] uppercase tracking-widest text-foreground/40 font-bold">{res.type}</span>
                          <button 
                            type="button" 
                            onClick={() => handleRemoveTopicResource(i)}
                            className="text-red-500 font-bold hover:underline"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="w-full py-3 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer shadow-md"
                >
                  Create Topic
                </button>
              </form>
            </div>
          </div>

          {/* Topics board */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-black">Topics ({currentSubjectTasks.length})</h3>

            {currentSubjectTasks.length === 0 ? (
              <div className="text-center p-12 border border-dashed border-border rounded-3xl text-foreground/40 font-bold">
                No topics added to this subject yet. Add one on the left!
              </div>
            ) : (
              <div className="space-y-4">
                {currentSubjectTasks.map((topic) => (
                  <div 
                    key={topic._id} 
                    className={`p-6 rounded-[2rem] border border-border bg-card hover:border-foreground/20 hover:shadow-xl transition-all ${topic.status === 'completed' ? 'opacity-70 bg-muted/10' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className={`text-lg font-black tracking-tight ${topic.status === 'completed' ? 'line-through text-foreground/30' : ''}`}>
                            {topic.title}
                          </h4>
                          <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            topic.priority === 'high' ? 'bg-red-500/10 text-red-500' : 
                            topic.priority === 'medium' ? 'bg-amber-500/10 text-amber-500' : 'bg-green-500/10 text-green-500'
                          }`}>
                            {topic.priority === 'high' ? 'Hard' : topic.priority === 'medium' ? 'Medium' : 'Easy'}
                          </span>
                        </div>
                        {topic.description && (
                          <p className="text-xs text-foreground/50 leading-relaxed font-semibold">{topic.description}</p>
                        )}

                        {topic.dueDate && (
                          <div className="flex items-center gap-1 text-[10px] text-foreground/40 font-bold uppercase tracking-wider">
                            <Calendar className="w-3 h-3" />
                            Target: {new Date(topic.dueDate).toLocaleDateString()}
                          </div>
                        )}

                        {/* Resources lists */}
                        {topic.resources && topic.resources.length > 0 && (
                          <div className="space-y-2 pt-2 border-t border-border/50 mt-3">
                            <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Learning Resources</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {topic.resources.map((res, rIdx) => (
                                <a 
                                  key={rIdx} 
                                  href={res.url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-between p-2 rounded-xl bg-muted hover:bg-border transition-colors text-xs font-bold group/res"
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {getResourceIcon(res.type)}
                                    <span className="truncate max-w-[120px]">{res.title}</span>
                                  </div>
                                  <ExternalLink className="w-3.5 h-3.5 opacity-30 group-hover/res:opacity-100 transition-opacity" />
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Inline Add Resource trigger */}
                        {activeAddResTopicId === topic._id ? (
                          <div className="p-4 rounded-2xl bg-muted border border-border mt-3 space-y-3">
                            <div className="text-[10px] font-black uppercase tracking-wider text-foreground/40">Add Resource</div>
                            <input 
                              type="text" 
                              placeholder="Resource Title (e.g. MDN Web Docs)" 
                              value={inlineResTitle}
                              onChange={(e) => setInlineResTitle(e.target.value)}
                              className="w-full p-2 rounded-lg border border-border bg-background text-xs font-bold"
                            />
                            <div className="grid grid-cols-3 gap-2">
                              <select 
                                value={inlineResType}
                                onChange={(e) => setInlineResType(e.target.value)}
                                className="col-span-1 p-2 rounded-lg border border-border bg-background text-[10px] font-bold"
                              >
                                <option value="youtube">YouTube</option>
                                <option value="article">Article</option>
                                <option value="course">Course</option>
                                <option value="other">Web</option>
                              </select>
                              <input 
                                type="url" 
                                placeholder="https://..." 
                                value={inlineResUrl}
                                onChange={(e) => setInlineResUrl(e.target.value)}
                                className="col-span-2 p-2 rounded-lg border border-border bg-background text-xs"
                              />
                            </div>
                            <div className="flex justify-end gap-2 text-xs">
                              <button 
                                onClick={() => setActiveAddResTopicId(null)}
                                className="px-3 py-1.5 hover:bg-border rounded-lg font-bold"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleAddInlineResource(topic._id)}
                                className="px-3 py-1.5 bg-foreground text-background font-bold rounded-lg"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button 
                            onClick={() => setActiveAddResTopicId(topic._id)}
                            className="mt-3 text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Resource
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col items-end gap-4">
                        <select 
                          value={topic.status}
                          onChange={(e) => handleUpdateTopicStatus(topic._id, e.target.value)}
                          className={`p-2 rounded-xl border border-border text-xs font-black uppercase tracking-wider outline-none cursor-pointer ${
                            topic.status === 'completed' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                            topic.status === 'in-progress' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 
                            'bg-muted text-foreground/50'
                          }`}
                        >
                          <option value="todo">Not Started</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>

                        <button 
                          onClick={() => handleDeleteTopic(topic._id)}
                          className="p-2 text-foreground/20 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
                          title="Delete Topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Overview
  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tight mb-2">Subject Courses</h2>
          <p className="text-foreground/50 font-medium">Click on a subject to manage topics and learning materials.</p>
        </div>
      </header>

      <form onSubmit={handleCreateSubject} className="relative group">
        <input
          type="text"
          placeholder="Add a new subject (e.g. Next.js, Algorithms)..."
          className="w-full p-6 pl-14 rounded-2xl bg-muted border-none focus:ring-4 focus:ring-foreground/5 text-lg font-bold outline-none transition-all placeholder:text-foreground/20"
          value={newSubjectName}
          onChange={(e) => setNewSubjectName(e.target.value)}
        />
        <Plus className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-foreground/20 group-focus-within:text-foreground transition-colors" />
        <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 px-4 py-2 bg-foreground text-background rounded-lg text-xs font-black uppercase tracking-widest hover:opacity-90 transition-opacity cursor-pointer">
          Create
        </button>
      </form>

      {loading ? (
        <div className="text-center font-bold opacity-50 py-10">Loading subject courses...</div>
      ) : subjects.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-border rounded-3xl text-foreground/45">
          <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
          <h4 className="text-lg font-bold">No subjects added</h4>
          <p className="text-sm opacity-60">Add a subject above to get started organizing your learning modules.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {subjects.map((subject) => {
              const subTasks = tasks.filter(t => t.subject && (t.subject._id === subject._id || t.subject === subject._id));
              const compCount = subTasks.filter(t => t.status === 'completed').length;
              const totalCount = subTasks.length;
              const progress = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={subject._id} 
                  onClick={() => setSelectedSubject(subject)}
                  className="group p-6 rounded-[2.2rem] border border-border bg-card transition-all hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/5 hover:-translate-y-1 cursor-pointer flex flex-col justify-between h-48"
                >
                  <div className="flex items-start justify-between gap-4 w-full">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-muted rounded-2xl text-foreground group-hover:bg-foreground group-hover:text-background transition-colors">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xl font-bold tracking-tight mb-1">
                          {subject.name}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">{totalCount} Topics</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSubject(subject._id);
                      }}
                      className="p-2 hover:bg-red-500/15 text-foreground/20 hover:text-red-500 rounded-xl transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-end text-xs font-bold text-foreground/50">
                      <span>Course Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-foreground rounded-full transition-all duration-500 group-hover:scale-x-105" 
                        style={{ width: `${progress}%`, transformOrigin: 'left' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default Subjects;
