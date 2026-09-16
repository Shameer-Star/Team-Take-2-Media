import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Achievement } from '../../types';
import { BadgeModal } from '../../components/BadgeModal';
import {
  Trophy,
  Sparkles,
  Award,
  Zap,
  Star,
  Cpu,
  Users,
  ShieldCheck,
  Crown,
  Plus,
} from 'lucide-react';

export const AchievementsPage: React.FC = () => {
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const res = await api.get('/achievements');
      setBadges(res.data);
    } catch (err) {
      console.error('Failed to load badges:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'Trophy':
        return <Trophy className="w-7 h-7 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-7 h-7 text-yellow-400" />;
      case 'Award':
        return <Award className="w-7 h-7 text-cyan-400" />;
      case 'Star':
        return <Star className="w-7 h-7 text-purple-400" />;
      case 'Cpu':
        return <Cpu className="w-7 h-7 text-indigo-400" />;
      case 'Users':
        return <Users className="w-7 h-7 text-blue-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-7 h-7 text-emerald-400" />;
      case 'Crown':
        return <Crown className="w-7 h-7 text-amber-300" />;
      default:
        return <Award className="w-7 h-7 text-indigo-400" />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            Badges & Recognition Catalog
          </h2>
          <p className="text-xs text-slate-400">
            Honors celebrating speed, consistency, technical brilliance, and milestone records.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:opacity-95 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Award Badge to Member</span>
        </button>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl">
          {feedback}
        </div>
      )}

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {badges.map((b) => (
          <div
            key={b.id}
            className="p-5 bg-[#111827] border border-slate-800 hover:border-amber-500/40 rounded-2xl transition shadow-xl flex flex-col justify-between group"
          >
            <div>
              <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                {getBadgeIcon(b.icon_name)}
              </div>

              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-black text-white">{b.title}</h3>
                <span className="text-[10px] font-black text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  +{b.points_reward} Pts
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed mb-4">{b.description}</p>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-800 transition"
            >
              Award This Badge
            </button>
          </div>
        ))}
      </div>

      <BadgeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setFeedback('Badge awarded successfully!');
          setTimeout(() => setFeedback(''), 4000);
        }}
      />
    </div>
  );
};
