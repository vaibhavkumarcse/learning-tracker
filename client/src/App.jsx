import { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import TaskBoard from './components/TaskBoard';
import Calendar from './components/Calendar';
import Pomodoro from './components/Pomodoro';
import Progress from './components/Progress';
import Goals from './components/Goals';
import Profile from './components/Profile';
import { useAuth } from './context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Zap } from 'lucide-react';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import GlobalTimer from './components/GlobalTimer';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'tasks': return <TaskBoard />;
      case 'calendar': return <Calendar />;
      case 'goals': return <Goals />;
      case 'pomodoro': return <Pomodoro />;
      case 'progress': return <Progress />;
      case 'profile': return <Profile />;
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
    <div className="min-h-screen bg-background text-foreground flex relative">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsMobileMenuOpen(false);
        }} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />
      
      <main className="flex-1 md:ml-72 min-h-screen p-4 pt-24 md:p-12 transition-all duration-500 bg-background flex flex-col w-full">
        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-30 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-foreground text-background rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">TRACKER.</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 rounded-lg bg-muted text-foreground hover:bg-border transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-6xl mx-auto w-full">
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
      <GlobalTimer activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default App;
