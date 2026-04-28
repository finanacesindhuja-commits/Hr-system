import React from 'react';
import { Search, LogOut, Download } from 'lucide-react';
import { exportToCSV } from '../../utils/ExportUtils';

export default function StaffRegistry({ staff, searchTerm, setSearchTerm, onEdit, onDelete, onAddClick }) {
  
  const handleExport = () => {
    const exportData = staff.map(s => ({
      'Staff ID': s.staff_id,
      'Name': s.name,
      'Mobile': s.mobile,
      'Role': s.role,
      'Branch': s.branch || 'None',
      'Monthly Salary': s.base_salary,
      'Police Verification': s.police_verification_url || 'None'
    }));
    exportToCSV(exportData, 'Staff_Registry');
  };

  return (
    <div className="glass-card overflow-hidden !p-0 shadow-2xl">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search staff name or ID..."
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-colors"
          >
            <Download className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={onAddClick}
            className="premium-btn bg-cyan-600 hover:bg-cyan-500 text-xs text-white flex-1 sm:flex-initial shadow-lg shadow-cyan-600/20"
          >
            + Add Staff Manually
          </button>
        </div>
      </div>
      <div className="overflow-x-auto text-sm">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-[10px] uppercase tracking-widest text-slate-500 font-black">
            <tr>
              <th className="p-4">Staff Details</th>
              <th className="p-4">Role</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Mobile</th>
              <th className="p-4">Salary</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {staff.filter(s => 
              s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              s.staff_id.toLowerCase().includes(searchTerm.toLowerCase())
            ).map((s) => (
              <tr key={s.staff_id} className="hover:bg-white/[0.02] group transition-colors">
                <td className="p-4">
                  <p className="font-bold group-hover:text-cyan-400 transition-colors uppercase text-sm">{s.name}</p>
                  <p className="text-[11px] text-cyan-400/80 font-black tracking-widest font-mono mt-0.5">#{s.staff_id}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${s.role?.toLowerCase() === 'hr' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-500/20 text-slate-400'}`}>
                    {s.role}
                  </span>
                </td>
                <td className="p-4 text-[10px] font-black uppercase text-cyan-500 italic">
                  {s.branch || 'Main'}
                </td>
                <td className="p-4 text-slate-400 font-mono italic">{s.mobile}</td>
                <td className="p-4 font-black text-white">₹{s.base_salary}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => onEdit(s)} className="p-2.5 hover:bg-cyan-500/10 rounded-xl text-cyan-400 border border-transparent hover:border-cyan-500/20 transition-all">
                     <Search className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(s.staff_id)} className="p-2.5 hover:bg-rose-500/10 rounded-xl text-rose-500 border border-transparent hover:border-rose-500/20 transition-all"><LogOut className="w-4 h-4 rotate-180" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
