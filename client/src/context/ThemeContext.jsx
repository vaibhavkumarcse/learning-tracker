import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../services/api';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (user && user.darkMode !== undefined) {
      setDarkMode(user.darkMode);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = async () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (user) {
      try {
        const { data } = await api.updateProfile({ darkMode: newDarkMode });
        updateUser(data);
      } catch (err) {
        console.error('Failed to save theme setting', err);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
