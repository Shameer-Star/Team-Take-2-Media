import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { PointRule, User } from '../../types';
import { Sliders, Plus, Check, Award, ShieldAlert, Sparkles } from 'lucide-react';

export const PointRulesSettings: React.FC = () => {
  const [rules, setRules] = useState<PointRule[]>([]);
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual point grant state
  const [targetUserId, setTargetUserId] = useState('');
  const [pointsDelta, setPointsDelta] = useState('10');
  const [manualReason, setManualReason] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rRes, uRes] = await Promise.all([
        api.get('/points/rules'),
        api.get('/users'),
      ]);
      setRules(rRes.data);
      setMembers(uRes.data);
    } catch (err) {
      console.error('Failed to load rules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRuleDelta = async (ruleId: string, newDelta: number) => {
    try {
      await api.put(`/points/rules/${ruleId}`, { points_delta: newDelta });
      setFeedback('Point rule updated successfully');
      loadData();
      setTimeout(() => setFeedback(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update rule');
    }
  };

  const handleManualPoints = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId || !manualReason.trim()) {
      alert('Please select a member and provide an audit reason');
      return;
    }

    try {
      setManualLoading(true);
      await api.post('/points/manual', {
        user_id: targetUserId,
        points: parseInt(pointsDelta, 10),
        reason: manualReason.trim(),
      });
      setFeedback('Manual points adjustment successfully recorded in ledger!');
      setManualReason('');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to log point transaction');
    } finally {
      setManualLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-400" />
          Configurable Point System & Company Gamification
        </h2>
        <p className="text-xs text-slate-400">
          Point adjustments are strictly additive ledger transactions and dynamically computed.
        </p>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <Sparkles className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rules Table */}
        <div className="lg:col-span-2 p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
            Active System Point Rules
          </h3>

          <div className="space-y-2.5">
            {rules.map((rule) => (
              <div
                key={rule.id}
                className="p-3.5 bg-slate-900/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>{rule.name}</span>
                    <span className="text-[10px] text-slate-500 font-mono">({rule.rule_key})</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{rule.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`font-black text-sm px-2.5 py-0.5 rounded-lg border ${
                      rule.points_delta >= 0
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {rule.points_delta >= 0 ? `+${rule.points_delta}` : rule.points_delta}
                  </span>

                  <input
                    type="number"
                    defaultValue={rule.points_delta}
                    onBlur={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val !== rule.points_delta) {
                        handleUpdateRuleDelta(rule.id, val);
                      }
                    }}
                    className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white text-center focus:outline-none"
                    title="Edit point delta"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manual Point Granting / Deduction */}
        <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
            Discretionary Point Adjustment
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Record bonus points for extraordinary contribution, or manual deductions with mandatory audit rationale.
          </p>

          <form onSubmit={handleManualPoints} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Member</label>
              <select
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                required
              >
                <option value="">Select Member...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.total_points ?? 0} Pts)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Points Delta (+ or -)</label>
              <input
                type="number"
                value={pointsDelta}
                onChange={(e) => setPointsDelta(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Rationale</label>
              <textarea
                rows={3}
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="e.g. Exceptional leadership during client product demonstration."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={manualLoading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {manualLoading ? 'Recording...' : 'Record Point Adjustment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
