import React from 'react';
import { motion } from 'framer-motion';

export default function AddStaffModal({ isOpen, onClose, onAdd, newStaff, setNewStaff }) {
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-lg bg-slate-900 border-cyan-500/30 overflow-hidden p-6"
      >
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter">Add New Staff member</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Manual Force Enrollment</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white p-2 text-2xl transition-colors">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Staff ID</label>
              <input 
                type="text" placeholder="e.g. STF005" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white font-mono"
                value={newStaff.staff_id} onChange={(e) => setNewStaff({...newStaff, staff_id: e.target.value.toUpperCase()})} required
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Full Name</label>
              <input 
                type="text" placeholder="Employee Name" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
                value={newStaff.name} onChange={(e) => setNewStaff({...newStaff, name: e.target.value})} required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Branch Location</label>
              <select 
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white appearance-none cursor-pointer"
                value={newStaff.branch} 
                onChange={(e) => setNewStaff({...newStaff, branch: e.target.value})}
              >
                <option value="Thiruvarur 01">Thiruvarur 01</option>
                <option value="Kodavasal 01">Kodavasal 01</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Mobile Number</label>
              <input 
                type="text" placeholder="10 Digit Mobile" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
                value={newStaff.mobile} onChange={(e) => setNewStaff({...newStaff, mobile: e.target.value})} required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Department/Role</label>
              <select 
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white appearance-none cursor-pointer"
                value={newStaff.role} onChange={(e) => setNewStaff({...newStaff, role: e.target.value})}
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
              <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Base Salary</label>
              <input 
                type="number" placeholder="Enter Amount" 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
                value={newStaff.base_salary} onChange={(e) => setNewStaff({...newStaff, base_salary: e.target.value})} required
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest text-cyan-500/70 ml-1">Assign Initial Password</label>
            <input 
              type="password" placeholder="Password" 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
              value={newStaff.password} onChange={(e) => setNewStaff({...newStaff, password: e.target.value})} required
            />
          </div>

          <button 
            type="submit" 
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-[0.2em] text-xs mt-6 rounded-xl transition-all shadow-xl shadow-cyan-600/20 active:scale-95"
          >
            Confirm Field Officer Registration
          </button>
        </form>
      </motion.div>
    </div>
  );
}
