
import React from 'react';

export const PlayIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M8 5.14v14l11-7-11-7z" /></svg>
);

export const PauseIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>
);

export const SkipForwardIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
);

export const SkipBackIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
);

export const VolumeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
);

export const MuteIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
);

export const ShuffleIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.44 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.05 2.05-3.12-3.13z" /></svg>
);

export const RepeatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" /></svg>
);

export const MOCK_SONGS = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    duration: 243,
    coverUrl: 'https://picsum.photos/seed/m83/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    duration: 230,
    coverUrl: 'https://picsum.photos/seed/weeknd/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  },
  {
    id: '3',
    title: 'Instant Crush',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    duration: 337,
    coverUrl: 'https://picsum.photos/seed/daft/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  },
  {
    id: '4',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    coverUrl: 'https://picsum.photos/seed/lights/400/400',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  }
];
