/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Player } from '../types';
import { UserPlus, Trash2, RotateCcw, Award, Globe, ShieldAlert } from 'lucide-react';

interface PlayerSelectorProps {
  players: Player[];
  selectedPlayerId: string;
  onSelectPlayer: (id: string) => void;
  onAddPlayer: (player: Omit<Player, 'id' | 'battingInnings' | 'bowlingInnings'>) => void;
  onDeletePlayer: (id: string) => void;
  onResetDefaults: () => void;
}

export default function PlayerSelector({
  players,
  selectedPlayerId,
  onSelectPlayer,
  onAddPlayer,
  onDeletePlayer,
  onResetDefaults,
}: PlayerSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [role, setRole] = useState<'Batsman' | 'Bowler' | 'All-Rounder'>('Batsman');
  const [battingStyle, setBattingStyle] = useState('Right-handed');
  const [bowlingStyle, setBowlingStyle] = useState('Right-arm Fast');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !stateVal.trim()) return;

    onAddPlayer({
      name: name.trim(),
      state: stateVal.trim(),
      role,
      battingStyle,
      bowlingStyle: role === 'Batsman' ? 'N/A' : bowlingStyle,
    });

    // Reset Form
    setName('');
    setStateVal('');
    setRole('Batsman');
    setBattingStyle('Right-handed');
    setBowlingStyle('Right-arm Fast');
    setIsAdding(false);
  };

  const handleDelete = () => {
    onDeletePlayer(selectedPlayerId);
    setShowConfirmDelete(false);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 id="player-selector-heading" className="text-xs font-bold text-sky-450 uppercase tracking-widest mb-1 glow-text">
            Player Workspace
          </h2>
          <p className="text-xl font-black font-sans text-slate-100 uppercase tracking-tight">
            Select or Create Player Profile
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg text-sm transition-all cursor-pointer shadow-[0_0_12px_rgba(56,189,248,0.2)]"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Player</span>
          </button>
          <button
            type="button"
            onClick={onResetDefaults}
            title="Reset to default players data"
            className="flex items-center gap-2 px-3 py-2 btn-outline rounded-lg text-sm transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden md:inline">Reload Originals</span>
          </button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className="mb-6 p-5 bg-slate-900/40 border border-white/10 rounded-xl animate-fade-in">
          <h3 className="font-bold text-slate-100 mb-4 text-base uppercase tracking-wider text-sky-450">Register New Cricketer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Brian Lara"
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-hidden focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">State / Province</label>
              <input
                type="text"
                required
                value={stateVal}
                onChange={e => setStateVal(e.target.value)}
                placeholder="e.g. Maharashtra"
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-hidden focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Primary Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 text-slate-100 rounded-lg text-sm focus:outline-hidden focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40"
              >
                <option value="Batsman" className="bg-slate-900 text-white">Batsman</option>
                <option value="Bowler" className="bg-slate-900 text-white">Bowler</option>
                <option value="All-Rounder" className="bg-slate-900 text-white">All-Rounder</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Batting Style</label>
              <select
                value={battingStyle}
                onChange={e => setBattingStyle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 text-slate-100 rounded-lg text-sm focus:outline-hidden focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40"
              >
                <option value="Right-handed" className="bg-slate-900 text-white">Right-handed</option>
                <option value="Left-handed" className="bg-slate-900 text-white">Left-handed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bowling Style</label>
              <input
                type="text"
                disabled={role === 'Batsman'}
                value={role === 'Batsman' ? 'N/A' : bowlingStyle}
                onChange={e => setBowlingStyle(e.target.value)}
                placeholder={role === 'Batsman' ? 'N/A (Batsman)' : 'e.g. Right-arm Off break'}
                className="w-full px-3 py-2 bg-slate-950/80 border border-white/10 text-slate-100 rounded-lg text-sm placeholder-slate-500 focus:outline-hidden focus:border-sky-500/60 focus:ring-1 focus:ring-sky-500/40 disabled:opacity-50 disabled:bg-slate-950/40 disabled:cursor-not-allowed"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 text-sm font-medium">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 border border-white/10 hover:bg-white/5 text-slate-300 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 btn-primary rounded-lg transition-colors cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      )}

      {/* Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {players.map(player => {
          const isSelected = player.id === selectedPlayerId;
          return (
            <div
              key={player.id}
              onClick={() => onSelectPlayer(player.id)}
              className={`relative flex flex-col p-4 rounded-xl border transition-all cursor-pointer select-none group ${
                isSelected
                  ? 'border-sky-500/80 bg-sky-500/10 ring-1 ring-sky-500/30 shadow-[0_0_15px_rgba(58,189,248,0.15)]'
                  : 'border-white/10 hover:border-sky-500/30 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-white text-base line-clamp-1">{player.name}</span>
                <span className={`text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded border ${
                  player.role === 'Batsman' ? 'bg-amber-500/10 text-amber-350 border-amber-500/35' :
                  player.role === 'Bowler' ? 'bg-sky-500/10 text-sky-350 border-sky-500/35' :
                  'bg-purple-500/10 text-purple-355 border-purple-500/35'
                }`}>
                  {player.role}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs text-slate-450 font-medium">
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-sky-400 opacity-70" />
                  <span className="text-slate-300">{player.state}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-sky-400 opacity-70" />
                  <span className="text-slate-400 text-[11px]">{player.battingStyle} · {player.bowlingStyle}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span className="group-hover:text-sky-305 transition-colors">{player.battingInnings.length} Bat Innings</span>
                <span className="group-hover:text-sky-305 transition-colors">{player.bowlingInnings.length} Bowl Innings</span>
              </div>
            </div>
          );
        })}
      </div>

      {selectedPlayer && (
        <div className="mt-6 pt-5 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 text-xs uppercase tracking-wider">
            <span className="font-bold text-sky-400">Selected Profile:</span>
            <span className="text-slate-200 normal-case font-bold text-sm tracking-normal">{selectedPlayer.name} ({selectedPlayer.state})</span>
          </div>

          <div className="flex items-center gap-2">
            {showConfirmDelete ? (
              <div className="flex items-center gap-2 p-1.5 bg-red-950/60 border border-red-500/20 rounded-lg animate-pulse">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span className="text-xs font-semibold text-red-200">Delete {selectedPlayer.name}?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-xs font-bold transition-all cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-2 py-1 bg-white/10 hover:bg-white/20 text-slate-300 rounded text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-350 px-3 py-2 border border-red-550/20 bg-red-500/5 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Profile</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
