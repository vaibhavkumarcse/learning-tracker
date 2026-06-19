import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { motion } from 'framer-motion';
import { User, Mail, Shield, CheckCircle, Calendar, Award, Zap, Clock, KeyRound, Sparkles } from 'lucide-react';

const presetAvatars = [
  { id: 'coder', emoji: '💻', name: 'Software Engineer', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=coder' },
  { id: 'hacker', emoji: '🥷', name: 'Cyber Ninja', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=hacker' },
  { id: 'designer', emoji: '🎨', name: 'Pixel Artist', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=designer' },
  { id: 'writer', emoji: '✍️', name: 'Documentarian', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=writer' },
  { id: 'brain', emoji: '🧠', name: 'Deep Thinker', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=brain' },
  { id: 'rocket', emoji: '🚀', name: 'Code Launcher', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=rocket' }
];

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // Stats states
  const [stats, setStats] = useState({ activities: [], streak: null });
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Status feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [statsRes, goalsRes] = await Promise.all([
        api.getStats(),
        api.getGoals()
      ]);
      setStats(statsRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Failed to fetch profile stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    let selectedAvatar = avatar;
    if (customAvatarUrl.trim()) {
      selectedAvatar = customAvatarUrl;
    }

    try {
      const { data } = await api.updateProfile({
        username,
        email,
        avatar: selectedAvatar
      });
      
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setCustomAvatarUrl('');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword) return;

    try {
      await api.updateProfile({
        currentPassword,
        newPassword
      });

      setPasswordSuccess('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      console.error('Failed to change password:', err);
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  // Stats derivations
  const totalStudyMinutes = stats.activities.reduce((acc, a) => acc + a.duration, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const completedGoalsCount = goals.filter(g => g.status === 'completed').length;
  const currentStreak = stats.streak?.currentStreak || 0;
  const longestStreak = stats.streak?.longestStreak || 0;

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-12">
      <header>
        <h2 className="text-4xl font-black tracking-tight mb-2">User Profile</h2>
        <p className="text-foreground/50 font-medium">Manage your personal settings and track learning stats.</p>
      </header>

      {/* Profile Card & Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Card: Summary & Avatar */}
        <div className="lg:col-span-1 p-8 rounded-[2.5rem] border border-border bg-card shadow-lg flex flex-col items-center justify-between space-y-6 text-center">
          <div className="space-y-4">
            <div className="w-28 h-28 rounded-full bg-muted border-2 border-border overflow-hidden flex items-center justify-center text-4xl shadow-md">
              {avatar.startsWith('http') ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                user?.username?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black">{user?.username}</h3>
              <p className="text-xs text-foreground/40 font-bold uppercase tracking-wider mt-1">{user?.email}</p>
            </div>
          </div>

          <div className="w-full border-t border-border pt-6 space-y-4 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Joined
              </span>
              <span className="font-black">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : 'Recent'}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-foreground/40 uppercase tracking-widest flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Rank
              </span>
              <span className="font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {totalStudyHours >= 50 ? 'Elite Scholar' : totalStudyHours >= 10 ? 'Adept Student' : 'Novice Learner'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Stats Dashboard */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          <div className="p-6 rounded-[2rem] border border-border bg-background hover:bg-muted transition-colors flex flex-col justify-between">
            <Clock className="w-6 h-6 text-indigo-500 mb-6" />
            <div>
              <div className="text-3xl font-black">{totalStudyHours}h</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Study Deep Work</div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-border bg-background hover:bg-muted transition-colors flex flex-col justify-between">
            <Zap className="w-6 h-6 text-red-500 mb-6" />
            <div>
              <div className="text-3xl font-black">{currentStreak}d</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Active Streak</div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-border bg-background hover:bg-muted transition-colors flex flex-col justify-between">
            <CheckCircle className="w-6 h-6 text-green-500 mb-6" />
            <div>
              <div className="text-3xl font-black">{completedGoalsCount}</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Goals Completed</div>
            </div>
          </div>

          <div className="p-6 rounded-[2rem] border border-border bg-background hover:bg-muted transition-colors flex flex-col justify-between">
            <Zap className="w-6 h-6 text-amber-500 mb-6" />
            <div>
              <div className="text-3xl font-black">{longestStreak}d</div>
              <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">Longest Streak</div>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Settings Form */}
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Details
          </h3>
          {error && <div className="p-3 text-xs text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
          {success && <div className="p-3 text-xs text-green-500 bg-green-500/10 rounded-lg">{success}</div>}

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Username
              </label>
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email Address
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold text-xs"
                required
              />
            </div>

            {/* Avatar Preset List */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Select Avatar Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {presetAvatars.map((av) => (
                  <button 
                    key={av.id}
                    type="button"
                    onClick={() => { setAvatar(av.url); setCustomAvatarUrl(''); }}
                    className={`p-2 rounded-xl bg-muted border text-center transition-all cursor-pointer ${
                      avatar === av.url ? 'border-foreground bg-foreground/5 scale-110 shadow-md' : 'border-border hover:border-foreground/30'
                    }`}
                    title={av.name}
                  >
                    <span className="text-xl block">{av.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 block">Or Custom Avatar URL</label>
              <input 
                type="url" 
                placeholder="https://example.com/avatar.jpg" 
                value={customAvatarUrl} 
                onChange={(e) => setCustomAvatarUrl(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none text-xs"
              />
            </div>

            <button 
              type="submit" 
              className="py-3 px-6 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer shadow-md"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="p-8 rounded-3xl border border-border bg-card shadow-sm space-y-6">
          <h3 className="text-xl font-black flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Settings
          </h3>
          {passwordError && <div className="p-3 text-xs text-red-500 bg-red-500/10 rounded-lg">{passwordError}</div>}
          {passwordSuccess && <div className="p-3 text-xs text-green-500 bg-green-500/10 rounded-lg">{passwordSuccess}</div>}

          <form onSubmit={handleChangePassword} className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> Current Password
              </label>
              <input 
                type="password" 
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                required={newPassword.length > 0}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-wider text-foreground/40 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5" /> New Password
              </label>
              <input 
                type="password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none font-bold"
                required={currentPassword.length > 0}
              />
            </div>

            <button 
              type="submit" 
              className="py-3 px-6 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-opacity text-sm cursor-pointer shadow-md"
            >
              Change Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;
