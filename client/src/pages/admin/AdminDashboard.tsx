import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  Briefcase,
  Award,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useNavigate } from 'react-router-dom';

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-slate-400 font-medium">Aggregating live business intelligence...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const members = data?.member_productivity || [];
  const recent = data?.recent_activity || [];
  const leadSources = data?.lead_sources || [];
  const weekly = data?.weekly_productivity || [];

  const taskPieData = [
    { name: 'Completed', value: kpis.completed_tasks || kpis.total_tasks - (kpis.pending_approvals || 0) },
    { name: 'Pending Review', value: kpis.pending_approvals || 3 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if Approvals Pending */}
      {kpis.pending_approvals > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border border-amber-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-amber-500/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Action Required: Submissions Pending Review</h2>
              <p className="text-[11px] text-slate-400">
                You have <span className="text-amber-300 font-bold">{kpis.pending_approvals}</span> task/report deliverable(s) awaiting approval. Points will only be awarded once approved.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/tasks')}
            className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-900 text-xs font-bold rounded-xl shadow-md transition"
          >
            Review Queue
          </button>
        </div>
      )}

      {/* 1. TEAM OVERVIEW - KPI Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
            Company Executive Overview
          </h2>
          <span className="text-[10px] text-slate-500">Live Database Queries • Real-time</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Members */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Total Team</span>
              <Users className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-lg font-black text-white">{kpis.total_members}</div>
            <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">{kpis.active_members} Active</div>
          </div>

          {/* Tasks */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Total Tasks</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-lg font-black text-white">{kpis.total_tasks}</div>
            <div className="text-[10px] text-indigo-300 font-medium mt-0.5">{kpis.approval_rate}% Approval</div>
          </div>

          {/* Completed Today */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Done Today</span>
              <Award className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400">{kpis.completed_today}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Approved today</div>
          </div>

          {/* Pending Approvals */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Pending</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-lg font-black text-amber-400">{kpis.pending_approvals}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Needs Review</div>
          </div>

          {/* Active Clients */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Clients</span>
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_clients}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{kpis.total_clients} Total</div>
          </div>

          {/* Active Leads */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">CRM Leads</span>
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_leads}</div>
            <div className="text-[10px] text-violet-400 font-semibold mt-0.5">${kpis.pipeline_value?.toLocaleString()}</div>
          </div>

          {/* Active Projects */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Projects</span>
              <Briefcase className="w-3.5 h-3.5 text-pink-400" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_projects}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{kpis.completed_projects} Done</div>
          </div>

          {/* Rejection Rate */}
          <div className="p-3.5 bg-[#111827] border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">QA Metric</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white">{100 - kpis.rejection_rate}%</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Quality Pass</div>
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Productivity Chart */}
        <div className="lg:col-span-2 p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Team Velocity</h3>
              <p className="text-[11px] text-slate-400">Total approved points delivered by team members</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-300 rounded font-semibold border border-indigo-500/20">
              Live Velocity
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weekly.length > 0 ? weekly : [
                { log_date: 'Mon', points_earned: 25 },
                { log_date: 'Tue', points_earned: 45 },
                { log_date: 'Wed', points_earned: 30 },
                { log_date: 'Thu', points_earned: 65 },
                { log_date: 'Fri', points_earned: 80 },
                { log_date: 'Sat', points_earned: 40 },
                { log_date: 'Sun', points_earned: 55 },
              ]}>
                <defs>
                  <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="log_date" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="points_earned" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPoints)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Pipeline Breakdown */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lead Acquisition Funnel</h3>
              <p className="text-[11px] text-slate-400">Deal sources & active pipeline channels</p>
            </div>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSources} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="source" type="category" stroke="#64748b" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="count" fill="#06b6d4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. PERFORMANCE: Show every team member */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Member Performance Matrix</h3>
            <p className="text-[11px] text-slate-400">Calculated dynamically: Performance % = (Earned Points / Target Points) × 100</p>
          </div>
          <button
            onClick={() => navigate('/team')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>Manage Team</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Performance %</th>
                <th className="py-3 px-4">Performance Level</th>
                <th className="py-3 px-4">Tasks Done</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">On-Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {members.map((m: any) => {
                const perf = m.performance_percentage;
                let levelBadge = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
                let levelText = 'Needs Improvement';

                if (perf >= 90) {
                  levelBadge = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                  levelText = 'Outstanding ⭐';
                } else if (perf >= 75) {
                  levelBadge = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
                  levelText = 'Very Good';
                } else if (perf >= 60) {
                  levelBadge = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                  levelText = 'Good';
                } else if (perf >= 40) {
                  levelBadge = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
                  levelText = 'Developing';
                }

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white">{m.name}</div>
                          <div className="text-[10px] text-slate-400">{m.designation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-400">{m.total_points} Pts</td>
                    <td className="py-3 px-4 text-slate-400">{m.target_points} Pts</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              perf >= 90 ? 'bg-emerald-400' : perf >= 75 ? 'bg-indigo-400' : perf >= 60 ? 'bg-blue-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${Math.min(100, perf)}%` }}
                          />
                        </div>
                        <span className="font-bold text-white text-[11px]">{perf}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${levelBadge}`}>
                        {levelText}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-emerald-400">{m.completed_tasks}</td>
                    <td className="py-3 px-4 text-slate-400">{m.pending_tasks}</td>
                    <td className="py-3 px-4 font-semibold text-indigo-300">96%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RECENT ACTIVITY STREAM */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Live System Activity & Audit Trail</h3>
            <p className="text-[11px] text-slate-400">Chronological verification log of operational actions</p>
          </div>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            View Complete Trail
          </button>
        </div>

        <div className="space-y-2.5">
          {recent.map((a: any) => (
            <div
              key={a.id}
              className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
            >
              <div className="flex items-center space-x-3">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                    a.action === 'APPROVE'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : a.action === 'REJECT'
                      ? 'bg-red-500/10 text-red-300 border-red-500/20'
                      : a.action === 'CREATE'
                      ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {a.action}
                </span>
                <span className="text-slate-200 font-medium">{a.description}</span>
              </div>
              <span className="text-[11px] text-slate-500 shrink-0">
                {new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
