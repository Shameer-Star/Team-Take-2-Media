import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, Lock, Key, Shield, CheckCircle2, Sparkles } from 'lucide-react';

export const MyProfile: React.FC = () => {
  const { user, refreshProfile } = useAuth();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setError('Please fill in both current and new password');
      return;
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setFeedback('Password successfully changed!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setFeedback(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      <div>
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
          Personal Profile & Security Settings
        </h2>
        <p className="text-xs text-slate-400">
          Manage your account credentials, security preferences, and personal details.
        </p>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white font-black text-xl flex items-center justify-center shadow-lg shadow-indigo-600/30">
              {user?.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {user?.name}
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  {user?.role}
                </span>
              </h3>
              <p className="text-xs text-slate-400">{user?.designation || 'Team Take Two Media Specialist'}</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
              <span className="text-white font-medium">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Performance Target</span>
              <span className="text-white font-medium">{user?.target_points} Points Baseline</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Account Access Tier</span>
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
                {user?.role === 'admin' ? 'Administrator (Full Access)' : 'Team Member (Verified)'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="p-6 bg-[#111827] border border-slate-800 rounded-2xl shadow-xl">
          <div className="flex items-center space-x-2 text-white font-bold text-xs uppercase tracking-wider mb-4">
            <Lock className="w-4 h-4 text-indigo-400" />
            <span>Update Account Password</span>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
