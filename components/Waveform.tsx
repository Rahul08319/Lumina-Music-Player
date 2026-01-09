
import React, { useMemo } from 'react';

interface WaveformProps {
  isPlaying: boolean;
}

const Waveform: React.FC<WaveformProps> = ({ isPlaying }) => {
  // Generate a static random set of heights for the waveform skeleton
  const bars = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      baseHeight: Math.random() * 30 + 10,
      delay: Math.random() * 2
    }));
  }, []);

  return (
    <div className="flex items-center justify-center gap-[3px] h-12 w-full overflow-hidden opacity-80 group">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className={`w-[3px] bg-gradient-to-t from-blue-600 via-blue-400 to-indigo-400 rounded-full transition-all duration-300 ease-in-out ${
            isPlaying ? 'animate-waveform-active' : 'h-[4px] opacity-40'
          }`}
          style={{
            height: isPlaying ? undefined : '4px',
            animationDelay: isPlaying ? `${bar.delay}s` : '0s',
            // Default active height when playing is handled by CSS animation but we set a fallback
            minHeight: '4px'
          }}
        />
      ))}
      <style>{`
        @keyframes waveform-active {
          0%, 100% { height: 8px; transform: scaleY(1); opacity: 0.5; }
          50% { height: 32px; transform: scaleY(1.2); opacity: 1; }
        }
        .animate-waveform-active {
          animation: waveform-active 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Waveform;
