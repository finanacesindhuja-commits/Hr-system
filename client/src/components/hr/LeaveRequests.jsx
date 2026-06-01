import React, { useState } from 'react';
import { Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function LeaveRequests({ leaves, onUpdate, selectedMonth, onMonthChange }) {
  const [filter, setFilter] = useState('Pending');

  const filtered = leaves.filter(l =>
    filter === 'All' ? true : l.status === filter
  );

  const counts = {
    Pending: leaves.filter(l => l.status === 'Pending').length,
    Approved: leaves.filter(l => l.status === 'Approved').length,
    Rejected: leaves.filter(l => l.status === 'Rejected').length,
  };

  const statusColor = (s) => {
    if (s === 'Pending') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (s === 'Approved') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
  };

  const borderColor = (s) => {
    if (s === 'Pending') return 'border-amber-500';
    if (s === 'Approved') return 'border-emerald-500';
    return 'border-rose-500';
  };

  return (
    <div className="space-y-6">

      {/* Header: Month Picker + Stats */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-cyan-400" />
          <input
            type="month"
            value={selectedMonth}
            onChange={e => onMonthChange(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="flex gap-3 text-xs font-bold uppercase tracking-widest">
          <span className="text-amber-400">⏳ {counts.Pending} Pending</span>
          <span className="text-emerald-400">✓ {counts.Approved} Approved</span>
          <span className="text-rose-400">✗ {counts.Rejected} Rejected</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${
              filter === f
                ? 'bg-cyan-500 text-white border-cyan-500'
                : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Leave Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(l => (
          <div key={l.id} className={`glass-card border-l-4 ${borderColor(l.status)} shadow-xl`}>
            {/* Staff Info */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center font-bold text-cyan-400 text-sm">
                  {l.staff?.name?.[0] || '?'}
                </div>
                <div>
                  <h4 className="font-bold text-sm">{l.staff?.name || 'Unknown'}</h4>
                  <p className="text-[10px] text-slate-500 font-mono">{l.staff_id}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-[10px] font-black uppercase border ${statusColor(l.status)}`}>
                {l.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-500">From</span>
                <span className="font-bold text-white">{l.start_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">To</span>
                <span className="font-bold text-white">{l.end_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Type</span>
                <span className="font-bold text-cyan-400 uppercase">{l.leave_type || 'Leave'}</span>
              </div>
              {l.reason && (
                <p className="italic text-slate-400 border-t border-white/5 pt-2">"{l.reason}"</p>
              )}
            </div>

            {/* Action Buttons - Only for Pending */}
            {l.status === 'Pending' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onUpdate(l.id, 'Approved')}
                  className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center gap-1 transition-colors"
                >
                  <CheckCircle className="w-3 h-3" /> Approve
                </button>
                <button
                  onClick={() => onUpdate(l.id, 'Rejected')}
                  className="py-2 bg-rose-600/20 hover:bg-rose-600 rounded-lg text-xs font-black uppercase tracking-widest border border-rose-500/30 flex items-center justify-center gap-1 transition-all"
                >
                  <XCircle className="w-3 h-3" /> Reject
                </button>
              </div>
            )}

            {/* Already actioned label */}
            {l.status !== 'Pending' && (
              <div className={`text-center text-[10px] font-black uppercase tracking-widest py-2 rounded-lg ${
                l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {l.status === 'Approved' ? '✓ Leave Approved' : '✗ Leave Rejected'}
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full py-24 text-center text-slate-500 glass-card">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No {filter === 'All' ? '' : filter.toLowerCase()} leave requests this month.</p>
          </div>
        )}
      </div>
    </div>
  );
}
