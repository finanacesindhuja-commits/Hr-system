import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    error: { icon: <AlertCircle className="w-5 h-5 text-rose-400" />, bg: 'bg-rose-500/10', border: 'border-rose-500/20' }
  };

  const { icon, bg, border } = config[type] || config.success;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, x: '-50%' }}
      animate={{ opacity: 1, y: 0, x: '-50%' }}
      exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
      className={`fixed bottom-8 left-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl border ${border} ${bg} backdrop-blur-xl shadow-2xl min-w-[320px]`}
    >
      {icon}
      <p className="flex-1 text-sm font-bold text-white tracking-tight">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-lg transition-colors">
        <X className="w-4 h-4 text-slate-500" />
      </button>
    </motion.div>
  );
}
