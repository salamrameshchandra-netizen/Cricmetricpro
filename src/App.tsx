/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { Player, BattingInnings, BowlingInnings } from './types';
import { DEFAULT_PLAYERS } from './data/defaultPlayers';
import { Dumbbell, Info, Users, Cloud, CloudOff, RefreshCw, LogIn, LogOut, Download, Upload, CheckCircle2 } from 'lucide-react';

import PlayerSelector from './components/PlayerSelector';
import OverviewStats from './components/OverviewStats';
import PerformanceCharts from './components/PerformanceCharts';
import MatchLog from './components/MatchLog';
import ExportPanel from './components/ExportPanel';

import { initAuth, googleSignIn, logout, getAccessToken } from './utils/googleAuth';
import { findDriveFile, downloadDriveFile, createDriveFile, updateDriveFile } from './utils/googleDrive';

const STORAGE_KEY = 'cricket_analyst_v1_players';

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');

  // Google Drive Cloud Sync State
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [driveFileId, setDriveFileId] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error' | 'local'>('local');
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [showSyncDropdown, setShowSyncDropdown] = useState<boolean>(false);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);

  const isPullingDataRef = useRef(false);

  // 1. Initial State Load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Player[];
        if (parsed && parsed.length > 0) {
          setPlayers(parsed);
          setSelectedPlayerId(parsed[0].id);
          return;
        }
      } catch (err) {
        console.error('Failed to parse cached players database, resetting to default profiles', err);
      }
    }
    // Fallback load
    setPlayers(DEFAULT_PLAYERS);
    setSelectedPlayerId(DEFAULT_PLAYERS[0].id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PLAYERS));
  }, []);

  const checkAndSyncDrive = async (token: string, forceDownload = false) => {
    setSyncStatus('syncing');
    try {
      const fileId = await findDriveFile(token, 'cricmetrics_data.json');
      if (fileId) {
        setDriveFileId(fileId);
        const cloudPlayers = await downloadDriveFile(token, fileId);
        
        if (Array.isArray(cloudPlayers)) {
          if (forceDownload) {
            isPullingDataRef.current = true;
            setPlayers(cloudPlayers);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPlayers));
            if (cloudPlayers.length > 0) {
              setSelectedPlayerId(cloudPlayers[0].id);
            }
            setSyncStatus('synced');
            setLastSynced(new Date().toLocaleTimeString());
          } else {
            // Check if there is local data that differs from preloaded defaults
            const rawLocal = localStorage.getItem(STORAGE_KEY);
            const isLocalDefault = !rawLocal || JSON.stringify(JSON.parse(rawLocal)) === JSON.stringify(DEFAULT_PLAYERS);
            
            if (isLocalDefault) {
              isPullingDataRef.current = true;
              setPlayers(cloudPlayers);
              localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPlayers));
              if (cloudPlayers.length > 0) {
                setSelectedPlayerId(cloudPlayers[0].id);
              }
              setSyncStatus('synced');
              setLastSynced(new Date().toLocaleTimeString());
            } else {
              setSyncStatus('idle');
            }
          }
        }
      } else {
        // Create file is none is found
        const newId = await createDriveFile(token, 'cricmetrics_data.json', players);
        setDriveFileId(newId);
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString());
      }
    } catch (err) {
      console.error('Google Drive sync check failed:', err);
      setSyncStatus('error');
    }
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setSyncStatus('syncing');
    try {
      const result = await googleSignIn();
      if (result) {
        setIsSignedIn(true);
        setGoogleUser(result.user);
        await checkAndSyncDrive(result.accessToken, false);
      }
    } catch (err) {
      console.error('Google login failed:', err);
      setSyncStatus('error');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsSignedIn(false);
      setGoogleUser(null);
      setDriveFileId(null);
      setSyncStatus('local');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handlePushToDrive = async () => {
    const token = getAccessToken();
    if (!token) return;
    
    setSyncStatus('syncing');
    try {
      let fileId = driveFileId;
      if (!fileId) {
        fileId = await findDriveFile(token, 'cricmetrics_data.json');
        setDriveFileId(fileId);
      }
      if (fileId) {
        await updateDriveFile(token, fileId, players);
      } else {
        const newId = await createDriveFile(token, 'cricmetrics_data.json', players);
        setDriveFileId(newId);
      }
      setSyncStatus('synced');
      setLastSynced(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to manually sync upload:', err);
      setSyncStatus('error');
    }
  };

  const handlePullFromDrive = async () => {
    const token = getAccessToken();
    if (!token) return;
    
    if (!window.confirm('This will replace your current workspace records with the data backed up in your Google Drive. Do you want to proceed?')) {
      return;
    }
    
    setSyncStatus('syncing');
    try {
      let fileId = driveFileId;
      if (!fileId) {
        fileId = await findDriveFile(token, 'cricmetrics_data.json');
        setDriveFileId(fileId);
      }
      if (fileId) {
        const cloudPlayers = await downloadDriveFile(token, fileId);
        if (Array.isArray(cloudPlayers)) {
          isPullingDataRef.current = true;
          setPlayers(cloudPlayers);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(cloudPlayers));
          if (cloudPlayers.length > 0) {
            setSelectedPlayerId(cloudPlayers[0].id);
          }
          setSyncStatus('synced');
          setLastSynced(new Date().toLocaleTimeString());
        }
      } else {
        alert('No backup file found in your Google Drive. Push current records first.');
        setSyncStatus('idle');
      }
    } catch (err) {
      console.error('Failed to manually sync download:', err);
      setSyncStatus('error');
    }
  };

  // Monitor Auth State and Auto-Login
  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setIsSignedIn(true);
        setGoogleUser(user);
        setSyncStatus('idle');
        checkAndSyncDrive(token, false);
      },
      () => {
        setIsSignedIn(false);
        setGoogleUser(null);
        setDriveFileId(null);
        setSyncStatus('local');
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Monitor players state to push changes via autoSync
  useEffect(() => {
    if (isPullingDataRef.current) {
      isPullingDataRef.current = false;
      return;
    }

    if (!isSignedIn || !autoSync) return;
    
    const token = getAccessToken();
    if (!token) return;

    const debouncePush = setTimeout(async () => {
      setSyncStatus('syncing');
      try {
        let fileId = driveFileId;
        if (!fileId) {
          fileId = await findDriveFile(token, 'cricmetrics_data.json');
          setDriveFileId(fileId);
        }
        if (fileId) {
          await updateDriveFile(token, fileId, players);
        } else {
          const newId = await createDriveFile(token, 'cricmetrics_data.json', players);
          setDriveFileId(newId);
        }
        setSyncStatus('synced');
        setLastSynced(new Date().toLocaleTimeString());
      } catch (err) {
        console.error('Google Drive Auto Sync failed:', err);
        setSyncStatus('error');
      }
    }, 1500);

    return () => clearTimeout(debouncePush);
  }, [players, isSignedIn, autoSync, driveFileId]);

  // 2. State Save synchronization
  const savePlayers = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPlayers));
  };

  const selectedPlayer = players.find(p => p.id === selectedPlayerId);

  // 3. Callback functions for Player Profiles
  const handleSelectPlayer = (id: string) => {
    setSelectedPlayerId(id);
  };

  const handleAddPlayer = (newInfo: Omit<Player, 'id' | 'battingInnings' | 'bowlingInnings'>) => {
    const newId = newInfo.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');
    // Ensure unique ID
    const holdsId = players.some(p => p.id === newId);
    const finalId = holdsId ? `${newId}-${Date.now()}` : newId;

    const newPlayer: Player = {
      ...newInfo,
      id: finalId,
      battingInnings: [],
      bowlingInnings: [],
    };

    const updated = [newPlayer, ...players];
    savePlayers(updated);
    setSelectedPlayerId(finalId);
  };

  const handleDeletePlayer = (id: string) => {
    const updated = players.filter(p => p.id !== id);
    savePlayers(updated);
    if (updated.length > 0) {
      setSelectedPlayerId(updated[0].id);
    } else {
      setSelectedPlayerId('');
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm('Are you sure you want to restore the preloaded historical legends? This will overwrite your current workspace changes.')) {
      savePlayers(DEFAULT_PLAYERS);
      setSelectedPlayerId(DEFAULT_PLAYERS[0].id);
    }
  };

  // 4. Callbacks for Batting Innings
  const handleAddBattingInnings = (innOrInns: Omit<BattingInnings, 'id'> | Omit<BattingInnings, 'id'>[]) => {
    if (!selectedPlayerId) return;

    const items = Array.isArray(innOrInns) ? innOrInns : [innOrInns];
    const newInnings: BattingInnings[] = items.map((inn, idx) => ({
      ...inn,
      id: `bat-${selectedPlayerId}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    setPlayers(prevPlayers => {
      const updated = prevPlayers.map(player => {
        if (player.id !== selectedPlayerId) return player;
        return {
          ...player,
          battingInnings: [...player.battingInnings, ...newInnings],
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteBattingInnings = (id: string) => {
    if (!selectedPlayerId) return;

    const updatedPlayers = players.map(player => {
      if (player.id !== selectedPlayerId) return player;
      return {
        ...player,
        battingInnings: player.battingInnings.filter(inn => inn.id !== id),
      };
    });

    savePlayers(updatedPlayers);
  };

  // 5. Callbacks for Bowling Innings
  const handleAddBowlingInnings = (innOrInns: Omit<BowlingInnings, 'id'> | Omit<BowlingInnings, 'id'>[]) => {
    if (!selectedPlayerId) return;

    const items = Array.isArray(innOrInns) ? innOrInns : [innOrInns];
    const newInnings: BowlingInnings[] = items.map((inn, idx) => ({
      ...inn,
      id: `bowl-${selectedPlayerId}-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
    }));

    setPlayers(prevPlayers => {
      const updated = prevPlayers.map(player => {
        if (player.id !== selectedPlayerId) return player;
        return {
          ...player,
          bowlingInnings: [...player.bowlingInnings, ...newInnings],
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeleteBowlingInnings = (id: string) => {
    if (!selectedPlayerId) return;

    const updatedPlayers = players.map(player => {
      if (player.id !== selectedPlayerId) return player;
      return {
        ...player,
        bowlingInnings: player.bowlingInnings.filter(inn => inn.id !== id),
      };
    });

    savePlayers(updatedPlayers);
  };

  return (
    <div className="min-h-screen immersive-bg text-slate-200 font-sans antialiased selection:bg-sky-500/30 selection:text-sky-100 pb-16">
      {/* Immersive Header Design */}
      <header className="glass-panel text-white shadow-lg sticky top-0 z-50 border-b-0 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500 p-2.5 rounded-xl border border-sky-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(56,189,248,0.3)]">
              <Dumbbell className="w-6 h-6 text-slate-955 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter glow-text uppercase font-sans">
                CRICMETRICS<span className="text-sky-400">PRO</span>
              </h1>
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">
                Professional Test Match Batting & Bowling Form Tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="hidden xs:flex items-center gap-1.5 bg-slate-900/80 px-4 py-2 rounded-full border border-sky-500/20 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#22c55e]"></span>
              <span className="opacity-75 text-slate-300">Active Profiles:</span>
              <span className="text-sky-400 font-bold">{players.length}</span>
            </div>

            {/* Google Drive Cloud Sync Widget */}
            <div className="relative">
              <button
                id="cloud-sync-toggle"
                onClick={() => setShowSyncDropdown(!showSyncDropdown)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full border select-none transition-all cursor-pointer ${
                  isSignedIn
                    ? syncStatus === 'synced'
                      ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/60 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
                      : syncStatus === 'syncing'
                      ? 'bg-amber-950/40 border-amber-500/30 text-amber-400 hover:bg-amber-950/60 animate-pulse'
                      : 'bg-sky-950/40 border-sky-500/30 text-sky-400 hover:bg-sky-950/60'
                    : 'bg-slate-900/80 border-slate-700/50 text-slate-400 hover:border-slate-600'
                }`}
              >
                {isSignedIn ? (
                  syncStatus === 'synced' ? (
                    <>
                      <Cloud className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline font-bold">Drive Synced</span>
                    </>
                  ) : syncStatus === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="hidden sm:inline font-bold">Syncing...</span>
                    </>
                  ) : syncStatus === 'error' ? (
                    <>
                      <CloudOff className="w-4 h-4 text-rose-450" />
                      <span className="hidden sm:inline font-bold">Sync Error</span>
                    </>
                  ) : (
                    <>
                      <Cloud className="w-4 h-4 text-sky-400" />
                      <span className="hidden sm:inline font-bold">Drive Connected</span>
                    </>
                  )
                ) : (
                  <>
                    <CloudOff className="w-4 h-4 text-slate-500" />
                    <span className="hidden sm:inline font-bold">Drive Backups</span>
                  </>
                )}
              </button>

              {showSyncDropdown && (
                <>
                  <div 
                    id="cloud-backdrop"
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setShowSyncDropdown(false)} 
                  />
                  <div id="cloud-sync-dropdown" className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900/95 border border-slate-700/60 rounded-2xl shadow-xl z-50 p-4 font-sans text-slate-200 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Google Drive Backup</span>
                      {isSignedIn && (
                        <button
                          id="cloud-signout-btn"
                          onClick={() => {
                            handleLogout();
                            setShowSyncDropdown(false);
                          }}
                          className="text-[10px] bg-slate-800 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 py-1 px-2.2 rounded-lg font-mono transition inline-flex items-center gap-1 cursor-pointer border border-transparent hover:border-rose-900/50"
                        >
                          <LogOut className="w-3 h-3" /> Disconnect
                        </button>
                      )}
                    </div>

                    {!isSignedIn ? (
                      <div className="space-y-3 font-sans">
                        <p className="text-xs text-slate-400 leading-relaxed font-sans normal-case">
                          Securely save your players' match records to your personal Google Drive for cloud backups and multi-device access.
                        </p>
                        <button
                          id="cloud-signin-btn"
                          onClick={handleLogin}
                          disabled={isLoggingIn}
                          className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 text-slate-900 font-bold px-4 py-2.5 rounded-xl transition shadow-md cursor-pointer text-xs"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4">
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                          </svg>
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3.5 font-sans">
                        <div className="bg-slate-950/50 p-2.5 rounded-xl border border-white/5 flex items-center gap-2.5">
                          {googleUser?.photoURL ? (
                            <img src={googleUser.photoURL} alt={googleUser.displayName} className="w-8 h-8 rounded-full border border-white/10" referrerPolicy="no-referrer" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs uppercase">
                              {googleUser?.displayName?.charAt(0) || 'U'}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-xs font-bold text-slate-100 truncate">{googleUser?.displayName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{googleUser?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="flex items-center gap-2 py-1 relative cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={autoSync}
                              onChange={e => setAutoSync(e.target.checked)}
                              className="w-4 h-4 text-sky-500 border-slate-700 rounded bg-slate-950 accent-sky-500 focus:ring-sky-500 cursor-pointer"
                            />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider font-mono">Auto-save changes</span>
                          </label>

                          <div className="grid grid-cols-2 gap-2 pt-1 font-mono">
                            <button
                              id="cloud-push-btn"
                              onClick={handlePushToDrive}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                              <Upload className="w-3.5 h-3.5" /> Push
                            </button>
                            <button
                              id="cloud-pull-btn"
                              onClick={handlePullFromDrive}
                              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-850 hover:bg-slate-800 active:bg-slate-900 border border-white/10 text-slate-200 font-bold rounded-xl text-xs transition cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" /> Pull
                            </button>
                          </div>
                        </div>

                        <div className="border-t border-white/5 pt-2.5 flex items-center justify-between text-[10px] font-mono text-slate-400">
                          <span>Status: <strong className="text-sky-400">{syncStatus.toUpperCase()}</strong></span>
                          {lastSynced && <span>Refreshed: {lastSynced}</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Module 1: Player selection and actions */}
        <section aria-labelledby="player-selector-heading">
          <PlayerSelector
            players={players}
            selectedPlayerId={selectedPlayerId}
            onSelectPlayer={handleSelectPlayer}
            onAddPlayer={handleAddPlayer}
            onDeletePlayer={handleDeletePlayer}
            onResetDefaults={handleResetDefaults}
          />
        </section>

        {selectedPlayer ? (
          <>
            {/* Module 2: Data exporting solutions */}
            <section aria-label="Export tools">
              <ExportPanel player={selectedPlayer} />
            </section>

            {/* Module 3: Historical bento metrics grid */}
            <section aria-label="Performance aggregates">
              <OverviewStats player={selectedPlayer} />
            </section>

            {/* Module 4: Career Progression SVG Charts */}
            <section aria-label="Trend analysis charts">
              <PerformanceCharts player={selectedPlayer} />
            </section>

            {/* Module 5: Detailed match grids & data entry loggers */}
            <section aria-label="Innings log ledger">
              <MatchLog
                player={selectedPlayer}
                onAddBattingInnings={handleAddBattingInnings}
                onAddBowlingInnings={handleAddBowlingInnings}
                onDeleteBattingInnings={handleDeleteBattingInnings}
                onDeleteBowlingInnings={handleDeleteBowlingInnings}
              />
            </section>
          </>
        ) : (
          <div className="glass-panel rounded-2xl p-12 text-center max-w-lg mx-auto mt-12 border border-sky-500/20">
            <Info className="w-12 h-12 mx-auto text-amber-500 mb-4" />
            <h3 className="text-lg font-bold text-slate-100 mb-2">Workspace is Empty</h3>
            <p className="text-sm text-slate-400 mb-6">
              You do not have any active player profiles registered inside this workspace.
            </p>
            <button
              onClick={() => {
                savePlayers(DEFAULT_PLAYERS);
                setSelectedPlayerId(DEFAULT_PLAYERS[0].id);
              }}
              className="px-5 py-2.5 btn-primary rounded-lg cursor-pointer"
            >
              Reload Preloaded Profiles
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
