import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Book, Download, BookOpen, X, Loader2, RefreshCw, 
  Eye, Settings, PlusCircle, Edit, Trash2, CheckCircle, AlertCircle 
} from 'lucide-react';

interface BookItem {
  id: string | number;
  title: string;
  description_mm: string;
  drive_file_id: string;
  category: string;
  file_size: string;
  created_at?: string;
}

interface BooksTabProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (val: boolean) => void;
}

export const BooksTab: React.FC<BooksTabProps> = ({ isAdminLoggedIn, setIsAdminLoggedIn }) => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtfumxdmgldvseuxarjo.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  // Suppress typescript warning for unused props without removing it
  const _dummy = () => { if (typeof setIsAdminLoggedIn === 'function') { /* noop */ } };
  useEffect(() => { _dummy(); }, [setIsAdminLoggedIn]);

  const supabase = useMemo(() => {
    if (supabaseUrl && supabaseAnonKey) {
      try {
        return createClient(supabaseUrl, supabaseAnonKey);
      } catch (e) {
        console.error("Failed to build Supabase client in BooksTab", e);
        return null;
      }
    }
    return null;
  }, [supabaseUrl, supabaseAnonKey]);

  const [books, setBooks] = useState<BookItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<'All' | 'N3 Books' | 'မေးခွန်းဟောင်း'>('All');

  // View state: Admin panel vs. Public client
  const [viewMode, setViewMode] = useState<'public' | 'admin'>(isAdminLoggedIn ? 'admin' : 'public');

  // Status message banners
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form states for adding/editing a book
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [formType, setFormType] = useState<'add' | 'edit'>('add');
  const [selectedItemId, setSelectedItemId] = useState<string | number | null>(null);

  const [bookTitle, setBookTitle] = useState('');
  const [bookDesc, setBookDesc] = useState('');
  const [bookCategory, setBookCategory] = useState('N3 Books');
  const [bookFileSize, setBookFileSize] = useState('');
  const [bookDriveFileId, setBookDriveFileId] = useState('');

  // Sync viewMode when logged in status changes
  useEffect(() => {
    if (isAdminLoggedIn) {
      setViewMode('admin');
    } else {
      setViewMode('public');
    }
  }, [isAdminLoggedIn]);

  // Handle banner timeouts
  useEffect(() => {
    if (successBanner) {
      const timer = setTimeout(() => setSuccessBanner(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [successBanner]);

  useEffect(() => {
    if (errorBanner) {
      const timer = setTimeout(() => setErrorBanner(null), 8000);
      return () => clearTimeout(timer);
    }
  }, [errorBanner]);

  const fetchBooks = async () => {
    if (!supabase) return;
    setLoading(true);
    setErrorText(null);
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (err: any) {
      console.error('Error fetching books:', err);
      setErrorText(err.message || 'Error occurred fetching books from Supabase.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (supabase) {
      fetchBooks();
    }
  }, [supabase]);

  const openPdfViewer = (book: BookItem) => {
    setSelectedBook(book);
    setIframeLoading(true);
  };

  const closePdfViewer = () => {
    setSelectedBook(null);
    setIframeLoading(true);
  };

  const filteredBooks = books.filter(book => 
    selectedCategory === 'All' ? true : book.category === selectedCategory
  );

  const getBookColor = (category: string) => {
    return category === 'N3 Books' ? '#6C63FF' : '#EF4444';
  };

  // Open Form Dialogs
  const openAddForm = () => {
    setFormType('add');
    setSelectedItemId(null);
    setBookTitle('');
    setBookDesc('');
    setBookCategory('N3 Books');
    setBookFileSize('');
    setBookDriveFileId('');
    setIsFormModalOpen(true);
  };

  const openEditForm = (book: BookItem) => {
    setFormType('edit');
    setSelectedItemId(book.id);
    setBookTitle(book.title || '');
    setBookDesc(book.description_mm || '');
    setBookCategory(book.category || 'N3 Books');
    setBookFileSize(book.file_size || '');
    setBookDriveFileId(book.drive_file_id || '');
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    setErrorBanner(null);
    setSuccessBanner(null);

    if (!bookTitle.trim() || !bookCategory.trim() || !bookDriveFileId.trim() || !bookFileSize.trim()) {
      setErrorBanner("Book Title, Category, File Size, and Google Drive File ID are required!");
      return;
    }

    const bookData = {
      title: bookTitle.trim(),
      description_mm: bookDesc.trim(),
      category: bookCategory.trim(),
      file_size: bookFileSize.trim(),
      drive_file_id: bookDriveFileId.trim(),
    };

    try {
      if (formType === 'add') {
        const { error } = await supabase.from('books').insert([bookData]);
        if (error) throw error;
        setSuccessBanner("Book added successfully!");
      } else {
        const { error } = await supabase.from('books').update(bookData).eq('id', selectedItemId);
        if (error) throw error;
        setSuccessBanner("Book updated successfully!");
      }
      setIsFormModalOpen(false);
      fetchBooks();
    } catch (err: any) {
      console.error("Failed to save book:", err);
      setErrorBanner(err.message || "Failed to save book details.");
    }
  };

  const handleDeleteBook = async (id: string | number) => {
    if (!supabase) return;
    if (!window.confirm("Are you sure you want to delete this book?")) return;

    setErrorBanner(null);
    setSuccessBanner(null);

    try {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      setSuccessBanner("Book deleted successfully!");
      fetchBooks();
    } catch (err: any) {
      console.error("Failed to delete book:", err);
      setErrorBanner(err.message || "Failed to delete book.");
    }
  };

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-28">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 text-left">
        <div className="flex flex-col gap-1 max-w-xl">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2 flex-wrap">
            <span>📚 PDF Study Books</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 rounded-md">
              Shin Kanzen Master & More
            </span>
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-normal">
            Access high-quality exam preparation resources directly offline or online inside your mobile dashboard companion.
          </p>
        </div>

        {/* Toggle Mode button for admins */}
        {isAdminLoggedIn && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800 rounded-xl self-start sm:self-center">
            <button
              onClick={() => setViewMode('public')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'public' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-100'}`}
            >
              <Eye size={12} />
              Public View
            </button>
            <button
              onClick={() => setViewMode('admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ${viewMode === 'admin' ? 'bg-[#EF4444] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-850 dark:hover:text-slate-100'}`}
            >
              <Settings size={12} />
              Admin Dashboard
            </button>
          </div>
        )}
      </div>

      {/* Floating Status notifications */}
      {successBanner && (
        <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black flex items-center gap-2 select-none text-left">
          <CheckCircle size={14} className="text-emerald-500" />
          <span>{successBanner}</span>
        </div>
      )}

      {errorBanner && (
        <div className="p-3 mb-4 bg-red-500/15 border border-red-500/25 text-red-400 rounded-xl text-xs font-black flex items-center gap-2 select-none text-left">
          <AlertCircle size={14} className="text-red-500" />
          <span>{errorBanner}</span>
        </div>
      )}

      {/* Error text boundary from Supabase if not loaded */}
      {errorText && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold leading-normal text-left">
          {errorText}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🖥️ VIEW MODE: PUBLIC INTERFACE */}
      {/* ========================================================================= */}
      {viewMode === 'public' ? (
        <>
          <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
            {/* Category filter tabs */}
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl border border-slate-250/20 dark:border-slate-800/40 w-full sm:w-auto sm:min-w-[400px]">
              {(['All', 'N3 Books', 'မေးခွန်းဟောင်း'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-1 py-1.5 text-center text-xs font-bold rounded-lg transition-all active-press ${
                    selectedCategory === cat
                      ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/20'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {cat === 'All' ? '📂 All' : cat === 'N3 Books' ? '📖 N3 Books' : '📝 မေးခွန်းဟောင်း'}
                </button>
              ))}
            </div>

            <button 
              onClick={fetchBooks} 
              disabled={loading}
              className="p-2 px-3 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 active-press"
            >
              <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
              Refresh list
            </button>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="animate-spin text-indigo-400" size={24} />
              <span className="text-xs text-slate-400 font-bold">Scanning study PDF directory from database...</span>
            </div>
          ) : books.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 dark:border-slate-800/80 rounded-3xl">
              <Book className="mx-auto text-slate-300 dark:text-slate-700 mb-2" size={32} />
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">No books available yet.</p>
            </div>
          ) : (
            <>
              {/* MOBILE LIST LAYOUT (Single horizontal row, small icon on left, title/desc center, read right) */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder rounded-2xl p-3 flex items-center justify-between gap-3 shadow-xs hover:shadow-sm"
                  >
                    {/* Small icon (40x40px) on the left */}
                    <div
                      style={{ backgroundColor: getBookColor(book.category) }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0"
                    >
                      <Book className="w-5 h-5 drop-shadow-sm" />
                    </div>

                    {/* Title + description in the middle */}
                    <div className="flex-grow min-w-0 pr-2 text-left">
                      <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-xs truncate leading-tight">
                        {book.title}
                      </h3>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5 leading-none font-semibold">
                        {book.description_mm} • {book.file_size}
                      </p>
                    </div>

                    {/* Read button on the right */}
                    <button
                      onClick={() => openPdfViewer(book)}
                      className="h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] flex items-center gap-1 shrink-0 transition active-press shadow-xs"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read</span>
                    </button>
                  </div>
                ))}
                {filteredBooks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-bold">
                    No books found under this category.
                  </div>
                )}
              </div>

              {/* DESKTOP GRID LAYOUT (Grid of cards) */}
              <div className="hidden md:grid md:grid-cols-2 gap-5 text-left">
                {filteredBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row text-left"
                  >
                    {/* Book Cover Visual Accent */}
                    <div 
                      style={{ backgroundColor: getBookColor(book.category) }}
                      className="md:w-36 h-48 md:h-auto flex flex-col items-center justify-center p-6 text-white shrink-0 relative overflow-hidden"
                    >
                      {/* Abs decoration circles */}
                      <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-white/10" />
                      <div className="absolute -bottom-10 -right-10 w-20 h-20 rounded-full bg-white/10" />
                      
                      <Book className="w-14 h-14 drop-shadow-lg mb-2" />
                      <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded-md text-center max-w-[120px] truncate block">
                        {book.category}
                      </span>
                      <span className="text-[9px] font-extrabold text-white/80 mt-1 uppercase">
                        {book.file_size}
                      </span>
                    </div>

                    {/* Book Description details */}
                    <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow gap-4 text-left">
                      <div className="space-y-1.5 flex flex-col text-left">
                        <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                          {book.description_mm}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2.5 mt-auto">
                        <button
                          onClick={() => openPdfViewer(book)}
                          className="w-full h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active-press shadow-sm"
                        >
                          <BookOpen className="w-4 h-4" />
                          <span>Read</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredBooks.length === 0 && (
                  <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 font-bold col-span-2">
                    No books found under this category.
                  </div>
                )}
              </div>
            </>
          )}
        </>
      ) : (
        /* ========================================================================= */
        /* ⚙️ VIEW MODE: ADMIN DATABASE INTERFACE */
        /* ========================================================================= */
        <div className="flex flex-col gap-4 animate-fade-in text-left">
          <div className="flex justify-between items-center sm:gap-4 flex-wrap gap-2 mb-2">
            <h4 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1">
              <span>📖</span> BOOKS DATABASE ({books.length})
            </h4>
            <button
              onClick={openAddForm}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shadow-md transition transform hover:scale-[1.02] active-press animate-pulse"
            >
              <PlusCircle size={14} />
              Add New Book
            </button>
          </div>

          {loading ? (
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
                              onClick={() => openEditForm(book)}
                              className="p-1.5 rounded-lg border border-slate-200/55 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-400 transition"
                              title="Edit Book"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteBook(book.id)}
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

      {/* FULLSCREEN PDF VIEWER MODAL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-[100] animate-fade-in">
          {/* Top Control Bar of PDF Modal */}
          <div className="bg-slate-900/90 text-white border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Book className="w-4 h-4" />
              </div>
              <div className="min-w-0 text-left">
                <h4 className="text-xs sm:text-sm font-extrabold truncate text-white" title={selectedBook.title}>
                  {selectedBook.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                  Pre-Viewing Live Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <a
                href={`https://drive.google.com/uc?export=download&id=${selectedBook.drive_file_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 px-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-lg text-white font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm whitespace-nowrap"
                title="Download PDF"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>
              <button
                onClick={closePdfViewer}
                className="h-9 px-3 bg-slate-800 hover:bg-slate-700 active:bg-slate-750 text-slate-200 hover:text-white rounded-lg font-extrabold text-xs flex items-center gap-1.5 transition whitespace-nowrap"
                aria-label="Close PDF"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* PDF Frame Container */}
          <div className="flex-grow flex items-center justify-center relative bg-slate-950">
            {/* Loading Spinner for iframe */}
            {iframeLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-950 z-10">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
                  Rendering PDF document container ...
                </span>
              </div>
            )}
            <iframe
              src={`https://drive.google.com/file/d/${selectedBook.drive_file_id}/preview`}
              className="w-full h-full border-none"
              allow="autoplay"
              onLoad={() => setIframeLoading(false)}
              title={selectedBook.title}
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📝 UNIFIED DATA EDIT & CREATION OVERLAY DIALOG MODAL */}
      {/* ========================================================================= */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-955/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in text-left">
          <form 
            onSubmit={handleFormSubmit}
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col gap-4 p-6"
          >
            {/* Form Header */}
            <div className="flex items-center justify-between border-b border-lightBorder dark:border-darkBorder pb-4">
              <div className="flex items-center gap-2">
                <span className="text-base text-violet-500">📖</span>
                <h3 className="text-[14px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest">
                  {formType === 'add' ? 'Add Book' : 'Edit Book'} — Books Manager
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
                    className="w-full text-xs font-black p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
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
                    className="w-full text-xs font-bold p-3 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-955 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* Form Action Controls */}
            <div className="flex items-center gap-3 border-t border-lightBorder dark:border-darkBorder pt-4 mt-1">
              <button 
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 py-3 px-4 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition transform hover:scale-[1.01] active-press"
              >
                {formType === 'add' ? 'Save New Book' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
