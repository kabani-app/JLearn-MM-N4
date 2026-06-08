import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Play, Pause, SkipForward, SkipBack, Search, Volume2, Music, Loader2, Info } from 'lucide-react';

interface Track {
  id: number;
  name: string;
  fileName: string;
}

const TOTAL_TRACKS = 133;

const TRACKS_LIST: Track[] = Array.from({ length: TOTAL_TRACKS }, (_, i) => {
  const id = i + 1;
  const padId = String(id).padStart(2, '0');
  return {
    id,
    name: `Track ${padId}`,
    fileName: `Track ${padId}.mp3`,
  };
});

// A high-quality public domain background audio sample for simulation when secrets are unconfigured 
const SAMPLE_MOCK_AUDIO = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

export const ListeningTab: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Instantiate Supabase client safely
  const supabase = useMemo(() => {
    if (supabaseUrl && supabaseAnonKey) {
      try {
        return createClient(supabaseUrl, supabaseAnonKey);
      } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
        return null;
      }
    }
    return null;
  }, [supabaseUrl, supabaseAnonKey]);

  // Player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Audio HTML DOM element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Filter track list
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return TRACKS_LIST;
    const query = searchQuery.toLowerCase().trim();
    return TRACKS_LIST.filter(
      (track) =>
        track.name.toLowerCase().includes(query) || 
        String(track.id).includes(query)
    );
  }, [searchQuery]);

  // Clean initialization of audio context element
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingAudio(false);
    };

    const handleEnded = () => {
      handleNextTrack();
    };

    const handleWaiting = () => {
      setIsLoadingAudio(true);
    };

    const handlePlaying = () => {
      setIsLoadingAudio(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('playing', handlePlaying);

    return () => {
      audio.pause();
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('playing', handlePlaying);
      audioRef.current = null;
    };
  }, []);

  // When track changes, update src & play
  const playTrack = (track: Track) => {
    if (!audioRef.current) return;

    setCurrentTrack(track);
    setIsLoadingAudio(true);

    let audioSrc = SAMPLE_MOCK_AUDIO;

    if (supabase) {
      const { data } = supabase.storage.from('listening-audio').getPublicUrl(track.fileName);
      if (data?.publicUrl) {
        audioSrc = data.publicUrl;
      }
    }

    audioRef.current.src = audioSrc;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.error('Audio playback failed:', e);
        setIsPlaying(false);
        setIsLoadingAudio(false);
      });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (!currentTrack) {
      // Pick the first track in list if none is active
      const first = filteredTracks[0] || TRACKS_LIST[0];
      if (first) playTrack(first);
      return;
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((e) => {
          console.error('Audio play resumption failed:', e);
          setIsLoadingAudio(false);
        });
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack) return;
    const currentIndex = TRACKS_LIST.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % TRACKS_LIST.length;
    playTrack(TRACKS_LIST[nextIndex]);
  };

  const handlePrevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = TRACKS_LIST.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + TRACKS_LIST.length) % TRACKS_LIST.length;
    playTrack(TRACKS_LIST[prevIndex]);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekVal = parseFloat(e.target.value);
    audioRef.current.currentTime = seekVal;
    setCurrentTime(seekVal);
  };

  // Time Formatter
  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-28">
      {/* Header Info Banner */}
      <div className="flex flex-col gap-1 mb-4">
        <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>🎧 Listening Practice</span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 rounded-md">
            N3 Mock Exercises
          </span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Listen to the official audio chapters, monitor dynamic progress, and matching test audios seamlessly.
        </p>
      </div>

      {/* Supabase status credentials callout */}
      {!supabase && (
        <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-start gap-2.5 mb-5 shadow-xs transition duration-200">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              Developer Settings Note
            </h5>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              Showing fully-functioning mock simulation client wrapper. Configure <code className="bg-slate-150 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">VITE_SUPABASE_URL</code> & <code className="bg-slate-150 dark:bg-slate-800 px-1 py-0.5 rounded text-indigo-600 dark:text-indigo-300">VITE_SUPABASE_ANON_KEY</code> in your AI Studio secrets board to streamline authentic live Supabase storage streams.
            </p>
          </div>
        </div>
      )}

      {/* Track filter field */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter chapters (e.g. Track 45)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl outline-none focus:border-indigo-500 transition shadow-inner"
        />
      </div>

      {/* Track list grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
        {filteredTracks.map((track) => {
          const isActive = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              onClick={() => playTrack(track)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-900/60 shadow-sm'
                  : 'bg-lightSurface border-lightBorder hover:border-slate-300/80 dark:bg-darkSurface dark:border-darkBorder dark:hover:border-slate-800/85'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 group-hover:bg-slate-200 dark:bg-slate-900 dark:group-hover:bg-slate-800 text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {isActive && isPlaying ? (
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-[2.5px] bg-white rounded-full animate-pulse h-2.5" />
                      <div className="w-[2.5px] bg-white rounded-full animate-pulse h-1.5 animation-delay-75" />
                      <div className="w-[2.5px] bg-white rounded-full animate-pulse h-3 animation-delay-150" />
                    </div>
                  ) : isActive ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Music className="w-4 h-4" />
                  )}
                </div>

                <div className="min-w-0">
                  <h4
                    className={`text-xs font-extrabold truncate ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {track.name}
                  </h4>
                  <span className="text-[10px] text-slate-400/80 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 block">
                    Chapter Exercise {track.id}
                  </span>
                </div>
              </div>

              {/* Action Circle Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isActive) {
                    handlePlayPause();
                  } else {
                    playTrack(track);
                  }
                }}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition shadow-xs shrink-0 ${
                  isActive
                    ? 'bg-indigo-600 hover:bg-indigo-700 border-indigo-600 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200/60 dark:bg-slate-900 dark:hover:bg-slate-800 dark:border-slate-800 text-slate-500 hover:text-slate-700'
                }`}
              >
                {isActive && isPlaying ? <Pause size={12} /> : <Play size={12} className="ml-0.5" />}
              </button>
            </div>
          );
        })}

        {filteredTracks.length === 0 && (
          <div className="col-span-full py-16 text-center text-slate-400/80 dark:text-slate-500 font-bold text-xs flex flex-col items-center gap-2">
            <Music className="w-8 h-8 text-slate-350 dark:text-slate-800" />
            <span>No matching exercise tracks found</span>
          </div>
        )}
      </div>

      {/* FLOAT / FIXED BOTTOM DOCK MEDIA PLAYER FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-lightSurface/95 dark:bg-darkSurface/95 backdrop-blur-md border-t border-lightBorder dark:border-darkBorder p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] animate-slide-up flex flex-col gap-2.5 sm:max-w-xl mx-auto rounded-t-3xl pb-18 lg:pb-4">
        {/* Track info + time elapsed details row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate leading-none">
                {currentTrack ? currentTrack.name : 'No track selected'}
              </h5>
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1 block">
                {currentTrack ? `Chapter ${currentTrack.id}` : 'Select a track to practice'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-[10px] font-bold text-slate-400 dark:text-slate-500">
            <span>{formatTime(currentTime)}</span>
            <span className="opacity-50">/</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress slider bar row */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-3 flex items-center relative">
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeek}
              disabled={!currentTrack}
              className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500 hover:accent-indigo-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Media navigation control triggers bar */}
        <div className="flex items-center justify-between mt-1">
          {/* Buffering state indicator or sample sound alert */}
          <div className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
            {isLoadingAudio ? (
              <span className="flex items-center gap-1 text-amber-500 animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Buffering stream...</span>
              </span>
            ) : supabase ? (
              <span className="text-emerald-500">Cloud Connected</span>
            ) : (
              <span className="text-indigo-500/80">Local Demo Active</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevTrack}
              disabled={!currentTrack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-30 transition active-press"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-100 dark:shadow-none active-press"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              disabled={!currentTrack}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-30 transition active-press"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="w-[70px] text-right">
            {currentTrack && (
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold uppercase px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 rounded">
                Loop: Off
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
