import React from 'react';

export default function LeaveRequests({ leaves, onUpdate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leaves.map(l => (
        <div key={l.id} className="glass-card border-l-4 border-amber-500 shadow-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h4 className="font-bold">{l.staff?.name}</h4>
              <p className="text-[10px] text-slate-500">{l.staff_id}</p>
            </div>
            <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
              l.status === 'Pending' ? 'bg-amber-500/20 text-amber-500' :
              l.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'
            }`}>
              {l.status}
            </span>
          </div>
          <div className="space-y-2 mb-4 text-xs">
            <p><span className="text-slate-500">Duration:</span> <span className="font-bold">{l.start_date} to {l.end_date}</span></p>
            <p className="italic text-slate-400">"{l.reason}"</p>
          </div>
          {l.status === 'Pending' && (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onUpdate(l.id, 'Approved')} className="py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-xs font-bold">Approve</button>
              <button onClick={() => onUpdate(l.id, 'Rejected')} className="py-2 bg-rose-600 hover:bg-rose-500 rounded-lg text-xs font-bold">Reject</button>
            </div>
          )}
        </div>
      ))}
      {leaves.length === 0 && <div className="col-span-full py-24 text-center text-slate-500 glass-card">No leave requests found for review.</div>}
    </div>
  );
}
