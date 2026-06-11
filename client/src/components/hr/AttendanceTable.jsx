import React, { useState } from 'react';
import { Clock, RefreshCw, Search, Download, Calendar, LogIn, LogOut, Timer } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportUtils';

// Format ISO timestamp → IST 12-hour time (e.g. "09:15 AM")
function formatTime(isoString) {
  if (!isoString) return null;
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) {
      // Maybe it's already HH:MM format
      if (/^\d{2}:\d{2}/.test(isoString)) {
        const [h, m] = isoString.split(':').map(Number);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const hour12 = h % 12 || 12;
        return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
      }
      return isoString;
    }
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata'
    }).toUpperCase();
  } catch {
    return isoString;
  }
}

// Calculate hours worked between check_in and check_out
function calcDuration(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  try {
    const inTime = new Date(checkIn);
    const outTime = new Date(checkOut);
    if (isNaN(inTime) || isNaN(outTime)) return null;
    const diffMs = outTime - inTime;
    if (diffMs <= 0) return null;
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${String(mins).padStart(2, '0')}m`;
  } catch {
    return null;
  }
}

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
      'Check In': formatTime(r.check_in) || '--',
      'Check Out': formatTime(r.check_out) || '--',
      'Duration': calcDuration(r.check_in, r.check_out) || '--',
      'Status': r.status
    }));
    exportToCSV(exportData, 'Attendance_Report');
  };

  return (
    <div className="glass-card overflow-hidden !p-0 shadow-2xl border border-white/5">
      {/* Header & Filters */}
      <div className="p-4 border-b border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center bg-white/5 gap-4">
        <h3 className="font-black flex items-center gap-2 font-outfit uppercase tracking-tighter">
          <Clock className="w-5 h-5 text-cyan-400" /> Staff Attendance Feed
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
              <th className="p-4">
                <span className="flex items-center gap-1.5">
                  <LogIn className="w-3 h-3 text-emerald-400" /> Check In
                </span>
              </th>
              <th className="p-4">
                <span className="flex items-center gap-1.5">
                  <LogOut className="w-3 h-3 text-rose-400" /> Check Out
                </span>
              </th>
              <th className="p-4">
                <span className="flex items-center gap-1.5">
                  <Timer className="w-3 h-3 text-amber-400" /> Duration
                </span>
              </th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filtered.map((row) => {
              const inTime = formatTime(row.check_in);
              const outTime = formatTime(row.check_out);
              const duration = calcDuration(row.check_in, row.check_out);
              const isPresent = row.status === 'Present';

              return (
                <tr key={row.id} className="hover:bg-white/[0.03] transition-colors group">
                  {/* Name / ID */}
                  <td className="p-4">
                    <p className="font-black group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{row.staff?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-0.5">{row.staff_id}</p>
                  </td>

                  {/* Date */}
                  <td className="p-4">
                    <span className="font-bold text-slate-300 text-xs">{row.date}</span>
                  </td>

                  {/* Check In */}
                  <td className="p-4">
                    {inTime ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 flex-shrink-0" />
                        <span className="font-mono font-bold text-emerald-400 text-sm tracking-wide">{inTime}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-mono text-xs italic">-- Not In --</span>
                    )}
                  </td>

                  {/* Check Out */}
                  <td className="p-4">
                    {outTime ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400 shadow-lg shadow-rose-500/50 flex-shrink-0" />
                        <span className="font-mono font-bold text-rose-400 text-sm tracking-wide">{outTime}</span>
                      </div>
                    ) : isPresent ? (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse flex-shrink-0" />
                        <span className="text-amber-400 font-bold text-[10px] uppercase tracking-widest">In Field</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 font-mono text-xs italic">-- Not Out --</span>
                    )}
                  </td>

                  {/* Duration */}
                  <td className="p-4">
                    {duration ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[11px] font-bold font-mono">
                        <Timer className="w-3 h-3" /> {duration}
                      </span>
                    ) : (
                      <span className="text-slate-600 text-xs">—</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 text-right">
                    <span className={`px-3 py-1 text-[10px] font-black rounded-full border shadow-lg uppercase ${
                      isPresent
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/10'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/10'
                    }`}>
                      {row.status || 'Absent'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="6" className="p-12 text-center text-slate-500 font-black italic uppercase tracking-widest text-xs opacity-50">No matching records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
