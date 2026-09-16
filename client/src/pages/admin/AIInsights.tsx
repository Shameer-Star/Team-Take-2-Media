import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  Sparkles,
  Zap,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  BrainCircuit,
  ArrowRight,
} from 'lucide-react';

export const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai-insights');
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="p-6 bg-gradient-to-r from-indigo-950 via-[#111827] to-[#0B0F19] border border-indigo-500/30 rounded-2xl relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xs uppercase tracking-widest mb-2">
          <BrainCircuit className="w-4 h-4" />
          <span>TAKE TWO OS • AI Intelligence Engine (V1 Foundation)</span>
        </div>

        <h2 className="text-xl font-black text-white tracking-tight mb-2">
          Predictive Operational & Growth Insights
        </h2>
        <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
          The database and APIs are pre-architected for automated predictive analysis, task delivery estimation, and lead conversion probability models.
        </p>

        <div className="flex flex-wrap items-center gap-3 mt-4 text-[11px]">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
            Vector Embeddings Ready
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
            LLM Pipeline Interface Standby
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
            Relational DB Telemetry Connected
          </span>
        </div>
      </div>

      {/* Real-time Predictive Signals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((item) => (
          <div
            key={item.id}
            className="p-5 bg-[#111827] border border-slate-800 hover:border-indigo-500/40 rounded-2xl transition shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                {item.category}
              </span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase border ${
                  item.impact === 'Positive'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : item.impact === 'Warning'
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                }`}
              >
                {item.confidence} Confidence
              </span>
            </div>

            <h3 className="text-sm font-bold text-white tracking-tight">{item.title}</h3>
            <p className="text-xs text-slate-300 leading-relaxed">{item.insight}</p>

            <div className="pt-3 border-t border-slate-800 flex items-start space-x-2 text-[11px] text-indigo-300">
              <Zap className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span>
                <strong>Action Recommendation:</strong> {item.action_recommendation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
