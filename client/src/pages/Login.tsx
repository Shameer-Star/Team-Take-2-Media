import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Shield, ArrowRight, Lock, Mail, Users, CheckCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setForgotMsg(false);

      const res = await api.post('/auth/login', {
        email: email.trim(),
        password,
      });

      login(res.data.token, res.data.user);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials or login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
    setForgotMsg(false);
  };

  return (
    <div className="min-h-screen bg-[#070A12] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* Brand Badge */}
        <div className="inline-flex items-center justify-center space-x-2.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mb-6 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">Take Two OS • Enterprise v1.0</span>
        </div>

        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-600/30">
            T2
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black text-white tracking-wider">TAKE TWO MEDIA</h2>
            <p className="text-[10px] tracking-widest uppercase font-bold text-indigo-400">
              Operations & Management OS
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-2 font-medium italic">
          "One Workspace. One Team. Complete Control."
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#0F172A]/90 backdrop-blur-xl border border-slate-800 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl shadow-black/60">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <span>{error}</span>
              </div>
            )}

            {forgotMsg && (
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs rounded-xl flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>To reset your password, please contact an administrator (Naveed, Shameer, or Rayyan) to issue an instant reset.</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@taketwomedia.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Switcher Section */}
          <div className="mt-6 pt-6 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-400" />
                Demo Credentials (1-Click)
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                Admin Roles
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('naveed@taketwomedia.com', 'Naveed123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-indigo-400">Naveed</div>
                  <div className="text-[9px] text-amber-400">Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('shameer@taketwomedia.com', 'Shameer123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-indigo-400">Shameer</div>
                  <div className="text-[9px] text-amber-400">Admin</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('rayyan@taketwomedia.com', 'Rayyan123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-indigo-400">Rayyan</div>
                  <div className="text-[9px] text-amber-400">Admin</div>
                </button>
              </div>

              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider pt-2">
                Team Members
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('hameed@taketwomedia.com', 'Hameed123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-emerald-400">Hameed</div>
                  <div className="text-[9px] text-emerald-400">Dev (110%)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('sathar@taketwomedia.com', 'Sathar123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-emerald-400">Sathar</div>
                  <div className="text-[9px] text-emerald-400">UI/UX (82%)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('asfar@taketwomedia.com', 'Asfar123.')}
                  className="p-2 text-left bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition group"
                >
                  <div className="font-bold text-[11px] group-hover:text-emerald-400">Asfar</div>
                  <div className="text-[9px] text-emerald-400">Video (67%)</div>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 text-xs text-slate-500">
          Protected by Take Two Media RBAC & ISO-27001 compliant security controls.
        </div>
      </div>
    </div>
  );
};
