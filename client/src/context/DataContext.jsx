import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const DataContext = createContext();

export const useData = () => useContext(DataContext);

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({ activities: [], streak: null });
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [tasksRes, goalsRes, statsRes] = await Promise.all([
        api.getTasks(),
        api.getGoals(),
        api.getStats()
      ]);
      setTasks(tasksRes.data || []);
      setGoals(goalsRes.data || []);
      setStats(statsRes.data || { activities: [], streak: null });
    } catch (err) {
      console.error('Failed to load global data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  // Expose methods to update global state immediately
  const updateTaskLocally = (updatedTask) => {
    setTasks(prev => prev.map(t => t._id === updatedTask._id ? updatedTask : t));
  };
  
  const addTaskLocally = (newTask) => {
    setTasks(prev => [...prev, newTask]);
  };
  
  const removeTaskLocally = (id) => {
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const refreshStats = async () => {
    try {
      const { data } = await api.getStats();
      setStats(data || { activities: [], streak: null });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <DataContext.Provider value={{
      tasks, setTasks,
      goals, setGoals,
      stats, setStats,
      loading,
      fetchAllData,
      updateTaskLocally,
      addTaskLocally,
      removeTaskLocally,
      refreshStats
    }}>
      {children}
    </DataContext.Provider>
  );
};
