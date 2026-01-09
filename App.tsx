
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Song, PlayerState } from './types';
import { 
  MOCK_SONGS, PlayIcon, PauseIcon, SkipForwardIcon, SkipBackIcon, 
  VolumeIcon, MuteIcon, ShuffleIcon, RepeatIcon 
} from './constants';
import SongItem from './components/SongItem';
import Visualizer from './components/Visualizer';
import LyricsPanel from './components/LyricsPanel';
import Waveform from './components/Waveform';

const STORAGE_KEY = 'lumina_player_session';
const EQ_STORAGE_KEY = 'lumina_eq_settings';
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

const App: React.FC = () => {
  const [songs] = useState<Song[]>(MOCK_SONGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showQueueMenu, setShowQueueMenu] = useState(false);
  const [showEq, setShowEq] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracklist' | 'queue'>('tracklist');
  const [queue, setQueue] = useState<Song[]>(MOCK_SONGS);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  
  const [eqSettings, setEqSettings] = useState(() => {
    const saved = localStorage.getItem(EQ_STORAGE_KEY);
    return saved ? JSON.parse(saved) : { bass: 50, mids: 50, treble: 50 };
  });

  const [playerState, setPlayerState] = useState<PlayerState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const currentSong = MOCK_SONGS.find(s => s.id === parsed.currentSongId) || MOCK_SONGS[0];
        return {
          isPlaying: false,
          currentSong,
          currentTime: parsed.currentTime || 0,
          volume: parsed.volume ?? 0.7,
          isMuted: parsed.isMuted ?? false,
          repeatMode: parsed.repeatMode || 'all',
          isShuffle: parsed.isShuffle ?? false,
          playbackSpeed: parsed.playbackSpeed ?? 1,
          theme: parsed.theme || 'dark',
          favorites: parsed.favorites || [],
        };
      } catch (e) { console.error(e); }
    }
    return {
      isPlaying: false,
      currentSong: MOCK_SONGS[0],
      currentTime: 0,
      volume: 0.7,
      isMuted: false,
      repeatMode: 'all',
      isShuffle: false,
      playbackSpeed: 1,
      theme: 'dark',
      favorites: [],
    };
  });

  const [showSaveToast, setShowSaveToast] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const searchResults = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return [];
    return songs.filter(song => 
      song.title.toLowerCase().includes(query) ||
      song.artist.toLowerCase().includes(query) ||
      song.album.toLowerCase().includes(query)
    ).slice(0, 5);
  }, [songs, searchQuery]);

  const currentIndex = useMemo(() => 
    queue.findIndex(s => s.id === playerState.currentSong?.id),
    [queue, playerState.currentSong]
  );

  const prevSong = useMemo(() => 
    queue[(currentIndex - 1 + queue.length) % queue.length] || queue[0],
    [queue, currentIndex]
  );

  const nextSong = useMemo(() => 
    queue[(currentIndex + 1) % queue.length] || queue[0],
    [queue, currentIndex]
  );

  const togglePlay = useCallback(() => {
    setPlayerState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  }, []);

  const playSong = useCallback((song: Song) => {
    setPlayerState(prev => ({ ...prev, currentSong: song, isPlaying: true, currentTime: 0 }));
    setShowSearchDropdown(false);
    setSearchQuery('');
  }, []);

  const handleNext = useCallback(() => {
    if (queue.length === 0) return;
    let nextIdx;
    if (playerState.isShuffle) {
      const availableIndices = queue.map((_, i) => i).filter(i => queue.length <= 1 || i !== currentIndex);
      nextIdx = availableIndices[Math.floor(Math.random() * availableIndices.length)];
    } else {
      nextIdx = (currentIndex + 1) % queue.length;
    }
    setPlayerState(prev => ({ ...prev, currentSong: queue[nextIdx], currentTime: 0 }));
  }, [queue, currentIndex, playerState.isShuffle]);

  const handlePrev = useCallback(() => {
    if (queue.length === 0) return;
    const prevIdx = (currentIndex - 1 + queue.length) % queue.length;
    setPlayerState(prev => ({ ...prev, currentSong: queue[prevIdx], currentTime: 0 }));
  }, [queue, currentIndex]);

  const toggleTheme = () => setPlayerState(prev => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }));

  const handleSavePlaylist = useCallback(() => {
    const sessionData = {
      currentSongId: playerState.currentSong?.id,
      currentTime: playerState.currentTime,
      volume: playerState.volume,
      isMuted: playerState.isMuted,
      repeatMode: playerState.repeatMode,
      isShuffle: playerState.isShuffle,
      playbackSpeed: playerState.playbackSpeed,
      theme: playerState.theme,
      favorites: playerState.favorites,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
  }, [playerState]);

  const toggleFavorite = useCallback((id: string) => {
    setPlayerState(prev => {
      const isFav = prev.favorites.includes(id);
      const newFavs = isFav 
        ? prev.favorites.filter(fid => fid !== id) 
        : [...prev.favorites, id];
      return { ...prev, favorites: newFavs };
    });
  }, []);

  const onDragStart = (index: number) => setDraggedItemIndex(index);
  const onDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;
    const newQueue = [...queue];
    const draggedItem = newQueue[draggedItemIndex];
    newQueue.splice(draggedItemIndex, 1);
    newQueue.splice(index, 0, draggedItem);
    setQueue(newQueue);
    setDraggedItemIndex(index);
  };

  useEffect(() => {
    localStorage.setItem(EQ_STORAGE_KEY, JSON.stringify(eqSettings));
  }, [eqSettings]);

  // Sync favorites specifically whenever playerState changes
  useEffect(() => {
    const sessionData = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    sessionData.favorites = playerState.favorites;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessionData));
  }, [playerState.favorites]);

  useEffect(() => {
    if (audioRef.current) {
      if (playerState.isPlaying) audioRef.current.play().catch(() => {});
      else audioRef.current.pause();
    }
  }, [playerState.isPlaying, playerState.currentSong]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = playerState.isMuted ? 0 : playerState.volume;
      audioRef.current.playbackRate = playerState.playbackSpeed;
    }
  }, [playerState.volume, playerState.isMuted, playerState.playbackSpeed]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) setPlayerState(prev => ({ ...prev, currentTime: audioRef.current?.currentTime || 0 }));
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setPlayerState(prev => ({ ...prev, currentTime: time }));
  };

  const handleEnded = () => {
    if (playerState.repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play();
      }
    } else {
      handleNext();
    }
  };

  const cycleRepeat = () => {
    setPlayerState(prev => {
      let nextMode: 'none' | 'all' | 'one';
      if (prev.repeatMode === 'none') nextMode = 'all';
      else if (prev.repeatMode === 'all') nextMode = 'one';
      else nextMode = 'none';
      return { ...prev, repeatMode: nextMode };
    });
  };

  return (
    <div className={`h-screen w-screen flex flex-col transition-colors duration-500 overflow-hidden ${playerState.theme === 'dark' ? 'bg-[#020617] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <style>{`
        .tooltip { position: relative; }
        .tooltip::after {
          content: attr(data-tooltip);
          position: absolute; bottom: 125%; left: 50%; transform: translateX(-50%) scale(0.9);
          background: #1e293b; color: white; padding: 6px 12px; border-radius: 8px; font-size: 10px; font-weight: 800; text-transform: uppercase; white-space: nowrap; opacity: 0; pointer-events: none; transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); z-index: 100;
        }
        .tooltip:hover::after { opacity: 1; transform: translateX(-50%) scale(1); }
        .perspective-1000 { perspective: 1000px; }
        .carousel-prev { transform: rotateY(30deg) translateZ(-100px) translateX(-60%); opacity: 0.4; }
        .carousel-next { transform: rotateY(-30deg) translateZ(-100px) translateX(60%); opacity: 0.4; }
        .carousel-active { transform: rotateY(0deg) translateZ(50px) scale(1); opacity: 1; z-index: 30; }
        @keyframes popIn { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        @keyframes shuffle-pulse {
          0%, 100% { filter: drop-shadow(0 0 2px rgba(59, 130, 246, 0.5)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 12px rgba(59, 130, 246, 0.8)); transform: scale(1.05); }
        }
        .shuffle-active { animation: shuffle-pulse 2s infinite ease-in-out; }

        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 14px;
          width: 14px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
          transition: transform 0.2s;
        }
        input[type="range"]:hover::-webkit-slider-thumb {
          transform: scale(1.2);
        }
      `}</style>

      {/* Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-[popIn_0.2s_ease-out]">
          <div className={`p-8 rounded-[2rem] border max-w-sm w-full shadow-2xl ${playerState.theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
            <h3 className="text-xl font-black mb-2 uppercase italic tracking-tighter">Clear Queue?</h3>
            <p className="text-sm opacity-60 mb-8 font-medium">This will remove all tracks from your playback list. This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Cancel</button>
              <button onClick={() => { setQueue([]); setShowClearConfirm(false); }} className="flex-1 py-3 text-xs font-black uppercase tracking-widest bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all">Clear All</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Notification */}
      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 pointer-events-none ${showSaveToast ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
        <div className="bg-blue-600/20 backdrop-blur-xl border border-blue-500/30 px-6 py-3 rounded-full flex items-center gap-3 text-blue-500">
          <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-sm font-bold tracking-tight uppercase">Synced</span>
        </div>
      </div>

      <header className="flex items-center justify-between px-10 py-5 border-b border-white/5 glass-panel z-50">
        <div className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center font-bold text-lg text-white rotate-3">L</div>
          <span className="text-2xl font-black tracking-tighter uppercase italic">Lumina <span className="text-blue-500 not-italic">Audio</span></span>
        </div>
        
        <div className="flex-grow max-w-md mx-8 relative group">
          <input 
            type="text" placeholder="Search tracks..." value={searchQuery} onFocus={() => setShowSearchDropdown(true)}
            onChange={(e) => { setSearchQuery(e.target.value); setShowSearchDropdown(true); }}
            className={`w-full border rounded-2xl py-2.5 pl-12 pr-10 text-sm font-medium focus:outline-none transition-all ${playerState.theme === 'dark' ? 'bg-white/5 border-white/10 focus:bg-white/10' : 'bg-slate-200/50 border-slate-300 focus:bg-white'}`}
          />
          {showSearchDropdown && searchResults.length > 0 && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSearchDropdown(false)} />
              <div className={`absolute top-full left-0 right-0 mt-3 p-2 rounded-2xl border shadow-2xl z-50 backdrop-blur-3xl animate-[popIn_0.3s_ease-out] ${playerState.theme === 'dark' ? 'bg-slate-900/95 border-white/10' : 'bg-white/95 border-slate-200'}`}>
                {searchResults.map(song => (
                  <button key={song.id} onClick={() => playSong(song)} className={`flex items-center gap-4 w-full p-2 rounded-xl transition-all text-left ${playerState.theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-100'}`}>
                    <img src={song.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
                    <div className="flex-grow min-w-0">
                      <div className="text-xs font-bold truncate">{song.title}</div>
                      <div className="text-[10px] opacity-60 truncate">{song.artist} • {song.album}</div>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowEq(!showEq)} className={`p-2.5 rounded-xl transition-all tooltip active:scale-95 ${showEq ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]' : 'bg-white/5 hover:bg-white/10 text-slate-400'}`} data-tooltip="Equalizer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 14V3M1 14h6M9 8h6M17 14h6" /></svg>
          </button>
          <button onClick={toggleTheme} className={`p-2.5 rounded-xl transition-all tooltip active:scale-95 ${playerState.theme === 'dark' ? 'bg-white/5 text-yellow-400' : 'bg-slate-200 text-slate-700'}`} data-tooltip="Toggle Theme">
             {playerState.theme === 'dark' ? <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M1 12h2M21 12h2" /></svg> : <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>}
          </button>
        </div>
      </header>

      {/* EQ Panel */}
      <div className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden ${showEq ? 'max-h-60 border-b border-white/5 opacity-100 py-8 bg-black/20' : 'max-h-0 opacity-0 p-0'}`}>
        <div className="max-w-4xl mx-auto px-10">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-blue-500">Audio Equalizer</h3>
            <button onClick={() => setEqSettings({ bass: 50, mids: 50, treble: 50 })} className="text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors">Reset to Flat</button>
          </div>
          <div className="flex items-center justify-center gap-16">
            {['Bass', 'Mids', 'Treble'].map(band => {
              const key = band.toLowerCase() as keyof typeof eqSettings;
              return (
                <div key={band} className="flex-1 space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>{band}</span>
                    <span className="text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">{eqSettings[key]}%</span>
                  </div>
                  <div className="relative h-1.5 flex items-center">
                    <input 
                      type="range" min="0" max="100" value={eqSettings[key]}
                      onChange={(e) => setEqSettings(s => ({ ...s, [key]: parseInt(e.target.value) }))}
                      className="w-full h-full bg-slate-800 rounded-full appearance-none cursor-pointer"
                      style={{ background: `linear-gradient(to right, #3b82f6 ${eqSettings[key]}%, #1e293b 0%)` }}
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-bold text-slate-600 uppercase">
                    <span>-12dB</span>
                    <span>Flat</span>
                    <span>+12dB</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
        <aside className="w-full md:w-[400px] border-r border-white/5 glass-panel p-8 flex flex-col overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 p-1 bg-black/10 rounded-xl mb-6 relative">
            <button onClick={() => setActiveTab('tracklist')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'tracklist' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Library</button>
            <button onClick={() => setActiveTab('queue')} className={`flex-1 py-2 text-[10px] font-black uppercase rounded-lg transition-all ${activeTab === 'queue' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}>Queue ({queue.length})</button>
            <button onClick={() => setShowQueueMenu(!showQueueMenu)} className="p-2 text-slate-500 hover:text-white transition-colors">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
            </button>
            {showQueueMenu && (
              <div className={`absolute top-full right-0 mt-2 p-1 rounded-xl border shadow-2xl z-50 min-w-[140px] ${playerState.theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}>
                <button onClick={() => { setShowClearConfirm(true); setShowQueueMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-red-500/10 hover:text-red-500 rounded-lg">Clear All</button>
                <button onClick={() => { setQueue(MOCK_SONGS); setShowQueueMenu(false); }} className="w-full text-left px-4 py-2 text-[10px] font-black uppercase hover:bg-blue-500/10 hover:text-blue-500 rounded-lg">Restore Defaults</button>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {(activeTab === 'tracklist' ? songs : queue).map((song, idx) => (
              <div key={`${song.id}-${idx}`} draggable={activeTab === 'queue'} onDragStart={() => onDragStart(idx)} onDragOver={(e) => onDragOver(e, idx)}
                   className={`group relative ${activeTab === 'queue' ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedItemIndex === idx ? 'opacity-50 grayscale' : ''}`}>
                <SongItem song={song} isActive={playerState.currentSong?.id === song.id} onSelect={playSong} />
              </div>
            ))}
          </div>
        </aside>

        <section className="flex-grow flex flex-col items-center justify-start p-10 overflow-y-auto custom-scrollbar relative">
          <div className="max-w-4xl w-full text-center space-y-8 z-10 pt-10">
            <div className="relative h-[420px] w-full flex items-center justify-center perspective-1000">
              <div onClick={handlePrev} className="absolute carousel-prev cursor-pointer transition-all duration-700 w-64 h-64 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                <img src={prevSong.coverUrl} className="w-full h-full object-cover grayscale opacity-50" alt="" />
              </div>
              <div className="carousel-active w-80 h-80 md:w-[400px] md:h-[400px] rounded-[3.5rem] overflow-hidden shadow-2xl border-4 border-white/5 transition-all duration-700">
                 <img src={playerState.currentSong?.coverUrl} className={`w-full h-full object-cover transition-transform duration-[20s] linear ${playerState.isPlaying ? 'scale-125' : 'scale-100'}`} alt="" />
              </div>
              <div onClick={handleNext} className="absolute carousel-next cursor-pointer transition-all duration-700 w-64 h-64 rounded-3xl overflow-hidden border border-white/10 shadow-xl">
                <img src={nextSong.coverUrl} className="w-full h-full object-cover grayscale opacity-50" alt="" />
              </div>
            </div>

            <div className="space-y-6 relative z-30">
              <div className="flex items-center justify-center gap-6">
                <h2 className="text-6xl font-black tracking-tighter uppercase italic">{playerState.currentSong?.title}</h2>
                <button 
                  onClick={() => playerState.currentSong && toggleFavorite(playerState.currentSong.id)} 
                  className={`p-2 transition-all active:scale-75 ${playerState.favorites.includes(playerState.currentSong?.id || '') ? 'text-red-500 scale-110 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-slate-400 hover:text-red-400'}`}
                >
                  <svg viewBox="0 0 24 24" fill={playerState.favorites.includes(playerState.currentSong?.id || '') ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-10 h-10"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                </button>
              </div>
              <p className="text-2xl text-blue-500 font-bold uppercase tracking-widest">{playerState.currentSong?.artist}</p>
              <div className="w-full max-w-xl mx-auto py-6"><Waveform isPlaying={playerState.isPlaying} /></div>
            </div>

            <Visualizer isPlaying={playerState.isPlaying} />
            <LyricsPanel song={playerState.currentSong} currentTime={playerState.currentTime} />
          </div>
        </section>
      </main>

      <footer className="h-32 glass-panel border-t border-white/10 flex flex-col items-center justify-center px-12 z-40">
        <div className="w-full max-w-5xl flex items-center gap-6 mb-4">
          <span className="text-xs font-mono font-bold text-slate-400 w-12 text-right">{formatTime(playerState.currentTime)}</span>
          <input 
            type="range" min="0" max={playerState.currentSong?.duration || 0} value={playerState.currentTime} onChange={onSeek}
            className="flex-grow h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500"
            style={{ background: `linear-gradient(to right, #3b82f6 ${(playerState.currentTime / (playerState.currentSong?.duration || 1)) * 100}%, #1e293b 0%)` }}
          />
          <span className="text-xs font-mono font-bold text-slate-400 w-12">{formatTime(playerState.currentSong?.duration || 0)}</span>
        </div>

        <div className="w-full max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-4 w-1/3">
            <button 
              onClick={() => setPlayerState(p => ({ ...p, isShuffle: !p.isShuffle }))} 
              className={`p-3 rounded-xl tooltip transition-all ${playerState.isShuffle ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 shuffle-active' : 'text-slate-400 hover:text-white'}`} 
              data-tooltip="Shuffle"
            ><ShuffleIcon /></button>
            <button 
              onClick={cycleRepeat} 
              className={`p-3 rounded-xl tooltip flex flex-col items-center relative transition-all ${playerState.repeatMode !== 'none' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-white'}`} 
              data-tooltip={`Repeat: ${playerState.repeatMode}`}
            >
              <RepeatIcon />
              {playerState.repeatMode === 'one' && <span className="absolute -top-1 -right-1 text-[8px] font-black bg-blue-400 text-white px-1.5 py-0.5 rounded-full border border-blue-600">1</span>}
            </button>
          </div>

          <div className="flex items-center gap-10 justify-center w-1/3">
            <button onClick={handlePrev} className="text-slate-400 hover:text-white transition-all active:scale-75 p-2 tooltip" data-tooltip="Previous"><SkipBackIcon /></button>
            <button onClick={togglePlay} className="w-16 h-16 bg-blue-600 text-white rounded-[1.25rem] flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-xl tooltip" data-tooltip={playerState.isPlaying ? "Pause" : "Play"}>{playerState.isPlaying ? <PauseIcon /> : <PlayIcon />}</button>
            <button onClick={handleNext} className="text-slate-400 hover:text-white transition-all active:scale-75 p-2 tooltip" data-tooltip="Next"><SkipForwardIcon /></button>
          </div>

          <div className="flex items-center gap-4 w-1/3 justify-end">
            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className={`p-2.5 rounded-xl tooltip text-[10px] font-black transition-all ${playerState.playbackSpeed !== 1 ? 'bg-blue-600 text-white' : 'text-slate-400 bg-white/5 hover:text-white'}`} data-tooltip="Playback Speed">{playerState.playbackSpeed}x</button>
            {showSpeedMenu && (
              <div className="fixed bottom-36 right-48 bg-slate-900 border border-white/10 rounded-2xl p-2 shadow-2xl z-[100] flex flex-col gap-1 min-w-[100px] animate-[popIn_0.3s_ease-out]">
                {SPEED_OPTIONS.map(s => (
                  <button key={s} onClick={() => { setPlayerState(p => ({ ...p, playbackSpeed: s })); setShowSpeedMenu(false); }} className={`px-4 py-2 text-xs font-black rounded-lg ${playerState.playbackSpeed === s ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/5'}`}>{s}x</button>
                ))}
              </div>
            )}
            <button onClick={() => setPlayerState(p => ({ ...p, isMuted: !p.isMuted }))} className={`p-3 rounded-xl tooltip transition-all ${playerState.isMuted ? 'text-red-500 bg-red-500/10' : 'text-slate-400 hover:text-white'}`} data-tooltip={playerState.isMuted ? "Unmute" : "Mute"}>{playerState.isMuted ? <MuteIcon /> : <VolumeIcon />}</button>
            <div className="relative group/vol flex items-center">
              <input 
                type="range" min="0" max="1" step="0.01" 
                value={playerState.isMuted ? 0 : playerState.volume} 
                onChange={(e) => setPlayerState(p => ({ ...p, volume: parseFloat(e.target.value), isMuted: false }))} 
                className="w-24 h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-blue-500 transition-all group-hover/vol:h-2"
                style={{ background: `linear-gradient(to right, #3b82f6 ${(playerState.isMuted ? 0 : playerState.volume) * 100}%, #1e293b 0%)` }}
              />
            </div>
          </div>
        </div>
      </footer>

      <audio ref={audioRef} src={playerState.currentSong?.audioUrl} onTimeUpdate={handleTimeUpdate} onEnded={handleEnded} />
    </div>
  );
};

export default App;
