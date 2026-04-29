import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import Progress from './components/Progress';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('landing');
  const { user, loading } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskBoard />;
      case 'calendar': return <Calendar />;
      case 'pomodoro': return <Pomodoro />;
      case 'progress': return <Progress />;
      case 'subjects':
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)]">
            <h2 className="text-3xl font-bold mb-4">Subjects</h2>
            <p className="text-foreground/60">Manage your learning subjects here.</p>
            <div className="mt-8 grid grid-cols-2 gap-4 w-full max-w-2xl">
              {['Mathematics', 'Computer Science', 'Physics', 'History'].map(sub => (
                <div key={sub} className="p-6 border border-border rounded-2xl hover:border-foreground transition-all cursor-pointer">
                  <div className="font-bold mb-2">{sub}</div>
                  <div className="text-sm text-foreground/60">12 Tasks • 4.5h this week</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center">
            <h2 className="text-3xl font-bold mb-4">Advanced Analytics</h2>
            <p className="text-foreground/60 max-w-md">Detailed charts, heatmaps, and streak tracking coming soon in the pro version.</p>
            <div className="mt-10 p-10 border border-border rounded-3xl bg-muted/20">
               <div className="text-6xl mb-4">📈</div>
               <div className="font-bold text-lg">Work in Progress</div>
            </div>
          </div>
        );
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center font-bold">Loading...</div>;
  }

  if (!user) {
    if (authView === 'login') return <Login setView={setAuthView} />;
    if (authView === 'signup') return <Signup setView={setAuthView} />;
    return <Landing setAuthView={setAuthView} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 ml-72 min-h-screen p-12 transition-colors duration-500 bg-background">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
