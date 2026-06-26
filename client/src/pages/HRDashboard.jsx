import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, MapPin, Filter, LogOut, ShieldCheck, Radar
} from 'lucide-react';
import axios from 'axios';
import { io } from 'socket.io-client';

// UI Components
import { StatCard, TabButton } from '../components/hr/UI';
import Sidebar from '../components/hr/Sidebar';
import AttendanceTable from '../components/hr/AttendanceTable';
import StaffRegistry from '../components/hr/StaffRegistry';
import LeaveRequests from '../components/hr/LeaveRequests';
import ApplicantsListing from '../components/hr/ApplicantsListing';
import PayrollMgmt from '../components/hr/PayrollMgmt';
import LiveMap from '../components/hr/LiveMap';
import Toast from '../components/hr/Toast';

// Modals
import AddStaffModal from '../components/hr/modals/AddStaffModal';
import EditStaffModal from '../components/hr/modals/EditStaffModal';
import ApplicantDetailModal from '../components/hr/modals/ApplicantDetailModal';
import StaffPassbookModal from '../components/hr/modals/StaffPassbookModal';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
const api = axios.create({ baseURL: `${BASE_URL}/api` });
const socket = io(BASE_URL);

export default function HRDashboard() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || '{}');
    } catch {
      return {};
    }
  });
  
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [proposedSalary, setProposedSalary] = useState(15000);
  const [proposedBranch, setProposedBranch] = useState('Thiruvarur 01');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('attendance');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [selectedPassbookStaff, setSelectedPassbookStaff] = useState(null);
  const [newStaff, setNewStaff] = useState({ staff_id: '', name: '', mobile: '', role: 'Staff', password: 'password', base_salary: '', branch: 'Thiruvarur 01' });
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }
  const navigate = useNavigate();

  useEffect(() => {
    if (!user.staff_id || user.role?.toLowerCase() !== 'hr') {
      navigate('/login');
      return;
    }
    
    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.emit('join-hr');

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [user, navigate]);

  useEffect(() => {
    if (!user.staff_id || user.role?.toLowerCase() !== 'hr') return;

    const refreshData = () => {
      fetchAll();
      fetchLeaves();
      fetchApplicants();
    };

    // Initial fetch
    refreshData();

    // Auto-refresh every 10 seconds to keep data updated
    const interval = setInterval(refreshData, 10000);

    return () => clearInterval(interval);
  }, [user, selectedMonth]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [staffRes, attendanceRes] = await Promise.allSettled([
        api.get('/hr/staff'),
        api.get('/hr/attendance')
      ]);
      
      if (staffRes.status === 'fulfilled') setStaff(staffRes.value.data);
      else throw new Error('Staff Registry Feed Down');
      
      if (attendanceRes.status === 'fulfilled') setAttendance(attendanceRes.value.data);
      else console.warn('Attendance feed unavailable');
      
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaves = async (month) => {
    try {
      const m = month || selectedMonth;
      const { data } = await api.get(`/hr/leaves?month=${m}`);
      setLeaves(data || []);
    } catch (err) {
      console.error('[DEBUG] Leaves Fetch Error:', err);
    }
  };

  const handleMonthChange = (month) => {
    setSelectedMonth(month);
    fetchLeaves(month);
  };

  const fetchApplicants = async () => {
    try {
      const { data } = await api.get('/hr/applicants');
      setApplicants(data || []);
    } catch (err) {
      console.error('[DEBUG] Applicants Fetch Error:', err);
    }
  };

  const handleUpdateLeave = async (id, status) => {
    try {
      await api.put(`/hr/leaves/${id}`, { status });
      fetchLeaves();
      showToast('Leave status updated');
    } catch (err) {
      showToast('Failed to update leave', 'error');
    }
  };

  const handleUpdateApplicant = async (id, action) => {
    try {
      const payload = action === 'approve' ? { base_salary: proposedSalary, branch: proposedBranch } : {};
      await api.put(`/hr/applicants/${id}/${action}`, payload);
      showToast(`Candidate ${action === 'approve' ? 'Approved' : 'Rejected'} Successfully`);
      setSelectedApplicant(null); // Close the modal
      fetchApplicants(); // Refresh the list
      if (action === 'approve') {
        fetchAll();
        setProposedSalary('');
      }
    } catch (err) {
      showToast('Action failed: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleUpdateStaff = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/hr/staff/${editingStaff.staff_id}`, editingStaff);
      showToast('Staff Updated Successfully');
      setEditingStaff(null);
      fetchAll();
    } catch (err) {
      showToast('Update failed', 'error');
    }
  };

  const handleAddStaff = async () => {
    try {
      await api.post('/hr/staff', newStaff);
      showToast('Staff Registered Successfully');
      setShowAddModal(false);
      setNewStaff({ staff_id: '', name: '', mobile: '', role: 'Staff', password: 'password', base_salary: '', branch: 'Thiruvarur 01' });
      fetchAll();
    } catch (err) {
      showToast('Failed to add staff', 'error');
    }
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm('Are you sure you want to delete this staff?')) return;
    try {
      await api.delete(`/hr/staff/${id}`);
      fetchAll();
      showToast('Staff member removed');
    } catch (err) {
      showToast('Delete failed', 'error');
    }
  };

  const stats = {
    total: staff.length,
    working: attendance.filter(a => a.date === new Date().toISOString().split('T')[0]).length
  };

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#030014] font-inter text-slate-100 flex overflow-hidden relative">
      {/* Premium Background Glows */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-cyan-600/5 blur-[120px] rounded-full" />
      </div>
      
      <Sidebar 
        tab={tab} 
        setTab={setTab} 
        applicantsCount={applicants.length} 
        user={user} 
        onSignOut={handleSignOut}
        connected={connected}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        {/* Mobile Header */}
        <header className="lg:hidden bg-slate-900 border-b border-white/10 p-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h1 className="font-bold font-outfit uppercase tracking-tighter text-sm">HR CONTROL</h1>
          </div>
          <button onClick={handleSignOut} className="p-2 text-rose-500">
            <LogOut className="w-6 h-6" />
          </button>
        </header>

        {/* Mobile Navigation */}
        <div className="lg:hidden bg-slate-900 border-b border-white/10 p-2 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            <TabButton active={tab === 'staff'} onClick={() => setTab('staff')} icon={<Users className="w-4 h-4" />} label="Staff" />
            <TabButton active={tab === 'attendance'} onClick={() => setTab('attendance')} icon={<Clock className="w-4 h-4" />} label="Logs" />
            <TabButton active={tab === 'tracking'} onClick={() => setTab('tracking')} icon={<Radar className="w-4 h-4" />} label="Monitor" />
            <TabButton active={tab === 'leaves'} onClick={() => setTab('leaves')} icon={<MapPin className="w-4 h-4" />} label="Leaves" />
            <TabButton active={tab === 'applicants'} onClick={() => setTab('applicants')} icon={<Users className="w-4 h-4" />} label="Appr" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 lg:pb-6 relative scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-8">
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl flex items-center justify-between">
                <p className="text-sm font-bold">⚠️ Error: {error}</p>
                <button onClick={fetchAll} className="text-xs underline font-black">Retry</button>
              </div>
            )}
            
            {tab !== 'tracking' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StatCard icon={<Users className="text-blue-400" />} label="Total Registered Forces" value={stats.total} />
                  <StatCard icon={<Clock className="text-emerald-400" />} label="Field Presence Today" value={stats.working} isSignal />
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {tab === 'staff' && (
                  <StaffRegistry 
                    staff={staff} 
                    searchTerm={searchTerm} 
                    setSearchTerm={setSearchTerm}
                    onEdit={setEditingStaff}
                    onDelete={handleDeleteStaff}
                    onAddClick={() => setShowAddModal(true)}
                    onViewPassbook={(id) => setSelectedPassbookStaff(id)}
                  />
                )}

                {tab === 'leaves' && (
                  <LeaveRequests
                    leaves={leaves}
                    onUpdate={handleUpdateLeave}
                    selectedMonth={selectedMonth}
                    onMonthChange={handleMonthChange}
                  />
                )}

                {tab === 'applicants' && (
                  <ApplicantsListing 
                    applicants={applicants}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onSelect={setSelectedApplicant}
                    onUpdate={handleUpdateApplicant}
                  />
                )}

                {tab === 'attendance' && (
                  <AttendanceTable 
                    attendance={attendance} 
                    loading={loading} 
                    onRefresh={fetchAll} 
                  />
                )}

                {tab === 'tracking' && (
                  <LiveMap socket={socket} staff={staff} attendance={attendance} />
                )}

                {tab === 'payslip' && (
                  <PayrollMgmt staff={staff} onShowToast={showToast} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        {/* Global Toasts */}
        <AnimatePresence>
           {toast && <Toast {...toast} onClose={() => setToast(null)} />}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AddStaffModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStaff}
        newStaff={newStaff}
        setNewStaff={setNewStaff}
      />

      <EditStaffModal 
        isOpen={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        onUpdate={handleUpdateStaff}
        editingStaff={editingStaff}
        setEditingStaff={setEditingStaff}
      />

      <ApplicantDetailModal 
        isOpen={!!selectedApplicant}
        onClose={() => setSelectedApplicant(null)}
        applicant={selectedApplicant}
        onUpdate={handleUpdateApplicant}
        proposedSalary={proposedSalary}
        setProposedSalary={setProposedSalary}
        proposedBranch={proposedBranch}
        setProposedBranch={setProposedBranch}
      />

      <StaffPassbookModal
        isOpen={!!selectedPassbookStaff}
        onClose={() => setSelectedPassbookStaff(null)}
        staffId={selectedPassbookStaff}
      />
    </div>
  );
}
