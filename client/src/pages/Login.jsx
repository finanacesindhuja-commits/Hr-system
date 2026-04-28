import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Lock, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });

export default function Login() {
  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/auth/login', { staff_id: staffId, password });
      if (data.success) {
        if (data.user.role?.toLowerCase() !== 'hr') {
          setError(`Access Denied: Restricted to HR Administration only.`);
          return;
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        if (!data.user.is_password_set) {
          navigate('/change-password');
        } else {
          navigate('/hr-dashboard');
        }
      }
    } catch (err) {
      if (!err.response) {
        setError('Connection failed. Database offline.');
      } else {
        setError('Invalid credentials. Check ID and Password.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#020617] relative overflow-hidden">
      {/* Background Aesthetics */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl shadow-cyan-500/20"
          >
            <ShieldCheck className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-black font-outfit text-white tracking-tighter mb-2 uppercase">HR PORTAL</h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-[0.2em]">Enterprise Security Access</p>
        </div>

        <div className="glass-card bg-slate-900/40 border-white/5 backdrop-blur-2xl shadow-2xl p-8 rounded-[2rem]">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Administration ID</label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="STF-001"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold placeholder:text-slate-700"
                  value={staffId}
                  onChange={(e) => setStaffId(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Access Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/20 transition-all font-bold placeholder:text-slate-700"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-rose-500 text-xs font-bold justify-center bg-rose-500/10 py-3 rounded-xl border border-rose-500/20"
                >
                  <AlertCircle className="w-4 h-4" /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full relative group overflow-hidden bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              <span className="flex items-center justify-center gap-2">
                {isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard'}
                {!isSubmitting && <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />}
              </span>
            </button>
          </form>

          <p className="text-center mt-8 text-[10px] text-slate-600 font-bold uppercase tracking-widest">
            Cloud Security V2.4 © 2026
          </p>
        </div>
      </motion.div>
    </div>
  );
}
