import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { CelebrationModal } from '../../components/CelebrationModal';
import {
  Trophy,
  CheckSquare,
  FileText,
  Sparkles,
  ArrowRight,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MemberDashboard: React.FC = () => {
  const { user, celebrationShown, setCelebrationShown } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const [tRes, rRes, bRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/reports'),
        api.get(`/achievements/user/${user?.id}`),
      ]);
      setTasks(tRes.data);
      setReports(rRes.data);
      setBadges(bRes.data);

      // Check for 100% milestone celebration!
      const perf = user?.performance_percentage ?? 0;
      if (perf >= 100 && !celebrationShown) {
        setShowCelebration(true);
        setCelebrationShown(true);
      }
    } catch (err) {
      console.error('Failed to load member cockpit:', err);
    } finally {
      setLoading(false);
    }
  };

  const points = user?.total_points ?? 0;
  const target = user?.target_points ?? 100;
  const perf = user?.performance_percentage ?? Math.round((points / target) * 100);

  // Performance tier
  let levelClass = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
  let levelTitle = 'Needs Improvement';
  if (perf >= 90) {
    levelClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    levelTitle = 'Outstanding ⭐';
  } else if (perf >= 75) {
    levelClass = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
    levelTitle = 'Very Good';
  } else if (perf >= 60) {
    levelClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
    levelTitle = 'Good';
  } else if (perf >= 40) {
    levelClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    levelTitle = 'Developing';
  }

  const pendingTasks = tasks.filter((t) => t.status !== 'APPROVED' && t.status !== 'COMPLETED');
  const submittedTasks = tasks.filter((t) => t.status === 'SUBMITTED');
  const rejectedTasks = tasks.filter((t) => t.status === 'REJECTED');
  const today = new Date().toISOString().split('T')[0];
  const todaysReport = reports.find((r) => r.report_date === today);

  return (
    <div className="space-y-6 pb-12">
      {/* Celebration trigger if 100%+ achieved */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        userName={user?.name}
        points={points}
        performance={perf}
      />

      {/* Hero Welcome Card */}
      <div className="p-6 bg-gradient-to-r from-[#1E1B4B] via-[#0F172A] to-[#0B0F19] border border-indigo-500/30 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Welcome back, {user?.name}</span>
          </div>
          <h2 className="text-xl font-black text-white tracking-tight">
            Take Two OS • Member Cockpit
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Track assigned client deliverables, record your daily work reports, and accumulate performance points.
          </p>
        </div>

        {/* Big Performance Widget */}
        <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shrink-0 text-center w-full md:w-56 shadow-lg">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">My Performance Tier</span>
          <div className="text-2xl font-black text-white">{perf}%</div>
          <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${levelClass}`}>
            {levelTitle}
          </span>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                perf >= 90 ? 'bg-emerald-400' : perf >= 75 ? 'bg-indigo-400' : 'bg-amber-400'
              }`}
              style={{ width: `${Math.min(100, perf)}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {points} / {target} target points
          </span>
        </div>
      </div>

      {/* Attention Required Banner (Rejected tasks / reports) */}
      {rejectedTasks.length > 0 && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <h3 className="text-xs font-bold text-white">Revisions Required on {rejectedTasks.length} Deliverable(s)</h3>
              <p className="text-[11px] text-slate-400">
                Admin feedback has been provided. Please make necessary updates and resubmit to earn your points.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-tasks')}
            className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl transition"
          >
            Fix Revisions
          </button>
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Points */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Points Balance</span>
            <div className="text-2xl font-black text-amber-400">{points} Pts</div>
            <span className="text-[10px] text-slate-500">Target: {target} Pts</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        {/* Assigned Tasks Pending */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Tasks</span>
            <div className="text-2xl font-black text-indigo-400">{pendingTasks.length}</div>
            <span className="text-[10px] text-amber-300/80">{submittedTasks.length} Awaiting Approval</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Daily Work Report */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Today's Work Log</span>
            <div className="text-sm font-black text-white">
              {todaysReport ? todaysReport.status.replace('_', ' ') : 'Not Submitted'}
            </div>
            <span className="text-[10px] text-slate-500">
              {todaysReport ? `${todaysReport.hours_worked} hrs recorded` : '+2 Pts on approval'}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Badges Earned */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Achievements</span>
            <div className="text-2xl font-black text-emerald-400">{badges.length} Badges</div>
            <span className="text-[10px] text-slate-500">Recognition medals</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Two Columns: My Active Tasks & Today's Work Report Action */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Tasks List */}
        <div className="lg:col-span-2 p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">My Active Deliverables</h3>
              <p className="text-[11px] text-slate-400">Update progress or submit deliverables with proof attachments</p>
            </div>
            <button
              onClick={() => navigate('/my-tasks')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {tasks.slice(0, 4).map((t) => (
              <div
                key={t.id}
                className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{t.title}</span>
                    <span className="text-[10px] text-indigo-300 font-medium">({t.client_name || 'Internal'})</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-1">
                    <span>Priority: <strong className="text-slate-200">{t.priority}</strong></span>
                    <span>Deadline: <strong className="text-slate-200">{t.deadline ? t.deadline.split('T')[0] : 'N/A'}</strong></span>
                    <span>Progress: <strong className="text-indigo-400">{t.progress_percentage}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.status === 'APPROVED'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : t.status === 'SUBMITTED'
                        ? 'bg-amber-500/15 text-amber-300'
                        : t.status === 'REJECTED'
                        ? 'bg-red-500/15 text-red-300'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {t.status.replace('_', ' ')}
                  </span>
                  <button
                    onClick={() => navigate('/my-tasks')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Report Quick Submission Card */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>

            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">
              Daily Work Log Requirement
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Team members are required to submit their daily work report before end of day. Approved daily logs award +2 points and maintain your streak!
            </p>

            {todaysReport ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Today's Log Submitted!
                </div>
                <div className="text-[11px] text-slate-400">
                  Status: <strong>{todaysReport.status.replace('_', ' ')}</strong>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300 space-y-1">
                <div className="font-bold">Pending Today's Submission</div>
                <div className="text-[11px] text-slate-400">
                  Record what you worked on, completed, and hours logged.
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/submit-report')}
            className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            {todaysReport ? 'View Submitted Log' : 'Submit Daily Work Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
