import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Tag,
  Copy,
  Check,
  ArrowRight,
  ShoppingBag,
  Percent,
  ChevronLeft,
  ChevronRight,
  Flame,
  Gift,
} from 'lucide-react';

export interface OfferBanner {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  promoCode?: string;
  discountHighlight: string;
  image: string;
  actionText: string;
  targetPage: 'ordering' | 'menu' | 'catering';
  accentColor: string;
  secondaryText?: string;
}

const DEFAULT_OFFERS: OfferBanner[] = [
  {
    id: 'west-african-feast',
    badge: 'Limited Time Online Exclusive',
    title: 'The Grand West African Feast',
    subtitle: 'Taste the vibrant culinary soul of Sierra Leone: Slow-simmered Cassava Leaf, smoky Jollof Rice with Stew, and grilled Dibi with sweet plantains.',
    promoCode: 'FAMINAS15',
    discountHighlight: '15% OFF Orders $60+',
    image: '/assets/banners/faminas_feast_promo.jpg',
    actionText: 'Claim 15% Off Feast',
    targetPage: 'ordering',
    accentColor: '#C9A45C',
    secondaryText: 'Valid on direct online pickup & delivery orders.',
  },
  {
    id: 'free-dodo-special',
    badge: 'Chef’s Weekend Gift',
    title: 'Free Sweet Fried Plantains',
    subtitle: 'Order any two signature traditional platters (Jollof, Achecke, or Cassava Leaf) and enjoy complimentary caramelized golden sweet plantains on the house.',
    promoCode: 'FREEDODO',
    discountHighlight: 'FREE Portion with 2 Platters',
    image: '/assets/menu_ref/plantain_sides.jpg',
    actionText: 'Add to Order',
    targetPage: 'ordering',
    accentColor: '#E2BE76',
    secondaryText: 'Freshly fried sweet yellow plantains ($5.99 value).',
  },
  {
    id: 'american-favorites-combo',
    badge: 'Signature American Duo',
    title: 'Philly Cheesesteak & Wings Combo',
    subtitle: 'Juicy ribeye cheesesteak with melted provolone & grilled peppers, paired with 6 crispy seasoned wings, golden fries, and artisanal house sauce.',
    promoCode: 'COMBO20',
    discountHighlight: 'Special $19.99 (Save $6)',
    image: '/assets/banners/faminas_american_combo_promo.jpg',
    actionText: 'Order Combo Now',
    targetPage: 'ordering',
    accentColor: '#F0AA59',
    secondaryText: 'A favorite lunch and dinner comfort classic in Lindenwold.',
  },
  {
    id: 'catering-family-platters',
    badge: 'Catering & Gatherings',
    title: 'Family Platters & Event Catering',
    subtitle: 'Planning a wedding, birthday, church event, or company celebration? Save 10% on large catering trays with free delivery in Camden County.',
    promoCode: 'CATER10',
    discountHighlight: '10% OFF Catering Trays',
    image: '/assets/menu_ref/lamb_grill_plantain.jpg',
    actionText: 'Explore Catering',
    targetPage: 'catering',
    accentColor: '#254B37',
    secondaryText: 'Feeds 15 to 250+ guests with authentic West African warmth.',
  },
];

interface PromotionalOfferBannersProps {
  onNavigate: (page: 'ordering' | 'menu' | 'catering') => void;
  customOffers?: OfferBanner[];
}

export const PromotionalOfferBanners: React.FC<PromotionalOfferBannersProps> = ({
  onNavigate,
  customOffers,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const activeOffers = customOffers && customOffers.length > 0 ? customOffers : DEFAULT_OFFERS;

  // Auto-advance banner every 6 seconds unless paused by mouse hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % activeOffers.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, activeOffers.length]);

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => {
      setCopiedCode(null);
    }, 2500);
  };

  const currentOffer = activeOffers[activeIndex] || activeOffers[0];

  return (
    <section
      aria-label="Promotional Offers & Specials"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
    >
      {/* Top Banner Navigation Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C9A45C] to-[#254B37] flex items-center justify-center text-[#21150F] shadow-[0_4px_14px_rgba(201,164,92,0.4)]">
            <Flame className="w-4 h-4 text-[#FFF9F4]" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#254B37]">
                Chef's Specials &amp; Savings
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#C9A45C]/20 text-[#21150F] border border-[#C9A45C]/40">
                Active Today
              </span>
            </div>
            <h2 className="font-serif-display text-xl sm:text-2xl font-bold text-[#21150F]">
              Exclusive Restaurant Offers &amp; Promo Deals
            </h2>
          </div>
        </div>

        {/* Carousel Slide Indicators & Controls */}
        <div className="flex items-center gap-2 self-end sm:self-center">
          <div className="flex items-center gap-1.5 mr-2">
            {activeOffers.map((offer, idx) => (
              <button
                key={offer.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`View Offer ${idx + 1}: ${offer.title}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  activeIndex === idx
                    ? 'w-7 h-2 bg-[#C9A45C]'
                    : 'w-2 h-2 bg-[#21150F]/25 hover:bg-[#21150F]/50'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() =>
              setActiveIndex((prev) => (prev === 0 ? activeOffers.length - 1 : prev - 1))
            }
            aria-label="Previous promotional offer"
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#C9A45C]/40 flex items-center justify-center text-[#21150F] shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setActiveIndex((prev) => (prev + 1) % activeOffers.length)}
            aria-label="Next promotional offer"
            className="w-8 h-8 rounded-full bg-white/80 hover:bg-white border border-[#C9A45C]/40 flex items-center justify-center text-[#21150F] shadow-sm hover:scale-105 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Feature Banner Card */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="relative overflow-hidden rounded-3xl faminas-glass-dark-card border-2 border-[#C9A45C]/55 shadow-[0_22px_55px_rgba(24,14,8,0.35)] transition-all duration-500 min-h-[360px] sm:min-h-[380px] lg:min-h-[420px] flex flex-col justify-end"
      >
        {/* Background Food Photography with Dark Vignette Gradient */}
        <div className="absolute inset-0 z-0">
          <img
            key={currentOffer.image}
            src={currentOffer.image}
            alt={currentOffer.title}
            className="w-full h-full object-cover object-center filter brightness-[0.78] contrast-[1.08] transition-transform duration-1000 scale-100 hover:scale-105 animate-fade-in-page"
          />
          {/* Dual Gradient Overlays: Dark Left Vignette for Readable Text + Warm Amber Specular */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#180E08]/96 via-[#180E08]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#180E08] via-[#180E08]/40 to-transparent" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 p-6 sm:p-8 lg:p-12 max-w-2xl space-y-4">
          {/* Top Badge & Discount Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#254B37]/90 text-[#F7F3EA] border border-[#C9A45C]/50 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>{currentOffer.badge}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-[#C9A45C] text-[#21150F] shadow-[0_4px_16px_rgba(201,164,92,0.4)]">
              <Percent className="w-3 h-3 stroke-[2.5]" />
              <span>{currentOffer.discountHighlight}</span>
            </span>
          </div>

          {/* Heading & Narrative */}
          <div className="space-y-2">
            <h3 className="font-serif-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#FFFFFF] tracking-tight leading-tight drop-shadow-md">
              {currentOffer.title}
            </h3>
            <p className="text-xs sm:text-sm lg:text-base text-[#F7F3EA]/90 leading-relaxed font-medium">
              {currentOffer.subtitle}
            </p>
          </div>

          {/* Promo Code Copy Pill + CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {currentOffer.promoCode && (
              <button
                type="button"
                onClick={(e) => handleCopyCode(currentOffer.promoCode!, e)}
                title="Click to copy promo code"
                className="btn-sheen inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-[#C9A45C]/80 text-[#F7F3EA] font-mono text-xs font-bold backdrop-blur-md transition-all cursor-pointer group active:scale-95"
              >
                <Tag className="w-3.5 h-3.5 text-[#C9A45C]" />
                <span>CODE: <span className="text-[#C9A45C] underline underline-offset-2">{currentOffer.promoCode}</span></span>
                {copiedCode === currentOffer.promoCode ? (
                  <span className="flex items-center gap-1 text-[#4ADE80] font-sans text-[11px] font-semibold">
                    <Check className="w-3.5 h-3.5" /> Copied!
                  </span>
                ) : (
                  <Copy className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => onNavigate(currentOffer.targetPage)}
              className="btn-sheen inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] hover:from-[#B89146] hover:to-[#D1A85E] text-[#21150F] text-xs sm:text-sm font-extrabold uppercase tracking-wider shadow-[0_8px_24px_rgba(201,164,92,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{currentOffer.actionText}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {currentOffer.secondaryText && (
            <p className="text-[11px] text-[#F7F3EA]/65 italic">
              * {currentOffer.secondaryText}
            </p>
          )}
        </div>
      </div>

      {/* Mini Quick-Offer Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
        {activeOffers.map((offer, idx) => {
          const isSelected = activeIndex === idx;
          return (
            <button
              key={offer.id}
              type="button"
              onClick={() => setActiveIndex(idx)}
              className={`p-3.5 rounded-2xl text-left transition-all duration-300 cursor-pointer flex items-center gap-3 border ${
                isSelected
                  ? 'faminas-glass-dark border-[#C9A45C] shadow-[0_6px_20px_rgba(201,164,92,0.25)] ring-1 ring-[#C9A45C]'
                  : 'bg-white/80 hover:bg-white border-[#C9A45C]/25 hover:border-[#C9A45C]/60 shadow-sm'
              }`}
            >
              <img
                src={offer.image}
                alt={offer.title}
                className="w-12 h-12 rounded-xl object-cover shrink-0 border border-[#C9A45C]/35"
              />
              <div className="min-w-0 flex-1">
                <span
                  className={`block text-[10px] font-bold uppercase tracking-wider truncate ${
                    isSelected ? 'text-[#C9A45C]' : 'text-[#254B37]'
                  }`}
                >
                  {offer.discountHighlight}
                </span>
                <h4
                  className={`text-xs font-bold truncate ${
                    isSelected ? 'text-[#FFFFFF]' : 'text-[#21150F]'
                  }`}
                >
                  {offer.title}
                </h4>
                {offer.promoCode && (
                  <span
                    className={`block font-mono text-[10px] ${
                      isSelected ? 'text-[#C9A45C]' : 'text-[#3B3029]'
                    }`}
                  >
                    Code: {offer.promoCode}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

