import React from 'react';
import { Search } from 'lucide-react';

export default function ApplicantsListing({ applicants, searchTerm, setSearchTerm, onSelect, onUpdate }) {
  return (
    <div className="space-y-6">
      <div className="glass-card p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search applicants..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
          {applicants.length} Pending Approvals
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {applicants.filter(a => a.name?.toLowerCase().includes(searchTerm.toLowerCase())).map(a => (
          <div key={a.id} className="glass-card border-l-4 border-cyan-500 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400">
                  {a.name?.[0]}
                </div>
                <div>
                  <h4 className="font-bold">{a.name}</h4>
                  <p className="text-[10px] text-slate-500">{a.role} • {a.area}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 mb-6 text-xs text-slate-300">
                <p className="flex justify-between"><span>Mobile:</span> <span className="text-white font-bold font-mono">{a.mobile}</span></p>
                <p className="flex justify-between"><span>Exp:</span> <span className="text-emerald-400 font-bold uppercase">{a.experience}</span></p>
            </div>
            <div className="grid grid-cols-1 gap-2 mt-4">
              <button onClick={() => onSelect(a)} className="py-2.5 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xs font-bold transition-colors uppercase tracking-widest text-white">View Full Profile</button>
            </div>
          </div>
        ))}
        {applicants.length === 0 && <div className="col-span-full py-24 text-center text-slate-500 glass-card">No pending candidates to review.</div>}
      </div>
    </div>
  );
}
