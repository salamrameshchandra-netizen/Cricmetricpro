/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player, BattingInnings, BowlingInnings } from '../types';
import { Plus, Trash2, Calendar, MapPin, Shield, HelpCircle, Sparkles } from 'lucide-react';

interface MatchLogProps {
  player: Player;
  onAddBattingInnings: (innings: Omit<BattingInnings, 'id'> | Omit<BattingInnings, 'id'>[]) => void;
  onAddBowlingInnings: (innings: Omit<BowlingInnings, 'id'> | Omit<BowlingInnings, 'id'>[]) => void;
  onDeleteBattingInnings: (id: string) => void;
  onDeleteBowlingInnings: (id: string) => void;
}

export default function MatchLog({
  player,
  onAddBattingInnings,
  onAddBowlingInnings,
  onDeleteBattingInnings,
  onDeleteBowlingInnings,
}: MatchLogProps) {
  const [activeSubTab, setActiveSubTab] = useState<'batting' | 'bowling'>('batting');

  // Batting Form State
  const [bMatchNum, setBMatchNum] = useState<number>(() => {
    const lastNum = Math.max(...player.battingInnings.map(i => i.matchNum), ...player.bowlingInnings.map(i => i.matchNum), 0);
    return lastNum + 1;
  });
  const [bInningsNum, setBInningsNum] = useState<number>(1);
  const [bOpponent, setBOpponent] = useState('');
  const [bVenue, setBVenue] = useState('');
  const [bDate, setBDate] = useState(new Date().toISOString().split('T')[0]);
  const [bRuns, setBRuns] = useState<number>(0);
  const [bBalls, setBBalls] = useState<number>(0);
  const [bIsDismissed, setBIsDismissed] = useState(true);
  const [bFours, setBFours] = useState<number>(0);
  const [bSixes, setBSixes] = useState<number>(0);
  const [bIsDNB, setBIsDNB] = useState(false);

  // Both innings state (Batting)
  const [bLogBothInnings, setBLogBothInnings] = useState<boolean>(false);
  const [bInningsNum2, setBInningsNum2] = useState<number>(3);
  const [bRuns2, setBRuns2] = useState<number>(0);
  const [bBalls2, setBBalls2] = useState<number>(0);
  const [bIsDismissed2, setBIsDismissed2] = useState(true);
  const [bFours2, setBFours2] = useState<number>(0);
  const [bSixes2, setBSixes2] = useState<number>(0);
  const [bIsDNB2, setBIsDNB2] = useState(false);

  // Bowling Form State
  const [blMatchNum, setBlMatchNum] = useState<number>(() => {
    const lastNum = Math.max(...player.battingInnings.map(i => i.matchNum), ...player.bowlingInnings.map(i => i.matchNum), 0);
    return lastNum + 1;
  });
  const [blInningsNum, setBlInningsNum] = useState<number>(1);
  const [blOpponent, setBlOpponent] = useState('');
  const [blVenue, setBlVenue] = useState('');
  const [blDate, setBlDate] = useState(new Date().toISOString().split('T')[0]);
  const [blOvers, setBlOvers] = useState<string>('0.0');
  const [blMaidens, setBlMaidens] = useState<number>(0);
  const [blRuns, setBlRuns] = useState<number>(0);
  const [blWickets, setBlWickets] = useState<number>(0);

  // Both innings state (Bowling)
  const [blLogBothInnings, setBlLogBothInnings] = useState<boolean>(false);
  const [blInningsNum2, setBlInningsNum2] = useState<number>(3);
  const [blOvers2, setBlOvers2] = useState<string>('0.0');
  const [blMaidens2, setBlMaidens2] = useState<number>(0);
  const [blRuns2, setBlRuns2] = useState<number>(0);
  const [blWickets2, setBlWickets2] = useState<number>(0);
  const [blIsDNBD, setBlIsDNBD] = useState(false);
  const [blIsDNBD2, setBlIsDNBD2] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);

  // Auto-increment helper for forms when a player's data changes
  React.useEffect(() => {
    const lastNum = Math.max(...player.battingInnings.map(i => i.matchNum), ...player.bowlingInnings.map(i => i.matchNum), 0);
    setBMatchNum(lastNum + 1);
    setBlMatchNum(lastNum + 1);
  }, [player]);

  const handleBattingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bOpponent.trim() || !bVenue.trim()) {
      setFormError('Please fill in opponent and venue.');
      return;
    }
    if (!bIsDNB && (bRuns < 0 || bBalls < 0 || bFours < 0 || bSixes < 0)) {
      setFormError('Scores cannot be negative.');
      return;
    }

    if (bLogBothInnings) {
      if (!bIsDNB2 && (bRuns2 < 0 || bBalls2 < 0 || bFours2 < 0 || bSixes2 < 0)) {
        setFormError('Second innings scores cannot be negative.');
        return;
      }

      onAddBattingInnings([
        {
          matchNum: Number(bMatchNum),
          inningsNum: Number(bInningsNum),
          opponent: bOpponent.trim(),
          venue: bVenue.trim(),
          date: bDate,
          runs: bIsDNB ? 0 : Number(bRuns),
          ballsFaced: bIsDNB ? 0 : Number(bBalls),
          isDismissed: bIsDNB ? false : bIsDismissed,
          fours: bIsDNB ? 0 : Number(bFours),
          sixes: bIsDNB ? 0 : Number(bSixes),
          dnb: bIsDNB,
        },
        {
          matchNum: Number(bMatchNum),
          inningsNum: Number(bInningsNum2),
          opponent: bOpponent.trim(),
          venue: bVenue.trim(),
          date: bDate,
          runs: bIsDNB2 ? 0 : Number(bRuns2),
          ballsFaced: bIsDNB2 ? 0 : Number(bBalls2),
          isDismissed: bIsDNB2 ? false : bIsDismissed2,
          fours: bIsDNB2 ? 0 : Number(bFours2),
          sixes: bIsDNB2 ? 0 : Number(bSixes2),
          dnb: bIsDNB2,
        }
      ]);

      // Reset
      setBRuns2(0);
      setBBalls2(0);
      setBIsDismissed2(true);
      setBFours2(0);
      setBSixes2(0);
      setBIsDNB2(false);
    } else {
      onAddBattingInnings({
        matchNum: Number(bMatchNum),
        inningsNum: Number(bInningsNum),
        opponent: bOpponent.trim(),
        venue: bVenue.trim(),
        date: bDate,
        runs: bIsDNB ? 0 : Number(bRuns),
        ballsFaced: bIsDNB ? 0 : Number(bBalls),
        isDismissed: bIsDNB ? false : bIsDismissed,
        fours: bIsDNB ? 0 : Number(bFours),
        sixes: bIsDNB ? 0 : Number(bSixes),
        dnb: bIsDNB,
      });
    }

    // Reset Form (except common values)
    setBRuns(0);
    setBBalls(0);
    setBIsDismissed(true);
    setBFours(0);
    setBSixes(0);
    setBIsDNB(false);
    setFormError(null);
  };

  const handleBowlingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blOpponent.trim() || !blVenue.trim()) {
      setFormError('Please fill in opponent and venue.');
      return;
    }

    const oversFloat = blIsDNBD ? 0 : parseFloat(blOvers);
    if (!blIsDNBD) {
      if (isNaN(oversFloat) || oversFloat < 0) {
        setFormError('Overs bowled must be a valid positive number.');
        return;
      }

      // Check fraction of overs (must be .0 through .5)
      const fraction = Math.round((oversFloat - Math.floor(oversFloat)) * 10);
      if (fraction >= 6) {
        setFormError('Invalid over format. Balls portion of an over can only be 1 to 5 (e.g., 20.4). Use 21.0 for 21 overs.');
        return;
      }

      if (blMaidens < 0 || blRuns < 0 || blWickets < 0) {
        setFormError('Bowling metrics cannot be negative.');
        return;
      }
    }

    if (blLogBothInnings) {
      const oversFloat2 = blIsDNBD2 ? 0 : parseFloat(blOvers2);
      if (!blIsDNBD2) {
        if (isNaN(oversFloat2) || oversFloat2 < 0) {
          setFormError('Second innings overs bowled must be a valid positive number.');
          return;
        }

        const fraction2 = Math.round((oversFloat2 - Math.floor(oversFloat2)) * 10);
        if (fraction2 >= 6) {
          setFormError('Invalid second innings over format. Balls portion of an over can only be 1 to 5 (e.g., 20.4).');
          return;
        }

        if (blMaidens2 < 0 || blRuns2 < 0 || blWickets2 < 0) {
          setFormError('Second innings bowling metrics cannot be negative.');
          return;
        }
      }

      onAddBowlingInnings([
        {
          matchNum: Number(blMatchNum),
          inningsNum: Number(blInningsNum),
          opponent: blOpponent.trim(),
          venue: blVenue.trim(),
          date: blDate,
          overs: blIsDNBD ? 0 : oversFloat,
          maidens: blIsDNBD ? 0 : Number(blMaidens),
          runsConceded: blIsDNBD ? 0 : Number(blRuns),
          wickets: blIsDNBD ? 0 : Number(blWickets),
          dnbd: blIsDNBD,
        },
        {
          matchNum: Number(blMatchNum),
          inningsNum: Number(blInningsNum2),
          opponent: blOpponent.trim(),
          venue: blVenue.trim(),
          date: blDate,
          overs: blIsDNBD2 ? 0 : oversFloat2,
          maidens: blIsDNBD2 ? 0 : Number(blMaidens2),
          runsConceded: blIsDNBD2 ? 0 : Number(blRuns2),
          wickets: blIsDNBD2 ? 0 : Number(blWickets2),
          dnbd: blIsDNBD2,
        }
      ]);

      // Reset
      setBlOvers2('0.0');
      setBlMaidens2(0);
      setBlRuns2(0);
      setBlWickets2(0);
      setBlIsDNBD2(false);
    } else {
      onAddBowlingInnings({
        matchNum: Number(blMatchNum),
        inningsNum: Number(blInningsNum),
        opponent: blOpponent.trim(),
        venue: blVenue.trim(),
        date: blDate,
        overs: blIsDNBD ? 0 : oversFloat,
        maidens: blIsDNBD ? 0 : Number(blMaidens),
        runsConceded: blIsDNBD ? 0 : Number(blRuns),
        wickets: blIsDNBD ? 0 : Number(blWickets),
        dnbd: blIsDNBD,
      });
    }

    // Reset bowling form
    setBlOvers('0.0');
    setBlMaidens(0);
    setBlRuns(0);
    setBlWickets(0);
    setBlIsDNBD(false);
    setFormError(null);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Logs Table (Left-2 Columns) */}
      <div className="xl:col-span-2 glass-panel rounded-2xl p-6 flex flex-col border border-white/5 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-lg font-black text-slate-100 uppercase tracking-tight">Innings Logs</h3>
            <p className="text-xs text-slate-450 font-medium">Chronological history of recorded matches</p>
          </div>

          <div className="flex items-center bg-slate-950/60 p-1 rounded-lg border border-white/5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('batting');
                setFormError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === 'batting' ? 'bg-slate-800 text-sky-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Batting Logs ({player.battingInnings.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubTab('bowling');
                setFormError(null);
              }}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeSubTab === 'bowling' ? 'bg-slate-800 text-sky-400 shadow-inner' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Bowling Logs ({player.bowlingInnings.length})
            </button>
          </div>
        </div>

        {/* Tables */}
        <div className="flex-1 overflow-x-auto select-none">
          {activeSubTab === 'batting' ? (
            player.battingInnings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                <HelpCircle className="w-10 h-10 mb-2 text-slate-600" />
                <p className="text-sm font-medium">No batting records found.</p>
                <p className="text-xs text-slate-500 mt-1">Use the right log panel to register stats.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase font-black text-sky-400 tracking-wider font-mono">
                    <th className="py-3 px-2">Match #</th>
                    <th className="py-3 px-2">Inns.</th>
                    <th className="py-3 px-3">Opponent / Venue</th>
                    <th className="py-3 px-2 text-right">Runs</th>
                    <th className="py-3 px-2 text-right">Balls</th>
                    <th className="py-3 px-2 text-right">SR</th>
                    <th className="py-3 px-2 text-right">4s/6s</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {[...player.battingInnings]
                    .sort((a, b) => b.matchNum - a.matchNum || b.inningsNum - a.inningsNum)
                    .map(ing => {
                      const sr = ing.dnb ? '-' : (ing.ballsFaced > 0 ? ((ing.runs / ing.ballsFaced) * 100).toFixed(1) : '0');
                      return (
                        <tr key={ing.id} className="hover:bg-white/5 group transition-colors">
                          <td className="py-3.5 px-2 font-mono font-bold text-slate-450">M{ing.matchNum}</td>
                          <td className="py-3.5 px-2 font-mono text-slate-450">{ing.inningsNum}</td>
                          <td className="py-3.5 px-3">
                            <div className="font-bold text-slate-200">{ing.opponent}</div>
                            <div className="flex items-center gap-1 text-[10px] text-slate-450 mt-0.5 font-sans font-medium">
                              <MapPin className="w-2.5 h-2.5 shrink-0 text-amber-500/80" />
                              <span className="truncate max-w-[120px]">{ing.venue}</span>
                              <span className="text-slate-700">|</span>
                              <Calendar className="w-2.5 h-2.5 shrink-0 text-sky-500/80" />
                              <span>{ing.date}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-2 text-right font-black text-amber-400 font-mono text-sm leading-none bg-amber-500/5 rounded-sm">
                            {ing.dnb ? (
                              <span className="text-slate-500/80 font-bold text-xs uppercase">DNB</span>
                            ) : (
                              <>
                                {ing.runs}
                                {!ing.isDismissed && '*'}
                              </>
                            )}
                          </td>
                          <td className="py-3.5 px-2 text-right font-mono text-slate-300">{ing.dnb ? '-' : (ing.ballsFaced || '-')}</td>
                          <td className="py-3.5 px-2 text-right font-mono text-slate-300">{sr}</td>
                          <td className="py-3.5 px-2 text-right font-mono text-slate-400">
                            {ing.dnb ? '-' : `${ing.fours} / ${ing.sixes}`}
                          </td>
                          <td className="py-3.5 px-3 text-right">
                            <button
                               type="button"
                               onClick={() => onDeleteBattingInnings(ing.id)}
                               className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
                               title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )
          ) : (player.bowlingInnings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <HelpCircle className="w-10 h-10 mb-2 text-slate-600" />
              <p className="text-sm font-medium">No bowling records found.</p>
              <p className="text-xs text-slate-500 mt-1">Use the right log panel to register stats.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase font-black text-sky-400 tracking-wider font-mono">
                  <th className="py-3 px-2">Match #</th>
                  <th className="py-3 px-2">Inns.</th>
                  <th className="py-3 px-3">Opponent / Venue</th>
                  <th className="py-3 px-2 text-right">Overs</th>
                  <th className="py-3 px-2 text-right">Mdns</th>
                  <th className="py-3 px-2 text-right">Runs Con</th>
                  <th className="py-3 px-2 text-right">Wkts</th>
                  <th className="py-3 px-2 text-right">Econ</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[...player.bowlingInnings]
                  .sort((a, b) => b.matchNum - a.matchNum || b.inningsNum - a.inningsNum)
                  .map(ing => {
                    const parsedOvers = Math.floor(ing.overs);
                    const balls = parsedOvers * 6 + Math.round((ing.overs - parsedOvers) * 10);
                    const oversCount = balls / 6;
                    const econ = oversCount > 0 ? (ing.runsConceded / oversCount).toFixed(2) : '0';
                    return (
                      <tr key={ing.id} className="hover:bg-white/5 group transition-colors">
                        <td className="py-3.5 px-2 font-mono font-bold text-slate-450">M{ing.matchNum}</td>
                        <td className="py-3.5 px-2 font-mono text-slate-455">{ing.inningsNum}</td>
                        <td className="py-3.5 px-3">
                          <div className="font-bold text-slate-200">{ing.opponent}</div>
                          <div className="flex items-center gap-1 text-[10px] text-slate-450 mt-0.5 font-sans font-medium">
                            <MapPin className="w-2.5 h-2.5 shrink-0 text-amber-500/80" />
                            <span className="truncate max-w-[120px]">{ing.venue}</span>
                            <span className="text-slate-700">|</span>
                            <Calendar className="w-2.5 h-2.5 shrink-0 text-sky-500/80" />
                            <span>{ing.date}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-300">{ing.dnbd ? '-' : ing.overs.toFixed(1)}</td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-300">{ing.dnbd ? '-' : ing.maidens}</td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-300">{ing.dnbd ? '-' : ing.runsConceded}</td>
                        <td className="py-3.5 px-2 text-right font-mono font-black text-sky-400 text-sm bg-sky-500/5 rounded-sm">
                          {ing.dnbd ? (
                            <span className="text-slate-500/80 font-bold text-xs uppercase">DNBD</span>
                          ) : (
                            `${ing.wickets}w`
                          )}
                        </td>
                        <td className="py-3.5 px-2 text-right font-mono text-slate-300">{ing.dnbd ? '-' : econ}</td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => onDeleteBowlingInnings(ing.id)}
                            className="inline-flex items-center justify-center p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md transition-all cursor-pointer"
                            title="Delete record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )
        )}
      </div>
    </div>

    {/* Form Panel (Right Column) */}
    <div className="glass-panel rounded-2xl p-6 flex flex-col justify-between border border-white/5 relative overflow-hidden">
      <div>
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div>
            <h3 className="text-base font-black text-slate-100 uppercase tracking-tight">Logger Console</h3>
            <p className="text-xs text-slate-450 font-medium">Manual match metric input</p>
          </div>
          <Sparkles className="w-4 h-4 text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.4)]" />
        </div>

        {formError && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs font-semibold text-rose-400 flex items-start gap-2">
            <span className="font-bold underline">Error:</span>
            <span>{formError}</span>
          </div>
        )}

        {activeSubTab === 'batting' ? (
          /* Batting Form */
          <form id="batting-log-form" onSubmit={handleBattingSubmit} className="space-y-4 text-xs sm:text-sm font-sans animate-fade-in">
            {/* Match Info (Common headers) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Match Number</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={bMatchNum}
                  onChange={e => setBMatchNum(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-502/50 focus:ring-1 focus:ring-sky-500/50 font-mono tracking-wider"
                />
              </div>
              <div className="flex flex-col justify-end">
                {/* Clean Toggle Checkbox */}
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 border border-white/5 rounded-lg select-none">
                  <input
                    id="b-log-both-innings"
                    type="checkbox"
                    checked={bLogBothInnings}
                    onChange={e => {
                      setBLogBothInnings(e.target.checked);
                      if (e.target.checked) {
                        setBInningsNum(1);
                        setBInningsNum2(3);
                      }
                    }}
                    className="w-4 h-4 text-amber-500 border-white/10 rounded-md bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="b-log-both-innings" className="text-[9px] font-black text-slate-300 tracking-wider uppercase cursor-pointer">
                    Log Both Innings
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Opposing Team</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Australia"
                  value={bOpponent}
                  onChange={e => setBOpponent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Venue / Ground</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lord's"
                  value={bVenue}
                  onChange={e => setBVenue(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Innings Date</label>
              <input
                type="date"
                required
                value={bDate}
                onChange={e => setBDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono"
              />
            </div>

            {!bLogBothInnings ? (
              /* Single Innings Input Block */
              <div className="space-y-4 pt-1 animate-none">
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 border border-white/5 rounded-lg select-none">
                  <input
                    id="is-dnb-chk"
                    type="checkbox"
                    checked={bIsDNB}
                    onChange={e => setBIsDNB(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-white/10 rounded-md bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="is-dnb-chk" className="text-[10px] font-black text-amber-400 tracking-widest uppercase cursor-pointer">
                    Did Not Bat (DNB)
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Innings (1-4)</label>
                  <select
                    value={bInningsNum}
                    onChange={e => setBInningsNum(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/15 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-bold"
                  >
                    <option value={1} className="bg-slate-900 text-slate-200">1st Innings</option>
                    <option value={2} className="bg-slate-900 text-slate-200">2nd Innings</option>
                    <option value={3} className="bg-slate-900 text-slate-200">3rd Innings</option>
                    <option value={4} className="bg-slate-900 text-slate-200">4th Innings</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Runs Scored</label>
                    <input
                      type="number"
                      min="0"
                      required={!bIsDNB}
                      disabled={bIsDNB}
                      value={bIsDNB ? 0 : bRuns}
                      onChange={e => setBRuns(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-amber-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-black font-mono tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Balls Faced</label>
                    <input
                      type="number"
                      min="0"
                      required={!bIsDNB}
                      disabled={bIsDNB}
                      value={bIsDNB ? 0 : bBalls}
                      onChange={e => setBBalls(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Fours (4s)</label>
                    <input
                      type="number"
                      min="0"
                      required={!bIsDNB}
                      disabled={bIsDNB}
                      value={bIsDNB ? 0 : bFours}
                      onChange={e => setBFours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Sixes (6s)</label>
                    <input
                      type="number"
                      min="0"
                      required={!bIsDNB}
                      disabled={bIsDNB}
                      value={bIsDNB ? 0 : bSixes}
                      onChange={e => setBSixes(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1 select-none">
                  <input
                    id="is-dismissed-chk"
                    type="checkbox"
                    disabled={bIsDNB}
                    checked={bIsDNB ? false : bIsDismissed}
                    onChange={e => setBIsDismissed(e.target.checked)}
                    className="w-4 h-4 text-amber-500 border-white/10 rounded-md bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                  />
                  <label htmlFor="is-dismissed-chk" className="text-xs font-bold text-slate-300 tracking-wide uppercase cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed">
                    Dismissed (Uncheck for Not Out *)
                  </label>
                </div>
              </div>
            ) : (
              /* Dual Innings Input Block */
              <div className="space-y-4 pt-1 animate-none">
                {/* Innings 1 Section */}
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Innings 1</span>
                    <select
                      value={bInningsNum}
                      onChange={e => setBInningsNum(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none font-bold"
                    >
                      <option value={1}>1st Innings</option>
                      <option value={2}>2nd Innings</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pb-1">
                    <input
                      id="is-dnb-1"
                      type="checkbox"
                      checked={bIsDNB}
                      onChange={e => setBIsDNB(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-500 border-white/10 rounded bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="is-dnb-1" className="text-[10px] font-bold text-amber-400 uppercase tracking-wider cursor-pointer">
                      Did Not Bat (DNB)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Runs</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB}
                        disabled={bIsDNB}
                        value={bIsDNB ? 0 : bRuns}
                        onChange={e => setBRuns(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-amber-500 font-bold font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Balls</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB}
                        disabled={bIsDNB}
                        value={bIsDNB ? 0 : bBalls}
                        onChange={e => setBBalls(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Fours</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB}
                        disabled={bIsDNB}
                        value={bIsDNB ? 0 : bFours}
                        onChange={e => setBFours(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-300 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Sixes</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB}
                        disabled={bIsDNB}
                        value={bIsDNB ? 0 : bSixes}
                        onChange={e => setBSixes(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-300 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pt-1">
                    <input
                      id="is-dismissed-1"
                      type="checkbox"
                      disabled={bIsDNB}
                      checked={bIsDNB ? false : bIsDismissed}
                      onChange={e => setBIsDismissed(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-500 border-white/10 rounded bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer disabled:opacity-40"
                    />
                    <label htmlFor="is-dismissed-1" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      Dismissed
                    </label>
                  </div>
                </div>

                {/* Innings 2 Section */}
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Innings 2</span>
                    <select
                      value={bInningsNum2}
                      onChange={e => setBInningsNum2(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none font-bold"
                    >
                      <option value={3}>3rd Innings</option>
                      <option value={4}>4th Innings</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pb-1">
                    <input
                      id="is-dnb-2"
                      type="checkbox"
                      checked={bIsDNB2}
                      onChange={e => setBIsDNB2(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-500 border-white/10 rounded bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="is-dnb-2" className="text-[10px] font-bold text-amber-400 uppercase tracking-wider cursor-pointer">
                      Did Not Bat (DNB)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Runs</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB2}
                        disabled={bIsDNB2}
                        value={bIsDNB2 ? 0 : bRuns2}
                        onChange={e => setBRuns2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-amber-500 font-bold font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Balls</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB2}
                        disabled={bIsDNB2}
                        value={bIsDNB2 ? 0 : bBalls2}
                        onChange={e => setBBalls2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Fours</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB2}
                        disabled={bIsDNB2}
                        value={bIsDNB2 ? 0 : bFours2}
                        onChange={e => setBFours2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-300 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Sixes</label>
                      <input
                        type="number"
                        min="0"
                        required={!bIsDNB2}
                        disabled={bIsDNB2}
                        value={bIsDNB2 ? 0 : bSixes2}
                        onChange={e => setBSixes2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-300 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pt-1">
                    <input
                      id="is-dismissed-2"
                      type="checkbox"
                      disabled={bIsDNB2}
                      checked={bIsDNB2 ? false : bIsDismissed2}
                      onChange={e => setBIsDismissed2(e.target.checked)}
                      className="w-3.5 h-3.5 text-amber-500 border-white/10 rounded bg-slate-950 accent-amber-500 focus:ring-amber-500 cursor-pointer disabled:opacity-40"
                    />
                    <label htmlFor="is-dismissed-2" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer disabled:opacity-40">
                      Dismissed
                    </label>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:opacity-90 active:scale-[0.98] transition-all text-slate-950 font-black uppercase text-xs tracking-widest rounded-lg cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Plus className="w-4 h-4" />
              <span>Log Batting Innings</span>
            </button>
          </form>
        ) : (
          /* Bowling Form */
          <form id="bowling-log-form" onSubmit={handleBowlingSubmit} className="space-y-4 text-xs sm:text-sm font-sans animate-fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Match Number</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={blMatchNum}
                  onChange={e => setBlMatchNum(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono"
                />
              </div>
              <div className="flex flex-col justify-end">
                {/* Clean Toggle Checkbox */}
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 border border-white/5 rounded-lg select-none">
                  <input
                    id="bl-log-both-innings"
                    type="checkbox"
                    checked={blLogBothInnings}
                    onChange={e => {
                      setBlLogBothInnings(e.target.checked);
                      if (e.target.checked) {
                        setBlInningsNum(1);
                        setBlInningsNum2(3);
                      }
                    }}
                    className="w-4 h-4 text-sky-500 border-white/10 rounded-md bg-slate-950 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="bl-log-both-innings" className="text-[9px] font-black text-slate-300 tracking-wider uppercase cursor-pointer">
                    Log Both Innings
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Opposing Team</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Australia"
                  value={blOpponent}
                  onChange={e => setBlOpponent(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Venue / Ground</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MCG Melbourne"
                  value={blVenue}
                  onChange={e => setBlVenue(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Innings Date</label>
              <input
                type="date"
                required
                value={blDate}
                onChange={e => setBlDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono"
              />
            </div>

            {!blLogBothInnings ? (
              /* Single Innings Bowling Block */
              <div className="space-y-4 pt-1 animate-none">
                <div className="flex items-center gap-2 py-2 px-3 bg-slate-950/40 border border-white/5 rounded-lg select-none">
                  <input
                    id="is-dnbd-chk"
                    type="checkbox"
                    checked={blIsDNBD}
                    onChange={e => setBlIsDNBD(e.target.checked)}
                    className="w-4 h-4 text-sky-500 border-white/10 rounded-md bg-slate-950 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                  />
                  <label htmlFor="is-dnbd-chk" className="text-[10px] font-black text-sky-450 tracking-widest uppercase cursor-pointer">
                    Did Not Bowl (DNBD)
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Innings (1-4)</label>
                  <select
                    value={blInningsNum}
                    onChange={e => setBlInningsNum(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-bold"
                  >
                    <option value={1} className="bg-slate-900 text-slate-200">1st Innings</option>
                    <option value={2} className="bg-slate-900 text-slate-200">2nd Innings</option>
                    <option value={3} className="bg-slate-900 text-slate-200">3rd Innings</option>
                    <option value={4} className="bg-slate-900 text-slate-200">4th Innings</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono cursor-pointer" title="Decimal, e.g. 10.3 for 10 overs and 3 balls">
                      Overs Bowled
                    </label>
                    <input
                      type="text"
                      required={!blIsDNBD}
                      disabled={blIsDNBD}
                      placeholder="e.g. 20.4"
                      value={blIsDNBD ? '0.0' : blOvers}
                      onChange={e => setBlOvers(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Maiden Overs</label>
                    <input
                      type="number"
                      min="0"
                      required={!blIsDNBD}
                      disabled={blIsDNBD}
                      value={blIsDNBD ? 0 : blMaidens}
                      onChange={e => setBlMaidens(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Runs Conceded</label>
                    <input
                      type="number"
                      min="0"
                      required={!blIsDNBD}
                      disabled={blIsDNBD}
                      value={blIsDNBD ? 0 : blRuns}
                      onChange={e => setBlRuns(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-mono disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-450 uppercase mb-1 tracking-widest font-mono">Wickets Taken</label>
                    <input
                      type="number"
                      min="0"
                      required={!blIsDNBD}
                      disabled={blIsDNBD}
                      value={blIsDNBD ? 0 : blWickets}
                      onChange={e => setBlWickets(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-slate-950/60 border border-white/5 rounded-lg text-sky-400 focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 font-black font-mono tracking-wide disabled:opacity-40 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* Dual Innings Bowling Block */
              <div className="space-y-4 pt-1 animate-none">
                {/* Bowling Innings 1 Section */}
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Innings 1</span>
                    <select
                      value={blInningsNum}
                      onChange={e => setBlInningsNum(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none font-bold"
                    >
                      <option value={1}>1st Innings</option>
                      <option value={2}>2nd Innings</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pb-1">
                    <input
                      id="bl-is-dnbd-1"
                      type="checkbox"
                      checked={blIsDNBD}
                      onChange={e => setBlIsDNBD(e.target.checked)}
                      className="w-3.5 h-3.5 text-sky-500 border-white/10 rounded bg-slate-950 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="bl-is-dnbd-1" className="text-[10px] font-bold text-sky-400 uppercase tracking-wider cursor-pointer">
                      Did Not Bowl (DNBD)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Overs</label>
                      <input
                        type="text"
                        required={!blIsDNBD}
                        disabled={blIsDNBD}
                        value={blIsDNBD ? '0.0' : blOvers}
                        onChange={e => setBlOvers(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Maidens</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD}
                        disabled={blIsDNBD}
                        value={blIsDNBD ? 0 : blMaidens}
                        onChange={e => setBlMaidens(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Runs Con</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD}
                        disabled={blIsDNBD}
                        value={blIsDNBD ? 0 : blRuns}
                        onChange={e => setBlRuns(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Wickets</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD}
                        disabled={blIsDNBD}
                        value={blIsDNBD ? 0 : blWickets}
                        onChange={e => setBlWickets(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-sky-400 font-bold font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>

                {/* Bowling Innings 2 Section */}
                <div className="p-3 bg-slate-950/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 mb-2">
                    <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Innings 2</span>
                    <select
                      value={blInningsNum2}
                      onChange={e => setBlInningsNum2(Number(e.target.value))}
                      className="px-2 py-1 text-xs bg-slate-900 border border-white/10 rounded text-slate-200 focus:outline-none font-bold"
                    >
                      <option value={3}>3rd Innings</option>
                      <option value={4}>4th Innings</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5 select-none pb-1">
                    <input
                      id="bl-is-dnbd-2"
                      type="checkbox"
                      checked={blIsDNBD2}
                      onChange={e => setBlIsDNBD2(e.target.checked)}
                      className="w-3.5 h-3.5 text-sky-500 border-white/10 rounded bg-slate-950 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                    />
                    <label htmlFor="bl-is-dnbd-2" className="text-[10px] font-bold text-sky-400 uppercase tracking-wider cursor-pointer">
                      Did Not Bowl (DNBD)
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Overs</label>
                      <input
                        type="text"
                        required={!blIsDNBD2}
                        disabled={blIsDNBD2}
                        value={blIsDNBD2 ? '0.0' : blOvers2}
                        onChange={e => setBlOvers2(e.target.value)}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Maidens</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD2}
                        disabled={blIsDNBD2}
                        value={blIsDNBD2 ? 0 : blMaidens2}
                        onChange={e => setBlMaidens2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Runs Con</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD2}
                        disabled={blIsDNBD2}
                        value={blIsDNBD2 ? 0 : blRuns2}
                        onChange={e => setBlRuns2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-slate-200 font-mono disabled:opacity-40"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase">Wickets</label>
                      <input
                        type="number"
                        min="0"
                        required={!blIsDNBD2}
                        disabled={blIsDNBD2}
                        value={blIsDNBD2 ? 0 : blWickets2}
                        onChange={e => setBlWickets2(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs bg-slate-950/80 border border-white/5 rounded text-sky-400 font-bold font-mono disabled:opacity-40"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:opacity-90 active:scale-[0.98] transition-all text-slate-950 font-black uppercase text-xs tracking-widest rounded-lg cursor-pointer shadow-[0_0_15px_rgba(14,165,233,0.2)] mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Log Bowling Innings</span>
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 text-[10px] uppercase tracking-wider font-extrabold text-slate-500 flex items-center gap-1.5 self-end">
        <Shield className="w-3.5 h-3.5 text-slate-500" />
        <span>Data is stored locally in standard browser storage.</span>
      </div>
    </div>
  </div>
  );
}
