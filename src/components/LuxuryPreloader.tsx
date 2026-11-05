import React, { useEffect, useState } from 'react';
import { FaminasLogo } from './FaminasLogo';

interface LuxuryPreloaderProps {
  onComplete?: () => void;
  minDurationMs?: number;
}

export const LuxuryPreloader: React.FC<LuxuryPreloaderProps> = ({
  onComplete,
  minDurationMs = 750,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const progressTimer = setTimeout(() => {
      setProgress(75);
    }, minDurationMs * 0.4);

    const fullTimer = setTimeout(() => {
      setProgress(100);
      setIsExiting(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
    }, minDurationMs);

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fullTimer);
    };
  }, [minDurationMs, onComplete]);

  return (
    <aside
      aria-label="Loading FAMINAS Restaurant Experience"
      aria-live="polite"
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#180E08] transition-opacity duration-400 ease-out ${
        isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background Luxury Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-[#C9A45C]/20 via-[#254B37]/25 to-transparent rounded-full blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center max-w-sm px-6 text-center space-y-6">
        {/* Animated Emblem with Halo */}
        <div className="relative">
          {/* Pulsing Outer Ring */}
          <div className="absolute -inset-3 rounded-full border border-[#C9A45C]/35 animate-spin-slow pointer-events-none" />
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#C9A45C]/30 to-[#254B37]/40 blur-md animate-pulse-subtle" />

          {/* Logo Card */}
          <div className="relative p-3.5 rounded-2xl bg-[#21150F] border border-[#C9A45C]/60 shadow-[0_10px_35px_rgba(201,164,92,0.35)]">
            <FaminasLogo size="lg" />
          </div>
        </div>

        {/* Narrative & Tagline */}
        <div className="space-y-1.5">
          <span className="block text-[10px] sm:text-xs font-mono font-bold uppercase tracking-[0.28em] text-[#C9A45C]">
            West African &amp; American Cuisine
          </span>
          <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#F7F3EA] tracking-wide">
            FAMINAS RESTAURANT
          </h2>
          <p className="text-[11px] text-[#F7F3EA]/70 italic">
            Good food brings people together · Lindenwold, NJ
          </p>
        </div>

        {/* Elegant Gold Progress Line */}
        <div className="w-48 sm:w-56 space-y-2">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#C9A45C] via-[#E2BE76] to-[#C9A45C] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
            {/* Shimmer sweep */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-gold-sweep pointer-events-none" />
          </div>
          <span className="block text-[9.5px] uppercase font-mono tracking-widest text-[#C9A45C]/80">
            {progress < 100 ? 'Preparing Fresh Flavors…' : 'Ready'}
          </span>
        </div>
      </div>
    </aside>
  );
};

