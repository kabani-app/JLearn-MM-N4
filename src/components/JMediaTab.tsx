import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Music, Youtube, FileText, Edit, Trash2, 
  LogOut, ExternalLink, Play, X, Loader2, RefreshCw, 
  Eye, CheckCircle, AlertCircle, ChevronRight, 
  PlusCircle, Check, Info, Settings, ShieldAlert,
  ArrowLeft, Folder, Layers, Film, Book,
  ArrowUp, ArrowDown, ListOrdered, Move, Sparkles
} from 'lucide-react';

interface JMediaTabProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
  onRateUpdated?: () => void;
}

interface Song {
  id: string | number;
  title: string;
  artist: string;
  youtube_id: string;
  description_mm: string;
  created_at?: string;
}

interface Playlist {
  id: string | number;
  title: string;
  description_mm: string;
  category: string;
  thumbnail_youtube_id: string;
  created_at?: string;
}

interface YouTubeChannel {
  id: string | number;
  channel_name: string;
  youtube_id: string;
  level: string; // 'Beginner' | 'Intermediate' | 'Advanced'
  description_mm: string;
  playlist_id?: string | number | null;
  created_at?: string;
  sort_order?: number;
}

interface NewsPodcast {
  id: string | number;
  title: string;
  url: string;
  type: string; // 'News' | 'Podcast'
  description_mm: string;
  created_at?: string;
}

interface BookDbItem {
  id: string | number;
  title: string;
  description_mm: string;
  drive_file_id: string;
  category: string;
  file_size: string;
  created_at?: string;
}

interface JPost {
  id: string | number;
  title: string;
  content: string;
  category: string;
  generated_by: 'admin' | 'ai';
  created_at?: string;
}

export const JMediaTab: React.FC<JMediaTabProps> = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  onRateUpdated,
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
  const [currentSection, setCurrentSection] = useState<'Posts' | 'Songs' | 'Lessons' | 'News'>('Posts');
  
  // Tab State: Admin Panel (allows Posts, Songs, Playlists, Lessons, News, Books, ExchangeRate)
  const [adminSection, setAdminSection] = useState<'Posts' | 'Songs' | 'Playlists' | 'Lessons' | 'News' | 'Books' | 'ExchangeRate'>('Posts');

  // Exchange rate states
  const [dbRate, setDbRate] = useState<number | null>(null);
  const [dbUpdatedAt, setDbUpdatedAt] = useState<string | null>(null);
  const [rateInput, setRateInput] = useState<string>('');
  const [isLoadingRate, setIsLoadingRate] = useState<boolean>(false);
  const [isSavingRate, setIsSavingRate] = useState<boolean>(false);
  
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
  const [posts, setPosts] = useState<JPost[]>([]);
  const [expandedPostIds, setExpandedPostIds] = useState<Record<string | number, boolean>>({});
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [lessons, setLessons] = useState<YouTubeChannel[]>([]);
  const [newsList, setNewsList] = useState<NewsPodcast[]>([]);
  const [books, setBooks] = useState<BookDbItem[]>([]);

  // Loading states
  const [loadingPosts, setLoadingPosts] = useState<boolean>(false);
  const [loadingSongs, setLoadingSongs] = useState<boolean>(false);
  const [loadingPlaylists, setLoadingPlaylists] = useState<boolean>(false);
  const [loadingLessons, setLoadingLessons] = useState<boolean>(false);
  const [loadingNews, setLoadingNews] = useState<boolean>(false);
  const [loadingBooks, setLoadingBooks] = useState<boolean>(false);

  // Active public playlist selection state
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Errors
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // UI state: Active embedded YouTube ID for modal player
  const [playingYoutubeId, setPlayingYoutubeId] = useState<string | null>(null);
  const [playingTitle, setPlayingTitle] = useState<string | null>(null);

  // Modal styling states for Admin Forms
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  
  // Reorder/Sort Modal States
  const [isSortModalOpen, setIsSortModalOpen] = useState<boolean>(false);
  const [selectedSortPlaylist, setSelectedSortPlaylist] = useState<Playlist | null>(null);
  const [sortItemList, setSortItemList] = useState<YouTubeChannel[]>([]);
  const [savingSortOrder, setSavingSortOrder] = useState<boolean>(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleOpenSortModal = (playlist: Playlist) => {
    setSelectedSortPlaylist(playlist);
    // Find videos for this playlist and sort them by existing sort_order (fall back to id index)
    const plistVideos = lessons
      .filter(l => String(l.playlist_id) === String(playlist.id))
      .sort((a, b) => {
        const orderA = a.sort_order !== undefined && a.sort_order !== null ? a.sort_order : 999999;
        const orderB = b.sort_order !== undefined && b.sort_order !== null ? b.sort_order : 999999;
        if (orderA !== orderB) return orderA - orderB;
        return Number(a.id) - Number(b.id);
      });
    setSortItemList(plistVideos);
    setIsSortModalOpen(true);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', index.toString());
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const updated = [...sortItemList];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setSortItemList(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItemUp = (index: number) => {
    if (index === 0) return;
    const updated = [...sortItemList];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSortItemList(updated);
  };

  const moveItemDown = (index: number) => {
    if (index === sortItemList.length - 1) return;
    const updated = [...sortItemList];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSortItemList(updated);
  };

  const handleSaveSortOrder = async () => {
    if (!supabase || !selectedSortPlaylist) return;
    setSavingSortOrder(true);
    setErrorBanner(null);
    setSuccessBanner(null);
    try {
      const promises = sortItemList.map((item, index) => {
        return supabase
          .from('youtube_channels')
          .update({ sort_order: index + 1 })
          .eq('id', item.id);
      });
      
      const results = await Promise.all(promises);
      const failed = results.find(r => r.error);
      if (failed) throw failed.error;
      
      setSuccessBanner("Video playlist order saved successfully!");
      setIsSortModalOpen(false);
      fetchLessons();
    } catch (err: any) {
      console.error("Failed to save sort order:", err);
      setErrorBanner(err.message || "Failed to update video sort sequence.");
    } finally {
      setSavingSortOrder(false);
    }
  };
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [formActiveManager, setFormActiveManager] = useState<'Posts' | 'Songs' | 'Playlists' | 'Lessons' | 'News' | 'Books'>('Posts');

  // Form Fields State
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);
  
  // Posts Form Fields
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCategory, setPostCategory] = useState('Japanese Culture');
  const [postGeneratedBy, setPostGeneratedBy] = useState<'admin' | 'ai'>('admin');

  // AI generator fields
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiWordCount, setAiWordCount] = useState<number>(300);
  const [generatingAi, setGeneratingAi] = useState(false);
  
  // Songs Form Fields
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [songYoutubeId, setSongYoutubeId] = useState('');
  const [songDesc, setSongDesc] = useState('');

  // Playlists Form Fields
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistDesc, setPlaylistDesc] = useState('');
  const [playlistCategory, setPlaylistCategory] = useState('');
  const [playlistThumbnailId, setPlaylistThumbnailId] = useState('');

  // YouTube Channel Form Fields
  const [channelName, setChannelName] = useState('');
  const [channelYoutubeId, setChannelYoutubeId] = useState('');
  const [channelLevel, setChannelLevel] = useState('Beginner');
  const [channelDesc, setChannelDesc] = useState('');
  const [channelPlaylistId, setChannelPlaylistId] = useState<string | number>('');

  // Books Form Fields
  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookCategory, setBookCategory] = useState('N3 Books');
  const [bookFileSize, setBookFileSize] = useState('');
  const [bookDriveFileId, setBookDriveFileId] = useState('');

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

  const fetchPlaylists = async () => {
    if (!supabase) return;
    setLoadingPlaylists(true);
    try {
      const { data, error } = await supabase
        .from('playlists')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setPlaylists(data || []);
    } catch (err: any) {
      console.error('Error fetching playlists:', err);
      setErrorBanner(err.message || 'Error occurred fetching playlists from Supabase.');
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const fetchLessons = async () => {
    if (!supabase) return;
    setLoadingLessons(true);
    try {
      const { data, error } = await supabase
        .from('youtube_channels')
        .select('*')
        .order('sort_order', { ascending: true })
        .order('id', { ascending: true });

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

  const fetchPosts = async () => {
    if (!supabase) return;
    setLoadingPosts(true);
    try {
      const { data, error } = await supabase
         .from('posts')
         .select('*')
         .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      setErrorBanner(err.message || 'Error occurred fetching posts from Supabase.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const togglePostExpand = (id: string | number) => {
    setExpandedPostIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleGeneratePostWithAI = async () => {
    if (!aiPrompt.trim()) {
      setErrorBanner("ကျေးဇူးပြု၍ generate လုပ်မည့် အကြောင်းအရာကို ထည့်သွင်းပေးပါ။");
      return;
    }
    setGeneratingAi(true);
    setErrorBanner(null);
    try {
      let apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        apiKey = localStorage.getItem('GEMINI_API_KEY') || '';
      }

      if (!apiKey) {
        throw new Error('API Key is missing. Please configure VITE_GEMINI_API_KEY in the Secrets panel or setting gear!');
      }

      const contentPrompt = `မြန်မာဘာသာဖြင့် ${aiPrompt} အကြောင်း ${aiWordCount} စာလုံးခန့် ရေးပေးပါ။ ဂျပန်ဘာသာသင်သူများအတွက် အသုံးဝင်သောအကြောင်းအရာ ဖြစ်ပါစေ။ No markdown headings, just paragraphs of useful text.`;
      
      const requestBody = {
        contents: [
          {
            parts: [{ text: contentPrompt }]
          }
        ]
      };

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Failed to generate with AI: HTTP ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      if (!rawText) {
        throw new Error('No content returned from Gemini.');
      }

      const titlePrompt = `Suggest a short, catchy Title (maximum 6-8 words) in Myanmar or English (as appropriate) for a post with the following content: "${rawText.substring(0, 300)}". Do not use quotation marks or styling, just output the plain title text.`;
      
      const titleRequestBody = {
        contents: [
          {
            parts: [{ text: titlePrompt }]
          }
        ]
      };

      const titleResponse = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(titleRequestBody)
      });

      let finalTitle = `AI Post: ${aiPrompt.substring(0, 30)}`;
      if (titleResponse.ok) {
        const titleData = await titleResponse.json();
        const suggestedTitle = titleData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (suggestedTitle) {
          finalTitle = suggestedTitle.replace(/^["']|["']$/g, '');
        }
      }

      setPostTitle(finalTitle);
      setPostContent(rawText);
      setPostCategory("AI Generated");
      setPostGeneratedBy("ai");
      
      setSuccessBanner("AI generate layout loaded successfully! Review below.");
    } catch (err: any) {
      console.error(err);
      setErrorBanner(err.message || "Failed to generate post with AI.");
    } finally {
      setGeneratingAi(false);
    }
  };

  const fetchBooks = async () => {
    if (!supabase) return;
    setLoadingBooks(true);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setErrorBanner(err.message || 'Error occurred fetching books from Supabase.');
    } finally {
      setLoadingBooks(false);
    }
  };

  const fetchAdminExchangeRate = async () => {
    if (!supabase) return;
    setIsLoadingRate(true);
    try {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('currency_pair', 'JPY-MMK')
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setDbRate(data.rate);
        setDbUpdatedAt(data.updated_at);
        setRateInput(data.rate.toString());
      }
    } catch (err: any) {
      console.error('Error fetching exchange rate:', err);
    } finally {
      setIsLoadingRate(false);
    }
  };

  const handleUpdateExchangeRate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    const rateVal = parseFloat(rateInput);
    if (isNaN(rateVal) || rateVal <= 0) {
      setErrorBanner("ကျေးဇူးပြု၍ မှန်ကန်သော rate (ကိန်းဂဏန်း) ကို ရိုက်ထည့်ပေးပါ။");
      return;
    }

    setIsSavingRate(true);
    try {
      // Check if existing row exists
      const { data: existingRate } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('currency_pair', 'JPY-MMK')
        .maybeSingle();

      let error;
      if (existingRate) {
        // Update
        const { error: err } = await supabase
          .from('exchange_rates')
          .update({
            rate: rateVal,
            updated_at: new Date().toISOString()
          })
          .eq('currency_pair', 'JPY-MMK');
        error = err;
      } else {
        // Insert
        const { error: err } = await supabase
          .from('exchange_rates')
          .insert([
            {
              currency_pair: 'JPY-MMK',
              rate: rateVal,
              updated_at: new Date().toISOString()
            }
          ]);
        error = err;
      }

      if (error) throw error;

      setSuccessBanner("JPY-MMK Exchange Rate updated successfully!");
      setDbRate(rateVal);
      setDbUpdatedAt(new Date().toISOString());
      
      if (onRateUpdated) {
        onRateUpdated();
      }
    } catch (err: any) {
      console.error('Error updating exchange rate:', err);
      setErrorBanner(err.message || 'Error occurred updating exchange rate to Supabase.');
    } finally {
      setIsSavingRate(false);
    }
  };

  // Fetch all on mount or when supabase becomes available
  useEffect(() => {
    if (supabase) {
      fetchPosts();
      fetchSongs();
      fetchPlaylists();
      fetchLessons();
      fetchNews();
      fetchBooks();
      fetchAdminExchangeRate();
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
  const openAddForm = (manager: 'Posts' | 'Songs' | 'Playlists' | 'Lessons' | 'News' | 'Books') => {
    setFormActiveManager(manager);
    setFormType('add');
    setSelectedItemId(null);
    setErrorBanner(null);

    // Reset fields
    setPostTitle('');
    setPostContent('');
    setPostCategory('Japanese Culture');
    setPostGeneratedBy('admin');
    setAiPrompt('');
    setAiWordCount(300);

    setSongTitle('');
    setSongArtist('');
    setSongYoutubeId('');
    setSongDesc('');

    setPlaylistTitle('');
    setPlaylistDesc('');
    setPlaylistCategory('');
    setPlaylistThumbnailId('');

    setChannelName('');
    setChannelYoutubeId('');
    setChannelLevel('Beginner');
    setChannelDesc('');
    setChannelPlaylistId('');

    setNewsTitle('');
    setNewsUrl('');
    setNewsType('News');
    setNewsDesc('');

    setBookTitle('');
    setBookDesc('');
    setBookCategory('N3 Books');
    setBookFileSize('');
    setBookDriveFileId('');

    setIsFormModalOpen(true);
  };

  // Helper to open Edit Model Form
  const openEditForm = (manager: 'Posts' | 'Songs' | 'Playlists' | 'Lessons' | 'News' | 'Books', item: any) => {
    setFormActiveManager(manager);
    setFormType('edit');
    setSelectedItemId(item.id);
    setErrorBanner(null);

    if (manager === 'Posts') {
      setPostTitle(item.title || '');
      setPostContent(item.content || '');
      setPostCategory(item.category || 'Japanese Culture');
      setPostGeneratedBy(item.generated_by || 'admin');
    } else if (manager === 'Songs') {
      setSongTitle(item.title || '');
      setSongArtist(item.artist || '');
      setSongYoutubeId(item.youtube_id || '');
      setSongDesc(item.description_mm || '');
    } else if (manager === 'Playlists') {
      setPlaylistTitle(item.title || '');
      setPlaylistDesc(item.description_mm || '');
      setPlaylistCategory(item.category || '');
      setPlaylistThumbnailId(item.thumbnail_youtube_id || '');
    } else if (manager === 'Lessons') {
      setChannelName(item.channel_name || '');
      setChannelYoutubeId(item.youtube_id || '');
      setChannelLevel(item.level || 'Beginner');
      setChannelDesc(item.description_mm || '');
      setChannelPlaylistId(item.playlist_id || '');
    } else if (manager === 'News') {
      setNewsTitle(item.title || '');
      setNewsUrl(item.url || '');
      setNewsType(item.type || 'News');
      setNewsDesc(item.description_mm || '');
    } else if (manager === 'Books') {
      setBookTitle(item.title || '');
      setBookDesc(item.description_mm || '');
      setBookCategory(item.category || 'N3 Books');
      setBookFileSize(item.file_size || '');
      setBookDriveFileId(item.drive_file_id || '');
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
      if (formActiveManager === 'Posts') {
        if (!postTitle.trim() || !postContent.trim() || !postCategory.trim()) {
          setErrorBanner("Title, Category and Content are required!");
          return;
        }

        const postData = {
          title: postTitle.trim(),
          content: postContent.trim(),
          category: postCategory.trim(),
          generated_by: postGeneratedBy,
        };

        if (formType === 'add') {
          const { error } = await supabase.from('posts').insert([postData]);
          if (error) throw error;
          setSuccessBanner("Post added successfully!");
        } else {
          const { error } = await supabase.from('posts').update(postData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("Post updated successfully!");
        }
        fetchPosts();

      } else if (formActiveManager === 'Songs') {
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

      } else if (formActiveManager === 'Playlists') {
        if (!playlistTitle.trim() || !playlistCategory.trim() || !playlistThumbnailId.trim()) {
          setErrorBanner("Playlist Title, Category and Thumbnail YouTube ID are required!");
          return;
        }

        const playlistData = {
          title: playlistTitle.trim(),
          description_mm: playlistDesc.trim(),
          category: playlistCategory.trim(),
          thumbnail_youtube_id: playlistThumbnailId.trim(),
        };

        if (formType === 'add') {
          const { error } = await supabase.from('playlists').insert([playlistData]);
          if (error) throw error;
          setSuccessBanner("Playlist added successfully!");
        } else {
          const { error } = await supabase.from('playlists').update(playlistData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("Playlist updated successfully!");
        }
        fetchPlaylists();

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
          playlist_id: channelPlaylistId ? (isNaN(Number(channelPlaylistId)) ? channelPlaylistId : Number(channelPlaylistId)) : null,
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
      } else if (formActiveManager === 'Books') {
        if (!bookTitle.trim() || !bookCategory.trim() || !bookDriveFileId.trim() || !bookFileSize.trim()) {
          setErrorBanner("Book Title, Category, File Size and Google Drive File ID are required!");
          return;
        }

        const bookData = {
          title: bookTitle.trim(),
          description_mm: bookDesc.trim(),
          category: bookCategory.trim(),
          file_size: bookFileSize.trim(),
          drive_file_id: bookDriveFileId.trim(),
        };

        if (formType === 'add') {
          const { error } = await supabase.from('books').insert([bookData]);
          if (error) throw error;
          setSuccessBanner("Book added successfully!");
        } else {
          const { error } = await supabase.from('books').update(bookData).eq('id', selectedItemId);
          if (error) throw error;
          setSuccessBanner("Book updated successfully!");
        }
        fetchBooks();
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      console.error("Supabase Operation Error:", err);
      setErrorBanner(err.message || "Operation failed. Make sure columns exist and permissions allow CRUD.");
    }
  };

  // Delete option
  const handleDelete = async (manager: 'Posts' | 'Songs' | 'Playlists' | 'Lessons' | 'News' | 'Books', id: string | number) => {
    if (!supabase) return;
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      let table = '';
      if (manager === 'Posts') table = 'posts';
      else if (manager === 'Songs') table = 'songs';
      else if (manager === 'Playlists') table = 'playlists';
      else if (manager === 'Lessons') table = 'youtube_channels';
      else if (manager === 'News') table = 'news_podcasts';
      else if (manager === 'Books') table = 'books';

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;

      setSuccessBanner("Item deleted successfully!");
      if (manager === 'Posts') fetchPosts();
      else if (manager === 'Songs') fetchSongs();
      else if (manager === 'Playlists') {
        fetchPlaylists();
        if (selectedPlaylist && String(selectedPlaylist.id) === String(id)) {
          setSelectedPlaylist(null);
        }
      }
      else if (manager === 'Lessons') fetchLessons();
      else if (manager === 'News') fetchNews();
      else if (manager === 'Books') fetchBooks();
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
    <div className="w-full flex flex-col gap-6 select-none max-w-5xl w-full animate-fade-in pb-16">
      
      {/* Toggle Mode button for admins */}
      {isAdminLoggedIn && (
        <div className="flex justify-end border-b border-slate-100 dark:border-slate-800/60 pb-4">
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
        </div>
      )}

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
          <div className="flex bg-slate-100 dark:bg-slate-900/60 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/40 w-full max-w-xl mx-auto flex-nowrap overflow-x-auto gap-1 scrollbar-none">
            <button
              onClick={() => setCurrentSection('Posts')}
              className={`flex-1 min-w-[70px] sm:min-w-[100px] py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black tracking-wide transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${currentSection === 'Posts' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'}`}
            >
              <FileText size={12} className="sm:w-[13px] sm:h-[13px]" />
              Posts
            </button>
            <button
              onClick={() => setCurrentSection('Songs')}
              className={`flex-1 min-w-[70px] sm:min-w-[100px] py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black tracking-wide transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${currentSection === 'Songs' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'}`}
            >
              <Music size={12} className="sm:w-[13px] sm:h-[13px]" />
              Songs
            </button>
            <button
              onClick={() => setCurrentSection('Lessons')}
              className={`flex-1 min-w-[70px] sm:min-w-[100px] py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black tracking-wide transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${currentSection === 'Lessons' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-205'}`}
            >
              <Youtube size={12} className="sm:w-[13px] sm:h-[13px]" />
              Lessons
            </button>
            <button
              onClick={() => setCurrentSection('News')}
              className={`flex-1 min-w-[70px] sm:min-w-[100px] py-1.5 px-2 sm:py-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-black tracking-wide transition flex items-center justify-center gap-1 sm:gap-1.5 whitespace-nowrap ${currentSection === 'News' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-205'}`}
            >
              <Layers size={12} className="sm:w-[13px] sm:h-[13px]" />
              <span>News<span className="hidden sm:inline"> & Podcast</span></span>
            </button>
          </div>

          {/* POSTS SECTION */}
          {currentSection === 'Posts' && (
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                  Articles & Posts ({posts.length})
                </h3>
                <button 
                  onClick={fetchPosts} 
                  disabled={loadingPosts}
                  className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-202 flex items-center gap-1"
                >
                  <RefreshCw size={10} className={loadingPosts ? "animate-spin" : ""} />
                  Refresh
                </button>
              </div>

              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="animate-spin text-indigo-400" size={24} />
                  <span className="text-xs text-slate-400 font-bold">Discovering interesting Japanese media posts...</span>
                </div>
              ) : posts.length === 0 ? (
                <div className="p-12 text-center bg-[#1E293B]/20 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No posts available yet. Check back later!</p>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  {posts.map((post) => {
                    const isExpanded = !!expandedPostIds[post.id];
                    return (
                      <div 
                        key={post.id}
                        className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm transition flex flex-col gap-4 animate-fade-in text-left hover:shadow-md"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/50 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2.5 py-0.5 rounded-full border border-indigo-500/20 tracking-wider">
                              {post.category || "General"}
                            </span>
                            {post.generated_by === 'ai' ? (
                              <span className="text-[10px] font-black uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/20 tracking-wider flex items-center gap-1">
                                <span>✨</span> AI Generated
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-450 px-2.5 py-0.5 rounded-full border border-amber-500/20 tracking-wider flex items-center gap-1">
                                <span>👤</span> Admin
                              </span>
                            )}
                          </div>
                          {post.created_at && (
                            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                              {new Date(post.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-col gap-2">
                          <h4 className="font-extrabold text-[#FF6B6B] dark:text-[#FF6B6B] text-lg leading-snug">
                            {post.title}
                          </h4>
                          
                          <div 
                            className={`text-[14px] font-medium text-slate-700 dark:text-slate-200 leading-relaxed bg-slate-50 dark:bg-slate-950/20 p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800/70 transition-all ${
                              isExpanded ? "whitespace-pre-wrap" : "line-clamp-2 overflow-hidden"
                            }`}
                          >
                            {post.content}
                          </div>
                        </div>

                        <div className="flex justify-start border-t border-slate-100 dark:border-slate-800/40 pt-2.5">
                          <button
                            onClick={() => togglePostExpand(post.id)}
                            className="text-xs font-black text-indigo-500 hover:text-indigo-650 dark:hover:text-indigo-400 flex items-center gap-1 transition focus:outline-none"
                          >
                            {isExpanded ? "Read less ‹" : "Read more ›"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

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
            <div className="flex flex-col gap-5 animate-fade-in">
              {selectedPlaylist ? (
                /* PLAYLIST DETAIL PAGE VIEW */
                <div className="flex flex-col gap-6 animate-fade-in">
                  {/* Header Detail Card with Back Button */}
                  <div className="flex flex-col gap-4">
                    <button
                      onClick={() => setSelectedPlaylist(null)}
                      className="self-start px-3 py-1.5 rounded-xl border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-850 transition text-xs font-black text-slate-650 dark:text-slate-350 flex items-center gap-2"
                    >
                      <ArrowLeft size={13} className="text-slate-500" />
                      Back to Playlists
                    </button>

                    <div className="p-6 bg-slate-105 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/80 rounded-3xl flex flex-col md:flex-row gap-5 items-center relative overflow-hidden">
                      {/* Thumbnail frame of playlist in detail top */}
                      <div className="w-full md:w-56 aspect-video shrink-0 bg-slate-950 rounded-2xl border border-slate-200/30 dark:border-slate-800 relative overflow-hidden flex items-center justify-center shadow-md">
                        <img 
                          src={`https://img.youtube.com/vi/${selectedPlaylist.thumbnail_youtube_id}/mqdefault.jpg`} 
                          alt={selectedPlaylist.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 to-transparent flex items-end p-3">
                          <span className="text-[10px] font-black text-white bg-indigo-600/80 p-1 px-2.5 rounded-full uppercase tracking-widest backdrop-blur-sm flex items-center gap-1">
                            <Layers size={9} />
                            Playlist Detail
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-grow w-full text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 tracking-wider">
                            {selectedPlaylist.category}
                          </span>
                          <span className="text-[9px] font-black font-mono uppercase bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full border border-slate-300/40 dark:border-slate-700/50">
                            {lessons.filter(l => String(l.playlist_id) === String(selectedPlaylist.id)).length} Videos
                          </span>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
                          {selectedPlaylist.title}
                        </h3>
                        {selectedPlaylist.description_mm ? (
                          <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 leading-relaxed max-w-2xl bg-white/45 dark:bg-slate-950/20 p-3 rounded-xl border border-slate-250 dark:border-slate-900">
                            {selectedPlaylist.description_mm}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-450 italic">No description provided for this playlist.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Videos list belonging to active playlist */}
                  <div className="flex flex-col gap-4">
                    <h4 className="text-xs font-black text-indigo-500 dark:text-indigo-400 uppercase tracking-widest flex items-center gap-1.5 px-0.5">
                      <Film size={12} className="text-[#EF4444]" />
                      Lesson Videos inside this playlist ({lessons.filter(l => String(l.playlist_id) === String(selectedPlaylist.id)).length})
                    </h4>

                    {lessons.filter(l => String(l.playlist_id) === String(selectedPlaylist.id)).length === 0 ? (
                      <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-805 rounded-3xl">
                        <Folder className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">There are no lesson videos currently assigned to this playlist.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-scale-up">
                        {lessons
                          .filter(l => String(l.playlist_id) === String(selectedPlaylist.id))
                          .map((item) => {
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
                                className="group p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex justify-between gap-4 h-full relative overflow-hidden"
                              >
                                <div className="flex flex-col flex-grow justify-between gap-2 text-left">
                                  <div className="flex flex-col gap-2">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full border ${levelColors} tracking-wider select-none font-sans`}>
                                        {item.level}
                                      </span>
                                    </div>
                                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-[14px] group-hover:text-indigo-500 transition line-clamp-2 leading-snug">
                                      {item.channel_name}
                                    </h4>
                                  </div>
                                  {item.description_mm && (
                                    <div className="text-[12px] font-medium text-slate-550 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 border-dashed line-clamp-2 leading-relaxed text-left">
                                      {item.description_mm}
                                    </div>
                                  )}
                                </div>

                                <div className="w-24 sm:w-28 aspect-video sm:h-20 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 relative overflow-hidden self-center group-hover:shadow-md transition">
                                  <img 
                                    src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`} 
                                    alt={item.channel_name}
                                    className="absolute inset-0 w-full h-full object-cover opacity-65 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                  <div className="absolute w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition z-10">
                                    <Play size={10} fill="currentColor" />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* PLAYLISTS OVERVIEW GRID VIEW */
                <div className="flex flex-col gap-8">
                  {/* Playlist Group List Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                      Lessons Playlists & Groups ({playlists.length})
                    </h3>
                    <button 
                      onClick={async () => {
                        await fetchPlaylists();
                        await fetchLessons();
                      }} 
                      disabled={loadingPlaylists || loadingLessons}
                      className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                    >
                      <RefreshCw size={10} className={(loadingPlaylists || loadingLessons) ? "animate-spin" : ""} />
                      Refresh
                    </button>
                  </div>

                  {loadingPlaylists || loadingLessons ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <Loader2 className="animate-spin text-indigo-400" size={24} />
                      <span className="text-xs text-slate-400 font-bold">Scanning playlists and lesson groupings from database...</span>
                    </div>
                  ) : playlists.length === 0 ? (
                    <div className="text-center py-10 bg-slate-100/30 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                      <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No study playlists have been added yet.</p>
                    </div>
                  ) : (
                    /* Playlists grid cards */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
                      {playlists.map((playlist) => {
                        const count = lessons.filter(l => String(l.playlist_id) === String(playlist.id)).length;
                        return (
                          <div
                            key={playlist.id}
                            onClick={() => setSelectedPlaylist(playlist)}
                            className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 hover:shadow-lg rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col h-full relative"
                          >
                            {/* Playlist mockup cover with stacked layers styling */}
                            <div className="w-full aspect-video bg-slate-950 relative overflow-hidden flex items-center justify-center shrink-0">
                              <img 
                                src={`https://img.youtube.com/vi/${playlist.thumbnail_youtube_id}/mqdefault.jpg`} 
                                alt={playlist.title}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                              
                              {/* Overlay Badge details */}
                              <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                                <span className="text-[8px] font-sans font-black uppercase text-white bg-indigo-600/90 px-2 py-0.5 rounded-full border border-white/10 tracking-wider">
                                  {playlist.category}
                                </span>
                              </div>

                              <div className="absolute bottom-3 right-3 bg-black/75 p-1 px-2.5 rounded text-[9px] font-black text-white flex items-center gap-1 backdrop-blur-sm z-10 font-mono tracking-wider">
                                <Layers size={11} className="text-indigo-400" />
                                {count} {count === 1 ? 'Video' : 'Videos'}
                              </div>
                            </div>

                            {/* Info card bottom details */}
                            <div className="p-4 flex flex-col justify-between flex-grow gap-2.5 text-left">
                              <div className="flex flex-col gap-1.5">
                                <h4 className="font-extrabold text-[15px] text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-indigo-500 transition">
                                  {playlist.title}
                                </h4>
                                {playlist.description_mm ? (
                                  <p className="text-[12px] font-semibold text-slate-550 dark:text-slate-400 line-clamp-3 leading-relaxed">
                                    {playlist.description_mm}
                                  </p>
                                ) : (
                                  <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No description provided...</p>
                                )}
                              </div>
                              <div className="text-[10px] font-black text-indigo-500 flex items-center gap-1.5 mt-1 relative tracking-wider uppercase font-sans text-left">
                                Open Playlist Detail
                                <ChevronRight size={10} className="transform group-hover:translate-x-1 transition" />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* UNASSIGNED & UNCATEGORIZED VIDEOS SECTION AT THE BOTTOM */}
                  {lessons.filter(l => !l.playlist_id).length > 0 && (
                    <div className="flex flex-col gap-4 border-t border-slate-100 dark:border-slate-850 pt-8 mt-4 text-left">
                      <div className="flex flex-col text-left">
                        <h4 className="text-xs font-black text-slate-550 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-450 dark:bg-slate-600" />
                          Uncategorized Lessons ({lessons.filter(l => !l.playlist_id).length})
                        </h4>
                        <p className="text-[11px] text-slate-400 dark:text-slate-550 mt-1 font-medium text-left">
                          These video resources are standalone lessons independent of specific study groups
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                        {lessons
                          .filter(l => !l.playlist_id)
                          .map((item) => {
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
                                className="group p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-indigo-500/40 dark:hover:border-indigo-500/50 rounded-2xl shadow-sm transition-all duration-200 cursor-pointer flex justify-between gap-4 h-full relative overflow-hidden text-left"
                              >
                                <div className="flex flex-col flex-1 gap-2.5 text-left">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-[15px] group-hover:text-indigo-500 transition line-clamp-1">
                                      {item.channel_name}
                                    </h4>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${levelColors} tracking-wider select-none font-sans`}>
                                      {item.level}
                                    </span>
                                  </div>
                                  {item.description_mm && (
                                    <div className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 p-2.5 rounded-lg border border-slate-100 dark:border-slate-900 border-dashed line-clamp-3 leading-relaxed text-left">
                                      {item.description_mm}
                                    </div>
                                  )}
                                </div>

                                <div className="w-24 sm:w-28 aspect-video sm:h-20 bg-slate-900 dark:bg-slate-950 rounded-xl border border-slate-200/50 dark:border-slate-800 flex flex-col items-center justify-center shrink-0 relative overflow-hidden self-center group-hover:shadow-md transition">
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
                                  <span className="absolute bottom-1 right-1 text-[8px] bg-red-655 text-white font-bold p-0.5 px-1 rounded-sm tracking-tighter opacity-80 z-10 font-mono">
                                    Lesson
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
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
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/40 dark:border-slate-800/60 max-w-2xl flex-wrap gap-1">
            <button
              onClick={() => setAdminSection('Posts')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Posts' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <FileText size={13} />
              Posts
            </button>
            <button
              onClick={() => setAdminSection('Songs')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Songs' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Music size={13} />
              Songs
            </button>
            <button
              onClick={() => setAdminSection('Playlists')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Playlists' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-805'}`}
            >
              <Layers size={13} />
              Playlists
            </button>
            <button
              onClick={() => setAdminSection('Lessons')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Lessons' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Youtube size={13} />
              Lessons
            </button>
            <button
              onClick={() => setAdminSection('News')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'News' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Folder size={13} />
              News
            </button>
            <button
              onClick={() => setAdminSection('Books')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'Books' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Book size={13} />
              Books
            </button>
            <button
              onClick={() => setAdminSection('ExchangeRate')}
              className={`flex-1 min-w-[100px] py-1.5 px-3 rounded-xl text-xs font-black tracking-wide transition flex items-center justify-center gap-1.5 ${adminSection === 'ExchangeRate' ? 'bg-[#EF4444] text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
            >
              <Settings size={13} />
              Exchange Rate
            </button>
          </div>

          {/* ==================== POSTS MANAGER PANEL ==================== */}
          {adminSection === 'Posts' && (
            <div className="flex flex-col gap-4 animate-fade-in text-left">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2 animate-fade-in">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>📰</span> POSTS DATABASE ({posts.length})
                </h4>
                <button
                  onClick={() => openAddForm('Posts')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Post
                </button>
              </div>

              {loadingPosts ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : posts.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">Database table 'posts' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm font-sans">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Post Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Generated By</th>
                          <th className="py-3 px-4 hidden md:table-cell">Snippet</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {posts.map((post) => (
                          <tr key={post.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 text-[13px] block">{post.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">ID: {post.id}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 tracking-wide uppercase">
                                {post.category || "General"}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              {post.generated_by === 'ai' ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-400">
                                  🤖 AI
                                </span>
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-500 text-amber-600 dark:text-amber-400">
                                  👤 Admin
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell max-w-[200px] truncate font-medium text-slate-400">
                              {post.content}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex gap-1.5 justify-end">
                                <button
                                  onClick={() => openEditForm('Posts', post)}
                                  className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 text-indigo-500 transition flex items-center justify-center cursor-pointer border border-indigo-55/10"
                                  title="Edit Post"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('Posts', post.id)}
                                  className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-950/80 text-[#EF4444] transition flex items-center justify-center cursor-pointer border border-red-50/10"
                                  title="Delete Post"
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

          {/* ==================== PLAYLISTS MANAGER PANEL ==================== */}
          {adminSection === 'Playlists' && (
            <div className="flex flex-col gap-4 animate-fade-in font-sens text-left">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>📂</span> PLAYLISTS DATABASE ({playlists.length})
                </h4>
                <button
                  onClick={() => openAddForm('Playlists')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Playlist
                </button>
              </div>

              {loadingPlaylists ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : playlists.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 text-center">Database table 'playlists' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Playlist Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Thumbnail ID</th>
                          <th className="py-3 px-4 hidden md:table-cell">Myanmar Description</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {playlists.map((playlist) => (
                          <tr key={playlist.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 text-[13.5px] block">{playlist.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">ID: {playlist.id}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[9px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                                {playlist.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[11px]">
                              <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded border border-lightBorder dark:border-darkBorder">
                                {playlist.thumbnail_youtube_id}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate block text-[11.5px] text-slate-500 leading-normal">
                              {playlist.description_mm || <span className="italic text-slate-600">-</span>}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => handleOpenSortModal(playlist)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-600 dark:hover:bg-indigo-800 text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white transition"
                                  title="Reorder Playlist Videos"
                                >
                                  <ListOrdered size={12} />
                                </button>
                                <button
                                  onClick={() => openEditForm('Playlists', playlist)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                                  title="Edit Playlist"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('Playlists', playlist.id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition"
                                  title="Delete Playlist"
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
                         {lessons.map((item) => {
                           const matchedPlaylist = playlists.find(p => String(p.id) === String(item.playlist_id));
                           return (
                             <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                               <td className="py-3.5 px-4 font-black text-left">
                                 <span className="text-indigo-400 text-[13.5px] block">{item.channel_name}</span>
                                 {item.playlist_id ? (
                                   <span className="text-[9px] text-[#FF6B6B] bg-[#FF6B6B]/10 border border-[#FF6B6B]/20 py-0.5 px-1.5 rounded-full inline-block mt-0.5 leading-none">
                                     Playlist: {matchedPlaylist ? matchedPlaylist.title : `ID: ${item.playlist_id}`}
                                   </span>
                                 ) : (
                                   <span className="text-[9px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800 py-0.5 px-1.5 rounded-full inline-block mt-0.5 leading-none">
                                     Unassigned / Uncategorized
                                   </span>
                                 )}
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
                        );
                      })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==================== NEWS & PODCASTS MANAGER PANEL ==================== */}
          {adminSection === 'News' && (
            <div className="flex flex-col gap-4 animate-fade-in text-left">
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
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate text-[11.5px] text-slate-500 leading-normal">
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

          {/* ==================== BOOKS MANAGER PANEL ==================== */}
          {adminSection === 'Books' && (
            <div className="flex flex-col gap-4 animate-fade-in text-left">
              <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
                  <span>📖</span> BOOKS DATABASE ({books.length})
                </h4>
                <button
                  onClick={() => openAddForm('Books')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press"
                >
                  <PlusCircle size={14} />
                  Add New Book
                </button>
              </div>

              {loadingBooks ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : books.length === 0 ? (
                <div className="p-8 text-center bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400">Database table 'books' returned 0 records.</p>
                </div>
              ) : (
                <div className="flex flex-col border border-slate-200/65 dark:border-slate-850 bg-white dark:bg-slate-900/40 rounded-2xl overflow-hidden shadow-sm font-sans">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900 border-b border-lightBorder dark:border-darkBorder text-[10px] font-black uppercase text-slate-400 tracking-wider">
                          <th className="py-3 px-4">Book Title</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">File Size</th>
                          <th className="py-3 px-4">Drive File ID</th>
                          <th className="py-3 px-4 hidden md:table-cell">Description MM</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-xs text-slate-700 dark:text-slate-300 font-bold">
                        {books.map((book) => (
                          <tr key={book.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition">
                            <td className="py-3.5 px-4 font-black">
                              <span className="text-indigo-400 text-[13px] block">{book.title}</span>
                              <span className="text-[10px] text-slate-400 font-medium">ID: {book.id}</span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border tracking-wide uppercase ${
                                book.category === 'N3 Books' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 
                                'bg-red-500/10 text-red-100 dark:text-red-400 border-red-500/20'
                              }`}>
                                {book.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[11px]">
                              {book.file_size}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-400 text-[10px] max-w-[120px] truncate" title={book.drive_file_id}>
                              {book.drive_file_id}
                            </td>
                            <td className="py-3.5 px-4 hidden md:table-cell font-medium max-w-[200px] truncate text-[11.5px] text-slate-500 leading-normal">
                              {book.description_mm || <span className="italic text-slate-600">-</span>}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  onClick={() => openEditForm('Books', book)}
                                  className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                                  title="Edit Book"
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  onClick={() => handleDelete('Books', book.id)}
                                  className="p-1.5 rounded-lg border border-red-500/10 bg-red-500/5 hover:bg-red-500/15 text-red-400 transition"
                                  title="Delete Book"
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

          {/* ==================== EXCHANGE RATE MANAGER PANEL ==================== */}
          {adminSection === 'ExchangeRate' && (
            <div className="flex flex-col gap-4 animate-fade-in text-left max-w-xl">
              <div className="border-b border-lightBorder dark:border-darkBorder pb-2">
                <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <span>💴</span> JPY-MMK SBI Exchange Rate
                </h4>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  စနစ်အတွင်းရှိ ဂျပန်ယန်းမှ မြန်မာကျပ်ငွေသို့ ပုံသေလဲလှယ်နှုန်းကို ဤနေရာတွင် ပြင်ဆင်နိုင်ပါသည်။
                </p>
              </div>

              {isLoadingRate ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-indigo-400" size={20} />
                </div>
              ) : (
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm flex flex-col gap-5">
                  <div className="flex flex-col gap-1 bg-slate-50 dark:bg-slate-950/20 p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800/80">
                    <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Current Rate in Database</span>
                    <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {dbRate !== null ? `1 JPY = ${dbRate} MMK` : "No rate set yet"}
                    </span>
                    {dbUpdatedAt && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                        Last Updated: {new Date(dbUpdatedAt).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <form onSubmit={handleUpdateExchangeRate} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        New JPY (Yen) - MMK (Kyat) Rate
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="e.g. 24.57"
                        value={rateInput}
                        onChange={(e) => setRateInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-950 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSavingRate}
                      className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md transition transform hover:scale-[1.01] active-press"
                    >
                      {isSavingRate ? (
                        <>
                          <Loader2 className="animate-spin" size={13} />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Check size={13} />
                          Update Rate
                        </>
                      )}
                    </button>
                  </form>
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
              
              {/* POSTS MANAGER FIELDS */}
              {formActiveManager === 'Posts' && (
                <div className="flex flex-col gap-3.5 text-left font-sans">
                  
                  {/* Mode switcher for adding posts */}
                  {formType === 'add' && (
                    <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-lightBorder dark:border-darkBorder">
                      <button
                        type="button"
                        onClick={() => {
                          setPostGeneratedBy('admin');
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black tracking-wide transition flex items-center justify-center gap-1 ${postGeneratedBy === 'admin' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-200'}`}
                      >
                        ✍️ Manual Post
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPostGeneratedBy('ai');
                        }}
                        className={`flex-1 py-1.5 px-3 rounded-lg text-[11px] font-black tracking-wide transition flex items-center justify-center gap-1 relative ${postGeneratedBy === 'ai' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-205'}`}
                      >
                        ✨ AI Generate Post
                      </button>
                    </div>
                  )}

                  {/* AI input section */}
                  {formType === 'add' && postGeneratedBy === 'ai' && (
                    <div className="p-4 bg-purple-500/5 dark:bg-purple-950/15 border border-purple-500/20 rounded-2xl flex flex-col gap-3 mb-2 animate-fade-in text-left">
                      <div className="flex items-center gap-1.5 text-xs font-black text-purple-500 uppercase tracking-widest">
                        <Sparkles size={13} />
                        Gemini AI Post Generator
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                          ဘာအကြောင်းအရာ ရေးမလဲ ပြောပါ...
                        </label>
                        <textarea
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                          placeholder="e.g. ဂျပန်မှာ အလုပ်လုပ်တဲ့အခါ သတိထားရမယ့် ယဉ်ကျေးမှုများ"
                          className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Word Count</label>
                          <select
                            value={aiWordCount}
                            onChange={(e) => setAiWordCount(Number(e.target.value))}
                            className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-purple-500"
                          >
                            <option value={100}>100 words</option>
                            <option value={200}>200 words</option>
                            <option value={300}>300 words</option>
                            <option value={500}>500 words</option>
                          </select>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Language</label>
                          <div className="w-full text-[11px] font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-100 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400">
                            မြန်မာဘာသာ (Default)
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleGeneratePostWithAI}
                        disabled={generatingAi}
                        className="w-full py-3 rounded-xl bg-purple-650 hover:bg-purple-700 disabled:bg-purple-900/40 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15 hover:shadow-purple-500/25 transition"
                      >
                        {generatingAi ? (
                          <>
                            <Loader2 size={13} className="animate-spin" />
                            AI Generation in progress...
                          </>
                        ) : (
                          <>
                            <Sparkles size={13} />
                            Generate & Preview
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Standard Editable Fields */}
                  <div className="flex flex-col gap-3.5">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Post Title</label>
                      <input 
                        type="text" 
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="e.g. Japanese Bowing Etiquette"
                        className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Category</label>
                      <input 
                        type="text" 
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        placeholder="e.g. Japanese Culture"
                        className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest font-sans">Content (Myanmar)</label>
                      <textarea 
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Type post story or verify generated description with AI..."
                        className="w-full text-xs font-medium p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 min-h-[150px]"
                        required
                        rows={6}
                      />
                    </div>
                  </div>

                </div>
              )}

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

              {/* PLAYLISTS MANAGER FIELDS */}
              {formActiveManager === 'Playlists' && (
                <div className="flex flex-col gap-3.5 text-left">
                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Playlist Title</label>
                    <input 
                      type="text" 
                      value={playlistTitle}
                      onChange={(e) => setPlaylistTitle(e.target.value)}
                      placeholder="e.g. N3 Grammar Master Class (စကားပြောစွမ်းရည်)"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category / Level Tag</label>
                    <input 
                      type="text" 
                      value={playlistCategory}
                      onChange={(e) => setPlaylistCategory(e.target.value)}
                      placeholder="e.g. JLPT N3 Grammar"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Thumbnail Video ID (YouTube)</label>
                      <span className="text-[9px] text-[#EF4444] font-semibold font-mono">11-char ID only</span>
                    </div>
                    <input 
                      type="text" 
                      value={playlistThumbnailId}
                      onChange={(e) => setPlaylistThumbnailId(e.target.value)}
                      placeholder="e.g. SX_ViT4Ra7k (used for playlist cover art)"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Myanmar Description / Target</label>
                    <textarea 
                      value={playlistDesc}
                      onChange={(e) => setPlaylistDesc(e.target.value)}
                      rows={3}
                      placeholder="Detail explanation in Myanmar about this learning playlist module..."
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* YOUTUBE CHANNEL MANAGER FIELDS */}
              {formActiveManager === 'Lessons' && (
                <div className="flex flex-col gap-3.5 text-left">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Channel Name (Title)</label>
                    <input 
                      type="text" 
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="e.g. Nihongo Nomori Lesson 1"
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-sans">Assign to Playlist (Optional)</label>
                    <select
                      value={channelPlaylistId}
                      onChange={(e) => setChannelPlaylistId(e.target.value)}
                      className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- No Playlist (Uncategorized) --</option>
                      {playlists.map((pl) => (
                        <option key={pl.id} value={pl.id}>
                          {pl.title} ({pl.category})
                        </option>
                      ))}
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

              {/* BOOKS MANAGER FIELDS */}
              {formActiveManager === 'Books' && (
                <div className="flex flex-col gap-3.5 text-left font-sans">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Book Title</label>
                    <input 
                      type="text" 
                      value={bookTitle}
                      onChange={(e) => setBookTitle(e.target.value)}
                      placeholder="e.g. Try! N3 Bunpou"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                    <select
                      value={bookCategory}
                      onChange={(e) => setBookCategory(e.target.value)}
                      className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    >
                      <option value="N3 Books">N3 Books</option>
                      <option value="မေးခွန်းဟောင်း">မေးခွန်းဟောင်း</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Size</label>
                    <input 
                      type="text" 
                      value={bookFileSize}
                      onChange={(e) => setBookFileSize(e.target.value)}
                      placeholder="e.g. 14.5 MB"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Google Drive File ID</label>
                    <input 
                      type="text" 
                      value={bookDriveFileId}
                      onChange={(e) => setBookDriveFileId(e.target.value)}
                      placeholder="e.g. 1aBCdEfGhK_LMnoPqrStUvWxYz-123"
                      className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description Myanmar</label>
                    <textarea 
                      value={bookDesc}
                      onChange={(e) => setBookDesc(e.target.value)}
                      rows={3}
                      placeholder="Explanation with Myanmar notes, description..."
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

      {/* ========================================================================= */}
      {/* 📑 PLAYLIST VIDEO REORDERING OVERLAY MODAL */}
      {/* ========================================================================= */}
      {isSortModalOpen && selectedSortPlaylist && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6 animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <div className="flex items-center gap-2">
                <span className="text-base text-indigo-500">↕️</span>
                <div className="flex flex-col">
                  <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">
                    Sort Playlist Videos
                  </h3>
                  <span className="text-[10px] text-slate-450 dark:text-slate-500 font-bold mt-1.5 uppercase tracking-wide block">
                    Playlist: {selectedSortPlaylist.title}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setIsSortModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-100 transition flex items-center justify-center border border-slate-200/50 dark:border-slate-800"
              >
                <X size={12} />
              </button>
            </div>

            {/* Sub-instruction statement */}
            <div className="bg-slate-50 dark:bg-slate-955 p-3 rounded-xl border border-lightBorder dark:border-darkBorder font-sans leading-relaxed text-[11px] text-slate-500 dark:text-slate-400">
              Drag rows using the handle (<Move size={10} className="inline vertical-middle" />) or use arrow buttons to arrange materials in order. Click <span className="font-bold text-slate-700 dark:text-slate-200">Save sorting sequence</span> to write to database.
            </div>

            {/* List space */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-[50vh] py-1 px-0.5 font-sans">
              {sortItemList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-955 rounded-2xl border border-dashed border-lightBorder dark:border-darkBorder text-slate-405 font-bold text-xs">
                  This playlist has no videos yet. Add lessons to it first!
                </div>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {sortItemList.map((item, index) => {
                    const isDragging = draggedIndex === index;
                    return (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragEnd={handleDragEnd}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                          isDragging 
                            ? 'bg-indigo-50/70 border-indigo-500 dark:bg-indigo-950/20 scale-[0.98] opacity-50' 
                            : 'bg-white dark:bg-slate-900/60 border-lightBorder dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-900'
                        }`}
                      >
                        {/* Drag Handle & Index Badge */}
                        <div className="flex items-center gap-2">
                          <div className="cursor-grab p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:cursor-grabbing transition animate-pulse" title="Drag to reorder">
                            <Move size={14} />
                          </div>
                          <span className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-850 text-slate-500 text-[10px] font-black flex items-center justify-center select-none">
                            {index + 1}
                          </span>
                        </div>

                        {/* Thumbnail of video */}
                        <div className="w-14 h-9 bg-slate-900 border border-lightBorder dark:border-darkBorder rounded overflow-hidden shrink-0 flex items-center justify-center relative">
                          <img 
                            src={`https://img.youtube.com/vi/${item.youtube_id}/mqdefault.jpg`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback if load fails
                              e.currentTarget.style.display = 'none';
                            }}
                            alt=""
                          />
                        </div>

                        {/* Details of video */}
                        <div className="flex-grow min-w-0 text-left">
                          <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 truncate leading-snug">
                            {item.channel_name}
                          </h4>
                          <span className="text-[9px] text-slate-400 dark:text-slate-550 uppercase tracking-widest font-black inline-block mt-0.5">
                            Level: {item.level}
                          </span>
                        </div>

                        {/* Manual shift arrows controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItemUp(index)}
                            disabled={index === 0}
                            className={`p-1.5 rounded-lg border transition ${
                              index === 0 
                                ? 'bg-slate-50 dark:bg-slate-905 border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                : 'bg-slate-100 dark:bg-slate-800 border-lightBorder dark:border-darkBorder text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-350'
                            }`}
                            title="Move Up"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItemDown(index)}
                            disabled={index === sortItemList.length - 1}
                            className={`p-1.5 rounded-lg border transition ${
                              index === sortItemList.length - 1 
                                ? 'bg-slate-50 dark:bg-slate-905 border-slate-100 dark:border-slate-850 text-slate-300 dark:text-slate-700 cursor-not-allowed' 
                                : 'bg-slate-100 dark:bg-slate-800 border-lightBorder dark:border-darkBorder text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 dark:text-slate-355'
                            }`}
                            title="Move Down"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Actions for sorts panel */}
            <div className="flex items-center justify-end gap-3 border-t border-lightBorder dark:border-darkBorder pt-4 font-sans mt-2">
              <button
                type="button"
                onClick={() => setIsSortModalOpen(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-650 dark:text-slate-350 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSortOrder}
                disabled={savingSortOrder || sortItemList.length === 0}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white flex items-center gap-1.5 shadow-md shadow-indigo-100 dark:shadow-none transition"
              >
                {savingSortOrder ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Saving order...</span>
                  </>
                ) : (
                  <>
                    <Check size={12} />
                    <span>Save sorting sequence</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
