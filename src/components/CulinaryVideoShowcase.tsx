import React, { useState } from 'react';
import { Play, Pause, ShoppingBag, Film, Volume2, Flame } from 'lucide-react';
import { MenuItem } from '../types/restaurant';

export interface CulinaryVideoClip {
  id: string;
  youtubeId?: string;
  localVideoUrl?: string;
  title: string;
  subtitle: string;
  dishName: string;
  priceLabel: string;
  matchedItemId: string;
  posterUrl: string;
  categoryTag: string;
  aspect?: 'vertical' | 'landscape';
}

export const FAMINAS_CULINARY_VIDEOS: CulinaryVideoClip[] = [
  {
    id: 'vid-west-african-feast',
    youtubeId: 'F9kEOXK_2M8',
    title: 'Whole Grilled Fish, Sweet Plantain & West African Rice Platter',
    subtitle: 'Charcoal-grilled whole fish served with golden fried plantains, rich pepper sauce, and crisp onion-cucumber salad.',
    dishName: 'Achecke with Grill Fish and Plantain',
    priceLabel: '$22.99',
    matchedItemId: 'sl-achecke-grill-fish',
    posterUrl: '/assets/videos/vid_F9kEOXK_2M8.jpg?v=natural3',
    categoryTag: 'Sierra Leonean Specialties',
    aspect: 'vertical',
  },
  {
    id: 'vid-foofoo-leaf-soup',
    youtubeId: 'G5GxntWX3QA',
    title: 'Hand-Pounded Smooth Foofoo & Traditional Leaf Soup',
    subtitle: 'Freshly prepared soft Foofoo served alongside slow-simmered Cassava Leaf, Okra Soup, and Sawa in traditional bowls.',
    dishName: 'Foofoo with Okra Soup / Sawa',
    priceLabel: '$17.99',
    matchedItemId: 'sl-foofoo-okra-soup',
    posterUrl: '/assets/videos/vid_G5GxntWX3QA.jpg?v=natural3',
    categoryTag: 'Traditional Soups & Leaf Dishes',
    aspect: 'vertical',
  },
  {
    id: 'vid-pepper-chicken-greens',
    youtubeId: 'P6Ls3zLxM48',
    title: 'Sizzling West African Pepper Chicken & Palm Oil Greens',
    subtitle: 'Fire-roasted chicken glazed in rich red palm oil pepper sauce with tender leafy greens and Foofoo.',
    dishName: 'Pepper Chicken',
    priceLabel: '$16.99',
    matchedItemId: 'sl-pepper-chicken',
    posterUrl: '/assets/videos/vid_P6Ls3zLxM48.jpg?v=natural3',
    categoryTag: 'Meat, Grill & Pepper Soup',
    aspect: 'vertical',
  },
  {
    id: 'vid-green-leaf-palm-oil',
    youtubeId: 'sv22p4b0eTg',
    title: 'Fresh Kran Kran & Potato Leaf Simmered in Red Palm Oil',
    subtitle: 'Vibrant chopped leafy greens cooked with aromatic West African spices, crayfish, smoked fish, and pure red palm oil.',
    dishName: 'Kran Kran (Jute Leaf) Palava Sauce',
    priceLabel: '$17.99',
    matchedItemId: 'sl-kran-kran-palava',
    posterUrl: '/assets/videos/vid_sv22p4b0eTg.jpg?v=natural3',
    categoryTag: 'Traditional Soups & Leaf Dishes',
    aspect: 'vertical',
  },
  {
    id: 'vid-seasoned-grill-fish',
    youtubeId: 'Ndf2zF4B4nM',
    title: 'Herb-Seasoned Whole Grill Fish, Seafood & Fried Plantain',
    subtitle: 'Whole seasoned fish and seafood topped with fresh bell peppers, sweet onions, herbs, and golden plantains.',
    dishName: 'Grill Fish with Salad',
    priceLabel: '$19.99',
    matchedItemId: 'sl-grill-fish-salad',
    posterUrl: '/assets/videos/vid_Ndf2zF4B4nM.jpg?v=natural3',
    categoryTag: 'Sierra Leonean Specialties',
    aspect: 'vertical',
  },
  {
    id: 'vid-fried-red-snapper',
    youtubeId: 'IIUQIvl74tk',
    title: 'Crispy Golden Whole Fried Red Snapper Fish',
    subtitle: 'Whole red snapper fried to a golden crunch and drizzled with savory house sauce—served hot and fresh.',
    dishName: 'Achecke with Fry Fish and Plantain',
    priceLabel: '$20.99',
    matchedItemId: 'sl-achecke-fry-fish',
    posterUrl: '/assets/videos/vid_IIUQIvl74tk.jpg?v=natural3',
    categoryTag: 'Sierra Leonean Specialties',
    aspect: 'vertical',
  },
  {
    id: 'vid-puff-puff-beans',
    youtubeId: 'p2VOdXrIbTA',
    title: 'Golden West African Puff Puff & Slow-Simmered Beans',
    subtitle: 'Warm, pillowy golden Puff Puff dough balls paired with rich, slow-cooked West African beans and pepper sauce.',
    dishName: 'Puff Puff & Black Eye Beans',
    priceLabel: '$5.99',
    matchedItemId: 'sl-puff-puff',
    posterUrl: '/assets/videos/vid_p2VOdXrIbTA.jpg?v=natural3',
    categoryTag: 'Snacks / Small Chops',
    aspect: 'vertical',
  },
];

export const FAMINAS_KITCHEN_REEL_CLIPS: CulinaryVideoClip[] = [
  {
    id: 'kitchen-reel-1',
    localVideoUrl: '/assets/videos/reel_achecke_fish.mp4',
    title: 'Freshly Plated Achecke with Whole Grilled Fish & Plantain',
    subtitle: 'Steamed cassava Achecke served with charcoal-grilled whole fish, sweet plantains, and house pepper sauce.',
    dishName: 'Achecke with Grill Fish and Plantain',
    priceLabel: '$22.99',
    matchedItemId: 'sl-achecke-grill-fish',
    posterUrl: '/assets/menu_ref/achecke_grill_fish.jpg?v=natural3',
    categoryTag: 'Kitchen Reel',
    aspect: 'landscape',
  },
  {
    id: 'kitchen-reel-2',
    localVideoUrl: '/assets/videos/reel_cassava_leaf.mp4',
    title: 'Traditional Cassava Leaf & Egusi Soup with Foofoo',
    subtitle: 'Authentic Sierra Leonean Cassava Leaf and Egusi Soup simmering slowly with tender meats and red palm oil.',
    dishName: 'Cassava Leaf & Egusi Soup',
    priceLabel: '$17.99',
    matchedItemId: 'sl-cassava-leaf',
    posterUrl: '/assets/menu_ref/cassava_leaf.jpg?v=natural3',
    categoryTag: 'Kitchen Reel',
    aspect: 'landscape',
  },
  {
    id: 'kitchen-reel-3',
    localVideoUrl: '/assets/videos/reel_lamb_grill.mp4',
    title: 'Flame-Grilled Lamb, Dibi & Spiced Suya Skewers',
    subtitle: 'Charcoal-grilled Lamb, Dibi goat meat, and spiced Kankakan (Suya) sizzling hot off the grill with onions and peppers.',
    dishName: 'Lamb Grill with Plantain',
    priceLabel: '$23.99',
    matchedItemId: 'sl-lamb-grill-plantain',
    posterUrl: '/assets/menu_ref/lamb_grill_plantain.jpg?v=natural3',
    categoryTag: 'Kitchen Reel',
    aspect: 'landscape',
  },
  {
    id: 'kitchen-reel-4',
    localVideoUrl: '/assets/videos/reel_oxtail_rice.mp4',
    title: 'Smoky Jollof Rice & Slow-Braised Oxtail Feast',
    subtitle: 'Generous portions of smoky West African Jollof Rice and Rice & Beans with tender slow-braised Oxtail.',
    dishName: 'Rice and Beans with Oxtail',
    priceLabel: '$23.99',
    matchedItemId: 'sl-rice-beans-oxtail',
    posterUrl: '/assets/menu_ref/rice_beans_oxtail.jpg?v=natural3',
    categoryTag: 'Kitchen Reel',
    aspect: 'landscape',
  },
];

interface CulinaryVideoShowcaseProps {
  menuItems: MenuItem[];
  onOrderDish: (item: MenuItem) => void;
  onViewDishDetails: (item: MenuItem) => void;
  compact?: boolean;
}

export const CulinaryVideoShowcase: React.FC<CulinaryVideoShowcaseProps> = ({
  menuItems,
  onOrderDish,
  onViewDishDetails,
  compact = false,
}) => {
  const [activeVideoIds, setActiveVideoIds] = useState<Record<string, boolean>>({
    'vid-west-african-feast': true,
    'kitchen-reel-1': true,
    'kitchen-reel-2': true,
    'kitchen-reel-3': true,
    'kitchen-reel-4': true,
  });

  const togglePlayVideo = (id: string) => {
    setActiveVideoIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const findMenuItem = (clip: CulinaryVideoClip): MenuItem | undefined => {
    return (
      menuItems.find((m) => m.id === clip.matchedItemId) ||
      menuItems.find((m) =>
        m.name.toLowerCase().includes(clip.dishName.toLowerCase().split(' ')[0])
      ) ||
      menuItems[0]
    );
  };

  const displayedVerticalClips = compact
    ? FAMINAS_CULINARY_VIDEOS.slice(0, 4)
    : FAMINAS_CULINARY_VIDEOS;

  return (
    <section
      aria-label="Live Kitchen & Real Food Video Showcase"
      className="py-12 bg-[#21150F] text-[#F7F3EA] border-y-2 border-[#C9A45C]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#C9A45C]/35 pb-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
              <Film className="w-4 h-4 text-[#C9A45C]" />
              <span>Real Kitchen Videos · Natural Food Action &amp; Plating</span>
            </div>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#FFFFFF]">
              Watch Our Dishes Sizzle, Simmer &amp; Plate Right Here
            </h2>
            <p className="text-sm sm:text-base text-[#F7F3EA]/85 leading-relaxed">
              Experience the real textures, natural colors, and authentic West African and American
              preparation behind every plate—from steaming Foofoo and palm-oil leaf stews to whole
              charcoal-grilled fish and golden Puff Puff. All videos play directly on this page.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#C9A45C] font-semibold shrink-0">
            <Volume2 className="w-4 h-4" />
            <span>Click any video card to play directly on the site</span>
          </div>
        </div>

        {/* Vertical 9:16 Real Culinary Videos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayedVerticalClips.map((clip) => {
            const isPlaying = Boolean(activeVideoIds[clip.id]);
            const matchedItem = findMenuItem(clip);

            return (
              <article
                key={clip.id}
                className="flex flex-col rounded-2xl bg-[#3B3029] border-2 border-[#C9A45C]/65 overflow-hidden shadow-[0_18px_42px_rgba(0,0,0,0.45)] hover:border-[#C9A45C] transition-all duration-300 group"
              >
                {/* 9:16 Natural Vertical Video Frame */}
                <div className="relative aspect-[9/14] w-full bg-[#120B07] overflow-hidden border-b border-[#C9A45C]/45">
                  {isPlaying && clip.youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${clip.youtubeId}?autoplay=1&mute=1&loop=1&playlist=${clip.youtubeId}&rel=0&modestbranding=1&playsinline=1&controls=1`}
                      title={clip.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => togglePlayVideo(clip.id)}
                      className="relative w-full h-full block text-left cursor-pointer group/vid"
                      aria-label={`Play video: ${clip.title}`}
                    >
                      <img
                        src={clip.posterUrl}
                        alt={clip.title}
                        loading="lazy"
                        className="w-full h-full object-cover object-center group-hover/vid:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#21150F]/85 via-[#21150F]/15 to-[#21150F]/35" />

                      {/* Center Play Button */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="w-16 h-16 rounded-full bg-[#C9A45C] text-[#21150F] flex items-center justify-center shadow-[0_0_30px_rgba(201,164,92,0.7)] group-hover/vid:scale-110 transition-transform">
                          <Play className="w-7 h-7 fill-[#21150F] ml-0.5" />
                        </span>
                      </div>

                      {/* Top Category Tag */}
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-[#21150F]/90 border border-[#C9A45C]/60 text-[11px] font-bold uppercase tracking-wider text-[#C9A45C]">
                        {clip.categoryTag}
                      </span>

                      {/* Bottom Dish Caption Overlay */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#C9A45C]">
                          <Flame className="w-3.5 h-3.5" />
                          Tap to Play Video Here
                        </span>
                        <h3 className="font-serif-display text-base font-bold text-[#FFFFFF] leading-snug mt-0.5">
                          {clip.title}
                        </h3>
                      </div>
                    </button>
                  )}
                </div>

                {/* Separate Dish Name & Official Price Bar Directly Underneath */}
                <div className="p-4 bg-[#F7F3EA] text-[#21150F] border-b border-[#C9A45C]/35 text-center space-y-1">
                  <p className="font-serif-display text-lg font-bold text-[#21150F] leading-snug line-clamp-1">
                    {clip.dishName}
                  </p>
                  <p className="font-mono text-xl font-extrabold text-[#21150F] tabular-nums">
                    {clip.priceLabel}
                  </p>
                </div>

                {/* Action Bar (On-Site Only) */}
                <div className="p-3.5 bg-[#FFFFFF] text-[#21150F] flex items-center gap-2 mt-auto">
                  <button
                    type="button"
                    onClick={() => togglePlayVideo(clip.id)}
                    className="h-[42px] px-3 rounded-xl bg-[#254B37] hover:bg-[#1D3B2B] text-[#FFFFFF] border border-[#C9A45C] font-bold text-xs inline-flex items-center justify-center gap-1.5 shrink-0 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5 text-[#C9A45C]" />
                        <span>Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-[#C9A45C] text-[#C9A45C]" />
                        <span>Play</span>
                      </>
                    )}
                  </button>
                  {matchedItem && (
                    <button
                      type="button"
                      onClick={() => onOrderDish(matchedItem)}
                      className="flex-1 h-[42px] px-3 rounded-xl bg-[#21150F] hover:bg-[#3B3029] text-[#FFFFFF] font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C9A45C]" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                  {matchedItem && (
                    <button
                      type="button"
                      onClick={() => onViewDishDetails(matchedItem)}
                      className="h-[42px] px-3 rounded-xl bg-[#F7F3EA] hover:bg-[#EDE4D3] border border-[#C9A45C] text-[#21150F] font-bold text-xs inline-flex items-center justify-center transition-colors cursor-pointer"
                    >
                      Details
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {/* On-Site Kitchen Reel Videos Strip (Native HTML5 Video Players) */}
        <div className="pt-4 border-t border-[#C9A45C]/30 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
                Signature Kitchen Reels · Playing Live on Site
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#FFFFFF]">
                Close-Up Kitchen Plating &amp; Dish Highlights
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FAMINAS_KITCHEN_REEL_CLIPS.map((reelClip) => {
              const isPlaying = Boolean(activeVideoIds[reelClip.id]);
              const matchedItem = findMenuItem(reelClip);
              return (
                <article
                  key={reelClip.id}
                  className="rounded-xl bg-[#3B3029] border border-[#C9A45C]/55 overflow-hidden flex flex-col shadow-md hover:border-[#C9A45C] transition-all group"
                >
                  <div className="relative aspect-[4/3] w-full bg-[#120B07] overflow-hidden">
                    {isPlaying && reelClip.localVideoUrl ? (
                      <video
                        src={reelClip.localVideoUrl}
                        poster={reelClip.posterUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        controls
                        className="w-full h-full object-cover object-center"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => togglePlayVideo(reelClip.id)}
                        className="relative w-full h-full block cursor-pointer"
                        aria-label={`Play kitchen video: ${reelClip.title}`}
                      >
                        <img
                          src={reelClip.posterUrl}
                          alt={reelClip.title}
                          loading="lazy"
                          className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#21150F]/80 via-transparent to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="w-12 h-12 rounded-full bg-[#21150F]/90 border-2 border-[#C9A45C] text-[#C9A45C] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                            <Play className="w-5 h-5 fill-[#C9A45C] ml-0.5" />
                          </span>
                        </div>
                        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded bg-[#254B37] text-[#FFFFFF] border border-[#C9A45C]/60 text-[10px] font-bold uppercase tracking-wider">
                          {reelClip.categoryTag}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Separate Dish Name & Official Price Bar Directly Underneath */}
                  <div className="p-3.5 bg-[#F7F3EA] text-[#21150F] text-center border-y border-[#C9A45C]/35">
                    <p className="font-serif-display text-base font-bold text-[#21150F] line-clamp-1">
                      {reelClip.dishName}
                    </p>
                    <p className="font-mono text-base font-extrabold text-[#21150F] tabular-nums">
                      {reelClip.priceLabel}
                    </p>
                  </div>

                  <div className="p-3 bg-[#FFFFFF] text-[#21150F] flex items-center justify-between gap-2 mt-auto">
                    <button
                      type="button"
                      onClick={() => togglePlayVideo(reelClip.id)}
                      className="flex-1 h-[38px] px-3 rounded-lg bg-[#21150F] hover:bg-[#3B3029] text-[#C9A45C] font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5 text-[#C9A45C]" />
                          <span>Pause Video</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-[#C9A45C]" />
                          <span>Play on Site</span>
                        </>
                      )}
                    </button>
                    {matchedItem && (
                      <button
                        type="button"
                        onClick={() => onOrderDish(matchedItem)}
                        className="h-[38px] px-3 rounded-lg bg-[#C9A45C] hover:bg-[#B89146] text-[#21150F] font-bold text-xs inline-flex items-center justify-center gap-1 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>Order</span>
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
