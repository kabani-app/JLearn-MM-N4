import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Play, Pause, SkipForward, SkipBack, Search, Volume2, Music, Loader2, Info, RefreshCw } from 'lucide-react';

interface Track {
  id: number;
  name: string;
  fileName: string;
}

export const ListeningTab: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtfumxdmgldvseuxarjo.supabase.co';
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
    // Fallback client with public access key if URL matches the user specified one
    if (supabaseUrl === 'https://rtfumxdmgldvseuxarjo.supabase.co') {
      try {
        // If anon key is empty, we must still supply something to createClient, 
        // fallback to empty or standard placeholder since it's a public bucket.
        return createClient(supabaseUrl, supabaseAnonKey || 'placeholder-anon-key');
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [supabaseUrl, supabaseAnonKey]);

  // Tracks list state loaded from Supabase
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Group division tab (CD-A vs CD-B)
  const [activeCDTab, setActiveCDTab] = useState<'A' | 'B'>('A');

  // Player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Audio HTML DOM element Ref
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Load files from Supabase Storage on mount
  const loadTracksFromSupabase = async () => {
    setIsLoadingTracks(true);
    setErrorStatus(null);
    try {
      if (!supabase) {
        throw new Error("Supabase client is not fully configured. Please configure your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY keys.");
      }

      // Fetch file listings from bucket 'listening-audio'
      const { data, error } = await supabase.storage
        .from('listening-audio')
        .list('', {
          limit: 300,
          sortBy: { column: 'name', order: 'asc' }
        });

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        // Filter out non-mp3 files and directories
        const mp3Files = data
          .filter(file => file.name.toLowerCase().endsWith('.mp3'))
          .map((file, index) => ({
            id: index + 1,
            name: file.name,
            fileName: file.name
          }));

        // Numerical alphabetical sorting
        mp3Files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

        setTracks(mp3Files);
      } else {
        // If bucket lists successfully but is empty
        setTracks([]);
      }
    } catch (err: any) {
      console.error('Failed to list files from Supabase Storage:', err);
      setErrorStatus(err?.message || 'Failed to list audio assets from Supabase');
    } finally {
      setIsLoadingTracks(false);
    }
  };

  useEffect(() => {
    loadTracksFromSupabase();
  }, [supabase]);

  // Group tracks by CD-A and CD-B dynamically
  const groupTracks = useMemo(() => {
    const cdA: Track[] = [];
    const cdB: Track[] = [];

    tracks.forEach((track) => {
      const nameUpper = track.fileName.toUpperCase();
      // Match CD-A, CD_A, CDA patterns
      if (nameUpper.includes('CD-A') || nameUpper.includes('CD_A') || nameUpper.includes('CDA')) {
        cdA.push(track);
      } else if (nameUpper.includes('CD-B') || nameUpper.includes('CD_B') || nameUpper.includes('CDB')) {
        cdB.push(track);
      } else {
        // Fallback default: put in CD-A
        cdA.push(track);
      }
    });

    return { cdA, cdB };
  }, [tracks]);

  // Active tracks based on chosen CD tab
  const activeCDTracks = useMemo(() => {
    return activeCDTab === 'A' ? groupTracks.cdA : groupTracks.cdB;
  }, [activeCDTab, groupTracks]);

  // Search filtered result within selected CD
  const filteredTracks = useMemo(() => {
    if (!searchQuery.trim()) return activeCDTracks;
    const query = searchQuery.toLowerCase().trim();
    return activeCDTracks.filter(
      (track) => track.fileName.toLowerCase().includes(query)
    );
  }, [activeCDTracks, searchQuery]);

  // Clean initialization of audio element
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
  }, [tracks, activeCDTab]); // Rebind next/prev handlers if tracks structure alters

  // Calculate dynamic URLs & Play
  const playTrack = (track: Track) => {
    if (!audioRef.current) return;

    setCurrentTrack(track);
    setIsLoadingAudio(true);

    // Build standard direct audio download stream URL as requested:
    // https://rtfumxdmgldvseuxarjo.supabase.co/storage/v1/object/public/listening-audio/[filename]
    const activeUrl = supabaseUrl || 'https://rtfumxdmgldvseuxarjo.supabase.co';
    const audioSrc = `${activeUrl}/storage/v1/object/public/listening-audio/${encodeURIComponent(track.fileName)}`;

    audioRef.current.src = audioSrc;
    audioRef.current.load();
    audioRef.current.play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.error('Audio stream playback failed:', e);
        setIsPlaying(false);
        setIsLoadingAudio(false);
      });
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (!currentTrack) {
      const first = filteredTracks[0];
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
          console.error('Audio resume failed:', e);
          setIsLoadingAudio(false);
        });
    }
  };

  const handleNextTrack = () => {
    if (!currentTrack || activeCDTracks.length === 0) return;
    const currentIndex = activeCDTracks.findIndex((t) => t.fileName === currentTrack.fileName);
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % activeCDTracks.length;
      playTrack(activeCDTracks[nextIndex]);
    } else {
      // Fallback
      playTrack(activeCDTracks[0]);
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack || activeCDTracks.length === 0) return;
    const currentIndex = activeCDTracks.findIndex((t) => t.fileName === currentTrack.fileName);
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + activeCDTracks.length) % activeCDTracks.length;
      playTrack(activeCDTracks[prevIndex]);
    } else {
      // Fallback
      playTrack(activeCDTracks[0]);
    }
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
    <div className="flex flex-col flex-1 pb-28 md:pb-32">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>🎧 Listening Practice</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/10 rounded-md">
              Supabase Live
            </span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Play dynamic N3 Shinkanzen listening files synced directly from the cloud repository storage bucket files.
          </p>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadTracksFromSupabase}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-350 text-[11px] font-bold rounded-xl border border-slate-200/40 dark:border-slate-800/60 transition active-press"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Sync Files</span>
        </button>
      </div>

      {/* Supabase unconfigured warn banner */}
      {!supabaseAnonKey && (
        <div className="p-3 bg-amber-50/75 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl flex items-start gap-2.5 mb-4 shadow-xs">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Credentials Notice
            </h5>
            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
              Using credentials bucket reader connection. Fill <code className="bg-slate-150 dark:bg-slate-800 px-1 py-0.5 rounded text-amber-600 dark:text-amber-300">VITE_SUPABASE_ANON_KEY</code> in current secrets database triggers if fetching operations raise access restrictions.
            </p>
          </div>
        </div>
      )}

      {/* Primary CD Division Tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-4 border border-slate-200/40 max-w-sm">
        <button
          onClick={() => {
            setActiveCDTab('A');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeCDTab === 'A'
              ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          💿 CD-A Tracks ({groupTracks.cdA.length})
        </button>
        <button
          onClick={() => {
            setActiveCDTab('B');
            setSearchQuery('');
          }}
          className={`flex-1 py-2 text-center text-xs font-bold rounded-lg transition-all ${
            activeCDTab === 'B'
              ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/20'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          💿 CD-B Tracks ({groupTracks.cdB.length})
        </button>
      </div>

      {/* TRACK SEARCH BAR */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder={`Search ${activeCDTab === 'A' ? 'CD-A' : 'CD-B'} tracks...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl outline-none focus:border-indigo-500 transition shadow-inner"
        />
      </div>

      {/* DYNAMIC TRACK LIST AREA */}
      {isLoadingTracks ? (
        <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
            Fetching files from cloud index ...
          </span>
        </div>
      ) : errorStatus ? (
        <div className="flex-1 min-h-[350px] flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl m-1">
          <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 mb-3 font-semibold">
            ⚠️
          </div>
          <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-200">Storage Sync Unsuccessful</h4>
          <p className="text-xs text-slate-400 max-w-sm mt-1 mb-4 leading-relaxed">
            {errorStatus}
          </p>
          <button
            onClick={loadTracksFromSupabase}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md transition"
          >
            Retry Connection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 h-[50vh] overflow-y-auto pr-1 scrollbar-thin">
          {filteredTracks.map((track) => {
            const isActive = currentTrack?.fileName === track.fileName;
            return (
              <div
                key={track.fileName}
                onClick={() => playTrack(track)}
                className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition-all duration-200 group relative overflow-hidden ${
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
                        <div className="w-[2.5px] bg-white rounded-full animate-pulse h-1.5" />
                        <div className="w-[2.5px] bg-white rounded-full animate-pulse h-3" />
                      </div>
                    ) : isActive ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Music className="w-4 h-4" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4
                      className={`text-[11px] font-extrabold truncate ${
                        isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-800 dark:text-slate-200'
                      }`}
                      title={track.fileName}
                    >
                      {track.fileName}
                    </h4>
                    <span className="text-[9px] text-slate-400/80 dark:text-slate-500 font-extrabold uppercase tracking-widest mt-0.5 block">
                      {activeCDTab === 'A' ? 'CD-A Segment' : 'CD-B Segment'}
                    </span>
                  </div>
                </div>

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
              <span>No tracks found matching "{searchQuery}"</span>
            </div>
          )}
        </div>
      )}

      {/* FLOAT / FIXED BOTTOM DOCK MEDIA PLAYER FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-lightSurface/95 dark:bg-darkSurface/95 backdrop-blur-md border-t border-lightBorder dark:border-darkBorder p-4 shadow-[0_-8px_24px_rgba(0,0,0,0.06)] flex flex-col gap-2.5 sm:max-w-xl mx-auto rounded-t-3xl pb-18 lg:pb-4">
        {/* Track info + time elapsed details row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h5 className="text-[11px] font-black text-slate-800 dark:text-slate-200 truncate leading-none" title={currentTrack ? currentTrack.fileName : ''}>
                {currentTrack ? currentTrack.fileName : 'No Track Selected'}
              </h5>
              <span className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1.5 block">
                {currentTrack ? `CD-${activeCDTab} Active` : 'Select a track to practice'}
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
                <span>Streaming...</span>
              </span>
            ) : supabase ? (
              <span className="text-emerald-500">dynamic-stream</span>
            ) : (
              <span className="text-amber-500">offline-mode</span>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevTrack}
              disabled={!currentTrack || activeCDTracks.length === 0}
              className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-30 transition active-press"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              disabled={activeCDTracks.length === 0 && !currentTrack}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-md shadow-indigo-100 dark:shadow-none active-press disabled:opacity-50"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4.5 h-4.5" /> : <Play className="w-4.5 h-4.5 ml-0.5" />}
            </button>

            <button
              onClick={handleNextTrack}
              disabled={!currentTrack || activeCDTracks.length === 0}
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
