import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { useGoogleLogin } from '@react-oauth/google';
import * as api from '../services/api';

const Login = ({ setView }) => {
  const [step, setStep] = useState('login'); // 'login', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [demoCode, setDemoCode] = useState('');
  const { login, googleLogin } = useAuth();

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      await googleLogin(tokenResponse.access_token);
    } catch (err) {
      setError(err.response?.data?.message || 'Google Login Failed');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed')
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await login(email, password);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const res = await api.forgotPassword(email);
      setInfo('Verification code sent successfully.');
      if (res.data.otp) {
        setDemoCode(res.data.otp);
      }
      setStep('reset');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate reset code');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      await api.resetPassword(email, otp, newPassword);
      setInfo('Password reset successful! You can now log in.');
      setStep('login');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-background"
    >
      <div className="w-full max-w-md p-8 bg-card rounded-2xl border border-border shadow-xl">
        
        {step === 'login' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight animate-pulse bg-gradient-to-r from-foreground to-foreground/75 bg-clip-text text-transparent">Welcome Back</h2>
              <p className="text-foreground/60 mt-2 font-medium">Log in to continue your learning journey.</p>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl font-bold border border-red-500/20">{error}</div>}
            {info && <div className="p-3 mb-4 text-sm text-green-500 bg-green-500/10 rounded-xl font-bold border border-green-500/20">{info}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all font-medium"
                  required 
                />
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold">Password</label>
                  <button 
                    type="button" 
                    onClick={() => { setStep('forgot'); setError(''); setInfo(''); }}
                    className="text-xs font-bold text-foreground/40 hover:text-foreground hover:underline transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all font-medium"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full p-3 mt-4 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-all cursor-pointer hover:shadow-lg active:scale-[0.98]"
              >
                Login
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between">
              <hr className="w-full border-border" />
              <span className="p-2 text-xs font-bold text-foreground/40 uppercase tracking-widest bg-card">Or</span>
              <hr className="w-full border-border" />
            </div>

            <button 
              onClick={() => loginWithGoogle()}
              className="w-full p-3 mt-4 bg-background text-foreground border border-border font-bold rounded-xl hover:bg-muted transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            
            <p className="text-center mt-6 text-sm text-foreground/60 font-medium">
              Don't have an account? <button onClick={() => setView('signup')} className="font-bold text-foreground hover:underline cursor-pointer">Sign up</button>
            </p>
          </>
        )}

        {step === 'forgot' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight">Recover Password</h2>
              <p className="text-foreground/60 mt-2 font-medium">Enter your email and we'll generate a verification OTP code.</p>
            </div>
            
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl font-bold border border-red-500/20">{error}</div>}
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all font-medium"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full p-3 mt-4 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-all cursor-pointer active:scale-[0.98]"
              >
                Send Reset Code
              </button>
            </form>
            
            <p className="text-center mt-6 text-sm text-foreground/60 font-medium">
              Remember password? <button onClick={() => { setStep('login'); setError(''); }} className="font-bold text-foreground hover:underline cursor-pointer">Back to Login</button>
            </p>
          </>
        )}

        {step === 'reset' && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black tracking-tight">Enter Reset OTP</h2>
              <p className="text-foreground/60 mt-2 font-medium">A 6-digit OTP code has been generated.</p>
            </div>

            {demoCode && (
              <div className="p-4 mb-4 text-sm text-blue-600 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <span className="font-black uppercase tracking-widest text-[10px] block opacity-60 mb-1">Demo Recovery Banner</span>
                <p className="font-medium">Verification Code: <strong className="font-black tracking-widest text-lg ml-1">{demoCode}</strong></p>
              </div>
            )}
            
            {error && <div className="p-3 mb-4 text-sm text-red-500 bg-red-500/10 rounded-xl font-bold border border-red-500/20">{error}</div>}
            
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">OTP Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all font-bold tracking-widest text-center text-lg"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">New Password</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-muted focus:ring-2 focus:ring-foreground outline-none transition-all font-medium"
                  required 
                />
              </div>
              <button 
                type="submit" 
                className="w-full p-3 mt-4 bg-foreground text-background font-black rounded-xl hover:opacity-90 transition-all cursor-pointer active:scale-[0.98]"
              >
                Reset Password & Log In
              </button>
            </form>
            
            <p className="text-center mt-6 text-sm text-foreground/60 font-medium">
              Want to cancel? <button onClick={() => { setStep('login'); setError(''); setInfo(''); setDemoCode(''); }} className="font-bold text-foreground hover:underline cursor-pointer">Back to Login</button>
            </p>
          </>
        )}

      </div>
    </motion.div>
  );
};

export default Login;
