import React, { useState } from 'react';
import { Clock, RefreshCw, Search, Download, Calendar } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportUtils';

export default function AttendanceTable({ attendance, loading, onRefresh }) {
  const [localSearch, setLocalSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const filtered = attendance.filter(row => {
    const matchesSearch = row.staff?.name?.toLowerCase().includes(localSearch.toLowerCase()) || 
                          row.staff_id?.toLowerCase().includes(localSearch.toLowerCase());
    const matchesDate = !dateFilter || row.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const handleExport = () => {
    const exportData = filtered.map(r => ({
      'Staff Name': r.staff?.name,
      'Staff ID': r.staff_id,
      'Date': r.date,
      'Check In': r.check_in,
      'Check Out': r.check_out,
      'Status': r.status
    }));
    exportToCSV(exportData, 'Attendance_Report');
  };

  return (
    <div className="glass-card overflow-hidden !p-0 shadow-2xl border border-white/5">
      {/* Header & Filters */}
      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 gap-4">
        <h3 className="font-black flex items-center gap-2 font-outfit uppercase tracking-tighter">
          <Clock className="w-5 h-5 text-cyan-400" /> Staff Attendance feed
        </h3>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search Name / ID..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-cyan-500 outline-none"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input 
              type="date" 
              className="bg-slate-900/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:border-cyan-500 outline-none w-40"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button 
            onClick={onRefresh}
            className="p-2 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto text-sm">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-black">
            <tr>
              <th className="p-4">Name / ID</th>
              <th className="p-4">Log Date</th>
              <th className="p-4">Check In</th>
              <th className="p-4">Check Out</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((row) => (
              <tr key={row.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <p className="font-black group-hover:text-cyan-400 transition-colors uppercase">{row.staff?.name || 'Unknown'}</p>
                  <p className="text-[10px] text-slate-500 font-bold">{row.staff_id}</p>
                </td>
                <td className="p-4 font-bold text-slate-300">{row.date}</td>
                <td className="p-4 text-cyan-400 font-mono italic">{row.check_in || '--:--'}</td>
                <td className="p-4 text-rose-400 font-mono italic">{row.check_out || '--:--'}</td>
                <td className="p-4 text-right">
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-lg uppercase ${
                    row.status === 'Present' 
                      ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5'
                  }`}>
                    {row.status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="p-12 text-center text-slate-500 font-black italic uppercase tracking-widest text-xs opacity-50">No matching records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
