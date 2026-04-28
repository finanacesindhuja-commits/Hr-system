import React from 'react';
import { ExternalLink } from 'lucide-react';

export function SidebarItem({ active, onClick, icon, label, badge }) {
  return (
    <button 
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
        active 
          ? 'bg-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]' 
          : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <div className={`${active ? 'text-white' : 'text-cyan-500/50'}`}>
        {icon}
      </div>
      {label}
      {badge && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-rose-500 text-white text-[10px] rounded-full flex items-center justify-center animate-pulse">
          {badge}
        </span>
      )}
    </button>
  );
}

export function StatCard({ icon, label, value, isSignal }) {
  return (
    <div className="glass-card flex items-center gap-4 relative overflow-hidden group hover:bg-white/[0.15] transition-all">
      <div className="p-3 bg-white/5 rounded-xl group-hover:bg-cyan-500/10 transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{label}</p>
        <p className="text-2xl font-black font-outfit tracking-tighter">{value}</p>
      </div>
      {isSignal && value > 0 && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
      )}
    </div>
  );
}

export function TabButton({ active, onClick, icon, label }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
        active 
          ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20' 
          : 'text-slate-400 hover:text-white hover:bg-white/5'
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
