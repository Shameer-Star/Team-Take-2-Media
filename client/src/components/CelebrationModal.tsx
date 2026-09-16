import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Star, Flame, X } from 'lucide-react';

interface CelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  points?: number;
  performance?: number;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  onClose,
  userName = 'Team Member',
  points = 100,
  performance = 100,
}) => {
  useEffect(() => {
    if (isOpen) {
      // Subtle premium confetti burst
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#1E1B4B] via-[#0F172A] to-[#0B0F19] border border-indigo-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl text-center overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy icon */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-0.5 shadow-xl shadow-amber-500/20 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
        </div>

        <span className="text-xs font-black tracking-widest text-amber-400 uppercase px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
          Milestone Achieved
        </span>

        <h2 className="text-2xl font-black text-white mt-3 mb-1">
          🎉 CONGRATULATIONS! 🎉
        </h2>
        <p className="text-sm font-semibold text-indigo-300 mb-4">
          {userName} has reached {performance}% performance!
        </p>

        {/* Milestone Highlights */}
        <div className="grid grid-cols-3 gap-2.5 my-6 text-left">
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Trophy className="w-4 h-4 text-amber-400 mb-1" />
            <div className="text-[10px] text-slate-400 font-medium">Rank</div>
            <div className="text-xs font-bold text-white">Champion</div>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Star className="w-4 h-4 text-yellow-400 mb-1" />
            <div className="text-[10px] text-slate-400 font-medium">Score</div>
            <div className="text-xs font-bold text-white">{points} Pts</div>
          </div>
          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl">
            <Flame className="w-4 h-4 text-rose-400 mb-1" />
            <div className="text-[10px] text-slate-400 font-medium">Impact</div>
            <div className="text-xs font-bold text-white">Outstanding</div>
          </div>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          Your exceptional focus, timely deliverables, and dedication have set a high standard for Team Take Two Media. Keep driving excellence!
        </p>

        <button
          onClick={onClose}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:opacity-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition"
        >
          Continue Dominating
        </button>
      </div>
    </div>
  );
};
