import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';

const Signup = ({ setView }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, googleLogin } = useAuth();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      await googleLogin(tokenResponse.access_token);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Sign Up Failed');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Sign Up Failed')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(username, email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <div className="w-full max-w-md p-8 bg-card rounded-2xl border border-border shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black tracking-tight">Create Account</h2>
          <p className="text-foreground/60 mt-2">Join us and start tracking your learning.</p>
        </div>
        
        {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-lg">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all"
              required 
            />
          </div>
          <button 
            type="submit" 
            className="w-full p-3 mt-4 bg-foreground text-background font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 flex items-center justify-between">
          <hr className="w-full border-border" />
          <span className="p-2 text-xs font-bold text-foreground/40 uppercase tracking-widest bg-card">Or</span>
          <hr className="w-full border-border" />
        </div>

        <button 
          onClick={() => loginWithGoogle()}
          className="w-full p-3 mt-4 bg-background text-foreground border border-border font-bold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign up with Google
        </button>
        
        <p className="text-center mt-6 text-sm text-foreground/60">
          Already have an account? <button onClick={() => setView('login')} className="font-bold text-foreground hover:underline">Log in</button>
        </p>
      </div>
    </motion.div>
  );
};

export default Signup;
