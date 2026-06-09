import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Book, Download, BookOpen, X, Loader2, RefreshCw } from 'lucide-react';

interface BookItem {
  id: string | number;
  title: string;
  description_mm: string;
  drive_file_id: string;
  category: string;
  file_size: string;
  created_at?: string;
}

export const BooksTab: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rtfumxdmgldvseuxarjo.supabase.co';
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-28">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-5 text-left">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <span>📚 PDF Study Books</span>
            <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 rounded-md">
              Shin Kanzen Master & More
            </span>
          </h2>
          <button 
            onClick={fetchBooks} 
            disabled={loading}
            className="p-1 px-2.5 rounded-lg border border-slate-200/30 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 transition text-[10px] font-black text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1 self-center active-press"
          >
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Access high-quality exam preparation resources directly offline or online inside your mobile dashboard companion.
        </p>
      </div>

      {/* Error banner */}
      {errorText && (
        <div className="p-3 mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold leading-normal text-left">
          {errorText}
        </div>
      )}

      {/* Category filter tabs */}
      <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900/60 rounded-xl mb-6 border border-slate-250/20 dark:border-slate-800/40 max-w-md">
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

      {/* FULLSCREEN PDF VIEWER MODEL */}
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
    </div>
  );
};
