import React from 'react';
import { ShieldCheck, Users, Clock, MapPin, Filter, LogOut, Radar } from 'lucide-react';
import { SidebarItem } from './UI';

export default function Sidebar({ tab, setTab, applicantsCount, user, onSignOut, connected }) {
  return (
    <aside className="w-72 bg-slate-900 border-r border-white/10 flex flex-col hidden lg:flex">
      <div className="p-6 border-b border-white/10 flex items-center gap-3">
        <div className="p-2 bg-cyan-500 rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold font-outfit leading-tight">HR Control</h1>
          <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-cyan-400">
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
            {connected ? 'System Online' : 'System Offline'}
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <SidebarItem 
          active={tab === 'staff'} 
          onClick={() => setTab('staff')} 
          icon={<Users className="w-5 h-5" />} 
          label="Staff Registry" 
        />
        <SidebarItem 
          active={tab === 'attendance'} 
          onClick={() => setTab('attendance')} 
          icon={<Clock className="w-5 h-5" />} 
          label="Attendance Logs" 
        />
        <SidebarItem 
          active={tab === 'leaves'} 
          onClick={() => setTab('leaves')} 
          icon={<MapPin className="w-5 h-5" />} 
          label="Leave Requests" 
        />
        <SidebarItem 
          active={tab === 'applicants'} 
          onClick={() => setTab('applicants')} 
          icon={<Users className="w-5 h-5" />} 
          label="New Candidates"
          badge={applicantsCount > 0 ? applicantsCount : null}
        />
        <SidebarItem 
          active={tab === 'tracking'} 
          onClick={() => setTab('tracking')} 
          icon={<Radar className="w-5 h-5 text-cyan-400" />} 
          label="Live Field Tracking" 
        />
        <SidebarItem 
          active={tab === 'payslip'} 
          onClick={() => setTab('payslip')} 
          icon={<Filter className="w-5 h-5" />} 
          label="Salary & Payroll" 
        />
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
            {user.name?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{user.name}</p>
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">HR Manager</p>
          </div>
        </div>
        <button 
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors font-bold text-sm"
        >
          <LogOut className="w-5 h-5" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
