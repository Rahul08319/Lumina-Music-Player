
export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number; // in seconds
  coverUrl: string;
  audioUrl: string;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffle: boolean;
  playbackSpeed: number;
  theme: 'dark' | 'light';
  favorites: string[];
}
