import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Achievement } from '../types';
import { X, Sparkles, Trophy } from 'lucide-react';

interface BadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  selectedUserId?: string;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  selectedUserId = '',
}) => {
  const [userId, setUserId] = useState(selectedUserId);
  const [achievementId, setAchievementId] = useState('');
  const [reason, setReason] = useState('');
  const [members, setMembers] = useState<User[]>([]);
  const [badges, setBadges] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setUserId(selectedUserId);
      Promise.all([api.get('/users'), api.get('/achievements')])
        .then(([uRes, aRes]) => {
          setMembers(uRes.data);
          setBadges(aRes.data);
          if (aRes.data.length > 0 && !achievementId) {
            setAchievementId(aRes.data[0].id);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, selectedUserId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !achievementId) {
      setError('Please select both a team member and an achievement badge');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/achievements/award', {
        user_id: userId,
        achievement_id: achievementId,
        reason: reason.trim() || 'Outstanding performance and high company standard',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to award badge');
    } finally {
      setLoading(false);
    }
  };

  const selectedBadge = badges.find(b => b.id === achievementId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#111827] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3 text-amber-400">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Award Team Badge</h3>
              <p className="text-xs text-slate-400">Take Two Media Recognition System</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Select Team Member <span className="text-amber-400">*</span>
            </label>
            <select
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              required
            >
              <option value="">Select Member...</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.designation || m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Choose Badge <span className="text-amber-400">*</span>
            </label>
            <select
              value={achievementId}
              onChange={(e) => setAchievementId(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
              required
            >
              {badges.map((b) => (
                <option key={b.id} value={b.id}>
                  🏆 {b.title} (+{b.points_reward} Pts bonus)
                </option>
              ))}
            </select>
          </div>

          {selectedBadge && (
            <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-xs text-amber-200/90 leading-relaxed">
              <span className="font-semibold">{selectedBadge.title}:</span> {selectedBadge.description}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Award Citation / Reason</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. For delivering flawless checkout code 3 days ahead of launch date."
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-400/20 transition disabled:opacity-50 flex items-center space-x-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Awarding...' : 'Award Badge'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
