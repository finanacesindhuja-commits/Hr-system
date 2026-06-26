import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Calendar, DollarSign, Activity, CheckCircle2, Clock, Briefcase } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });

export default function StaffPassbookModal({ isOpen, onClose, staffId }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [payslips, setPayslips] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('payslips');

  useEffect(() => {
    if (isOpen && staffId) {
      fetchPassbookData();
    }
  }, [isOpen, staffId]);

  const fetchPassbookData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profileRes, payslipsRes, attendanceRes] = await Promise.all([
        api.get(`/staff/profile/${staffId}`),
        api.get(`/staff/payslips/${staffId}`),
        api.get(`/staff/attendance/history/${staffId}`)
      ]);
      setProfile(profileRes.data);
      setPayslips(payslipsRes.data || []);
      setAttendance(attendanceRes.data || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const presentDaysThisMonth = attendance.filter(a => a.status === 'Present').length;
  const totalPaid = payslips.reduce((sum, p) => sum + Number(p.net_salary || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header (Passbook Cover Style) */}
        <div className="p-6 sm:p-8 bg-gradient-to-br from-indigo-900 via-slate-900 to-cyan-900 border-b border-white/10 flex justify-between items-start relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[100px] rounded-full" />
           
           <div className="relative z-10 flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-xl backdrop-blur-md">
               <BookOpen className="w-8 h-8 text-cyan-400" />
             </div>
             <div>
               <h2 className="text-3xl font-black font-outfit uppercase tracking-tighter text-white">Digital Passbook</h2>
               <p className="text-xs text-cyan-400 font-bold uppercase tracking-[0.2em] mt-1">
                 Official Staff Ledger • {staffId}
               </p>
             </div>
           </div>

           <button 
             onClick={onClose}
             className="relative z-10 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-950">
          
          {loading ? (
            <div className="h-64 flex items-center justify-center">
               <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-center font-bold">
               Error loading passbook: {error}
            </div>
          ) : profile && (
            <>
              {/* Profile Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="col-span-1 md:col-span-2 bg-white/5 rounded-2xl p-6 border border-white/5 relative overflow-hidden">
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/10 blur-3xl rounded-full" />
                    <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2"><Briefcase className="w-3 h-3"/> Staff Profile</h3>
                    
                    <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                       <div>
                         <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Full Name</p>
                         <p className="font-bold text-lg text-white capitalize leading-tight">{profile.name}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Branch</p>
                         <p className="font-bold text-cyan-400 uppercase tracking-tighter leading-tight">{profile.branch || 'Main Branch'}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Role & Designation</p>
                         <p className="font-bold text-slate-300 uppercase leading-tight">{profile.role}</p>
                       </div>
                       <div>
                         <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Base Salary</p>
                         <p className="font-black text-emerald-400 leading-tight">₹{profile.base_salary}</p>
                       </div>
                    </div>
                 </div>

                 {/* Quick Stats */}
                 <div className="col-span-1 space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5">
                       <h3 className="text-[10px] text-emerald-500/80 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign className="w-3 h-3"/> Total Paid</h3>
                       <p className="text-2xl font-black text-emerald-400 font-outfit">₹{totalPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5">
                       <h3 className="text-[10px] text-blue-500/80 font-black uppercase tracking-widest mb-2 flex items-center gap-2"><Activity className="w-3 h-3"/> Present this Month</h3>
                       <p className="text-2xl font-black text-blue-400 font-outfit">{presentDaysThisMonth} <span className="text-sm font-bold text-blue-500/50">Days</span></p>
                    </div>
                 </div>
              </div>

              {/* Ledger Tabs */}
              <div className="border-b border-white/10 flex gap-6">
                 <button 
                   onClick={() => setActiveTab('payslips')}
                   className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'payslips' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Salary Ledger
                   {activeTab === 'payslips' && <motion.div layoutId="passbookTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                 </button>
                 <button 
                   onClick={() => setActiveTab('attendance')}
                   className={`pb-3 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'attendance' ? 'text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}
                 >
                   Attendance Logs
                   {activeTab === 'attendance' && <motion.div layoutId="passbookTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
                 </button>
              </div>

              {/* Ledger Content */}
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
                {activeTab === 'payslips' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <tr>
                          <th className="p-4">Month</th>
                          <th className="p-4">Base Salary</th>
                          <th className="p-4">Deductions</th>
                          <th className="p-4">Net Paid</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {payslips.length === 0 ? (
                          <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">No salary records found</td></tr>
                        ) : payslips.map((p) => (
                          <tr key={p.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                               <Calendar className="w-4 h-4 text-slate-500" />
                               {new Date(p.month_year + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </td>
                            <td className="p-4 font-mono text-slate-300">₹{p.base_salary}</td>
                            <td className="p-4 font-mono text-rose-400">₹{p.deductions}</td>
                            <td className="p-4 font-mono font-black text-emerald-400">₹{p.net_salary}</td>
                            <td className="p-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400">
                                <CheckCircle2 className="w-3 h-3" /> {p.status || 'Paid'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeTab === 'attendance' && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-black/20 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <tr>
                          <th className="p-4">Date</th>
                          <th className="p-4">Check In</th>
                          <th className="p-4">Check Out</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {attendance.length === 0 ? (
                          <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-bold text-xs uppercase tracking-widest">No attendance records this month</td></tr>
                        ) : attendance.map((a) => (
                          <tr key={a.id} className="hover:bg-white/5 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                               <Calendar className="w-4 h-4 text-slate-500" />
                               {new Date(a.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="p-4 font-mono text-slate-400">
                               {a.check_in ? new Date(a.check_in).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </td>
                            <td className="p-4 font-mono text-slate-400">
                               {a.check_out ? new Date(a.check_out).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--'}
                            </td>
                            <td className="p-4">
                               <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-400">
                                 {a.status}
                               </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </>
          )}

        </div>
      </motion.div>
    </div>
  );
}
