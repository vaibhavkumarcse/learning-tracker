import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Timer, Zap, Sun, Moon, LogOut, Target, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ activeTab, setActiveTab, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'pomodoro', label: 'Timer', icon: Timer },
    { id: 'progress', label: 'Progress', icon: BarChart3 },
  ];

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`w-72 h-screen border-r border-border bg-background flex flex-col p-6 md:p-8 fixed left-0 top-0 z-50 shadow-sm transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
    >
      <div className="flex items-center justify-between mb-8 md:mb-12 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-foreground text-background rounded-xl flex items-center justify-center shadow-lg shadow-foreground/10">
            <Zap className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">TRACKER.</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="md:hidden p-2 text-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-300 relative group ${
              activeTab === item.id 
                ? 'bg-foreground text-background shadow-xl shadow-foreground/10' 
                : 'text-foreground/50 hover:bg-muted hover:text-foreground'
            }`}
          >
            {activeTab === item.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-foreground rounded-xl -z-10"
              />
            )}
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-background' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-semibold text-sm">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="pt-8 border-t border-border mt-auto space-y-4">
        <button 
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-muted hover:bg-border transition-colors group"
        >
          <div className="flex items-center gap-3 text-sm font-semibold">
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{darkMode ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-10 h-5 rounded-full transition-colors relative ${darkMode ? 'bg-foreground' : 'bg-border'}`}>
            <div className={`absolute top-1 w-3 h-3 rounded-full bg-background transition-all ${darkMode ? 'left-6' : 'left-1'}`} />
          </div>
        </button>

        <div 
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-muted/70 transition-all ${
            activeTab === 'profile' ? 'bg-muted border border-border' : ''
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg overflow-hidden border border-border">
            {user?.avatar?.startsWith('http') ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.username?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-foreground/40 uppercase tracking-widest leading-none mb-1">User</div>
            <div className="text-sm font-bold truncate max-w-[100px]">{user?.username}</div>
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); logout(); }} 
            className="p-2 hover:bg-muted rounded-xl transition-colors text-foreground/40 hover:text-red-500"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;
