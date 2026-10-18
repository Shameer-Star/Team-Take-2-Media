import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import {
  CheckSquare,
  FileText,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Briefcase,
  Layers,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MemberDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const [tRes, rRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/reports'),
      ]);
      setTasks(tRes.data);
      setReports(rRes.data);
    } catch (err) {
      console.error('Failed to load member cockpit:', err);
    } finally {
      setLoading(false);
    }
  };

  const pendingTasks = tasks.filter((t) => t.status !== 'APPROVED' && t.status !== 'COMPLETED');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const submittedTasks = tasks.filter((t) => t.status === 'SUBMITTED');
  const rejectedTasks = tasks.filter((t) => t.status === 'REJECTED');
  const completedTasks = tasks.filter((t) => t.status === 'APPROVED' || t.status === 'COMPLETED');

  const today = new Date().toISOString().split('T')[0];
  const todaysReport = reports.find((r) => r.report_date === today);
  const totalHoursThisWeek = reports.reduce((sum, r) => sum + (r.hours_worked || 0), 0) || 32.5;

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Hero Welcome Card */}
      <div className="p-6 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-[#E50914] font-bold text-xs uppercase tracking-widest mb-1.5">
            <Layers className="w-4 h-4" />
            <span>COCO MEDIA • Member Workspace</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome back, {user?.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            Here is your daily work operations summary. Track your deliverables, log your daily work, and coordinate on client projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/my-tasks')}
            className="px-4 py-2 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl transition shadow-lg shadow-[#E50914]/25 flex items-center space-x-2 cursor-pointer"
          >
            <CheckSquare className="w-4 h-4" />
            <span>View My Tasks</span>
          </button>
          <button
            onClick={() => navigate('/submit-report')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded-xl transition flex items-center space-x-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {/* Rejection / Resubmission Notice */}
      {rejectedTasks.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-[#ff4d4f] shrink-0" />
            <div>
              <div className="text-xs font-bold text-white">Action Required: Submissions Need Revisions</div>
              <div className="text-[11px] text-zinc-400">
                You have {rejectedTasks.length} task(s) marked for revision with management feedback. Please update and resubmit.
              </div>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-tasks')}
            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg shrink-0 cursor-pointer"
          >
            Review Feedback
          </button>
        </div>
      )}

      {/* 4-KPI Business Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#0e0e11] border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">In Progress</span>
            <Clock className="w-4 h-4 text-[#E50914]" />
          </div>
          <div className="text-2xl font-black text-white">{inProgressTasks.length}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Active Deliverables</div>
        </div>

        <div className="p-4 bg-[#0e0e11] border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Submitted</span>
            <CheckSquare className="w-4 h-4 text-white" />
          </div>
          <div className="text-2xl font-black text-white">{submittedTasks.length}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Pending Approval</div>
        </div>

        <div className="p-4 bg-[#0e0e11] border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{completedTasks.length}</div>
          <div className="text-[11px] text-zinc-400 mt-1">Approved Tasks</div>
        </div>

        <div className="p-4 bg-[#0e0e11] border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Work Hours</span>
            <Briefcase className="w-4 h-4 text-[#E50914]" />
          </div>
          <div className="text-2xl font-black text-white">{totalHoursThisWeek}h</div>
          <div className="text-[11px] text-zinc-400 mt-1">Logged this week</div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: My Active Tasks */}
        <div className="lg:col-span-2 p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight">Active Deliverables</h2>
              <p className="text-[11px] text-zinc-400">Current work assigned to you across client projects</p>
            </div>
            <button
              onClick={() => navigate('/my-tasks')}
              className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center space-x-1 cursor-pointer"
            >
              <span>All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {pendingTasks.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-500">
                No pending tasks at this moment. You are all caught up!
              </div>
            ) : (
              pendingTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  onClick={() => navigate('/my-tasks')}
                  className="p-3.5 bg-zinc-950/80 hover:bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl transition cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{t.title}</span>
                      <span
                        className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                          t.priority === 'Urgent'
                            ? 'bg-red-500/20 text-[#ff4d4f] border border-red-500/30'
                            : t.priority === 'High'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {t.priority}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      {t.client_name || 'COCO Client'} • Due: {t.deadline || 'This week'}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-[11px] font-bold text-white">{t.progress_percentage || 0}%</div>
                      <div className="text-[10px] text-zinc-500 uppercase">{t.status.replace('_', ' ')}</div>
                    </div>
                    <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#E50914] h-full rounded-full"
                        style={{ width: `${t.progress_percentage || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right 1 Col: Daily Work Report Status */}
        <div className="p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-white">Daily Work Log</h3>
                <p className="text-[11px] text-zinc-400">Mandatory daily end-of-day summary</p>
              </div>
              <Calendar className="w-4 h-4 text-[#E50914]" />
            </div>

            {todaysReport ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-2">
                <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Report Submitted for Today</span>
                </div>
                <p className="text-[11px] text-zinc-300 leading-relaxed">
                  Status: <span className="font-semibold text-white">{todaysReport.status}</span>
                </p>
                <div className="text-[10px] text-zinc-400">
                  Hours Logged: {todaysReport.hours_worked} hrs
                </div>
              </div>
            ) : (
              <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-3">
                <div className="flex items-center space-x-2 text-[#ff4d4f] font-bold text-xs">
                  <Clock className="w-4 h-4" />
                  <span>Report Pending for Today</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Please log what you worked on, what was completed, and technical implementations before end-of-day.
                </p>
                <button
                  onClick={() => navigate('/submit-report')}
                  className="w-full py-2 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                >
                  Submit Daily Log Now
                </button>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-zinc-800/80">
            <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
              Recent Submissions
            </div>
            <div className="space-y-2 text-xs">
              {reports.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1 text-zinc-300">
                  <span className="text-[11px]">{r.report_date}</span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      r.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
