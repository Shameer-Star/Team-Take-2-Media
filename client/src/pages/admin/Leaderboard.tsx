import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LeaderboardEntry } from '../../types';
import { Award, Trophy, Star, Shield, Flame, CheckCircle2 } from 'lucide-react';

export const Leaderboard: React.FC = () => {
  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await api.get('/points/leaderboard');
      setBoard(res.data);
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Company Performance Leaderboard
          </h2>
          <p className="text-xs text-slate-400">
            Ranked live by cumulative points earned through approved tasks, early deliveries, and reports.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[11px] text-emerald-400 font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Real-time Calculation Engine
          </span>
        </div>
      </div>

      {/* Top 3 Podium Cards */}
      {board.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
          {/* Rank 2 (Silver) */}
          <div className="p-6 bg-gradient-to-b from-slate-900 to-[#111827] border border-slate-700/80 rounded-2xl text-center flex flex-col justify-between shadow-xl order-2 md:order-1">
            <div>
              <span className="text-3xl mb-1 block">🥈</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank 2 • Silver</span>
              <h3 className="text-base font-black text-white mt-2">{board[1].name}</h3>
              <p className="text-[11px] text-slate-400">{board[1].designation || board[1].role}</p>
            </div>
            <div className="my-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-2xl font-black text-amber-400">{board[1].points} Pts</div>
              <div className="text-[11px] text-indigo-300 font-semibold">{board[1].performance_percentage}% Performance</div>
            </div>
            <div className="text-[11px] text-slate-400">
              Tasks Completed: <strong className="text-white">{board[1].tasks_completed}</strong>
            </div>
          </div>

          {/* Rank 1 (Gold Champion) */}
          <div className="p-6 bg-gradient-to-b from-[#1E1B4B] to-[#111827] border border-amber-500/40 rounded-2xl text-center flex flex-col justify-between shadow-2xl shadow-amber-500/10 order-1 md:order-2 scale-105 transform">
            <div>
              <span className="text-4xl mb-1 block animate-bounce">🥇</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                Performance Champion
              </span>
              <h3 className="text-lg font-black text-white mt-2">{board[0].name}</h3>
              <p className="text-[11px] text-indigo-300 font-medium">{board[0].designation || board[0].role}</p>
            </div>
            <div className="my-4 p-3 bg-slate-900/90 rounded-xl border border-amber-500/30">
              <div className="text-3xl font-black text-amber-400">{board[0].points} Pts</div>
              <div className="text-xs text-emerald-400 font-bold">{board[0].performance_percentage}% Performance</div>
            </div>
            <div className="text-[11px] text-slate-400">
              Tasks Completed: <strong className="text-white">{board[0].tasks_completed}</strong>
            </div>
          </div>

          {/* Rank 3 (Bronze) */}
          <div className="p-6 bg-gradient-to-b from-slate-900 to-[#111827] border border-amber-800/40 rounded-2xl text-center flex flex-col justify-between shadow-xl order-3">
            <div>
              <span className="text-3xl mb-1 block">🥉</span>
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Rank 3 • Bronze</span>
              <h3 className="text-base font-black text-white mt-2">{board[2].name}</h3>
              <p className="text-[11px] text-slate-400">{board[2].designation || board[2].role}</p>
            </div>
            <div className="my-4 p-3 bg-slate-900/90 rounded-xl border border-slate-800">
              <div className="text-2xl font-black text-amber-400">{board[2].points} Pts</div>
              <div className="text-[11px] text-indigo-300 font-semibold">{board[2].performance_percentage}% Performance</div>
            </div>
            <div className="text-[11px] text-slate-400">
              Tasks Completed: <strong className="text-white">{board[2].tasks_completed}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Leaderboard Full Table */}
      <div className="p-5 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">Team Member</th>
                <th className="py-3 px-4">Points</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Performance %</th>
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Tasks Done</th>
                <th className="py-3 px-4">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {board.map((m) => {
                let badgeClass = 'bg-rose-500/10 text-rose-300 border-rose-500/20';
                if (m.performance_percentage >= 90) badgeClass = 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
                else if (m.performance_percentage >= 75) badgeClass = 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30';
                else if (m.performance_percentage >= 60) badgeClass = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
                else if (m.performance_percentage >= 40) badgeClass = 'bg-amber-500/15 text-amber-300 border-amber-500/30';

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-black text-sm">
                      {getRankMedal(m.rank)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white">{m.name}</span>
                          <span className="text-[10px] text-slate-400 block">{m.designation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-black text-amber-400 text-sm">{m.points} Pts</td>
                    <td className="py-3 px-4 text-slate-400">{m.target_points} Pts</td>
                    <td className="py-3 px-4 font-bold text-white">{m.performance_percentage}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                        {m.performance_level}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-emerald-400">{m.tasks_completed}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-1">
                        {m.achievements?.slice(0, 3).map((a) => (
                          <span
                            key={a.id}
                            title={a.title}
                            className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] font-medium"
                          >
                            🏆 {a.title}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
