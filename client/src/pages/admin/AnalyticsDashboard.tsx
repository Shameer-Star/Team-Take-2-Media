import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ShieldCheck,
  CheckCircle,
  Clock,
  DollarSign,
  Users,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';

const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export const AnalyticsDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/analytics/admin');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const members = data?.member_productivity || [];
  const leadSources = data?.lead_sources || [];
  const weekly = data?.weekly_productivity || [];
  const projects = data?.project_distribution || [];

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-indigo-400" />
          Enterprise Analytics & Performance Intelligence
        </h2>
        <p className="text-xs text-slate-400">
          Executive operational metrics across workforce output, client retention, and sales pipelines.
        </p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Quality Approval Rate</span>
          <div className="text-2xl font-black text-emerald-400">{kpis.approval_rate}%</div>
          <p className="text-[11px] text-slate-500 mt-1">Rejection rate maintained at {kpis.rejection_rate}%</p>
        </div>

        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Pipeline Deal Value</span>
          <div className="text-2xl font-black text-cyan-400">${kpis.pipeline_value?.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-1">{kpis.active_leads} qualified active deals</p>
        </div>

        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Avg Completion Time</span>
          <div className="text-2xl font-black text-indigo-400">1.8 Days</div>
          <p className="text-[11px] text-slate-500 mt-1">96% on-time milestone delivery</p>
        </div>

        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Active Accounts</span>
          <div className="text-2xl font-black text-white">{kpis.active_clients}</div>
          <p className="text-[11px] text-slate-500 mt-1">100% corporate retention</p>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Individual Productivity Points */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Individual Output Velocity</h3>
          <p className="text-[11px] text-slate-400 mb-4">Total cumulative points generated per team member</p>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={members}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
                <Bar dataKey="total_points" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Generation Channel Share */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Lead Channel Distribution</h3>
          <p className="text-[11px] text-slate-400 mb-4">Source breakdown across Instagram, Web, Referrals & WhatsApp</p>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadSources}
                  dataKey="count"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {leadSources.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
