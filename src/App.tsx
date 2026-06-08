import { useState, useEffect, useMemo } from 'react';
import { 
  Book, 
  Search as SearchIcon, 
  RefreshCw, 
  Play, 
  Pause, 
  ArrowLeft, 
  Star, 
  Volume2, 
  Check, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Settings,
  Sparkles,
  List as ListIcon,
  LayoutGrid
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Word } from './types';
import { loadVocabulary } from './data/VocabularyLoader';
import { getSynonymsOrAntonyms } from './data/GeminiNetwork';

// Caching helper functions for Gemini Vocabulary results
const getCacheKey = (wordId: string, mode: 'same' | 'diff') => {
  return `gemini_vocab_cache_${mode}_${wordId}`;
};

const getCachedResult = (wordId: string, mode: 'same' | 'diff'): string | null => {
  try {
    return localStorage.getItem(getCacheKey(wordId, mode));
  } catch (e) {
    return null;
  }
};

const setCachedResult = (wordId: string, mode: 'same' | 'diff', value: string) => {
  try {
    localStorage.setItem(getCacheKey(wordId, mode), value);
  } catch (e) {
    console.error('Error writing to localStorage cache:', e);
  }
};

export default function App() {
  // --- Core Vocabulary Storage & States ---
  const allWords = useMemo(() => loadVocabulary(), []);

  const [learnedWords, setLearnedWords] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('learned_words');
    return saved ? new Set(JSON.parse(saved)) : new Set<string>();
  });

  const [settings, setSettings] = useState(() => {
    const darkSaved = localStorage.getItem('dark_mode');
    const isDark = darkSaved !== null ? darkSaved === 'true' : true;
    const lastUnit = localStorage.getItem('last_studied_unit') || '';
    return {
      darkMode: isDark,
      lastStudiedUnit: lastUnit
    };
  });

  const [activeTab, setActiveTab] = useState<'Home' | 'Search'>('Home');
  const [activePart, setActivePart] = useState<'Part 1' | 'Part 2'>('Part 1');
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListView, setIsListView] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);

  // Search screen query state
  const [searchQuery, setSearchQuery] = useState('');

  // AI Helping States
  const [aiMode, setAiMode] = useState<'same' | 'diff' | null>(null);
  const [aiResult, setAiResult] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // Key configurations
  const [apiKeyInput, setApiKeyInput] = useState(() => localStorage.getItem('GEMINI_API_KEY') || '');
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Swipe offset state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Autosave settings
  useEffect(() => {
    localStorage.setItem('learned_words', JSON.stringify(Array.from(learnedWords)));
  }, [learnedWords]);

  useEffect(() => {
    localStorage.setItem('dark_mode', String(settings.darkMode));
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Pre-load voices
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Speak Handler
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      const voices = window.speechSynthesis.getVoices();
      const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang === 'ja-JP');
      if (jaVoice) {
        utterance.voice = jaVoice;
      }
      window.speechSynthesis.speak(utterance);
    }
  };

  // Grouped vocabulary data
  const vocabData = useMemo(() => {
    const p1: Record<string, Word[]> = {};
    const p2: Record<string, Word[]> = {};

    allWords.forEach(w => {
      const target = w.part === 'Part 1' ? p1 : p2;
      if (!target[w.unit]) {
        target[w.unit] = [];
      }
      target[w.unit].push(w);
    });

    return {
      'Part 1': p1,
      'Part 2': p2
    };
  }, [allWords]);

  // Handle Search Filtering
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allWords.filter(w => 
      w.kanji.toLowerCase().includes(q) ||
      w.hiragana.toLowerCase().includes(q) ||
      w.meaning.toLowerCase().includes(q)
    );
  }, [searchQuery, allWords]);

  // Base list of terms in current active unit
  const baseList = useMemo(() => {
    if (!selectedUnit) return [];
    return vocabData['Part 1'][selectedUnit] || vocabData['Part 2'][selectedUnit] || [];
  }, [selectedUnit, vocabData]);

  // Shuffled sequence holder
  const [shuffledSequence, setShuffledSequence] = useState<Word[]>([]);

  // Calculate dynamic active list
  const activeList = useMemo(() => {
    if (isShuffle) {
      return shuffledSequence;
    }
    return baseList;
  }, [baseList, isShuffle, shuffledSequence]);

  const currentWord = activeList[currentIndex] || activeList[0];

  // Trigger Shuffle sequence
  const toggleShuffle = () => {
    if (!isShuffle) {
      const randomized = [...baseList].sort(() => Math.random() - 0.5);
      setShuffledSequence(randomized);
      setIsShuffle(true);
    } else {
      setIsShuffle(false);
    }
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const toggleListView = () => {
    setIsListView(!isListView);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  const toggleFlipped = () => {
    if (!isAutoPlaying) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleNext = () => {
    if (currentIndex < activeList.length - 1) {
      setIsFlipped(false);
      setAiMode(null);
      setAiResult('');
      setCurrentIndex(prev => prev + 1);
    } else {
      // Done with unit! Blasting celebratory confetti!
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      if (isAutoPlaying) {
        setIsAutoPlaying(false);
      }
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setIsFlipped(false);
      setAiMode(null);
      setAiResult('');
      setCurrentIndex(prev => prev - 1);
    }
  };

  // Autoplay Timer Loop
  useEffect(() => {
    let timerId: any = null;
    if (isAutoPlaying && activeList.length > 0) {
      timerId = setTimeout(() => {
        if (!isFlipped) {
          setIsFlipped(true);
        } else {
          if (currentIndex < activeList.length - 1) {
            handleNext();
          } else {
            setIsAutoPlaying(false);
            confetti({
              particleCount: 200,
              spread: 100,
              origin: { y: 0.5 }
            });
          }
        }
      }, 2500);
    }
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isAutoPlaying, isFlipped, currentIndex, activeList]);

  // Background pre-fetching of next card's AI results (de-bounced)
  useEffect(() => {
    if (!selectedUnit || isAutoPlaying || isListView) return;
    
    const nextIndex = currentIndex + 1;
    if (nextIndex >= activeList.length) return;
    
    const nextWord = activeList[nextIndex];
    if (!nextWord) return;
    
    // Check if both are already cached
    const hasSameCache = !!getCachedResult(nextWord.id, 'same');
    const hasDiffCache = !!getCachedResult(nextWord.id, 'diff');
    if (hasSameCache && hasDiffCache) return;
    
    const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || localStorage.getItem('GEMINI_API_KEY') || '';
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') return;
    
    const timer = setTimeout(async () => {
      // Background pre-fetch 'same' meanings
      if (!hasSameCache) {
        try {
          const result = await getSynonymsOrAntonyms(
            nextWord.hiragana,
            nextWord.kanji,
            nextWord.meaning,
            'same'
          );
          if (result && !result.startsWith('Error') && !result.includes('အမှားဖြစ်') && !result.includes('API Key Error') && !result.includes('API Key is missing')) {
            setCachedResult(nextWord.id, 'same', result);
          }
        } catch (e) {
          console.debug('Background pre-fetch same failed:', e);
        }
      }
      
      // Background pre-fetch 'diff' opposites
      if (!hasDiffCache) {
        try {
          const result = await getSynonymsOrAntonyms(
            nextWord.hiragana,
            nextWord.kanji,
            nextWord.meaning,
            'diff'
          );
          if (result && !result.startsWith('Error') && !result.includes('အမှားဖြစ်') && !result.includes('API Key Error') && !result.includes('API Key is missing')) {
            setCachedResult(nextWord.id, 'diff', result);
          }
        } catch (e) {
          console.debug('Background pre-fetch diff failed:', e);
        }
      }
    }, 1200); // 1.2s idle delay to avoid spamming searches while clicking fast through card collections
    
    return () => clearTimeout(timer);
  }, [currentIndex, activeList, selectedUnit, isAutoPlaying, isListView]);

  // Load Unit
  const openUnit = (unitName: string) => {
    setSelectedUnit(unitName);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsShuffle(false);
    setIsAutoPlaying(false);
    setIsListView(false);
    setAiMode(null);
    setAiResult('');

    localStorage.setItem('last_studied_unit', unitName);
    setSettings(prev => ({ ...prev, lastStudiedUnit: unitName }));

    const part = vocabData['Part 1'][unitName] ? 'Part 1' : 'Part 2';
    setActivePart(part);
  };

  const closeUnit = () => {
    setIsAutoPlaying(false);
    setSelectedUnit(null);
    setSearchQuery('');
    setActiveTab('Home');
  };

  // Last Studied Unit Launcher
  const launchLastStudy = () => {
    const lastUnit = settings.lastStudiedUnit || Object.keys(vocabData['Part 1'])[0] || '';
    if (lastUnit) {
      openUnit(lastUnit);
    }
  };

  const toggleLearned = (wordId: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      if (next.has(wordId)) {
        next.delete(wordId);
      } else {
        next.add(wordId);
      }
      return next;
    });
  };

  const markLearnedAndNext = (wordId: string) => {
    setLearnedWords(prev => {
      const next = new Set(prev);
      next.add(wordId);
      return next;
    });
    handleNext();
  };

  // Run AI helper query with caching & skeleton
  const loadAI = async (mode: 'same' | 'diff') => {
    if (!currentWord) return;
    setAiMode(mode);
    
    // Check local storage cache first
    const cached = getCachedResult(currentWord.id, mode);
    if (cached) {
      setAiResult(cached);
      setAiLoading(false);
      return;
    }
    
    setAiResult('');
    setAiLoading(true);

    try {
      const result = await getSynonymsOrAntonyms(
        currentWord.hiragana,
        currentWord.kanji,
        currentWord.meaning,
        mode
      );
      
      // Save valid responses in cache
      if (result && !result.startsWith('Error') && !result.includes('အမှားဖြစ်') && !result.includes('API Key Error') && !result.includes('API Key is missing')) {
        setCachedResult(currentWord.id, mode, result);
      }
      setAiResult(result);
    } catch (err) {
      setAiResult(`Error: ${(err as Error).message}`);
    } finally {
      setAiLoading(false);
    }
  };

  // Touch Swipe Handling for Swiper
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 80;
    const isRightSwipe = distance < -80;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Settings Save
  const saveApiKey = (key: string) => {
    localStorage.setItem('GEMINI_API_KEY', key);
    setApiKeyInput(key);
    setShowSettingsModal(false);
  };

  // Calculating overall statistics
  const masteredCount = useMemo(() => {
    return allWords.filter(w => learnedWords.has(w.id)).length;
  }, [allWords, learnedWords]);

  const totalProgressPercent = useMemo(() => {
    if (allWords.length === 0) return 0;
    return Math.round((masteredCount * 100) / allWords.length);
  }, [allWords, masteredCount]);

  const part1Stats = useMemo(() => {
    let total = 0;
    let learned = 0;
    if (vocabData['Part 1']) {
      Object.keys(vocabData['Part 1']).forEach(unit => {
        const words = vocabData['Part 1'][unit] || [];
        total += words.length;
        learned += words.filter(w => learnedWords.has(w.id)).length;
      });
    }
    const percent = total === 0 ? 0 : Math.round((learned * 100) / total);
    return { total, learned, percent };
  }, [vocabData, learnedWords]);

  const part2Stats = useMemo(() => {
    let total = 0;
    let learned = 0;
    if (vocabData['Part 2']) {
      Object.keys(vocabData['Part 2']).forEach(unit => {
        const words = vocabData['Part 2'][unit] || [];
        total += words.length;
        learned += words.filter(w => learnedWords.has(w.id)).length;
      });
    }
    const percent = total === 0 ? 0 : Math.round((learned * 100) / total);
    return { total, learned, percent };
  }, [vocabData, learnedWords]);

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen flex lg:flex-col items-center justify-center lg:items-stretch lg:justify-start py-0 sm:py-8 lg:py-0 transition-colors duration-200">
      
      {/* Container Frame - behaves as absolute/mobile center on smaller screens, and wide fluid layout on lg screens (1024px+) */}
      <div className="w-full sm:max-w-md lg:max-w-full lg:w-full bg-lightBg dark:bg-darkBg min-h-screen sm:min-h-[85vh] lg:min-h-screen sm:rounded-2xl lg:rounded-none sm:shadow-2xl lg:shadow-none sm:border lg:border-none border-slate-200 dark:border-darkBorder flex flex-col relative overflow-hidden transition-all duration-200 shrink-0">
        
        {/* TOP HEADER / NAVBAR */}
        <header className="sticky top-0 z-40 bg-lightSurface dark:bg-darkSurface border-b border-lightBorder dark:border-darkBorder py-3.5 px-4 lg:px-8 shadow-sm transition-colors duration-200">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            {selectedUnit === null ? (
              <>
                <div className="flex items-center gap-3 lg:gap-8">
                  {/* Branding */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-100 dark:shadow-none">
                      <span className="text-lg">📚</span>
                    </div>
                    <div>
                      <h1 className="font-bold text-sm lg:text-base leading-tight text-slate-800 dark:text-slate-100">N3 Standard 2400</h1>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">Daily Japanese Myanmar Companion</p>
                    </div>
                  </div>

                  {/* Desktop Navigation Tabs */}
                  <div className="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-900/60 px-1 py-1 rounded-xl border border-slate-200/40">
                    <button
                      onClick={() => setActiveTab('Home')}
                      className={`px-4 py-1.5 font-bold text-xs rounded-lg transition active-press ${activeTab === 'Home' ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      Home Module
                    </button>
                    <button
                      onClick={() => setActiveTab('Search')}
                      className={`px-4 py-1.5 font-bold text-xs rounded-lg transition active-press ${activeTab === 'Search' ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      Dictionary Search
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Desktop Header Stats */}
                  <div className="hidden lg:flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/40 px-3.5 py-1.5 rounded-xl mr-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 animate-fade-in">
                    <span>✨ Mastered {masteredCount}/{allWords.length}</span>
                    <span className="opacity-40">|</span>
                    <span>{totalProgressPercent}% Complete</span>
                  </div>

                  {/* Light/Dark mode */}
                  <button 
                    onClick={() => setSettings(p => ({ ...p, darkMode: !p.darkMode }))}
                    className="w-8.5 h-8.5 rounded-full border border-lightBorder dark:border-darkBorder flex items-center justify-center text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition active-press"
                    aria-label="Toggle dark mode"
                  >
                    {settings.darkMode ? '☀️' : '🌙'}
                  </button>

                  {/* API Settings */}
                  <button 
                    onClick={() => setShowSettingsModal(true)}
                    className="w-8.5 h-8.5 rounded-full border border-lightBorder dark:border-darkBorder flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition active-press"
                    aria-label="API Settings"
                  >
                    <Settings size={16} />
                  </button>

                  {/* Last Study */}
                  <button
                    onClick={launchLastStudy}
                    className="h-8.5 px-3 bg-indigo-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1 hover:bg-indigo-700 transition shadow-lg shadow-indigo-100 dark:shadow-none active-press"
                  >
                    <Play size={12} className="fill-current" />
                    <span>Last Study</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3.5">
                  <button 
                    onClick={closeUnit}
                    className="w-9 h-9 rounded-xl border border-lightBorder dark:border-darkBorder flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <div className="leading-tight">
                    <h2 className="font-bold text-[13px] text-slate-500 dark:text-slate-400 uppercase tracking-wider">Study Mode</h2>
                    <p className="font-bold text-sm text-slate-800 dark:text-slate-100 max-w-[200px] sm:max-w-xs truncate">{selectedUnit}</p>
                  </div>
                </div>

                {/* Header Right toggler */}
                <button 
                  onClick={() => setSettings(p => ({ ...p, darkMode: !p.darkMode }))}
                  className="w-8.5 h-8.5 rounded-full border border-lightBorder dark:border-darkBorder flex items-center justify-center text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  {settings.darkMode ? '☀️' : '🌙'}
                </button>
              </>
            )}
          </div>
        </header>

        {/* TICKER/MARQUEE BANNER */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 py-2.5 overflow-hidden flex items-center border-b border-indigo-500/20 select-none shadow-sm relative z-30 transition-all">
          <div className="w-full flex overflow-hidden">
            <div className="animate-marquee inline-flex shrink-0 items-center gap-16 text-xs text-white font-bold tracking-wide">
              <span>✨ This App is created by PHYO WAI SOE ✨ 日本語能力試験 N3 Standard 2400 ✨ This App is created by PHYO WAI SOE ✨</span>
              <span>✨ This App is created by PHYO WAI SOE ✨ 日本語能力試験 N3 Standard 2400 ✨ This App is created by PHYO WAI SOE ✨</span>
              <span>✨ This App is created by PHYO WAI SOE ✨ 日本語能力試験 N3 Standard 2400 ✨ This App is created by PHYO WAI SOE ✨</span>
              <span>✨ This App is created by PHYO WAI SOE ✨ 日本語能力試験 N3 Standard 2400 ✨ This App is created by PHYO WAI SOE ✨</span>
            </div>
          </div>
        </div>

        {/* MAIN BODY AREA */}
        <main className="flex-1 overflow-y-auto px-4 py-4 lg:px-8 lg:py-8 flex flex-col gap-4">
          <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
          
          {/* SCREEN DISPATCHER */}
          {selectedUnit !== null ? (
            /* --- STUDY SCREEN --- */
            <div className="flex-1 flex flex-col gap-4">
              {activeList.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-slate-500 dark:text-slate-400 font-medium">No words found in this unit</p>
                </div>
              ) : (
                <>
                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">Word Progress</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        {currentIndex + 1} <span className="text-xs text-slate-400">of</span> {activeList.length}
                      </p>
                    </div>

                    {/* Unit Controls Toolbar */}
                    <div className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-1 rounded-xl flex items-center gap-1 shadow-sm">
                      {/* List/Grid toggler */}
                      <button
                        onClick={toggleListView}
                        className={`p-2 rounded-lg transition ${isListView ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title={isListView ? 'Standard View' : 'List View'}
                      >
                        {isListView ? <LayoutGrid size={15} /> : <ListIcon size={15} />}
                      </button>

                      {/* Shuffle */}
                      <button
                        onClick={toggleShuffle}
                        className={`p-2 rounded-lg transition ${isShuffle ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Shuffle Words"
                      >
                        <RefreshCw size={14} className={isShuffle ? 'animate-spin-once' : ''} />
                      </button>

                      {/* Autoplay */}
                      <button
                        onClick={toggleAutoPlay}
                        className={`p-2 rounded-lg transition ${isAutoPlaying ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                        title="Auto Play Cards"
                      >
                        {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* LIST SUBVIEW */}
                  {isListView ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8">
                      {activeList.map((word) => {
                        const learned = learnedWords.has(word.id);
                        return (
                          <div 
                            key={word.id}
                            className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-4 rounded-2xl flex flex-col gap-3 shadow-sm transition hover:shadow-md"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <button
                                  onClick={() => speak(word.kanji)}
                                  className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                  <Volume2 size={16} className="text-slate-600 dark:text-slate-300" />
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">{word.kanji}</h3>
                                    {word.kanji !== word.hiragana && (
                                      <span className="text-xs text-slate-400 font-medium">[{word.hiragana}]</span>
                                    )}
                                  </div>
                                  <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 leading-tight">{word.meaning}</p>
                                </div>
                              </div>
                              
                              <button
                                onClick={() => toggleLearned(word.id)}
                                className={`p-2 rounded-full transition ${learned ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                              >
                                <Star size={20} fill={learned ? 'currentColor' : 'none'} />
                              </button>
                            </div>

                            {word.sentenceJa && (
                              <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/60 p-3 rounded-xl flex flex-col gap-1 text-[12px]">
                                <div className="flex items-center justify-between gap-2.5">
                                  <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">{word.sentenceJa}</p>
                                  <button 
                                    onClick={() => speak(word.sentenceJa)}
                                    className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                  >
                                    <Volume2 size={13} />
                                  </button>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">{word.sentenceMm}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* FLASHCARD GRAPHICS CONTAINER */
                    <div className="flex-1 flex flex-col gap-4 max-w-2xl mx-auto w-full">
                      {/* Linear progression bar */}
                      <div className="w-full h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300" 
                          style={{ width: `${((currentIndex + 1) / activeList.length) * 100}%` }}
                        />
                      </div>

                      {/* 3D Rotation Card Frame */}
                      <div 
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        className="h-72 w-full perspective-1000 cursor-pointer active-press"
                        onClick={toggleFlipped}
                      >
                        <div className={`w-full h-full duration-500 transform-style-3d relative ${isFlipped ? 'rotate-y-180' : ''}`}>
                          
                          {/* FRONT PANEL */}
                          <div className="absolute inset-0 w-full h-full rounded-3xl bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-6 shadow-md shadow-slate-100 dark:shadow-none backface-hidden flex flex-col justify-between items-center text-center">
                            
                            {/* Card Header */}
                            <div className="w-full flex items-center justify-between">
                              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-slate-100 dark:bg-slate-805 text-slate-500 dark:text-slate-400 rounded-md">
                                {currentWord.pos}
                              </span>
                              
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  speak(currentWord.kanji);
                                }}
                                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition"
                              >
                                <Volume2 size={16} />
                              </button>
                            </div>

                            {/* Center Kanji/Hiragana */}
                            <div className="flex-1 flex flex-col justify-center items-center gap-1.5 py-4">
                              {currentWord.kanji !== currentWord.hiragana && (
                                <p className="text-base text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                                  {currentWord.hiragana}
                                </p>
                              )}
                              <h3 className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
                                {currentWord.kanji}
                              </h3>
                              
                              <div className="w-14 h-[2px] bg-slate-100 dark:bg-slate-800 my-3" />
                              
                              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                                {currentWord.meaning}
                              </p>
                            </div>

                            {/* Hints footer */}
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wide">
                              Tap to flip · Swipe to navigate
                            </p>
                          </div>

                          {/* BACK PANEL */}
                          <div className="absolute inset-0 w-full h-full rounded-3xl bg-indigo-600 dark:bg-indigo-900 text-white p-6 shadow-xl backface-hidden rotate-y-180 flex flex-col justify-between items-center text-center">
                            
                            {/* Header back */}
                            <div className="w-full flex items-center justify-between">
                              <span className="px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold bg-white/20 text-white rounded-md">
                                {currentWord.pos}
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    speak(currentWord.kanji);
                                  }}
                                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
                                >
                                  <Volume2 size={16} />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleLearned(currentWord.id);
                                  }}
                                  className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25 transition"
                                >
                                  <Star size={16} fill={learnedWords.has(currentWord.id) ? '#fbbf24' : 'none'} className={learnedWords.has(currentWord.id) ? 'text-amber-400' : ''} />
                                </button>
                              </div>
                            </div>

                            {/* Back Content */}
                            <div className="flex-1 flex flex-col justify-center items-center py-2 max-w-xs w-full gap-2.5">
                              <p className="text-[10px] tracking-widest uppercase font-extrabold text-white/60">EXAMPLE SENTENCE</p>
                              
                              {currentWord.sentenceJa ? (
                                <>
                                  <p className="text-[21px] font-bold leading-snug">{currentWord.sentenceJa}</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      speak(currentWord.sentenceJa);
                                    }}
                                    className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white font-bold text-[10px] rounded-full flex items-center gap-1.5 transition"
                                  >
                                    <Volume2 size={11} />
                                    <span>Listen</span>
                                  </button>

                                  <div className="bg-black/15 w-full p-3 rounded-xl border border-white/5 mt-1">
                                    <p className="text-[13px] leading-relaxed text-slate-100 font-medium">
                                      {currentWord.sentenceMm}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <p className="text-xs text-white/70 italic">No example text available</p>
                              )}
                            </div>

                            {/* Hint back */}
                            <p className="text-[10px] text-white/50 font-bold tracking-wider">
                              Tap to flip back
                            </p>
                          </div>

                        </div>
                      </div>

                      {/* AI Synonymous assistance panels (Only when autoplay is disabled) */}
                      {!isAutoPlaying && (
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <button
                              onClick={() => loadAI('same')}
                              className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${aiMode === 'same' ? 'border-2 border-slate-600 dark:border-indigo-400 bg-slate-100/50 dark:bg-slate-800 text-slate-800 dark:text-indigo-400 shadow-sm' : 'border border-lightBorder dark:border-darkBorder bg-lightSurface dark:bg-darkSurface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                              <span>💬 ≈ Same meanings</span>
                            </button>

                            <button
                              onClick={() => loadAI('diff')}
                              className={`flex-1 h-11 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${aiMode === 'diff' ? 'border-2 border-indigo-600 dark:border-amber-400 bg-slate-100/50 dark:bg-slate-800 text-slate-800 dark:text-amber-400 shadow-sm' : 'border border-lightBorder dark:border-darkBorder bg-lightSurface dark:bg-darkSurface text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850'}`}
                            >
                              <span>💬 ≠ Opposites</span>
                            </button>
                          </div>

                          {/* AI API output window */}
                          {(aiLoading || aiResult) && (
                            <div className="bg-slate-50 dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-4 rounded-2xl flex flex-col gap-1.5 shadow-inner transition max-h-[145px] overflow-y-auto">
                              {aiLoading ? (
                                <div className="space-y-2.5 py-1 w-full animate-pulse select-none">
                                  <div className="flex items-center gap-2">
                                    <span className="text-yellow-500 animate-bounce text-xs">•</span>
                                    <div className="h-3 w-1/4 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-900 rounded opacity-60" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-500 animate-bounce text-xs delay-75">•</span>
                                    <div className="h-3 w-1/5 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-2/5 bg-slate-100 dark:bg-slate-900 rounded opacity-60" />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-blue-500 animate-bounce text-xs delay-100">•</span>
                                    <div className="h-3 w-1/3 bg-slate-200 dark:bg-slate-800 rounded" />
                                    <div className="h-3 w-1/3 bg-slate-100 dark:bg-slate-900 rounded opacity-60" />
                                  </div>
                                  <div className="flex items-center justify-center gap-1.5 pt-1">
                                    <span className="flex h-1.5 w-1.5 relative">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                                    </span>
                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-widest leading-none">
                                      Retrieving AI Insights...
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs leading-relaxed flex flex-col gap-1">
                                  {aiResult.split('\n').filter(l => l.trim()).map((line, i) => {
                                    if (line.trim().startsWith('•')) {
                                      const parts = line.split('—');
                                      const boldPart = parts[0];
                                      const meaningPart = parts.slice(1).join('—');
                                      return (
                                        <div key={i} className="flex items-start gap-1 font-medium">
                                          <span className="font-extrabold text-[#d97706] dark:text-[#f59e0b] shrink-0">{boldPart}</span>
                                          <span className="text-[#059669] dark:text-[#10b981] font-semibold">{meaningPart ? ' — ' + meaningPart : ''}</span>
                                        </div>
                                      );
                                    }
                                    return <p key={i} className="text-slate-600 dark:text-slate-300 font-medium">{line}</p>;
                                  })}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Manual pagination controller buttons */}
                      <div className="flex items-center justify-between gap-4 mt-auto py-1">
                        <button
                          onClick={handlePrev}
                          disabled={currentIndex === 0 || isAutoPlaying}
                          className="w-13 h-13 rounded-2xl border border-lightBorder dark:border-darkBorder bg-lightSurface dark:bg-darkSurface hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 transition flex items-center justify-center text-slate-600 dark:text-slate-400 active-press"
                        >
                          <ChevronLeft size={24} />
                        </button>

                        <button
                          onClick={() => markLearnedAndNext(currentWord.id)}
                          className="flex-1 h-13 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-100 dark:shadow-none transition active-press"
                        >
                          <span>Got it</span>
                          <Check size={18} strokeWidth={2.5} />
                        </button>

                        <button
                          onClick={handleNext}
                          disabled={currentIndex === activeList.length - 1 || isAutoPlaying}
                          className="w-13 h-13 rounded-2xl border border-lightBorder dark:border-darkBorder bg-lightSurface dark:bg-darkSurface hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-35 transition flex items-center justify-center text-slate-600 dark:text-slate-400 active-press"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'Home' ? (
            /* --- DASHBOARD SCREEN --- */
            <div className="flex flex-col gap-6">
              
              {/* RESPONSIVE DASHBOARD STATS BANNER VIEW */}
              <div>
                {/* Mobile version (flex, matching original layout perfectly) */}
                <div className="flex lg:hidden gap-3">
                  {/* Learned metrics box */}
                  <div className="flex-1 bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-4 rounded-2xl flex items-center gap-3 shadow-sm transition hover:shadow-md">
                    <div className="w-11 h-11 rounded-full bg-amber-50 dark:bg-amber-955/20 text-amber-500 flex items-center justify-center text-lg shrink-0">
                      <Star size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mastered</h4>
                      <p className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                        {masteredCount} <span className="text-[11px] text-slate-400 font-semibold">/ {allWords.length}</span>
                      </p>
                    </div>
                  </div>

                  {/* Performance linear meter */}
                  <div className="flex-1 bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-2xl text-white shadow-lg flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest block">Total Progress</span>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-2xl font-black">{totalProgressPercent}%</span>
                      <span className="text-[10px] text-white/70">completed</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/20 rounded-full mt-2.5 overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${totalProgressPercent}%` }} />
                    </div>
                  </div>
                </div>

                {/* Desktop Version - Wide stats row cards at the top (grid of 3 columns) */}
                <div className="hidden lg:grid grid-cols-3 gap-6">
                  {/* Total Performance overall */}
                  <div className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center text-2xl shrink-0">
                      ⭐
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black block">Overall Progress</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-850 dark:text-slate-150">{masteredCount}</span>
                        <span className="text-sm text-slate-450 dark:text-slate-400 font-semibold">of {allWords.length} terms</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-300" style={{ width: `${totalProgressPercent}%` }} />
                        </div>
                        <span className="text-xs font-black text-amber-500">{totalProgressPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 1 stats card */}
                  <div className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500 flex items-center justify-center text-2xl shrink-0">
                      📖
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black block">Part 1 Mastery</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{part1Stats.learned}</span>
                        <span className="text-sm text-slate-450 dark:text-slate-400 font-semibold">of {part1Stats.total} words</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full transition-all duration-300" style={{ width: `${part1Stats.percent}%` }} />
                        </div>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{part1Stats.percent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Part 2 stats card */}
                  <div className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-6 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md transition">
                    <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center text-2xl shrink-0">
                      🏆
                    </div>
                    <div className="flex-1">
                      <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-black block">Part 2 Mastery</span>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">{part2Stats.learned}</span>
                        <span className="text-sm text-slate-450 dark:text-slate-400 font-semibold">of {part2Stats.total} words</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-600 dark:bg-emerald-400 rounded-full transition-all duration-300" style={{ width: `${part2Stats.percent}%` }} />
                        </div>
                        <span className="text-xs font-black text-emerald-500">{part2Stats.percent}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION TABS FOR PART 1 / PART 2 */}
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/55 p-1 rounded-xl flex gap-1 self-start min-w-[280px]">
                {(['Part 1', 'Part 2'] as const).map((part) => {
                  const selected = activePart === part;
                  const count = Object.keys(vocabData[part]).length;
                  return (
                    <button
                      key={part}
                      onClick={() => setActivePart(part)}
                      className={`flex-1 py-2 font-bold text-xs rounded-lg transition active-press ${selected ? 'bg-lightSurface dark:bg-darkSurface text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/20' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
                    >
                      {part} ({count} Units)
                    </button>
                  );
                })}
              </div>

              {/* LIST OF STUDY UNITS FOR SELECTED PART */}
              <div className="flex flex-col gap-3">
                <h3 className="font-extrabold text-xs text-slate-400 tracking-wider uppercase">Study Units</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-12">
                  {Object.keys(vocabData[activePart]).map((unitName) => {
                    const uWords = vocabData[activePart][unitName] || [];
                    const uTotal = uWords.length;
                    const uLearned = uWords.filter(w => learnedWords.has(w.id)).length;
                    const uPercent = uTotal === 0 ? 0 : Math.round((uLearned * 100) / uTotal);

                    const displayTitle = unitName.includes(': ') 
                      ? `${unitName.split(': ')[1]} (${unitName.split(': ')[0]})` 
                      : unitName;

                    return (
                      <div
                        key={unitName}
                        onClick={() => openUnit(unitName)}
                        className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition active-press group"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition truncate">
                            {displayTitle}
                          </h4>
                          
                          <div className="flex items-center gap-2.5 mt-2">
                            <span className="text-[11px] text-slate-400 font-bold tracking-wide">
                              {uLearned} / {uTotal} words
                            </span>
                            
                            <span className="px-1.5 py-0.5 text-[9px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-400/80 rounded">
                              {uTotal}w
                            </span>
                          </div>
                        </div>

                        {/* Circular Progress SVG Ring */}
                        <div className="w-12 h-12 relative flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90">
                            {/* Inner Track circle */}
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              className="stroke-slate-100 dark:stroke-slate-800/80 fill-none"
                              strokeWidth="3.5"
                            />
                            {/* Foremost Progress arc */}
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              className={`fill-none transition-all duration-500 ${uPercent === 100 ? 'stroke-emerald-500' : 'stroke-indigo-600'}`}
                              strokeWidth="3.5"
                              strokeDasharray={`${2 * Math.PI * 20}`}
                              strokeDasharray-value=""
                              strokeDashoffset={`${2 * Math.PI * 20 * (1 - uPercent / 100)}`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <span className={`absolute text-[10px] font-extrabold ${uPercent === 100 ? 'text-emerald-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            {uPercent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* --- DICTIONARY SEARCH SCREEN --- */
            <div className="flex flex-col gap-4 flex-1">
              <h2 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">Dictionary Search</h2>
              
              {/* Search textfield */}
              <div className="relative">
                <SearchIcon size={18} className="absolute left-4 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Kanji, Hiragana, or Meaning..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 pl-11 pr-11 border border-lightBorder dark:border-darkBorder bg-lightSurface dark:bg-darkSurface focus:border-indigo-600 text-sm font-medium rounded-xl outline-none text-slate-800 dark:text-slate-100 transition shadow-inner"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Increment search lists */}
              {searchQuery.trim() ? (
                <div className="flex-1 flex flex-col gap-3 pb-12">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide px-1">Found {searchResults.length} results</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[62vh] overflow-y-auto">
                    {searchResults.map((word) => {
                      const learned = learnedWords.has(word.id);
                      return (
                        <div 
                          key={word.id}
                          className="bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-3.5 rounded-2xl flex items-center justify-between gap-3 shadow-none hover:shadow-md transition"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              onClick={() => speak(word.kanji)}
                              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 hover:text-slate-700"
                            >
                              <Volume2 size={15} />
                            </button>
                            
                            <div className="min-w-0">
                              <div className="flex items-baseline gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-sm text-slate-850 dark:text-slate-100">{word.kanji}</h4>
                                {word.kanji !== word.hiragana && (
                                  <span className="text-[10px] text-slate-400 font-bold">[{word.hiragana}]</span>
                                )}
                              </div>
                              <p className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5 truncate">{word.meaning}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => toggleLearned(word.id)}
                            className={`p-2 rounded-full shrink-0 transition ${learned ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                          >
                            <Star size={18} fill={learned ? 'currentColor' : 'none'} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col gap-2 items-center justify-center text-center p-8 mt-4">
                  <div className="w-14 h-14 rounded-full border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-2">
                    <SearchIcon size={24} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Enter query to find words</h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px]">Type any Kanji, Hiragana or Myanmar translation keywords</p>
                </div>
              )}

            </div>
          )}

          </div>
        </main>

        {/* BOTTOM NAVIGATION TAB BAR */}
        {selectedUnit === null && (
          <nav className="lg:hidden sticky bottom-0 z-40 bg-lightSurface dark:bg-darkSurface border-t border-lightBorder dark:border-darkBorder px-6 py-2 pb-3.5 flex items-center justify-around shadow-lg transition-colors duration-200">
            {/* Home Tab */}
            <button
              onClick={() => setActiveTab('Home')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'Home' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Book size={20} className={activeTab === 'Home' ? 'stroke-[2.5px]' : ''} />
              <span className="text-[10px] uppercase tracking-wider">Home</span>
            </button>

            {/* Search Tab */}
            <button
              onClick={() => setActiveTab('Search')}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition ${activeTab === 'Search' ? 'text-indigo-600 dark:text-indigo-400 font-black' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <SearchIcon size={20} className={activeTab === 'Search' ? 'stroke-[2.5px]' : ''} />
              <span className="text-[10px] uppercase tracking-wider">Search</span>
            </button>
          </nav>
        )}

        {/* SETTINGS DIALOG MODAL (For API Keys) */}
        {showSettingsModal && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="w-full max-w-[325px] bg-lightSurface dark:bg-darkSurface border border-lightBorder dark:border-darkBorder p-5 rounded-2xl shadow-2xl flex flex-col gap-4 text-slate-800 dark:text-slate-100">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-500 flex items-center justify-center">
                    <Sparkles size={14} fill="currentColor" />
                  </div>
                  <h3 className="font-extrabold text-sm tracking-wide">Gemini AI Settings</h3>
                </div>
                <button 
                  onClick={() => setShowSettingsModal(false)}
                  className="w-7 h-7 rounded-full border border-lightBorder dark:border-darkBorder flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              </div>

              <div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-semibold uppercase tracking-wider mb-2">Gemini API Token key</p>
                <input
                  type="password"
                  placeholder="Paste GEMINI_API_KEY here..."
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full h-10 px-3.5 border border-lightBorder dark:border-darkBorder bg-slate-50 dark:bg-slate-900 focus:border-indigo-600 text-xs font-semibold rounded-xl outline-none"
                />
                <p className="text-[10px] text-slate-400 leading-relaxed mt-2.5 font-medium">
                  We use <span className="font-bold text-indigo-500">gemini-3.5-flash</span> to generate synonym and antonym cards instantly. Leaving it blank falls back to injected workspace secrets. Key is stored locally in your browser.
                </p>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="px-3.5 py-1.5 border border-lightBorder dark:border-darkBorder hover:bg-slate-50 dark:hover:bg-slate-850 font-bold text-[11px] rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveApiKey(apiKeyInput)}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-[11px] rounded-lg transition"
                >
                  Save API Key
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
