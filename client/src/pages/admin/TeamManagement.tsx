import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { User, Achievement } from '../../types';
import { BadgeModal } from '../../components/BadgeModal';
import {
  Users,
  UserPlus,
  Key,
  Shield,
  ShieldOff,
  Edit2,
  Award,
  CheckCircle,
  Clock,
  ChevronRight,
  X,
  ExternalLink,
} from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals & Drawers
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'team_member'>('team_member');
  const [designation, setDesignation] = useState('');
  const [phone, setPhone] = useState('');
  const [targetPoints, setTargetPoints] = useState('100');
  const [newPassword, setNewPassword] = useState('');
  const [actionUserId, setActionUserId] = useState('');
  const [modalError, setModalError] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setMembers(res.data);
    } catch (err) {
      console.error('Failed to load team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenProfile = async (id: string) => {
    try {
      setProfileLoading(true);
      const res = await api.get(`/users/${id}`);
      setSelectedMember(res.data);
    } catch (err) {
      console.error('Failed to load member profile:', err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const res = await api.patch(`/users/${user.id}/toggle-status`);
      setFeedbackMsg(res.data.message);
      loadMembers();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to toggle status');
    }
  };

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalError('');
      await api.post('/users', {
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        designation: designation.trim(),
        phone: phone.trim(),
        target_points: parseInt(targetPoints, 10) || 100,
      });
      setShowAddModal(false);
      setFeedbackMsg(`Successfully created team member ${name}!`);
      loadMembers();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to create member');
    }
  };

  const handleEditMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setModalError('');
      await api.put(`/users/${actionUserId}`, {
        name: name.trim(),
        email: email.trim(),
        role,
        designation: designation.trim(),
        phone: phone.trim(),
        target_points: parseInt(targetPoints, 10) || 100,
      });
      setShowEditModal(false);
      setFeedbackMsg('Team member updated successfully!');
      loadMembers();
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to update member');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setModalError('Password must be at least 6 characters');
      return;
    }
    try {
      setModalError('');
      await api.post(`/users/${actionUserId}/reset-password`, {
        newPassword,
      });
      setShowResetModal(false);
      setFeedbackMsg('Password reset successfully!');
      setTimeout(() => setFeedbackMsg(''), 3000);
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Failed to reset password');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-slate-300">
            Team Take Two Media Roster
          </h2>
          <p className="text-xs text-slate-400">
            Manage roles, passwords, point targets, and review detailed operational profiles.
          </p>
        </div>

        <button
          onClick={() => {
            setName('');
            setEmail('');
            setPassword('');
            setDesignation('');
            setPhone('');
            setRole('team_member');
            setTargetPoints('100');
            setModalError('');
            setShowAddModal(true);
          }}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Team Member</span>
        </button>
      </div>

      {feedbackMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Members Grid / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {members.map((u) => {
          const perf = u.performance_percentage ?? 0;
          return (
            <div
              key={u.id}
              className={`p-5 bg-[#111827] border rounded-2xl flex flex-col justify-between transition relative overflow-hidden shadow-lg ${
                u.is_active === 0 ? 'border-red-500/30 opacity-60' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-sm">
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {u.name}
                        {u.is_active === 0 && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-red-500/20 text-red-400 rounded">Inactive</span>
                        )}
                      </h3>
                      <p className="text-[10px] text-slate-400 truncate max-w-[130px]">{u.designation || u.role}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      u.role === 'admin'
                        ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {u.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 space-y-1 mb-4">
                  <div className="truncate">{u.email}</div>
                  <div className="text-[10px] text-slate-500">{u.phone || 'No phone recorded'}</div>
                </div>

                {/* Score & Progress */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80 mb-4">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-400">Total Points</span>
                    <span className="font-black text-amber-400">{u.total_points ?? 0} Pts</span>
                  </div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-slate-400">Target Score</span>
                    <span className="text-slate-300 font-semibold">{u.target_points} Pts</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        perf >= 90 ? 'bg-emerald-400' : perf >= 75 ? 'bg-indigo-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min(100, perf)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[10px]">
                    <span className="text-slate-500">Performance</span>
                    <span className="font-bold text-white">{perf}%</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 grid grid-cols-4 gap-1">
                <button
                  onClick={() => handleOpenProfile(u.id)}
                  title="View Full Profile"
                  className="p-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                >
                  <Users className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setActionUserId(u.id);
                    setName(u.name);
                    setEmail(u.email);
                    setDesignation(u.designation || '');
                    setPhone(u.phone || '');
                    setRole(u.role);
                    setTargetPoints(String(u.target_points || 100));
                    setModalError('');
                    setShowEditModal(true);
                  }}
                  title="Edit Member"
                  className="p-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    setActionUserId(u.id);
                    setNewPassword('');
                    setModalError('');
                    setShowResetModal(true);
                  }}
                  title="Reset Password"
                  className="p-2 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleToggleStatus(u)}
                  title={u.is_active === 1 ? 'Disable Member' : 'Activate Member'}
                  className={`p-2 flex items-center justify-center rounded-lg transition ${
                    u.is_active === 1
                      ? 'bg-red-500/10 hover:bg-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {u.is_active === 1 ? <ShieldOff className="w-3.5 h-3.5" /> : <Shield className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Member Profile Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-black text-xl">
                  {selectedMember.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedMember.name}
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {selectedMember.role}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedMember.designation} • {selectedMember.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Points Earned</span>
                <div className="text-lg font-black text-amber-400">{selectedMember.total_points} Pts</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Performance</span>
                <div className="text-lg font-black text-emerald-400">{selectedMember.performance_percentage}%</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Tasks Logged</span>
                <div className="text-lg font-black text-white">{selectedMember.tasks?.length || 0}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Badges Earned</span>
                <div className="text-lg font-black text-indigo-300">{selectedMember.badges?.length || 0}</div>
              </div>
            </div>

            {/* Badges / Accolades */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Achievements & Badges</h4>
                <button
                  onClick={() => {
                    setActionUserId(selectedMember.id);
                    setShowBadgeModal(true);
                  }}
                  className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold"
                >
                  + Award Badge
                </button>
              </div>

              {selectedMember.badges?.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No badges awarded yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedMember.badges?.map((b: any) => (
                    <div
                      key={b.id}
                      className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center space-x-2 text-xs text-amber-300"
                    >
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">{b.title}</span>
                      <span className="text-[10px] text-slate-400">({b.awarded_reason})</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Tasks */}
            <div className="mb-6">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Assigned Tasks</h4>
              <div className="space-y-1.5">
                {selectedMember.tasks?.slice(0, 5).map((t: any) => (
                  <div key={t.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-white">{t.title}</span>
                      <span className="text-[10px] text-slate-400 ml-2">({t.client_name || 'Internal'})</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-indigo-300">
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Point Transaction History */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Points Ledger</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {selectedMember.transactions?.map((tx: any) => (
                  <div key={tx.id} className="p-2 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-[11px]">
                    <span className="text-slate-300">{tx.reason}</span>
                    <span className={`font-black ${tx.points >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.points >= 0 ? `+${tx.points}` : tx.points} Pts
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Create New Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="mt-4 space-y-3">
              {modalError && <div className="p-2.5 bg-red-500/10 text-red-400 text-xs rounded-lg">{modalError}</div>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Tariq Vance"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Work Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@taketwomedia.com"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Points</label>
                  <input
                    type="number"
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Visual Designer"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555-019-2831"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md"
                >
                  Create Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">Edit Team Member</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditMember} className="mt-4 space-y-3">
              {modalError && <div className="p-2.5 bg-red-500/10 text-red-400 text-xs rounded-lg">{modalError}</div>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Points</label>
                  <input
                    type="number"
                    value={targetPoints}
                    onChange={(e) => setTargetPoints(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Designation</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-[#111827] border border-amber-500/30 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-amber-400">
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4" /> Reset Member Password
              </h3>
              <button onClick={() => setShowResetModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="mt-4 space-y-3">
              {modalError && <div className="p-2.5 bg-red-500/10 text-red-400 text-xs rounded-lg">{modalError}</div>}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">New Secure Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-md"
                >
                  Set Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Award Badge Modal */}
      <BadgeModal
        isOpen={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
        selectedUserId={actionUserId}
        onSuccess={() => {
          setFeedbackMsg('Badge successfully awarded!');
          loadMembers();
          if (selectedMember) handleOpenProfile(selectedMember.id);
        }}
      />
    </div>
  );
};
