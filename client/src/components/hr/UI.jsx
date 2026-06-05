import React from 'react';
import { ExternalLink } from 'lucide-react';

export function SidebarItem({ active, onClick, icon, label, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-full flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl text-sm font-bold transition-all duration-300 group ${
        active 
          ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_4px_20px_rgba(99,102,241,0.25)] border border-indigo-400/20' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <div className={`transition-transform duration-300 group-hover:scale-110 ${active ? 'brightness-125' : ''}`}>
        {icon}
      </div>
      <span>{label}</span>
      {badge && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center font-black animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}

export function StatCard({ icon, label, value, isSignal }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/40 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-2xl hover:shadow-indigo-500/5 group">
      {/* Accent glow on hover */}
      <div className="absolute -inset-px bg-gradient-to-r from-transparent via-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
      
      <div className="flex items-center gap-4 relative z-10">
        <div className="p-4 rounded-xl bg-white/5 group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
          {icon}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black font-outfit tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">{value}</p>
        </div>
      </div>
      {isSignal && value > 0 && (
        <div className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
      )}
    </div>
  );
}

export function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4.5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-95 ${
        active 
          ? 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-indigo-400/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
      }`}
    >
      {icon} {label}
    </button>
  );
}

export function DetailSection({ title, children }) {
  return (
    <div className="space-y-3">
       <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 border-b border-white/5 pb-2">{title}</h3>
       <div className="space-y-3">{children}</div>
    </div>
  );
}

export function DetailRow({ label, value, isMono, highlight }) {
  return (
    <div className="flex flex-col">
      <span className="text-[9px] text-slate-500 uppercase font-black">{label}</span>
      <span className={`text-sm font-bold ${isMono ? 'font-mono' : ''} ${highlight ? 'text-cyan-400' : 'text-slate-200'}`}>{value}</span>
    </div>
  );
}

export function DocLink({ label, url }) {
  return (
    <a 
      href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors group"
    >
      <span className="text-[11px] font-bold">{label}</span>
      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
    </a>
  );
}
