import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, CheckSquare, Zap, Clock } from 'lucide-react';

const Landing = ({ setAuthView }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-foreground selection:text-background overflow-x-hidden">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl w-full mx-auto">
        <div className="text-xl font-black tracking-tighter">LEARN<span className="opacity-40">TRACK</span></div>
        <div className="flex gap-4">
          <button onClick={() => setAuthView('login')} className="px-5 py-2.5 text-sm font-bold hover:bg-muted rounded-xl transition-colors">Log in</button>
          <button onClick={() => setAuthView('signup')} className="px-5 py-2.5 text-sm font-bold bg-foreground text-background rounded-xl hover:opacity-90 transition-opacity shadow-xl shadow-foreground/10">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-5xl mx-auto w-full py-20">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center max-w-4xl"
        >
          <motion.div variants={item} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted border border-border text-xs font-bold uppercase tracking-widest mb-8">
            <span className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            The Ultimate Learning Companion
          </motion.div>
          
          <motion.h1 variants={item} className="text-6xl md:text-8xl font-black tracking-tighter leading-[1.1] mb-8">
            Master your mind. <br className="hidden md:block"/>
            <span className="text-foreground/40">Track your growth.</span>
          </motion.h1>
          
          <motion.p variants={item} className="text-lg md:text-xl font-medium text-foreground/60 mb-12 max-w-2xl mx-auto leading-relaxed">
            A professional, minimalist operating system for your learning journey. Deep work timers, intelligent analytics, and task tracking—all in one place.
          </motion.p>
          
          <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => setAuthView('signup')} className="w-full sm:w-auto px-8 py-4 bg-foreground text-background font-bold rounded-2xl hover:scale-105 transition-transform flex items-center justify-center gap-2 text-lg shadow-2xl shadow-foreground/20">
              Start Tracking Now <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={() => setAuthView('login')} className="w-full sm:w-auto px-8 py-4 bg-muted font-bold rounded-2xl hover:bg-border transition-colors text-lg">
              I already have an account
            </button>
          </motion.div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-32 w-full"
        >
          {[
            { icon: Zap, title: "Deep Work Sessions", desc: "Built-in Pomodoro timers to maximize your focus and automatically log your dedicated learning hours." },
            { icon: BarChart3, title: "Advanced Analytics", desc: "Visualize your progress with GitHub-style heatmaps, area charts, and streak tracking." },
            { icon: CheckSquare, title: "Smart Task Backlog", desc: "Organize your study backlog, prioritize assignments, and check them off as you conquer them." },
            { icon: Clock, title: "Time Distribution", desc: "Understand exactly where your time goes across different subjects with beautiful distribution charts." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-[2rem] bg-card border border-border flex gap-6 group hover:border-foreground/20 transition-colors">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-foreground group-hover:text-background transition-all">
                <feature.icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-black mb-2">{feature.title}</h3>
                <p className="text-foreground/60 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="p-8 text-center text-sm font-bold text-foreground/40 border-t border-border mt-20">
        © {new Date().getFullYear()} LearnTrack. Minimalist learning tools.
      </footer>
    </div>
  );
};

export default Landing;
