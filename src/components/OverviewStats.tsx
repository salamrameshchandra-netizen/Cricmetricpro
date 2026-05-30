/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Player } from '../types';
import { calculateBattingStats, calculateBowlingStats } from '../utils/cricketMath';
import { Award, Target, Zap, ShieldAlert, Flame, Hash, Activity } from 'lucide-react';

interface OverviewStatsProps {
  player: Player;
}

export default function OverviewStats({ player }: OverviewStatsProps) {
  const batting = calculateBattingStats(player.battingInnings);
  const bowling = calculateBowlingStats(player.bowlingInnings);

  const displayBBI = (wickets: number, runs: number) => {
    if (wickets === 0 && runs === 0) return '-';
    return `${wickets}/${runs}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Batting Card */}
      <div className="glass-panel stat-card rounded-2xl p-6 border-l-[3px] border-l-amber-500 text-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest glow-text">Test Cricket</span>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">Batting Aggregates</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-wider">{batting.innings} Inning{batting.innings !== 1 ? 's' : ''} logged</span>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Runs</span>
            <span className="text-3xl font-black font-sans text-white glow-text">{batting.runs.toLocaleString()}</span>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Average</span>
            <span className="text-3xl font-black font-sans text-amber-450 glow-text">
              {batting.innings > 0 ? batting.average : '-'}
            </span>
          </div>
          <div className="bg-amber-500/5 border border-amber-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-widest mb-1">Strike Rate</span>
            <span className="text-3xl font-black font-sans text-slate-100 glow-text">
              {batting.innings > 0 ? batting.strikeRate : '-'}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-sans">
          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Hash className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-450 uppercase font-black tracking-wider">Matches</span>
              <span className="font-bold font-mono text-slate-200">{batting.matches}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-450 uppercase font-black tracking-wider">Hundreds</span>
              <span className="font-bold font-mono text-slate-200">{batting.hundreds}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Award className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Fifties</span>
              <span className="font-bold font-mono text-slate-200">{batting.fifties}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">High Score</span>
              <span className="font-bold font-mono text-slate-200">
                {batting.highScore}{batting.highScoreNotOut ? '*' : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Activity className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Not Outs</span>
              <span className="font-bold font-mono text-slate-200">{batting.notOuts}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Target className="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Fours (4s)</span>
              <span className="font-bold font-mono text-slate-200">{batting.fours}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Sixes (6s)</span>
              <span className="font-bold font-mono text-slate-200">{batting.sixes}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 rounded-lg border border-white/5 bg-slate-900/60">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider font-sans">Ducks (0s)</span>
              <span className="font-bold font-mono text-slate-200">{batting.ducks}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bowling Card */}
      <div className="glass-panel stat-card rounded-2xl p-6 border-l-[3px] border-l-sky-500 text-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-widest glow-text">Test Cricket</span>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">Bowling Aggregates</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono tracking-wider">{bowling.innings} Inning{bowling.innings !== 1 ? 's' : ''} logged</span>
        </div>

        {/* Big numbers */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Wickets</span>
            <span className="text-3xl font-black font-sans text-white glow-text">{bowling.wickets}</span>
          </div>
          <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Average</span>
            <span className="text-3xl font-black font-sans text-sky-400 glow-text">
              {bowling.wickets > 0 ? bowling.average : '-'}
            </span>
          </div>
          <div className="bg-sky-500/5 border border-sky-500/15 rounded-xl p-3 text-center shadow-inner">
            <span className="block text-[10px] font-bold text-slate-455 uppercase tracking-widest mb-1">Econ Rate</span>
            <span className="text-3xl font-black font-sans text-slate-100 glow-text">
              {bowling.innings > 0 ? bowling.economyRate : '-'}
            </span>
          </div>
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-sans">
          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Hash className="w-4 h-4 text-slate-450 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Matches</span>
              <span className="font-bold font-mono text-slate-200">{bowling.matches}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Activity className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Overs</span>
              <span className="font-bold font-mono text-slate-200">{bowling.overs}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Award className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Balls</span>
              <span className="font-bold font-mono text-slate-200">{bowling.balls}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Best Innings</span>
              <span className="font-bold font-mono text-slate-200">
                {displayBBI(bowling.bestInningsWickets, bowling.bestInningsRuns)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Award className="w-4 h-4 text-indigo-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">5w Hauls</span>
              <span className="font-bold font-mono text-slate-200">{bowling.fiveWickets}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Award className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">10w Hauls</span>
              <span className="font-bold font-mono text-slate-200">{bowling.tenWickets}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Runs Con</span>
              <span className="font-bold font-mono text-slate-200">{bowling.runs}</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-2 bg-slate-900/60 border border-white/5 rounded-lg">
            <Target className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="block text-[9px] text-slate-455 uppercase font-black tracking-wider">Strike Rate</span>
              <span className="font-bold font-mono text-slate-200 font-sans">
                {bowling.wickets > 0 ? bowling.strikeRate : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
