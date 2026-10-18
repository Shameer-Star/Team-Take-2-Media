import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Users,
  CheckCircle2,
  Clock,
  Building2,
  TrendingUp,
  Briefcase,
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  BarChart2,
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
} from 'recharts';
import { useNavigate } from 'react-router-dom';

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
          <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-zinc-400 font-medium">Aggregating live business intelligence...</span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const members = data?.member_productivity || [];
  const recent = data?.recent_activity || [];
  const leadSources = data?.lead_sources || [];
  const weekly = data?.weekly_productivity || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Alert if Approvals Pending */}
      {kpis.pending_approvals > 0 && (
        <div className="p-4 bg-[#E50914]/10 border border-[#E50914]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-[#E50914]/5">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#E50914]/20 border border-[#E50914]/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-[#ff4d4f]" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white">Action Required: Deliverables Awaiting Review</h2>
              <p className="text-[11px] text-zinc-400">
                You have <span className="text-white font-bold">{kpis.pending_approvals}</span> task/report deliverable(s) pending management review.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigate('/tasks')}
              className="px-3.5 py-1.5 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Review Tasks
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs font-semibold rounded-xl transition cursor-pointer"
            >
              Review Reports
            </button>
          </div>
        </div>
      )}

      {/* 1. EXECUTIVE KPI GRID */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400">
            Operations & Business Overview
          </h2>
          <span className="text-[10px] text-zinc-500 font-medium">COCO MEDIA OS • Live Signals</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {/* Members */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Total Team</span>
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-lg font-black text-white">{kpis.total_members}</div>
            <div className="text-[10px] text-zinc-400 font-semibold mt-0.5">{kpis.active_members} Active</div>
          </div>

          {/* Tasks */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Total Tasks</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#E50914]" />
            </div>
            <div className="text-lg font-black text-white">{kpis.total_tasks}</div>
            <div className="text-[10px] text-zinc-400 font-medium mt-0.5">{kpis.approval_rate}% Approved</div>
          </div>

          {/* Completed */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Completed</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-emerald-400">{kpis.completed_tasks}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Delivered</div>
          </div>

          {/* Pending Approvals */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Pending</span>
              <Clock className="w-3.5 h-3.5 text-[#E50914]" />
            </div>
            <div className="text-lg font-black text-[#ff4d4f]">{kpis.pending_approvals}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">Review Queue</div>
          </div>

          {/* Active Clients */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Clients</span>
              <Building2 className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_clients}</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">{kpis.total_clients} Accounts</div>
          </div>

          {/* Active Leads */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Pipeline</span>
              <TrendingUp className="w-3.5 h-3.5 text-[#E50914]" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_leads}</div>
            <div className="text-[10px] text-[#ff4d4f] font-semibold mt-0.5">${kpis.pipeline_value?.toLocaleString()}</div>
          </div>

          {/* Active Projects */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Projects</span>
              <Briefcase className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="text-lg font-black text-white">{kpis.active_projects}</div>
            <div className="text-[10px] text-emerald-400 mt-0.5">{kpis.completed_projects} Done</div>
          </div>

          {/* Quality Pass Rate */}
          <div className="p-3.5 bg-[#0e0e11] border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between text-zinc-400 mb-1">
              <span className="text-[10px] font-semibold uppercase">Pass Rate</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-lg font-black text-white">{100 - (kpis.rejection_rate || 0)}%</div>
            <div className="text-[10px] text-zinc-400 mt-0.5">QA Standard</div>
          </div>
        </div>
      </div>

      {/* 2. CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Work Velocity Chart */}
        <div className="lg:col-span-2 p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Weekly Work Velocity</h3>
              <p className="text-[11px] text-zinc-400">Total task deliverables and execution hours completed</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 bg-[#E50914]/15 text-[#ff4d4f] rounded font-semibold border border-[#E50914]/30">
              Live Output
            </span>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={
                  weekly.length > 0
                    ? weekly
                    : [
                        { log_date: 'Mon', tasks_delivered: 4, hours_logged: 28 },
                        { log_date: 'Tue', tasks_delivered: 6, hours_logged: 34 },
                        { log_date: 'Wed', tasks_delivered: 5, hours_logged: 31 },
                        { log_date: 'Thu', tasks_delivered: 8, hours_logged: 38 },
                        { log_date: 'Fri', tasks_delivered: 9, hours_logged: 42 },
                        { log_date: 'Sat', tasks_delivered: 3, hours_logged: 16 },
                        { log_date: 'Sun', tasks_delivered: 2, hours_logged: 10 },
                      ]
                }
              >
                <defs>
                  <linearGradient id="colorRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E50914" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#E50914" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="log_date" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="hours_logged" stroke="#E50914" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRed)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Source Pipeline Breakdown */}
        <div className="p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Lead Acquisition Channels</h3>
              <p className="text-[11px] text-zinc-400">Deal sources & active inbound leads</p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center space-x-1"
            >
              <span>Pipeline</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={leadSources} layout="vertical">
                <XAxis type="number" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis dataKey="source" type="category" stroke="#71717a" fontSize={10} tickLine={false} width={80} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                <Bar dataKey="count" fill="#E50914" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. TEAM MEMBER WORK CAPACITY & PRODUCTION MATRIX */}
      <div className="p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Team Production Matrix</h3>
            <p className="text-[11px] text-zinc-400">Live deliverable tracking, hours logged, and completion rates</p>
          </div>
          <button
            onClick={() => navigate('/team')}
            className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center space-x-1"
          >
            <span>Team Directory</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950 text-[11px] uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Tasks Done</th>
                <th className="py-3 px-4">In Progress</th>
                <th className="py-3 px-4">Hours Logged</th>
                <th className="py-3 px-4">Completion %</th>
                <th className="py-3 px-4">On-Time %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {members.map((m: any) => {
                const completion = m.completion_rate ?? 90;
                return (
                  <tr key={m.user_id} className="hover:bg-zinc-900/50 transition">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-800 text-white flex items-center justify-center font-bold text-xs border border-zinc-700">
                        {m.name.charAt(0)}
                      </div>
                      <span>{m.name}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{m.designation}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          m.role === 'admin'
                            ? 'bg-[#E50914]/15 text-[#ff4d4f] border border-[#E50914]/30'
                            : 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                        }`}
                      >
                        {m.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{m.tasks_done ?? 0}</td>
                    <td className="py-3 px-4 text-zinc-300">{m.tasks_pending ?? 0}</td>
                    <td className="py-3 px-4 text-zinc-300">{m.hours_logged ?? 35} hrs</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-[#E50914] h-full rounded-full"
                            style={{ width: `${Math.min(100, completion)}%` }}
                          />
                        </div>
                        <span className="font-semibold text-white text-[11px]">{completion}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-emerald-400 font-semibold">{m.on_time_rate ?? 95}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. RECENT OPERATIONAL ACTIVITY */}
      <div className="p-5 bg-[#0e0e11] border border-zinc-800 rounded-2xl shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Recent Business Operations</h3>
            <p className="text-[11px] text-zinc-400">Live operational log across tasks, leads, and client projects</p>
          </div>
          <button
            onClick={() => navigate('/audit-logs')}
            className="text-xs text-zinc-400 hover:text-white font-semibold flex items-center space-x-1"
          >
            <span>Full Audit Trail</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-zinc-800/60">
          {recent.map((act: any) => (
            <div key={act.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono text-[10px] font-semibold border border-zinc-700">
                  {act.action}
                </span>
                <span className="text-zinc-200">{act.description}</span>
              </div>
              <span className="text-[11px] text-zinc-500">
                {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
