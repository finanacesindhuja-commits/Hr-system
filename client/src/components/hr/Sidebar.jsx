import React from 'react';
import { ShieldCheck, Users, Clock, MapPin, Filter, LogOut, Radar } from 'lucide-react';
import { SidebarItem } from './UI';

export default function Sidebar({ tab, setTab, applicantsCount, user, onSignOut, connected }) {
  return (
    <aside className="w-72 bg-[#02000f]/40 backdrop-blur-3xl border-r border-white/5 flex flex-col hidden lg:flex relative z-10">
      <div className="p-6 border-b border-white/5 flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl shadow-[0_4px_15px_rgba(99,102,241,0.35)]">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black font-outfit leading-tight tracking-tight text-white uppercase">HR Control</h1>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-indigo-400">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]'}`} />
            {connected ? 'System Online' : 'System Offline'}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2.5 overflow-y-auto">
        <SidebarItem 
          active={tab === 'staff'} 
          onClick={() => setTab('staff')} 
          icon={<Users className={`w-5 h-5 ${tab === 'staff' ? 'text-white' : 'text-cyan-400'}`} />} 
          label="Staff Registry" 
        />
        <SidebarItem 
          active={tab === 'attendance'} 
          onClick={() => setTab('attendance')} 
          icon={<Clock className={`w-5 h-5 ${tab === 'attendance' ? 'text-white' : 'text-emerald-400'}`} />} 
          label="Attendance Logs" 
        />
        <SidebarItem 
          active={tab === 'leaves'} 
          onClick={() => setTab('leaves')} 
          icon={<MapPin className={`w-5 h-5 ${tab === 'leaves' ? 'text-white' : 'text-amber-400'}`} />} 
          label="Leave Requests" 
        />
        <SidebarItem 
          active={tab === 'applicants'} 
          onClick={() => setTab('applicants')} 
          icon={<Users className={`w-5 h-5 ${tab === 'applicants' ? 'text-white' : 'text-pink-400'}`} />} 
          label="New Candidates"
          badge={applicantsCount > 0 ? applicantsCount : null}
        />
        <SidebarItem 
          active={tab === 'tracking'} 
          onClick={() => setTab('tracking')} 
          icon={<Radar className={`w-5 h-5 ${tab === 'tracking' ? 'text-white' : 'text-rose-500 animate-pulse'}`} />} 
          label="Live Field Tracking" 
        />
        <SidebarItem 
          active={tab === 'payslip'} 
          onClick={() => setTab('payslip')} 
          icon={<Filter className={`w-5 h-5 ${tab === 'payslip' ? 'text-white' : 'text-violet-400'}`} />} 
          label="Salary & Payroll" 
        />
      </nav>

      <div className="p-4 border-t border-white/5 space-y-4 bg-slate-950/20">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-300">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-white truncate leading-tight">{user.name}</p>
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-black">HR Manager</p>
          </div>
        </div>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4.5 py-3 text-rose-400 hover:text-white hover:bg-rose-500/10 rounded-xl transition-all duration-300 font-black text-xs uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
