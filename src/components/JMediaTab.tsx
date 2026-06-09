import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Music, Youtube, FileText, Edit, Trash2, 
  LogOut, ExternalLink, Play, X, Loader2, RefreshCw, 
  Eye, CheckCircle, AlertCircle, ChevronRight, 
  PlusCircle, Check, Info, Settings, ShieldAlert
} from 'lucide-react';

interface JMediaTabProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

interface Song {
  id: string | number;
  title: string;
  artist: string;
  youtube_id: string;
  description_mm: string;
  created_at?: string;
}

interface YouTubeChannel {
  id: string | number;
  channel_name: string;
  youtube_id: string;
  level: string; // 'Beginner' | 'Intermediate' | 'Advanced'
  description_mm: string;
  created_at?: string;
}

interface NewsPodcast {
  id: string | number;
  title: string;
  url: string;
  type: string; // 'News' | 'Podcast'
  description_mm: string;
  created_at?: string;
}

export const JMediaTab: React.FC<JMediaTabProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
}) => {
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
    // Fallback client
    if (supabaseUrl === 'https://rtfumxdmgldvseuxarjo.supabase.co') {
      try {
        return createClient(supabaseUrl, supabaseAnonKey || 'placeholder-anon-key');
      } catch (e) {
        return null;
      }
    }
    return null;
  }, [supabaseUrl, supabaseAnonKey]);

  // Tab State: Public View
  const [currentSection, setCurrentSection] = useState<'Songs' | 'Lessons' | 'News'>('Songs');
  
  // Tab State: Admin Panel
  const [adminSection, setAdminSection] = useState<'Songs' | 'Lessons' | 'News'>('Songs');
  
  // Whether we are currently in Admin Dashboard view vs Public view (for authorized admin)
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(isAdminLoggedIn ? 'admin' : 'public');

  // Sync viewMode when logged in state changes
  useEffect(() => {
    if (isAdminLoggedIn) {
      setViewMode('admin');
    } else {
      setViewMode('public');
    }
  }, [isAdminLoggedIn]);

  // Data states
  const [songs, setSongs] = useState<Song[]>([]);
  const [lessons, setLessons] = useState<YouTubeChannel[]>([]);
  const [newsList, setNewsList] = useState<NewsPodcast[]>([]);

  // Loading states
  const [loadingSongs, setLoadingSongs] = useState<boolean>(false);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);

  // Errors
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // UI state: Active embedded YouTube ID for modal player
  const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);
  const [playingTitle, setPlayingTitle] = useState<string | null>(null);

  // Modal styling states for Admin Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [formActiveManager, setFormActiveManager] = useState<'Songs' | 'Lessons' | 'News'>('Songs');

  // Form Fields State
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  
  // Songs Form Fields
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songYoutubeId, setSongYoutubeId] = useState('');
  const [songDesc, setSongDesc] = useState('');

  // YouTube Channel Form Fields
  const [channelName, setChannelName] = useState('');
  const [channelYoutubeId, setChannelYoutubeId] = useState('');
  const [channelLevel, setChannelLevel] = useState('Beginner');
  const [channelDesc, setChannelDesc] = useState('');

  // News/Podcast Form Fields
  const [newsTitle, setNewsTitle] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsType, setNewsType] = useState('News');
  const [newsDesc, setNewsDesc] = useState('');

  // Fetching methods
  const fetchSongs = async () => {
    if (!supabase) return;
    setLoadingSongs(true);
    try {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setSongs(data || []);
    } catch (err: any) {
      console.error('Error fetching songs:', err);
      // Fallback with friendly toast message
      setErrorBanner(err.message || 'Error occurred fetching songs from Supabase.');
    } finally {
      setLoadingSongs(false);
    }
  };

  const fetchLessons = async () => {
    if (!supabase) return;
    setLoadingLessons(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setLessons(data || []);
    } catch (err: any) {
      console.error('Error fetching youtube channels:', err);
      setErrorBanner(err.message || 'Error occurred fetching youtube channels from Supabase.');
    } finally {
      setLoadingLessons(false);
    }
  };

  const fetchNews = async () => {
    if (!supabase) return;
    setLoadingNews(true);
    try {
      const { data, error } = await supabase
        .from('news_podcasts')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setNewsList(data || []);
    } catch (err: any) {
      console.error('Error fetching news podcasts:', err);
      setErrorBanner(err.message || 'Error occurred fetching news podcasts from Supabase.');
    } finally {
      setLoadingNews(false);
    }
  };

  // Fetch all on mount or when supabase becomes available
  useEffect(() => {
    if (supabase) {
      fetchSongs();
      fetchLessons();
      fetchNews();
    }
  }, [supabase]);

  // Clear alerts after 5 seconds
  useEffect(() => {
    if (errorBanner) {
      const timer = setTimeout(() => setErrorBanner(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorBanner]);

  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  // Helper to open Add Model Form
  const openAddForm = (manager: 'Songs' | 'Lessons' | 'News') => {
    setFormActiveManager(manager);
    setFormType('add');
    setSelectedItemId(null);
    setErrorBanner(null);

    // Reset fields
    setSongTitle('');
    setSongArtist('');
    setSongYoutubeId('');
    setSongDesc('');

    setChannelName('');
    setChannelYoutubeId('');
    setChannelLevel('Beginner');
    setChannelDesc('');

    setNewsTitle('');
    setNewsUrl('');
    setNewsType('News');
    setNewsDesc('');

    setIsFormModalOpen(true);
  };

  // Helper to open Edit Model Form
  const openEditForm = (manager: 'Songs' | 'Lessons' | 'News', item: any) => {
    setFormActiveManager(manager);
    setFormType('edit');
    setSelectedItemId(item.id);
    setErrorBanner(null);

    if (manager === 'Songs') {
      setSongTitle(item.title || '');
      setSongArtist(item.artist || '');
      setSongYoutubeId(item.youtube_id || '');
      setSongDesc(item.description_mm || '');
    } else if (manager === 'Lessons') {
      setChannelName(item.channel_name || '');
      setChannelYoutubeId(item.youtube_id || '');
      setChannelLevel(item.level || 'Beginner');
      setChannelDesc(item.description_mm || '');
    } else if (manager === 'News') {
      setNewsTitle(item.title || '');
      setNewsUrl(item.url || '');
      setNewsType(item.type || 'News');
      setNewsDesc(item.description_mm || '');
    }

    setIsFormModalOpen(true);
  };

  // Submit operations
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setErrorBanner("Supabase Client is not instantiated.");
      return;
    }

    try {
      if (formActiveManager === 'Songs') {
        if (!songTitle.trim() || !songArtist.trim() || !songYoutubeId.trim()) {
          setErrorBanner("All fields except description are required!");
          return;
        }

        const songData = {
          title: songTitle.trim(),
          artist: songArtist.trim(),
          youtube_id: songYoutubeId.trim(),
          description_mm: songDesc.trim(),
        };

        if (formType === 'add') {
          const { error } = await supabase.from('songs').insert([songData]);
          if (error) throw error;
          setSuccessBanner("Song added successfully!");
        } else {
          const { error } = await supabase.from('songs').update(songData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("Song updated successfully!");
        }
        fetchSongs();

      } else if (formActiveManager === 'Lessons') {
        if (!channelName.trim() || !channelYoutubeId.trim()) {
          setErrorBanner("Channel Name and YouTube ID are required!");
          return;
        }

        const channelData = {
          channel_name: channelName.trim(),
          youtube_id: channelYoutubeId.trim(),
          level: channelLevel,
          description_mm: channelDesc.trim(),
        };

        if (formType === 'add') {
          const { error } = await supabase.from('youtube_channels').insert([channelData]);
          if (error) throw error;
          setSuccessBanner("YouTube Lesson Channel added successfully!");
        } else {
          const { error } = await supabase.from('youtube_channels').update(channelData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("YouTube Lesson Channel updated successfully!");
        }
        fetchLessons();

      } else if (formActiveManager === 'News') {
        if (!newsTitle.trim() || !newsUrl.trim()) {
          setErrorBanner("Title and URL are required!");
          return;
        }

        const newsData = {
          title: newsTitle.trim(),
          url: newsUrl.trim(),
          type: newsType,
          description_mm: newsDesc.trim(),
        };

        if (formType === 'add') {
          const { error } = await supabase.from('news_podcasts').insert([newsData]);
          if (error) throw error;
          setSuccessBanner("News/Podcast item added successfully!");
        } else {
          const { error } = await supabase.from('news_podcasts').update(newsData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("News/Podcast item updated successfully!");
        }
        fetchNews();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error("Supabase Operation Error:", err);
      setErrorBanner(err.message || "Operation failed. Make sure columns exist and permissions allow CRUD.");
    }
  };

  // Delete option
  const handleDelete = async (manager: 'Songs' | 'Lessons' | 'News', id: string | number) => {
    if (!supabase) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      let table = '';
      if (manager === 'Songs') table = 'songs';
      else if (manager === 'Lessons') table = 'youtube_channels';
      else if (manager === 'News') table = 'news_podcasts';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      setSuccessBanner("Item deleted successfully!");
      if (manager === 'Songs') fetchSongs();
      else if (manager === 'Lessons') fetchLessons();
      else if (manager === 'News') fetchNews();
    } catch (err: any) {
      console.error("Delete failed:", err);
      setErrorBanner(err.message || "Failed to delete item.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
    setViewMode('public');
    setSuccessBanner("Successfully logged out from Admin Dashboard");
  };

  return (
    <div className="w-full flex flex-col gap-6 select-none max-w-5xl mx-auto w-full animate-fade-in pb-16">
      
      {/* Top Welcome Title Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-[10px] font-black tracking-widest text-[#EF4444] uppercase bg-red-500/10 dark:bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
            J-Media Station
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight mt-1 px-0.5">
            Japanese Media Companion
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse videos, lesson channels, and external podcasts matching your JLPT N3 level
          </p>
        </div>

        {/* Toggle Mode button for admins */}
        {isAdminLoggedIn && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'public' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Eye size={12} />
              Public View
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'admin' ? 'bg-[#EF4444] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Settings size={12} />
              Admin Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Database notification warnings if anon keys are not defined */}
      {!supabaseAnonKey && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-3">
          <Info className="text-amber-500 shrink-0 mt-0.5" size={16} />
          <div className="text-xs font-bold text-amber-700 dark:text-amber-300 leading-relaxed">
            Supabase Anonymous Key is not detected in your project environment!
            <p className="font-medium text-slate-500 dark:text-slate-400 mt-1">
              Please declare <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-500">VITE_SUPABASE_URL</code> and <code className="bg-slate-100 dark:bg-slate-900 px-1 py-0.5 rounded text-indigo-500">VITE_SUPABASE_ANON_KEY</code> in the Secrets Panel.
            </p>
          </div>
        </div>
      )}

      {/* Floating Status notifications */}
      {successBanner && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black flex items-center gap-2 animate-bounce select-none">
          <CheckCircle size={14} className="text-emerald-500" />
          <span>{successBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3 bg-red-500/15 border border-red-500/25 text-red-400 rounded-xl text-xs font-black flex items-center gap-2 animate-pulse select-none">
          <AlertCircle size={14} className="text-red-500" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖥️ VIEW MODE: PUBLIC INTERFACE */}
      {/* ========================================================================= */}
      {viewMode === 'public' ? (
        <div className="flex flex-col gap-6">
          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 w-full max-w-md mx-auto">
            <button
              onClick={() => setCurrentSection('Songs')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${currentSection === 'Songs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Music size={13} />
              Songs
            </button>
            <button
              onClick={() => setCurrentSection('Lessons')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${currentSection === 'Lessons' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Youtube size={13} />
              Lessons
            </button>
            <button
              onClick={() => setCurrentSection('News')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${currentSection === 'News' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <FileText size={13} />
              News & Podcast
            </button>
          </div>

          {/* SONGS SECTION */}
          {currentSection === 'Songs' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B6B]" />
                  Japanese Songs ({songs.length})
                </h3>
                <button 
                  onClick={fetchSongs} 
                  disabled={loadingSongs}
                  className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={loadingSongs ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {loadingSongs ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs text-slate-400 font-bold">Retrieving awesome J-pop tunes from DB...</span>
                </div>
              ) : songs.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No songs currently listed. Check back shortly!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {songs.map((song) => (
                    <div 
                      key={song.id}
                      onClick={() => {
                        setPlayingYoutubeId(song.youtube_id);
                        setPlayingTitle(song.title);
                      }}
                      className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex justify-between gap-4 h-full relative overflow-hidden animate-fade-in"
                    >
                      <div className="flex flex-col flex-1 gap-2">
                        <div>
                          <h4 className="font-extrabold text-[#FF6B6B] dark:text-[#FF6B6B] text-base group-hover:text-indigo-500 transition line-clamp-1">
                            {song.title}
                          </h4>
                          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                            By {song.artist}
                          </span>
                        </div>
                        {song.description_mm && (
                          <div className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 border-dashed line-clamp-3">
                            {song.description_mm}
                          </div>
                        )}
                      </div>

                      {/* Side video thumbnail simulator with Play button overlay */}
                      <div className="w-24 sm:w-28 aspect-video sm:h-20 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden self-center group-hover:shadow-md transition">
                        <img 
                          src={`https://img.youtube.com/vi/${song.youtube_id}/mqdefault.jpg`} 
                          alt={song.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                          onError={(e) => {
                            // If thumbnail load fails
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition z-10">
                          <Play size={12} fill="currentColor" />
                        </div>
                        {/* YouTube label watermark */}
                        <span className="absolute bottom-1 right-1 text-[8px] bg-red-600 text-white font-bold p-0.5 px-1 rounded-sm tracking-tighter opacity-80 z-10">
                          YouTube
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* YOUTUBE LESSONS SECTION */}
          {currentSection === 'Lessons' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                  YouTube Channel Lessons ({lessons.length})
                </h3>
                <button 
                  onClick={fetchLessons} 
                  disabled={loadingLessons}
                  className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={loadingLessons ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {loadingLessons ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs text-slate-400 font-bold">Scanning top lesson resources from database...</span>
                </div>
              ) : lessons.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No channels listed. Check back shortly!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.map((item) => {
                    const levelColors = {
                      Beginner: "bg-teal-500/10 text-teal-400 border-teal-500/20",
                      Intermediate: "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      Advanced: "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    }[item.level] || "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";

                    return (
                      <div 
                        key={item.id}
                        onClick={() => {
                          setPlayingYoutubeId(item.youtube_id);
                          setPlayingTitle(item.channel_name);
                        }}
                        className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex justify-between gap-4 h-full relative overflow-hidden animate-fade-in"
                      >
                        <div className="flex flex-col flex-1 gap-2.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-[15px] group-hover:text-indigo-500 transition line-clamp-1">
                              {item.channel_name}
                            </h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${levelColors} tracking-wider select-none font-sans`}>
                              {item.level}
                            </span>
                          </div>
                          {item.description_mm && (
                            <div className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 border-dashed line-clamp-3 leading-relaxed">
                              {item.description_mm}
                            </div>
                          )}
                        </div>

                        {/* Video Thumbnail embed simulator */}
                        <div className="w-24 sm:w-28 aspect-video sm:h-20 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center relative overflow-hidden self-center group-hover:shadow-md transition">
                          <img 
                            src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`} 
                            alt={item.channel_name}
                            className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition z-10">
                            <Play size={12} fill="currentColor" />
                          </div>
                          <span className="absolute bottom-1 right-1 text-[8px] bg-red-600 text-white font-bold p-0.5 px-1 rounded-sm tracking-tighter opacity-80 z-10">
                            Lessons
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* NEWS & PODCAST SECTION */}
          {currentSection === 'News' && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  News & Podcast Channels ({newsList.length})
                </h3>
                <button 
                  onClick={fetchNews} 
                  disabled={loadingNews}
                  className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={loadingNews ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {loadingNews ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs text-slate-400 font-bold">Fetching newspapers and broadcast transcripts...</span>
                </div>
              ) : newsList.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No news articles or podcasts listed. Check back shortly!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {newsList.map((news) => {
                    const badgeStyles = news.type === 'News' 
                      ? "bg-slate-100 dark:bg-indigo-950/65 text-indigo-500 dark:text-indigo-400 border-indigo-200/35 dark:border-indigo-900/50" 
                      : "bg-[#10B981]/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20";
                    
                    return (
                      <a 
                        key={news.id}
                        href={news.url}
                        target="_blank"
                        rel="noreferrer"
                        className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-[#10B981]/50 rounded-2xl shadow-sm transition-all duration-200 flex flex-col justify-between gap-3 h-full animate-fade-in relative hover:shadow-md"
                      >
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${badgeStyles} tracking-wider font-sans`}>
                              {news.type}
                            </span>
                            <ExternalLink size={13} className="text-slate-400 group-hover:text-[#10B981] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                          </div>

                          <h4 className="font-extrabold text-[15.5px] text-slate-800 dark:text-slate-100 group-hover:text-[#10B981] transition mt-1 line-clamp-1 leading-tight">
                            {news.title}
                          </h4>

                          {news.description_mm && (
                            <p className="text-[12.5px] font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-700 bg-slate-50 dark:bg-slate-950/40 p-3 rounded-lg border border-slate-100 dark:border-slate-900/60 transition line-clamp-3 leading-relaxed">
                              {news.description_mm}
                            </p>
                          )}
                        </div>

                        <div className="text-[10px] font-extrabold text-[#10B981] dark:text-emerald-400 flex items-center gap-1 mt-1 font-mono uppercase tracking-wider">
                          Go to full resource <ChevronRight size={10} />
                        </div>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* 🛠️ VIEW MODE: ADMIN CONTROL CENTER */
        /* ========================================================================= */
        <div className="flex flex-col gap-6 bg-slate-500/5 dark:bg-slate-950/25 border border-slate-200/50 dark:border-slate-900 p-6 rounded-3xl animate-fade-in">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-lightBorder dark:border-darkBorder pb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="text-[#EF4444]" size={20} />
              <div>
                <h3 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">
                  Content Management Terminal
                </h3>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                  Direct database operations via Supabase for J-Media assets
                </p>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="p-1 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-[#EF4444] border border-red-500/20 text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-sm"
            >
              <LogOut size={13} />
              Admin Logout
            </button>
          </div>

          {/* Subtab selection for manager sections */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 max-w-lg">
            <button
              onClick={() => setAdminSection('Songs')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Songs' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Music size={13} />
              Songs Manager
            </button>
            <button
              onClick={() => setAdminSection('Lessons')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Lessons' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Youtube size={13} />
              Lessons Manager
            </button>
            <button
              onClick={() => setAdminSection('News')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'News' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <FileText size={13} />
              News Manager
            </button>
          </div>

          {/* ==================== SONGS MANAGER PANEL ==================== */}
          {adminSection === 'Songs' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🔴</span> SONGS DATABASE ({songs.length})
                </h4>
                <button
                  onClick={() => openAddForm('Songs')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Song
                </button>
              </div>

              {loadingSongs ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : songs.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">Database table 'songs' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Title / Artist</th>
                          <th className="py-3 px-4">YouTube ID</th>
                          <th className="py-3 px-4 hidden md:table-cell">Myanmar Reading/Desc</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {songs.map((song) => (
                          <tr key={song.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 block font-black text-[13px]">{song.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">by {song.artist}</span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[11px]">
                              <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-lightBorder dark:border-darkBorder">
                                {song.youtube_id}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate-3 text-[11.5px] text-slate-500 leading-normal">
                              {song.description_mm || <span className="italic text-slate-600">-</span>}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditForm('Songs', song)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                                  title="Edit Song"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('Songs', song.id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition"
                                  title="Delete Song"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== YOUTUBE CHANNELS MANAGER PANEL ==================== */}
          {adminSection === 'Lessons' && (
            <div className="flex flex-col gap-4 animate-fade-in font-sens">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🔵</span> YOUTUBE LESSONS DATABASE ({lessons.length})
                </h4>
                <button
                  onClick={() => openAddForm('Lessons')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Lesson
                </button>
              </div>

              {loadingLessons ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : lessons.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">Database table 'youtube_channels' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Channel Name</th>
                          <th className="py-3 px-4">Level</th>
                          <th className="py-3 px-4">Sample Video ID</th>
                          <th className="py-3 px-4 hidden md:table-cell">Myanmar Description</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {lessons.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 text-[13.5px] block">{item.channel_name}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                                item.level === 'Beginner' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                                item.level === 'Intermediate' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                'bg-amber-500/10 text-amber-500 border-amber-500/20'
                              }`}>
                                {item.level}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[11px]">
                              <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-lightBorder dark:border-darkBorder">
                                {item.youtube_id}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate-3 text-[11.5px] text-slate-500 leading-normal">
                              {item.description_mm || <span className="italic text-slate-600">-</span>}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditForm('Lessons', item)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                                  title="Edit YouTube Lesson"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('Lessons', item.id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition"
                                  title="Delete Lesson Row"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== NEWS & PODCASTS MANAGER PANEL ==================== */}
          {adminSection === 'News' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>🟢</span> NEWS & PODCAST DATABASE ({newsList.length})
                </h4>
                <button
                  onClick={() => openAddForm('News')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Item
                </button>
              </div>

              {loadingNews ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : newsList.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">Database table 'news_podcasts' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Title</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Asset URL</th>
                          <th className="py-3 px-4 hidden md:table-cell">Myanmar Description</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {newsList.map((news) => (
                          <tr key={news.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 text-[13px] block">{news.title}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                                news.type === 'News' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                'bg-[#10B981]/10 text-emerald-400 border-emerald-500/20'
                              }`}>
                                {news.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 max-w-[150px] truncate text-slate-400 font-mono text-[10px]" title={news.url}>
                              <a href={news.url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1 text-slate-500">
                                {news.url}
                                <ExternalLink size={9} />
                              </a>
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate-3 text-[11.5px] text-slate-500 leading-normal">
                              {news.description_mm || <span className="italic text-slate-600">-</span>}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditForm('News', news)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                                  title="Edit News Article"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('News', news.id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition"
                                  title="Delete Line Row"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📹 YOUTUBE POPUP EMBED MODAL (Public and Admin side) */}
      {/* ========================================================================= */}
      {playingYoutubeId && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => {
            setPlayingYoutubeId(null);
            setPlayingTitle(null);
          }}
        >
          <div 
            className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col gap-3 p-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Navigation Header */}
            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Youtube size={18} className="text-[#EF4444]" />
                <h3 className="text-[13.5px] font-extrabold text-slate-100 uppercase tracking-wider line-clamp-1">
                  {playingTitle || "Now Playing"}
                </h3>
              </div>
              <button 
                onClick={() => {
                  setPlayingYoutubeId(null);
                  setPlayingTitle(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition flex items-center justify-center border border-slate-700/50"
              >
                <X size={14} />
              </button>
            </div>

            {/* Video embed frame container (16:9 Aspect Ratio aspect-video) */}
            <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src={`https://www.youtube.com/embed/${playingYoutubeId}?autoplay=1&rel=0`}
                title={`${playingTitle} - YouTube Player`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="w-full h-full"
              />
            </div>

            {/* Modal Footer Tip */}
            <div className="flex justify-between items-center text-[10.5px] font-semibold text-slate-500 font-mono">
              <span>Streaming from YouTube Embed service</span>
              <span>Click outside to release player</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 UNIFIED DATA EDIT & CREATION OVERLAY DIALOG MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <form 
            onSubmit={handleSubmit}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6 animate-scale-up"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <div className="flex items-center gap-2">
                <span className="text-base text-yellow-500">⚙️</span>
                <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  {formType === 'add' ? 'Add Item' : 'Edit Item'} — {formActiveManager}
                </h3>
              </div>
              <button 
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-100 transition flex items-center justify-center border border-slate-200/50 dark:border-slate-800"
              >
                <X size={12} />
              </button>
            </div>

            {/* Form core scrollable fields */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[60vh] py-1 px-0.5">
              
              {/* SONGS MANAGER FIELDS */}
              {formActiveManager === 'Songs' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Song Title</label>
                    <input 
                      type="text" 
                      value={songTitle}
                      onChange={(e) => setSongTitle(e.target.value)}
                      placeholder="e.g. Lemon (レモン)"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Artist / Band</label>
                    <input 
                      type="text" 
                      value={songArtist}
                      onChange={(e) => setSongArtist(e.target.value)}
                      placeholder="e.g. Kenshi Yonezu"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube Video ID</label>
                      <span className="text-[9px] text-[#EF4444] font-semibold font-mono">11-char ID only</span>
                    </div>
                    <input 
                      type="text" 
                      value={songYoutubeId}
                      onChange={(e) => setSongYoutubeId(e.target.value)}
                      placeholder="e.g. SX_ViT4Ra7k (Not full URL)"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Myanmar Description / Explanations</label>
                    <textarea 
                      value={songDesc}
                      onChange={(e) => setSongDesc(e.target.value)}
                      rows={3}
                      placeholder="Enter description, lyrics summary or explanations in Myanmar..."
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* YOUTUBE CHANNEL MANAGER FIELDS */}
              {formActiveManager === 'Lessons' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel Name</label>
                    <input 
                      type="text" 
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g. Nihongo Nomori"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">JLPT Track Level</label>
                    <select
                      value={channelLevel}
                      onChange={(e) => setChannelLevel(e.target.value)}
                      className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Beginner">Beginner (N5/N4)</option>
                      <option value="Intermediate">Intermediate (N3)</option>
                      <option value="Advanced">Advanced (N2/N1)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Intro Video ID (YouTube)</label>
                      <span className="text-[9px] text-[#EF4444] font-semibold font-mono">11-char ID only</span>
                    </div>
                    <input 
                      type="text" 
                      value={channelYoutubeId}
                      onChange={(e) => setChannelYoutubeId(e.target.value)}
                      placeholder="e.g. SX_ViT4Ra7k (For embedding previews)"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Myanmar Description</label>
                    <textarea 
                      value={channelDesc}
                      onChange={(e) => setChannelDesc(e.target.value)}
                      rows={3}
                      placeholder="Explain what lessons this channel provides, and recommendations in Myanmar..."
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* NEWS & PODCASTS MANAGER FIELDS */}
              {formActiveManager === 'News' && (
                <div className="flex flex-col gap-3.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Content Title</label>
                    <input 
                      type="text" 
                      value={newsTitle}
                      onChange={(e) => setNewsTitle(e.target.value)}
                      placeholder="e.g. NHK News Easy Web"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Format Type</label>
                    <select
                      value={newsType}
                      onChange={(e) => setNewsType(e.target.value)}
                      className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="News">News Portal</option>
                      <option value="Podcast">Podcast Channel</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination URL</label>
                    <input 
                      type="url" 
                      value={newsUrl}
                      onChange={(e) => setNewsUrl(e.target.value)}
                      placeholder="https://www3.nhk.or.jp/news/easy/"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Myanmar Description</label>
                    <textarea 
                      value={newsDesc}
                      onChange={(e) => setNewsDesc(e.target.value)}
                      rows={3}
                      placeholder="Explain features in Myanmar, recommendations of study..."
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Form Action Controls */}
            <div className="flex items-center justify-end gap-3 border-t border-lightBorder dark:border-darkBorder pt-4 font-sans">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none transition"
              >
                <Check size={12} />
                {formType === 'add' ? 'Save New Item' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
