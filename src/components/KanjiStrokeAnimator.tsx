import React, { useState, useEffect, useRef } from 'react';
import { RotateCcw, Loader2 } from 'lucide-react';

interface KanjiStrokeAnimatorProps {
  kanji: string;
}

// Global cache for parsed KanjiVG SVG content to avoid redundancy
const kanjivgCache: Record<string, string> = {};

export const KanjiStrokeAnimator: React.FC<KanjiStrokeAnimatorProps> = ({ kanji }) => {
  const [svgText, setSvgText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [animKey, setAnimKey] = useState<number>(0);
  
  const activeContainerRef = useRef<HTMLDivElement>(null);

  // Convert kanji character to KanjiVG 5-digit hex string
  const getKanjiVGHex = (char: string): string => {
    if (!char) return '';
    const codePoint = char.codePointAt(0);
    if (!codePoint) return '';
    return codePoint.toString(16).toLowerCase().padStart(5, '0');
  };

  useEffect(() => {
    if (!kanji) return;

    const hex = getKanjiVGHex(kanji);
    if (!hex) {
      setError('Invalid character code');
      return;
    }

    // Check memory cache
    if (kanjivgCache[hex]) {
      setSvgText(kanjivgCache[hex]);
      setError(null);
      setAnimKey(prev => prev + 1);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    const url = `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`;

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to load stroke data: ${res.status}`);
        }
        return res.text();
      })
      .then(text => {
        if (!isMounted) return;
        
        // Optimize the raw SVG to be fluid and scalable
        const smoothedText = text
          .replace(/width="[^"]+"/, 'width="100%"')
          .replace(/height="[^"]+"/, 'height="100%"')
          // Strip hardcoded internal styling, if any, to allow clean custom stroke overriding in CSS
          .replace(/style="[^"]*"/g, '');

        kanjivgCache[hex] = smoothedText;
        setSvgText(smoothedText);
        setAnimKey(prev => prev + 1);
      })
      .catch(err => {
        if (!isMounted) return;
        console.error(err);
        setError('KanjiVG Offline');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [kanji]);

  // Run or replay the stroke-by-stroke drawing sequence
  useEffect(() => {
    if (!svgText || loading || error) return;

    // Timeout allows DOM parsing & rendering injection to settle completely before measuring total lengths
    const timer = setTimeout(() => {
      if (!activeContainerRef.current) return;

      const strokePaths = activeContainerRef.current.querySelectorAll('svg path');
      if (strokePaths.length === 0) return;

      // Reset and compute lengths
      strokePaths.forEach((pathNode) => {
        const path = pathNode as SVGPathElement;
        const strokeLength = path.getTotalLength() || 120;
        
        // Hide path initially
        path.style.strokeDasharray = `${strokeLength}`;
        path.style.strokeDashoffset = `${strokeLength}`;
        path.style.transition = 'none';
        
        // Strip fill-none and set stroke styling manually just in case
        path.setAttribute('fill', 'none');
      });

      // Force a document layout reflow
      activeContainerRef.current.getBoundingClientRect();

      // Setup sequential drawing transition delays
      let accumulatedDelay = 0;
      const strokeDrawDuration = 0.45; // seconds per stroke
      const transitionGap = 0.12;       // overlap gap between consecutive strokes

      strokePaths.forEach((pathNode) => {
        const path = pathNode as SVGPathElement;
        path.style.transition = `stroke-dashoffset ${strokeDrawDuration}s cubic-bezier(0.4, 0, 0.2, 1)`;
        path.style.transitionDelay = `${accumulatedDelay}s`;
        
        accumulatedDelay += strokeDrawDuration + transitionGap;
      });

      // Trigger animation frame trigger to execute in the next tick
      requestAnimationFrame(() => {
        strokePaths.forEach((pathNode) => {
          const path = pathNode as SVGPathElement;
          path.style.strokeDashoffset = '0';
        });
      });
    }, 60);

    return () => clearTimeout(timer);
  }, [svgText, animKey, loading, error]);

  const handleReplay = (e: React.MouseEvent) => {
    e.stopPropagation(); // critical to prevent card flip trigger!
    setAnimKey(prev => prev + 1);
  };

  return (
    <div className="flex flex-col items-center gap-2 mt-1">
      {/* Container display box */}
      <div className="w-44 h-44 relative flex items-center justify-center bg-slate-50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/60 rounded-2xl overflow-hidden shadow-inner p-2">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xs z-10">
            <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
            <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">Loading...</span>
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-slate-50 dark:bg-slate-900 z-10">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-tight">No Diagram</span>
            <span className="text-[8px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">{error}</span>
          </div>
        )}

        {/* The Animated Grid System */}
        {!loading && !error && svgText && (
          <>
            {/* Soft grid decoration */}
            <div className="absolute inset-0 pointer-events-none border-dashed border-slate-200/50 dark:border-slate-800/50 border m-1.5 rounded-xl flex items-center justify-center">
              <div className="absolute top-0 bottom-0 left-1/2 w-[1px] border-l border-dashed border-slate-200/30 dark:border-slate-800/20" />
              <div className="absolute left-0 right-0 top-1/2 h-[1px] border-t border-dashed border-slate-200/30 dark:border-slate-800/20" />
            </div>

            {/* Background skeleton: static faint guide of the full shape */}
            <div 
              className="absolute inset-2 opacity-[0.09] dark:opacity-[0.14] pointer-events-none scale-100 [&_path]:stroke-slate-500 dark:[&_path]:stroke-slate-400 [&_path]:stroke-[3] [&_path]:fill-none [&_text]:hidden"
              dangerouslySetInnerHTML={{ __html: svgText }}
            />

            {/* Active drawing layer in foreground */}
            <div 
              ref={activeContainerRef}
              className="absolute inset-2 pointer-events-none scale-100 [&_path]:stroke-indigo-600 dark:[&_path]:stroke-indigo-400 [&_path]:stroke-[4.5] [&_path]:stroke-linecap-round [&_path]:stroke-linejoin-round [&_path]:fill-none [&_text]:hidden"
              dangerouslySetInnerHTML={{ __html: svgText }}
            />
          </>
        )}
      </div>

      {/* Control bar */}
      {!loading && !error && svgText && (
        <button
          onClick={handleReplay}
          className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-slate-100 border border-slate-200/50 dark:border-slate-800 rounded-lg transition active-press shadow-xs"
          title="Replay stroke sequence"
        >
          <RotateCcw className="w-2.5 h-2.5" />
          <span>Replay</span>
        </button>
      )}
    </div>
  );
};
