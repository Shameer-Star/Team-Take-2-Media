import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CocoLogo } from '../components/CocoLogo';
import { ArrowRight, Lock, Mail, CheckCircle } from 'lucide-react';

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
      setError('Please enter both work email and password.');
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

      if (!res.data || !res.data.token || !res.data.user) {
        throw new Error('Authentication response incomplete.');
      }

      login(res.data.token, res.data.user);

      if (res.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/member');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        'Invalid work email or password. Access is restricted to authorized personnel.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience: Signature Red & White glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#E50914]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[380px] h-[380px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        {/* Brand Emblem */}
        <div className="flex flex-col items-center justify-center mb-6">
          <CocoLogo variant="full" size="xl" theme="dark" className="drop-shadow-2xl mb-2" />
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[10px] text-zinc-400 mt-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
            <span className="font-bold tracking-wider uppercase text-zinc-300">
              Operations & Management OS
            </span>
          </div>
        </div>

        <p className="text-xs text-zinc-400 font-medium italic">
          "One Workspace. Business Focused. Complete Control."
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-[#0e0e11]/95 backdrop-blur-2xl border border-zinc-800/90 py-8 px-6 sm:px-10 rounded-2xl shadow-2xl shadow-black">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl flex items-center space-x-2">
                <span>{error}</span>
              </div>
            )}

            {forgotMsg && (
              <div className="p-3 bg-zinc-800/80 border border-zinc-700 text-zinc-300 text-xs rounded-xl flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-[#E50914] shrink-0 mt-0.5" />
                <span>To reset your password, contact an administrator (Naveed, Shameer, or Rayyan).</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@cocomedia.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setForgotMsg(true)}
                  className="text-[11px] text-zinc-400 hover:text-white font-medium transition cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/90 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#E50914] focus:ring-1 focus:ring-[#E50914] transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-[#E50914] hover:bg-[#ff1723] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#E50914]/25 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer active:scale-[0.99]"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        <div className="text-center mt-6 text-xs text-zinc-500 font-medium">
          COCO MEDIA OS • Enterprise Business & Operations Architecture
        </div>
      </div>
    </div>
  );
};
