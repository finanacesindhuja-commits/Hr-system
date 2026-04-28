import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { DetailSection, DetailRow, DocLink } from '../UI';

export default function ApplicantDetailModal({ isOpen, onClose, applicant, onUpdate, proposedSalary, setProposedSalary, proposedBranch, setProposedBranch }) {
  if (!isOpen || !applicant) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card w-full max-w-2xl bg-slate-900 border-cyan-500/30 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl font-black text-cyan-400 overflow-hidden shadow-xl">
                {applicant.image_url ? (
                  <img src={applicant.image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  applicant.name?.[0]
                )}
             </div>
             <div>
                <h2 className="text-2xl font-black font-outfit uppercase tracking-tighter">{applicant.name}</h2>
                <p className="text-cyan-400 font-bold text-xs uppercase tracking-[0.2em]">{applicant.role}</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-slate-500 hover:text-white transition-colors">
            <ExternalLink className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <DetailSection title="Contact Information">
                <DetailRow label="Primary Mobile" value={applicant.mobile} isMono />
                <DetailRow label="Alt Mobile" value={applicant.alternative_mobile || 'N/A'} isMono />
                <DetailRow label="Email Address" value={applicant.email} />
                <DetailRow label="Working Area" value={applicant.area} />
             </DetailSection>

             <DetailSection title="Personal Details">
                <DetailRow label="Father's Name" value={applicant.fathers_name} />
                <DetailRow label="Mother's Name" value={applicant.mothers_name} />
                <DetailRow label="Experience" value={applicant.experience} highlight />
             </DetailSection>

              <DetailSection title="Salary & Approval Settings">
                 <div className="bg-cyan-500/5 border border-cyan-500/20 p-4 rounded-xl space-y-4">
                   <div>
                      <label className="text-[9px] text-cyan-400 uppercase font-black mb-1 block">Assigned Branch</label>
                      <select 
                        className="bg-slate-800 text-sm font-bold w-full text-white border border-cyan-500/20 rounded-lg p-2 focus:outline-none focus:border-cyan-400 appearance-none cursor-pointer"
                        value={proposedBranch}
                        onChange={(e) => setProposedBranch(e.target.value)}
                      >
                         <option value="Thiruvarur 01">Thiruvarur 01</option>
                         <option value="Kodavasal 01">Kodavasal 01</option>
                      </select>
                   </div>

                   <div>
                      <label className="text-[9px] text-cyan-400 uppercase font-black mb-1 block">Assigned Base Salary (Monthly)</label>
                      <div className="flex items-center gap-2">
                         <span className="text-xl font-bold text-white">₹</span>
                         <input 
                            type="number" 
                            className="bg-transparent text-xl font-black focus:outline-none w-full text-white"
                            value={proposedSalary}
                            onChange={(e) => setProposedSalary(e.target.value)}
                         />
                      </div>
                   </div>
                   <p className="text-[9px] text-slate-500 mt-2">Specify the branch and monthly salary for induction.</p>
                 </div>
              </DetailSection>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <DetailSection title="Education Details">
                <DetailRow label="Highest Degree" value={applicant.degree} highlight />
             </DetailSection>

             <DetailSection title="Verification Documents">
                <div className="space-y-2">
                  {applicant.cert_10th_url && <DocLink label="10th Certificate" url={applicant.cert_10th_url} />}
                  {applicant.cert_12th_url && <DocLink label="12th Certificate" url={applicant.cert_12th_url} />}
                  {applicant.cert_degree_url && <DocLink label="Degree Certificate" url={applicant.cert_degree_url} />}
                </div>
             </DetailSection>
          </div>
        </div>

        <div className="p-6 border-t border-white/10 bg-white/5 grid grid-cols-2 gap-4">
          <button 
            onClick={() => onUpdate(applicant.id, 'approve')}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-emerald-500/20 transition-all active:scale-95"
          >
            Approve Candidate
          </button>
          <button 
            onClick={() => onUpdate(applicant.id, 'reject')}
            className="w-full py-4 bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white font-black uppercase tracking-[0.2em] rounded-xl border border-rose-500/30 transition-all active:scale-95"
          >
            Reject Candidate
          </button>
        </div>
      </motion.div>
    </div>
  );
}
