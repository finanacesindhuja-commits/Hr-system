import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Key } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });

export default function ChangePassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords don't match");
    
    try {
      if (!user.staff_id) return setError('Session expired. Please login again.');
      
      await api.post('/auth/change-password', { 
        staff_id: user.staff_id, 
        new_password: newPassword 
      });
      user.is_password_set = true;
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/hr-dashboard');
    } catch (err) {
      setError('Update failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-card w-full max-w-md border-rose-500/20"
      >
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-rose-500/20 rounded-full">
            <ShieldAlert className="text-rose-500 w-8 h-8" />
          </div>
        </div>
        <h2 className="text-2xl font-bold font-outfit text-center mb-2">Set Secure Password</h2>
        <p className="text-slate-400 text-center mb-8 text-sm">You must change your initial password for security reasons.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
            <input
              type="password"
              placeholder="New Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-cyan-500"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-cyan-500"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          {error && <p className="text-rose-500 text-sm">{error}</p>}
          <button type="submit" className="w-full check-in-btn">Update & Continue</button>
        </form>
      </motion.div>
    </div>
  );
}
