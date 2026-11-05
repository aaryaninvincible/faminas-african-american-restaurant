import React, { useState, useEffect, useRef } from 'react';
import { Heart, ShoppingBag, Eye, Check, Edit3, Loader2 } from 'lucide-react';
import { MenuItem } from '../types/restaurant';
import { getCulinaryVisualUrl } from '../lib/culinaryVisuals';

interface FoodCardProps {
  item: MenuItem;
  currencySymbol: string;
  isFavourite: boolean;
  whatsappEnabled: boolean;
  index?: number;
  animationKey?: string;
  onAddToCart: (item: MenuItem) => void;
  onOrderNow?: (item: MenuItem) => void;
  onViewDetails: (item: MenuItem) => void;
  onToggleFavourite: (itemId: string) => void;
  onWhatsAppOrder: (item: MenuItem) => void;
  onUpdatePrice?: (item: MenuItem, nextPrice: number) => void;
}

/** Crisp recognizable WhatsApp icon SVG */
const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className={className}
  >
    <path d="M12.031 2C6.508 2 2.023 6.485 2.023 12.007c0 1.766.46 3.49 1.335 5.01L2 22l5.122-1.343a9.967 9.967 0 0 0 4.909 1.298h.004c5.522 0 10.007-4.485 10.007-10.007 0-2.674-1.041-5.188-2.932-7.079A9.944 9.944 0 0 0 12.031 2Zm5.862 14.324c-.246.693-1.434 1.326-1.988 1.409-.508.076-1.15.108-1.856-.116-.428-.136-.978-.318-1.682-.622-2.961-1.278-4.894-4.261-5.042-4.458-.148-.197-1.204-1.602-1.204-3.056 0-1.454.763-2.169 1.034-2.465.271-.296.591-.37.788-.37.197 0 .394.002.567.01.182.009.426-.069.666.508.246.591.838 2.045.912 2.193.074.148.123.32.025.517-.099.197-.148.32-.296.493-.148.172-.311.385-.444.517-.148.148-.302.309-.13.605.172.296.766 1.264 1.645 2.047 1.13 1.007 2.083 1.319 2.379 1.467.296.148.468.123.641-.074.172-.197.739-.862.936-1.158.197-.296.394-.246.665-.148.271.099 1.725.813 2.02.961.296.148.493.222.567.345.074.123.074.714-.172 1.407Z" />
  </svg>
);

export const FoodCard: React.FC<FoodCardProps> = ({
  item,
  currencySymbol,
  isFavourite,
  whatsappEnabled,
  index = 0,
  animationKey = 'default',
  onAddToCart,
  onViewDetails,
  onToggleFavourite,
  onWhatsAppOrder,
  onUpdatePrice,
}) => {
  const cardRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    return false;
  });

  // Button interactive states for Add to Cart: idle | adding | added
  const [cartButtonState, setCartButtonState] = useState<'idle' | 'adding' | 'added'>('idle');
  const addTimerRef = useRef<number | null>(null);
  const confirmTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (addTimerRef.current) window.clearTimeout(addTimerRef.current);
      if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current);
    };
  }, []);

  const handleAddToCartClick = () => {
    if (!item.isAvailable || cartButtonState === 'adding') return;

    if (addTimerRef.current) window.clearTimeout(addTimerRef.current);
    if (confirmTimerRef.current) window.clearTimeout(confirmTimerRef.current);

    setCartButtonState('adding');

    addTimerRef.current = window.setTimeout(() => {
      onAddToCart(item);
      setCartButtonState('added');

      confirmTimerRef.current = window.setTimeout(() => {
        setCartButtonState('idle');
      }, 1600);
    }, 260);
  };

  const visualSrc = getCulinaryVisualUrl(
    item.imageKey,
    item.name,
    item.categoryName,
    item.imageUrl
  );

  const [priceDraft, setPriceDraft] = useState<string>(
    item.price > 0 ? item.price.toFixed(2) : ''
  );
  const [isEditingPrice, setIsEditingPrice] = useState<boolean>(item.price <= 0);

  useEffect(() => {
    setPriceDraft(item.price > 0 ? item.price.toFixed(2) : '');
    if (item.price > 0) {
      setIsEditingPrice(false);
    }
  }, [item.price]);

  // Smooth Fade-In + Upward (18px) Transition via IntersectionObserver when rendered, scrolled, or filtered
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsVisible(true);
      return;
    }

    const prefersReducedMotion =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    setIsVisible(false);
    const node = cardRef.current;
    if (!node || !('IntersectionObserver' in window)) {
      const fallbackTimer = window.setTimeout(() => setIsVisible(true), 30);
      return () => window.clearTimeout(fallbackTimer);
    }

    let rafId = 0;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            rafId = window.requestAnimationFrame(() => {
              setIsVisible(true);
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -24px 0px',
        threshold: 0.08,
      }
    );

    observer.observe(node);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [animationKey, item.id]);

  const commitPriceChange = () => {
    const parsed = parseFloat(priceDraft.replace(/[^0-9.]/g, ''));
    if (!Number.isNaN(parsed) && parsed >= 0) {
      if (onUpdatePrice) {
        onUpdatePrice(item, Number(parsed.toFixed(2)));
      }
      if (parsed > 0) {
        setPriceDraft(parsed.toFixed(2));
        setIsEditingPrice(false);
      } else {
        setPriceDraft('');
      }
    }
  };

  // Subtle stagger between food cards (capped so large lists never feel sluggish)
  const staggerDelayMs = Math.min((index % 8) * 55, 360);

  return (
    <article
      ref={cardRef}
      style={{ transitionDelay: isVisible ? `${staggerDelayMs}ms` : '0ms' }}
      className={`food-card-reveal group h-full flex flex-col faminas-glass-light-card rounded-2xl overflow-hidden will-change-[opacity,transform] transform-gpu transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] shadow-[0_12px_32px_-8px_rgba(33,21,15,0.12),0_4px_14px_rgba(33,21,15,0.06)] hover:-translate-y-2 hover:border-[#C9A45C] hover:shadow-[0_26px_56px_-12px_rgba(33,21,15,0.22),0_12px_30px_-6px_rgba(201,164,92,0.32)] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[18px]'
      }`}
    >
      {/* 1. Separate Clean 4:3 High-Resolution Restaurant Photography Frame with Smooth Hover Scale Transition */}
      <div className="food-card-image-frame relative aspect-[4/3] w-full bg-[#180E08] overflow-hidden border-b border-[#C9A45C]/40">
        <img
          src={visualSrc}
          alt={`${item.name} – FAMINAS African and Americans Restaurant in Lindenwold NJ`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onClick={() => onViewDetails(item)}
          className="food-card-image-zoom w-full h-full object-cover object-center cursor-pointer transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108 hover:scale-108"
        />
        <div
          onClick={() => onViewDetails(item)}
          className="absolute inset-0 bg-gradient-to-t from-[#180E08]/60 via-transparent to-transparent opacity-60 group-hover:opacity-20 transition-opacity duration-500 cursor-pointer"
        />

        {/* Top-Left Featured / Popular Status Badge (Translucent Glass Pill) */}
        {(item.isFeatured || item.isPopular) && (
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
            {item.isFeatured && (
              <span className="px-3 py-1 rounded-full bg-[#180E08]/85 backdrop-blur-md text-[#C9A45C] border border-[#C9A45C]/80 text-[10.5px] font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.5)]">
                ★ Signature Special
              </span>
            )}
            {item.isPopular && !item.isFeatured && (
              <span className="px-3 py-1 rounded-full bg-[#254B37]/90 backdrop-blur-md text-[#FFFFFF] border border-[#C9A45C]/60 text-[10.5px] font-bold uppercase tracking-wider shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
                ♥ Popular Choice
              </span>
            )}
          </div>
        )}

        {/* Top-Right Touch-Friendly Favourite Toggle Button (Frosted Translucent Glass Circle) */}
        <button
          type="button"
          onClick={() => onToggleFavourite(item.id)}
          aria-label={isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className="absolute top-3 right-3 w-10 h-10 rounded-full bg-[#180E08]/80 backdrop-blur-md border border-[#C9A45C]/65 flex items-center justify-center text-[#F7F3EA] hover:text-[#C9A45C] hover:border-[#C9A45C] hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-[0_4px_18px_rgba(0,0,0,0.45)]"
        >
          <Heart
            className={`w-4 h-4 transition-transform ${
              isFavourite ? 'fill-[#C9A45C] text-[#C9A45C] scale-110' : 'text-[#F7F3EA]'
            }`}
          />
        </button>
      </div>

      {/* 2. Dedicated Dish Name & Price Strip Written Directly Underneath the Food Image */}
      <div className="px-5 py-4 bg-gradient-to-b from-[#F7F3EA] to-[#EFE7D8]/80 backdrop-blur-md border-b border-[#C9A45C]/35 flex flex-col items-center text-center justify-center min-h-[104px]">
        <h3
          onClick={() => onViewDetails(item)}
          className="font-serif-display text-xl sm:text-[22px] font-bold text-[#21150F] group-hover:text-[#254B37] transition-colors cursor-pointer leading-snug line-clamp-2"
        >
          {item.name}
        </h3>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <span className="font-mono text-lg sm:text-xl font-extrabold text-[#21150F] bg-white/95 backdrop-blur-sm border-2 border-[#C9A45C] px-3.5 py-0.5 rounded-xl shadow-[0_4px_14px_rgba(201,164,92,0.22)] tabular-nums transition-transform group-hover:scale-105">
            {item.price > 0
              ? `${currencySymbol}${item.price.toFixed(2)}`
              : `${currencySymbol} Editable Price`}
          </span>
        </div>
      </div>

      {/* 3. Card Body: Cuisine Metadata, Availability Status, Description & Balanced Action Area */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 justify-between gap-4 bg-[#FFFFFF]">
        <div className="space-y-2.5">
          {/* Cuisine & Availability Row */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#3B3029]">
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              <span className="uppercase tracking-wider text-[#254B37] font-bold truncate">
                {item.cuisineType}
              </span>
              <span aria-hidden="true" className="text-[#C9A45C] font-bold">
                ·
              </span>
              <span className="text-[#3B3029]/85 font-medium shrink-0">{item.spiceLevel}</span>
            </div>

            <span
              className={`inline-flex items-center gap-1.5 text-xs font-bold shrink-0 ${
                item.isAvailable ? 'text-[#254B37]' : 'text-[#B91C1C]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isAvailable ? 'bg-[#254B37]' : 'bg-[#B91C1C]'
                }`}
              />
              {item.isAvailable ? 'Available' : 'Sold Out'}
            </span>
          </div>

          {/* Dish Description */}
          <p className="text-sm text-[#3B3029] line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Optional Owner Quick Price Editor (Only when signed in as Admin) */}
          {onUpdatePrice && (
            <div className="mt-3 pt-2.5 border-t border-[#C9A45C]/25 flex items-center justify-between gap-2">
              <span className="text-[11px] uppercase tracking-wider text-[#3B3029]/80 font-semibold">
                Menu Price ({currencySymbol})
              </span>

              {isEditingPrice || item.price <= 0 ? (
                <div className="inline-flex items-center gap-1.5 bg-[#F7F3EA] border border-[#C9A45C] rounded-lg px-2.5 py-1">
                  <span className="font-mono text-xs font-bold text-[#21150F]">
                    {currencySymbol}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    aria-label={`Set price in dollars for ${item.name}`}
                    placeholder="Enter price"
                    value={priceDraft}
                    onChange={(e) => setPriceDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        commitPriceChange();
                      }
                    }}
                    onBlur={commitPriceChange}
                    className="w-16 bg-transparent font-mono text-xs font-bold text-[#21150F] focus:outline-none tabular-nums"
                  />
                  <button
                    type="button"
                    onClick={commitPriceChange}
                    title="Save dish price"
                    className="p-1.5 rounded bg-[#21150F] text-[#C9A45C] hover:bg-[#254B37] hover:text-[#FFFFFF] transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-[#21150F] tabular-nums">
                    {currencySymbol}
                    {item.price.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingPrice(true)}
                    title="Edit dish price"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#F7F3EA] hover:bg-[#C9A45C]/25 border border-[#C9A45C]/60 text-xs text-[#21150F] font-semibold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    Edit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 4. Bottom Action Area — Guaranteed Non-Clipping 3-Column Grid with Visible Icon Button */}
        <div className="pt-3.5 border-t border-[#C9A45C]/30 w-full">
          <div
            className={`grid items-center gap-2 w-full ${
              whatsappEnabled && item.isAvailable
                ? 'grid-cols-[1.12fr_1fr_44px]'
                : 'grid-cols-2'
            }`}
          >
            {/* 1. ADD TO CART BUTTON (#21150F Espresso Brown, White Bold Text, #C9A45C Gold Icon, 44px height) */}
            <button
              type="button"
              disabled={!item.isAvailable || cartButtonState === 'adding'}
              onClick={handleAddToCartClick}
              aria-live="polite"
              className={`btn-sheen min-w-0 h-[44px] px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold tracking-tight whitespace-nowrap transition-all duration-300 cursor-pointer select-none shadow-sm ${
                !item.isAvailable
                  ? 'bg-[#F7F3EA] text-[#3B3029]/45 border border-[#3B3029]/15 cursor-not-allowed'
                  : cartButtonState === 'added'
                  ? 'bg-[#254B37] text-[#FFFFFF] border border-[#C9A45C] shadow-[0_6px_20px_rgba(37,75,55,0.4)] scale-[1.02]'
                  : 'bg-[#21150F] text-[#FFFFFF] border border-[#21150F] hover:bg-[#341F14] hover:border-[#C9A45C] hover:shadow-[0_8px_22px_rgba(201,164,92,0.28)] active:scale-[0.97]'
              }`}
            >
              {cartButtonState === 'adding' ? (
                <>
                  <Loader2 className="w-4 h-4 text-[#C9A45C] animate-spin shrink-0" />
                  <span className="truncate">Adding...</span>
                </>
              ) : cartButtonState === 'added' ? (
                <>
                  <Check className="w-4 h-4 text-[#C9A45C] stroke-[2.5] shrink-0" />
                  <span className="truncate">Added!</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-4 h-4 text-[#C9A45C] shrink-0" />
                  <span className="truncate">{item.isAvailable ? 'Add to Cart' : 'Sold Out'}</span>
                </>
              )}
            </button>

            {/* 2. VIEW DETAILS BUTTON (#F7F3EA Warm Ivory, #21150F Espresso Text, Eye Icon, #C9A45C Gold Border, 44px height) */}
            <button
              type="button"
              onClick={() => onViewDetails(item)}
              className="min-w-0 h-[44px] px-2.5 rounded-xl inline-flex items-center justify-center gap-1.5 text-xs sm:text-[13px] font-bold tracking-tight whitespace-nowrap text-[#21150F] bg-white/80 hover:bg-[#EDE4D3] border border-[#C9A45C]/80 hover:border-[#C9A45C] hover:shadow-[0_4px_16px_rgba(201,164,92,0.18)] transition-all duration-300 active:scale-[0.97] cursor-pointer select-none"
            >
              <Eye className="w-4 h-4 text-[#21150F] shrink-0" />
              <span className="truncate">View Details</span>
            </button>

            {/* 3. VISIBLE PROFESSIONAL WHATSAPP ORDER ICON BUTTON (Fixed 44x44px Square, Never Clipped) */}
            {whatsappEnabled && item.isAvailable && (
              <button
                type="button"
                onClick={() => onWhatsAppOrder(item)}
                title={`Quick Order ${item.name} via WhatsApp`}
                aria-label={`Quick Order ${item.name} via WhatsApp`}
                className="w-[44px] h-[44px] rounded-xl inline-flex items-center justify-center text-[#FFFFFF] bg-[#254B37] hover:bg-[#1D3B2B] border-2 border-[#C9A45C] shadow-sm hover:shadow-[0_8px_20px_rgba(37,75,55,0.4)] transition-all duration-300 hover:scale-[1.06] active:scale-[0.95] cursor-pointer select-none shrink-0"
              >
                <WhatsAppIcon className="w-5 h-5 text-[#FFFFFF] shrink-0" />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
