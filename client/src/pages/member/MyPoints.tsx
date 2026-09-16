import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { PointTransaction, Achievement } from '../../types';
import { CelebrationModal } from '../../components/CelebrationModal';
import {
  Trophy,
  Award,
  Sparkles,
  TrendingUp,
  Clock,
  ShieldCheck,
  Star,
  CheckCircle,
} from 'lucide-react';

export const MyPoints: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<PointTransaction[]>([]);
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setLoading(true);
      const [tRes, bRes] = await Promise.all([
        api.get(`/points/transactions?user_id=${user?.id}`),
        api.get(`/achievements/user/${user?.id}`),
      ]);
      setTransactions(tRes.data);
      setBadges(bRes.data);
    } catch (err) {
      console.error('Failed to load points ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const points = user?.total_points ?? 0;
  const target = user?.target_points ?? 100;
  const perf = user?.performance_percentage ?? Math.round((points / target) * 100);

  return (
    <div className="space-y-6 pb-12">
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        userName={user?.name}
        points={points}
        performance={perf}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Points Ledger & Recognition Accolades
          </h2>
          <p className="text-xs text-slate-400">
            Immutable points audit trail awarded upon verified task deliveries and approved daily reports.
          </p>
        </div>

        {perf >= 100 && (
          <button
            onClick={() => setShowCelebration(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Celebrate 100% Milestone 🎉</span>
          </button>
        )}
      </div>

      {/* Points Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-[#111827] border border-amber-500/30 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Total Points Balance</span>
            <div className="text-3xl font-black text-amber-400">{points} Pts</div>
            <span className="text-xs text-slate-500 mt-1 block">Cumulative verified output</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Trophy className="w-8 h-8" />
          </div>
        </div>

        <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Score</span>
            <div className="text-3xl font-black text-white">{target} Pts</div>
            <span className="text-xs text-slate-500 mt-1 block">Monthly achievement baseline</span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-8 h-8" />
          </div>
        </div>

        <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Performance %</span>
            <div className="text-3xl font-black text-emerald-400">{perf}%</div>
            <span className="text-xs text-emerald-400 font-semibold mt-1 block">
              {perf >= 100 ? '100% Club Milestone Achieved!' : `${100 - perf}% to reach 100%`}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Award className="w-8 h-8" />
          </div>
        </div>
      </div>

      {/* Earned Badges */}
      <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          My Unlocked Accolades & Badges
        </h3>

        {badges.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
            Complete high priority tasks and exceed deadlines to earn honorary badges.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-4 bg-slate-900 border border-amber-500/30 rounded-xl flex items-center space-x-3 text-xs"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{b.title}</h4>
                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Point Transaction Ledger */}
      <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
          Point Transaction Statement
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Reason / Milestone</th>
                <th className="py-3 px-4">Approved By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`font-black px-2 py-0.5 rounded text-xs ${
                        tx.points >= 0
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}
                    >
                      {tx.points >= 0 ? `+${tx.points}` : tx.points}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-200 font-medium">{tx.reason}</td>
                  <td className="py-3 px-4 text-slate-400">{tx.admin_name || 'System / Auto'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
