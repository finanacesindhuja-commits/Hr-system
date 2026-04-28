import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search, RefreshCw, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });

export default function PayrollMgmt({ staff }) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1); // Default to PREVIOUS month
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });
  const [attendanceStats, setAttendanceStats] = useState({});
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [adjustments, setAdjustments] = useState({}); // { staff_id: deductions }
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPayrollData();
  }, [selectedMonth]);

  const fetchPayrollData = async () => {
    setLoading(true);
    try {
      const [statsRes, historyRes] = await Promise.all([
        api.get(`/hr/payroll/stats/${selectedMonth}`),
        api.get(`/hr/payroll/history/${selectedMonth}`)
      ]);
      setAttendanceStats(statsRes.data);
      setPaymentHistory(historyRes.data);
    } catch (err) {
      console.error('Payroll Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDisburse = async (s) => {
    const presentDays = attendanceStats[s.staff_id] || 0;
    const baseVal = parseFloat(s.base_salary || 0);
    const deductionVal = parseFloat(adjustments[s.staff_id] || 0);
    const netSalary = baseVal - deductionVal;

    if (netSalary < 0) return alert('Deductions cannot exceed Base Salary!');

    try {
      await api.post('/hr/payroll/disburse', {
        staff_id: s.staff_id,
        month_year: selectedMonth,
        present_days: presentDays,
        base_salary: baseVal,
        deductions: deductionVal,
        net_salary: netSalary
      });
      alert(`Salary disbursed for ${s.name}`);
      fetchPayrollData();
    } catch (err) {
      alert('Disbursement failed');
    }
  };

  const isPaid = (staffId) => paymentHistory.some(p => p.staff_id === staffId);

  return (
    <div className="space-y-6">
      {/* Payroll Header */}
      <div className="glass-card flex flex-col sm:flex-row gap-4 justify-between items-center p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <div>
            <h3 className="font-outfit font-black uppercase tracking-tighter text-xl">Monthly Payroll</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none">Calculate & Process Staff Salaries</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input 
            type="month" 
            className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none text-white"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
          />
          <button 
            onClick={fetchPayrollData}
            className="p-3 hover:bg-white/10 rounded-xl border border-white/5 transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(s => {
          const presentDays = attendanceStats[s.staff_id] || 0;
          const paidRecord = paymentHistory.find(p => p.staff_id === s.staff_id);
          
          return (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={s.staff_id} 
              className={`glass-card relative overflow-hidden transition-all border-b-4 ${
                paidRecord ? 'border-emerald-500 bg-emerald-500/5' : 'border-cyan-500/30'
              }`}
            >
              {paidRecord && (
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-emerald-500 text-[10px] font-black uppercase px-2 py-1 rounded shadow-lg">
                  <CheckCircle2 className="w-3 h-3" /> Processed
                </div>
              )}

              <div className="flex items-center gap-4 mb-6 pt-2">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-lg text-cyan-400 border border-white/10">
                  {s.name?.[0] || '?'}
                </div>
                <div className="min-w-0">
                  <h4 className="font-black text-lg uppercase tracking-tighter truncate leading-tight">{s.name}</h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest">{s.staff_id}</p>
                </div>
              </div>

              <div className="space-y-4 text-sm font-bold">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Days worked</p>
                    <p className="text-xl font-outfit text-white">{presentDays} <span className="text-[10px] text-slate-600">Days</span></p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                    <p className="text-[9px] text-slate-500 uppercase mb-1">Base Salary</p>
                    <p className="text-xl font-outfit text-white">₹{s.base_salary || 0}</p>
                  </div>
                </div>

                {!paidRecord ? (
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] text-slate-500 uppercase">Monthly Deductions / Penalties</label>
                      <input 
                        type="number" 
                        placeholder="0.00"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm focus:border-cyan-500 outline-none"
                        value={adjustments[s.staff_id] || ''}
                        onChange={(e) => setAdjustments({...adjustments, [s.staff_id]: e.target.value})}
                      />
                    </div>
                    <div className="flex justify-between items-center bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/10">
                      <span className="text-[10px] text-cyan-400 uppercase">Est. Net Payable</span>
                      <span className="text-xl font-outfit text-white">₹{(s.base_salary || 0) - (adjustments[s.staff_id] || 0)}</span>
                    </div>
                    <button 
                      onClick={() => handleDisburse(s)}
                      className="w-full premium-btn bg-cyan-600 hover:bg-cyan-500 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-cyan-600/20"
                    >
                      Process & Disburse
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                     <div className="flex justify-between items-center bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/10">
                        <span className="text-[10px] text-emerald-400 uppercase">Net Paid</span>
                        <span className="text-xl font-outfit text-emerald-400">₹{paidRecord.net_salary}</span>
                     </div>
                     <p className="text-center text-[9px] text-slate-500 uppercase font-black">Processed on {new Date(paidRecord.processed_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
