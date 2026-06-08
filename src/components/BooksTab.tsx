import React, { useState } from 'react';
import { Book, Download, BookOpen, X, Loader2 } from 'lucide-react';

interface BookItem {
  title: string;
  description: string;
  fileId: string;
  size: string;
  category: string;
  color: string;
}

const BOOK_DATA: BookItem[] = [
  {
    title: "Shin Kanzen Master N3 Listening",
    description: "N3 Listening practice book - Shin Kanzen Master series",
    fileId: "1W5LUyEJZIyE91IhXNl5Kii3S2amZ-2bw",
    size: "~50 MB",
    category: "Listening",
    color: "#6C63FF"
  }
];

export const BooksTab: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(null);
  const [iframeLoading, setIframeLoading] = useState<boolean>(true);

  const openPdfViewer = (book: BookItem) => {
    setSelectedBook(book);
    setIframeLoading(true);
  };

  const closePdfViewer = () => {
    setSelectedBook(null);
    setIframeLoading(true);
  };

  return (
    <div className="flex flex-col flex-1 pb-24 md:pb-28">
      {/* Header Section */}
      <div className="flex flex-col gap-1 mb-6">
        <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>📚 PDF Study Books</span>
          <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/10 rounded-md">
            Shin Kanzen Master
          </span>
        </h2>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Access high-quality exam preparation resources directly offline or online inside your mobile dashboard companion.
        </p>
      </div>

      {/* Library Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {BOOK_DATA.map((book) => (
          <div
            key={book.fileId}
            className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row"
          >
            {/* Book Cover Visual Accent */}
            <div 
              style={{ backgroundColor: book.color }}
              className="md:w-36 h-48 md:h-auto flex flex-col items-center justify-center p-6 text-white shrink-0 relative overflow-hidden"
            >
              {/* Abs decoration circles */}
              <div className="absolute -top-10 -left-10 w-24 h-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-10 -right-10 w-20 h-20 rounded-full bg-white/10" />
              
              <Book className="w-14 h-14 drop-shadow-lg mb-2" />
              <span className="text-[10px] font-black tracking-widest uppercase bg-black/20 px-2 py-0.5 rounded-md">
                {book.category}
              </span>
              <span className="text-[9px] font-extrabold text-white/80 mt-1 uppercase">
                {book.size}
              </span>
            </div>

            {/* Book Description details */}
            <div className="p-5 sm:p-6 flex flex-col justify-between flex-grow gap-4">
              <div className="space-y-1.5Packed">
                <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm sm:text-base leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed font-semibold">
                  {book.description}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => openPdfViewer(book)}
                  className="flex-1 h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 transition active-press shadow-sm"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Read Online</span>
                </button>
                <a
                  href={`https://drive.google.com/uc?export=download&id=${book.fileId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 px-4 rounded-xl border border-lightBorder dark:border-darkBorder bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/40 dark:hover:bg-slate-900 text-slate-600 dark:text-slate-300 font-extrabold text-xs flex items-center justify-center gap-1.5 transition active-press"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FULLSCREEN PDF VIEWER MODEL */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col z-[100] animate-fade-in">
          {/* Top Control Bar of PDF Modal */}
          <div className="bg-slate-900/90 text-white border-b border-white/10 px-4 sm:px-6 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                <Book className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs sm:text-sm font-extrabold truncate" title={selectedBook.title}>
                  {selectedBook.title}
                </h4>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">
                  Pre-Viewing Live Document
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://drive.google.com/uc?export=download&id=${selectedBook.fileId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 transition"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </a>
              <button
                onClick={closePdfViewer}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition"
                aria-label="Close PDF"
              >
                <X className="w-4 h-4" />
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
              src={`https://drive.google.com/file/d/${selectedBook.fileId}/preview`}
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
