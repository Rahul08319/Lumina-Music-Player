
import React, { useState, useEffect, useRef } from 'react';
import { Song } from '../types';

interface LyricsPanelProps {
  song: Song | null;
  currentTime: number;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({ song, currentTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [lyrics, setLyrics] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (!song) return;
    const fetchLyrics = async () => {
      setLoading(true);
      setLyrics("");
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockLyrics: Record<string, string> = {
        '1': "Midnight city, calls my name...\nThe neon lights are burning bright\nWaiting for the magic hour\nWhen the stars begin to shine\n\nLooking at the city lights\nSearching for a sign of life\nWe are the dreamers\nIn the midnight city.",
        '2': "I'm tryna put you in the worst mood, ah\nP1 cleaner than your church shoes, ah\nMilli point two just to hurt you, ah\nAll red Lamb' just to tease you, ah\n\nLook what you've done\nI'm a motherfuckin' starboy.",
        '3': "I waited for so long\nBut I didn't know join\nI was thinking about you\nAnd the things we do\n\nIt was an instant crush\nI couldn't help myself\nYou were everything I needed\nAnd more.",
        '4': "I've been on my own for long enough\nMaybe you can show me how to love, maybe\nI'm going through withdrawals\nYou don't even have to do too much.\n\nI said, ooh, I'm blinded by the lights\nNo, I can't sleep until I feel your touch."
      };
      setLyrics(mockLyrics[song.id] || "Lyrics not available.");
      setLoading(false);
    };
    fetchLyrics();
  }, [song]);

  const lines = lyrics.split('\n');
  // Simple time-to-line mapping for mock synchronization
  const activeLineIndex = Math.min(
    lines.length - 1, 
    Math.floor((currentTime / (song?.duration || 1)) * lines.length)
  );

  useEffect(() => {
    if (activeLineRef.current && isOpen) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [activeLineIndex, isOpen]);

  if (!song) return null;

  return (
    <div className={`w-full max-w-md mx-auto mt-6 transition-all duration-700 ${isOpen ? 'mb-8' : 'mb-0'}`}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
          {isOpen ? 'Hide Lyrics' : 'Show Lyrics'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180 text-blue-400' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'max-h-[400px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
        <div ref={scrollRef} className="p-8 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 h-64 overflow-y-auto custom-scrollbar relative">
          {loading ? (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="text-center px-4">
              {lines.map((line, i) => (
                <p 
                  key={i} 
                  ref={i === activeLineIndex ? activeLineRef : null}
                  className={`font-sans text-lg leading-relaxed mb-4 transition-all duration-500 ${i === activeLineIndex ? 'text-white font-black scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'text-slate-500 opacity-40 blur-[0.5px]'}`}
                >
                  {line || '...'}
                </p>
              ))}
            </div>
          )}
          <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-slate-900/80 to-transparent pointer-events-none" />
        </div>
      </div>
    </div>
  );
};

export default LyricsPanel;
