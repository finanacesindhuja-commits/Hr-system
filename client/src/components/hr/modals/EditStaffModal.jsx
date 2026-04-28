import React from 'react';
import { motion } from 'framer-motion';

export default function EditStaffModal({ isOpen, onClose, onUpdate, editingStaff, setEditingStaff }) {
  if (!isOpen || !editingStaff) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-md bg-slate-900 border-cyan-500/30 overflow-hidden"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold font-outfit uppercase tracking-tighter">Edit Staff Profile</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 text-2xl">&times;</button>
        </div>
        <form onSubmit={onUpdate} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Staff ID (Read-only)</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-500 outline-none cursor-not-allowed"
              value={editingStaff.staff_id} readOnly
            />
          </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Name</p>
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white"
                  value={editingStaff.name} 
                  onChange={(e) => setEditingStaff({...editingStaff, name: e.target.value})}
                />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Branch</p>
                <select 
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-500 text-white appearance-none"
                  value={editingStaff.branch || 'Thiruvarur 01'} 
                  onChange={(e) => setEditingStaff({...editingStaff, branch: e.target.value})}
                >
                  <option value="Thiruvarur 01">Thiruvarur 01</option>
                  <option value="Kodavasal 01">Kodavasal 01</option>
                </select>
              </div>
            </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Mobile Number</label>
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
              value={editingStaff.mobile} onChange={(e) => setEditingStaff({...editingStaff, mobile: e.target.value})} required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Role</label>
              <select 
                className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
                value={editingStaff.role} onChange={(e) => setEditingStaff({...editingStaff, role: e.target.value})}
              >
                <option value="Relationship Officer">Relationship Officer</option>
                <option value="Disbursement Officer">Disbursement Officer</option>
                <option value="Collections Officer">Collections Officer</option>
                <option value="MIS Executive">MIS Executive</option>
                <option value="Area Manager">Area Manager</option>
                <option value="Cluster Manager">Cluster Manager</option>
                <option value="hr">HR Manager</option>
                <option value="Staff">General Staff</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Monthly Salary</label>
              <input 
                type="number" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                value={editingStaff.base_salary} onChange={(e) => setEditingStaff({...editingStaff, base_salary: e.target.value})} required
              />
            </div>
          </div>
          <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Police Verification URL (Optional)</label>
              <input 
                type="text" 
                placeholder="https://..."
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                value={editingStaff.police_verification_url || ''} onChange={(e) => setEditingStaff({...editingStaff, police_verification_url: e.target.value})}
              />
          </div>
          <button type="submit" className="w-full premium-btn bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-[0.2em] text-xs mt-4 py-4 shadow-lg shadow-cyan-600/20">Save All Changes</button>
        </form>
      </motion.div>
    </div>
  );
}
