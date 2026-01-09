
import React from 'react';
import { Song } from '../types';

interface SongItemProps {
  song: Song;
  isActive: boolean;
  onSelect: (song: Song) => void;
}

const SongItem: React.FC<SongItemProps> = ({ song, isActive, onSelect }) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <button 
      onClick={() => onSelect(song)}
      className={`group flex items-center w-full text-left gap-4 p-3 rounded-2xl transition-all duration-300 relative overflow-hidden border ${
        isActive 
        ? 'bg-blue-600/10 border-blue-500/30' 
        : 'hover:bg-black/5 dark:hover:bg-white/5 border-transparent'
      }`}
    >
      <div className="relative w-10 h-10 flex-shrink-0">
        <img src={song.coverUrl} alt="" className="w-full h-full object-cover rounded-xl" />
        {isActive && (
          <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
             <div className="flex gap-0.5 items-end h-3">
               <div className="w-0.5 bg-blue-400 animate-[bounce_0.6s_infinite]" />
               <div className="w-0.5 bg-blue-400 animate-[bounce_0.8s_infinite]" />
               <div className="w-0.5 bg-blue-400 animate-[bounce_0.5s_infinite]" />
             </div>
          </div>
        )}
      </div>
      
      <div className="flex-grow min-w-0 pr-12">
        <h4 className={`text-xs font-bold truncate ${isActive ? 'text-blue-500' : 'text-current opacity-90'}`}>{song.title}</h4>
        <p className="text-[10px] opacity-60 font-medium truncate">{song.artist}</p>
      </div>
      
      <div className="text-[9px] font-mono opacity-40">{formatDuration(song.duration)}</div>
    </button>
  );
};

export default SongItem;
