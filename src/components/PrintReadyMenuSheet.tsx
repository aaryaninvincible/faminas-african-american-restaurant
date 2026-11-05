import React, { useState } from 'react';
import {
  Printer,
  Edit3,
  Check,
  MapPin,
  Phone,
  Globe,
  ShoppingBag,
  UtensilsCrossed,
  Truck,
  FileText,
  Image as ImageIcon,
  RotateCcw,
  Eye,
  LayoutGrid,
  ZoomIn,
  X,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import { FaminasLogo } from './FaminasLogo';
import { MenuItem } from '../types/restaurant';

interface PrintReadyMenuSheetProps {
  onSelectDish?: (item: MenuItem) => void;
}

export const PrintReadyMenuSheet: React.FC<PrintReadyMenuSheetProps> = ({
  onSelectDish,
}) => {
  const {
    menuItems,
    settings,
    addToCart,
    updateItemPrice,
    saveMenuItem,
    saveRestaurantSettings,
    notify,
  } = useRestaurant();

  const [isEditMode, setIsEditMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<'interactive' | 'print-artwork'>('interactive');
  const [lightboxDish, setLightboxDish] = useState<{
    src: string;
    label: string;
    item: MenuItem;
  } | null>(null);

  const [customNames, setCustomNames] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('faminas_custom_menu_names_v2');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const getItem = (id: string, fallbackName: string, fallbackPrice: number): MenuItem => {
    const found = menuItems.find((m) => m.id === id);
    if (found) {
      return {
        ...found,
        name: customNames[id] || found.name,
        price: found.price > 0 ? found.price : fallbackPrice,
      };
    }
    return {
      id,
      name: customNames[id] || fallbackName,
      categoryId: 'cat-sierra-leonean-specialties',
      categoryName: 'SIERRA LEONEAN SPECIALTIES',
      cuisineType: 'Sierra Leonean',
      description: fallbackName,
      price: fallbackPrice,
      imageKey: 'achecke_grilled_fish',
      imageUrl: '/assets/menu_ref/achecke_grill_fish.jpg',
      isAvailable: true,
      isPopular: true,
      isFeatured: true,
      spiceLevel: 'Medium',
      prepTimeMinutes: 20,
      dietaryNotes: '',
    };
  };

  const handleNameChange = (item: MenuItem, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const updated = { ...customNames, [item.id]: trimmed };
    setCustomNames(updated);
    try {
      localStorage.setItem('faminas_custom_menu_names_v2', JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
    saveMenuItem({ ...item, name: trimmed });
  };

  const handleResetOfficialPrices = () => {
    try {
      localStorage.removeItem('faminas_custom_prices_v2');
      localStorage.removeItem('faminas_custom_menu_names_v2');
      setCustomNames({});
      window.location.reload();
    } catch {
      // ignore
    }
  };

  // Page 1 Categories
  const sierraLeoneanSpecialties = [
    getItem('achecke-grilled-fish-plantain', 'Achecke with Grill Fish and Plantain', 22.99),
    getItem('achecke-fried-fish-plantain', 'Achecke with Fry Fish and Plantain', 20.99),
    getItem('dibi-with-plantain', 'Dibi with Plantain (Goat Meat)', 22.99),
    getItem('dibi-achecke-plantain', 'Dibi with Achecke (Goat Meat) and Plantain', 24.99),
    getItem('grilled-fish-with-salad', 'Grill Fish with Salad', 19.99),
    getItem('kankakan-suya', 'Kankakan (Suya)', 16.99),
  ];

  const traditionalSoupsAndLeaf = [
    getItem('cassava-leaf', 'Cassava Leaf', 17.99),
    getItem('potato-leaf-green', 'Potato Leaf (Green)', 17.99),
    getItem('foofoo-okra-soup', 'Foofoo with Okra Soup', 17.99),
    getItem('foofoo-with-sawa', 'Foofoo with Sawa', 17.99),
    getItem('kran-kran-jute-leaf', 'Kran Kran (Jute Leaf) Palava Sauce', 17.99),
    getItem('egusi-soup-foofoo', 'Egusi Soup with Foofoo', 18.99),
  ];

  const meatGrillPepperSoup = [
    getItem('roast-beef-peanut-butter', 'Roast Beef with Peanut Butter', 19.99),
    getItem('grilled-lamb-plantain-achecke', 'Lamb Grill with Plantain', 23.99),
    getItem('lamb-grill-with-achecke', 'Lamb Grill with Achecke', 24.99),
    getItem(
      'assorted-pepper-soup',
      'Pepper Soup with Goat Meat, Cow Feet, Strip, Cow Skin and Beef',
      20.99
    ),
    getItem('pepper-chicken', 'Pepper Chicken', 16.99),
    getItem('chicken-wings-and-fries', 'Chicken Wings and Fries', 15.99),
  ];

  // Page 2 Categories
  const riceAndBeans = [
    getItem('jollof-rice-and-stew', 'Jollof Rice and Stew', 14.99),
    getItem('rice-and-beans-oxtail', 'Rice and Beans with Oxtail', 23.99),
    getItem('black-eyed-beans-oil', 'Black Eye Beans with Oil', 10.99),
    getItem('black-eyed-beans-palm-oil', 'Black Eyes Beans with Palm Oil', 11.99),
  ];

  const americanFavorites = [
    getItem('hamburger-and-fries', 'Hamburger and Fries', 15.99),
    getItem('cheesesteak-with-fries', 'Cheese Steak with Fries', 16.99),
    getItem('mac-and-cheese', 'Mac and Cheese', 9.99),
    getItem('mashed-potatoes', 'Mash Potatoes', 6.99),
  ];

  const snacksAndSmallChops = [
    getItem('meat-pie', 'Meat Pie', 4.50),
    getItem('fish-pie', 'Fish Pie', 4.50),
    getItem('puff-puff', 'Puff Puff', 5.99),
    getItem('spring-roll-vegetable-roll', 'Spring Roll or Vegetable Roll', 5.99),
  ];

  const naturalDrinks = [
    getItem('ginger-beer', 'Ginger Beer', 4.99),
    getItem('bissab-sorrel-hibiscus', 'Bissab (Sorrel or Hibiscus)', 4.99),
  ];

  const handleDishClick = (item: MenuItem) => {
    if (isEditMode) return;
    if (onSelectDish) {
      onSelectDish(item);
    } else {
      addToCart(item, 1);
    }
  };

  const renderLuxuryPhotoFrame = (
    src: string,
    label: string,
    item: MenuItem,
    heightClass: string,
    captionInsideCard = false,
    multilineLabel?: React.ReactNode
  ) => (
    <div
      onClick={() => handleDishClick(item)}
      className="flex flex-col items-center cursor-pointer group w-full"
    >
      <div
        className={`relative w-full rounded-xl overflow-hidden border-[2px] border-[#D4AF37]/80 group-hover:border-[#FFF0A8] ring-1 ring-[#D4AF37]/25 shadow-[0_12px_28px_rgba(0,0,0,0.9)] bg-[#0A0705] transition-all duration-300`}
      >
        <div className="overflow-hidden relative">
          <img
            src={src.includes('?') ? src : `${src}?v=natural2`}
            alt={label}
            className={`w-full ${heightClass} object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out`}
          />
          {/* Subtle Warm Studio Lighting Gloss & Vignette */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0B0705]/30 via-transparent to-[#FFF0A8]/10" />
          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#D4AF37]/30 rounded-t-xl" />

          {/* Quick HD Lightbox Zoom Trigger on Hover */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxDish({ src, label, item });
            }}
            title={`Zoom HD photo of ${label}`}
            aria-label={`Zoom HD photo of ${label}`}
            className="print:hidden absolute top-2 right-2 w-7 h-7 rounded-full bg-[#0B0705]/85 hover:bg-[#D4AF37] text-[#E5C158] hover:text-[#0B0705] border border-[#D4AF37]/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Dish Name & Price Written Directly Underneath the Separate Food Image */}
        <div className="py-1.5 px-2 text-center bg-gradient-to-b from-[#16100A] to-[#0A0705] border-t border-[#D4AF37]/55 flex flex-col items-center justify-center gap-0.5">
          <span className="font-serif text-[11px] sm:text-[12.5px] text-[#F7F2EB] group-hover:text-[#E5C158] font-semibold leading-tight block">
            {multilineLabel || label}
          </span>
          <span className="font-mono font-extrabold text-[11.5px] sm:text-[13px] text-[#E5C158] tabular-nums leading-tight block">
            ${item.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );

  const renderDottedMenuItem = (item: MenuItem) => {
    if (isEditMode) {
      return (
        <div
          key={item.id}
          className="flex items-center justify-between gap-2 py-1 border-b border-[#D4AF37]/25"
        >
          <input
            type="text"
            defaultValue={item.name}
            onBlur={(e) => handleNameChange(item, e.target.value)}
            aria-label={`Dish name for ${item.name}`}
            className="flex-1 bg-[#16110D] border border-[#D4AF37]/50 rounded px-2 py-0.5 text-xs sm:text-sm font-serif text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
          />
          <div className="inline-flex items-center gap-0.5 bg-[#16110D] border border-[#D4AF37]/60 rounded px-2 py-0.5 shrink-0">
            <span className="text-[#E5C158] font-serif font-bold text-xs sm:text-sm">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              defaultValue={item.price.toFixed(2)}
              onBlur={(e) => {
                const v = parseFloat(e.target.value);
                if (!Number.isNaN(v) && v !== item.price) {
                  updateItemPrice(item, v);
                }
              }}
              aria-label={`Price for ${item.name}`}
              className="w-16 bg-transparent text-[#E5C158] font-serif font-bold text-xs sm:text-sm text-right focus:outline-none tabular-nums"
            />
          </div>
        </div>
      );
    }

    // Two-line special formatting for Pepper Soup with Goat Meat, Cow Feet, Strip, Cow Skin and Beef
    if (item.id === 'assorted-pepper-soup') {
      return (
        <div
          key={item.id}
          onClick={() => handleDishClick(item)}
          title={`Click to order ${item.name} ($${item.price.toFixed(2)})`}
          className="group cursor-pointer hover:bg-[#D4AF37]/10 rounded px-1 -mx-1 py-0.5 transition-colors"
        >
          <div className="font-serif text-[13px] sm:text-[14.5px] text-[#F7F2EB] group-hover:text-[#E5C158] leading-tight">
            Pepper Soup with Goat Meat, Cow Feet, Strip,
          </div>
          <div className="flex items-baseline justify-between gap-1.5 leading-tight mt-0.5">
            <span className="font-serif text-[13px] sm:text-[14.5px] text-[#F7F2EB] group-hover:text-[#E5C158] transition-colors">
              Cow Skin and Beef
            </span>
            <span
              aria-hidden="true"
              className="flex-1 border-b-[1.5px] border-dotted border-[#F7F2EB]/45 group-hover:border-[#E5C158]/70 mx-1 min-w-[16px] translate-y-[-3px]"
            />
            <span className="font-serif font-bold text-[13.5px] sm:text-[15px] text-[#E5C158] tabular-nums shrink-0">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        key={item.id}
        onClick={() => handleDishClick(item)}
        title={`Click to order ${item.name} ($${item.price.toFixed(2)})`}
        className="group flex items-baseline justify-between gap-1.5 cursor-pointer hover:bg-[#D4AF37]/10 rounded px-1 -mx-1 py-[3px] transition-colors"
      >
        <span className="font-serif text-[13px] sm:text-[14.5px] text-[#F7F2EB] group-hover:text-[#E5C158] transition-colors leading-snug">
          {item.name}
        </span>
        <span
          aria-hidden="true"
          className="flex-1 border-b-[1.5px] border-dotted border-[#F7F2EB]/45 group-hover:border-[#E5C158]/70 mx-1 min-w-[12px] translate-y-[-3px]"
        />
        <span className="font-serif font-bold text-[13.5px] sm:text-[15px] text-[#E5C158] tabular-nums shrink-0">
          ${item.price.toFixed(2)}
        </span>
      </div>
    );
  };

  const renderSectionBanner = (title: string, showFlag = false) => (
    <div className="inline-flex items-center justify-between gap-3 px-4 py-1 rounded-[10px] bg-gradient-to-r from-[#C89B3C] via-[#ECCF79] to-[#B6862C] shadow-[0_2px_10px_rgba(0,0,0,0.65)] border border-[#FBF0B9]/60 mb-2.5 w-full max-w-[360px]">
      <h3 className="font-serif-display font-extrabold text-[12px] sm:text-[13.5px] md:text-[14.5px] tracking-wide text-[#0B0704] uppercase leading-tight">
        {title}
      </h3>
      {showFlag && (
        <span
          className="inline-flex flex-col w-7 h-4.5 rounded-[2px] overflow-hidden border border-black/35 shadow-xs shrink-0 -rotate-2"
          title="Sierra Leone Flag"
        >
          <span className="h-1/3 w-full bg-[#1EB53A]" />
          <span className="h-1/3 w-full bg-[#FFFFFF]" />
          <span className="h-1/3 w-full bg-[#0072C6]" />
        </span>
      )}
    </div>
  );

  const renderPalmLeafCorner = (position: 'top-left' | 'bottom-left') => (
    <svg
      aria-hidden="true"
      viewBox="0 0 180 180"
      className={`pointer-events-none absolute z-0 w-28 h-28 sm:w-36 sm:h-36 opacity-55 ${
        position === 'top-left' ? 'top-0 left-0' : 'bottom-0 left-0 -scale-y-100'
      }`}
    >
      <defs>
        <linearGradient id="palmGradGreen" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E6B43" />
          <stop offset="60%" stopColor="#2D6A4F" />
          <stop offset="100%" stopColor="#0F291A" />
        </linearGradient>
        <linearGradient id="palmGradGold" x1="0%" y1="0%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#E5C158" />
          <stop offset="100%" stopColor="#8A6421" />
        </linearGradient>
      </defs>
      <path
        d="M0,0 Q70,15 140,5 Q90,25 40,25 Q85,40 155,35 Q95,55 45,50 Q85,70 140,75 Q80,85 35,75 Q70,105 115,115 Q60,115 25,95 Q45,135 80,155 Q35,140 10,115 Z"
        fill="url(#palmGradGreen)"
      />
      <path
        d="M0,0 Q55,10 110,2 Q70,18 25,18 Q65,30 120,28 Q70,42 20,38 Z"
        fill="url(#palmGradGold)"
        opacity="0.55"
      />
    </svg>
  );

  const renderSheetHeader = (rightScriptLines: string[]) => (
    <div className="relative z-10 flex items-center justify-between gap-2 pb-3 mb-3 border-b-[1.5px] border-[#D4AF37]/75">
      {/* Left Official Emblem + Brand Identity */}
      <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3.5 pl-2 sm:pl-4">
        <FaminasLogo size="md" className="shrink-0" />
        <div className="text-center sm:text-left">
          <p className="font-serif italic text-[12px] sm:text-[14px] text-[#F7F2EB] font-medium">
            Good Food Brings People Together.
          </p>
        </div>
      </div>

      {/* Right Tilted Script Callout */}
      <div className="hidden sm:flex flex-col items-end text-right font-serif italic text-[#EBD07A] text-[13px] md:text-[15px] leading-snug -rotate-6 pr-2 shrink-0">
        {rightScriptLines.map((line, i) => (
          <span key={i} className="whitespace-nowrap drop-shadow">
            {line}
            {i === rightScriptLines.length - 1 && (
              <span className="text-[#E62020] not-italic ml-1">♥</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Compact Print & Editable Controls Bar (Hidden when printing) */}
      <div className="print:hidden p-3.5 sm:p-4 rounded-xl bg-[#16110D] border border-[#D4AF37]/40 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center p-1 rounded-lg bg-[#0F0B08] border border-[#D4AF37]/35">
            <button
              type="button"
              onClick={() => setDisplayMode('interactive')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                displayMode === 'interactive'
                  ? 'bg-[#D4AF37] text-[#0F0B08]'
                  : 'text-[#F7F2EB]/75 hover:text-[#F7F2EB]'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Interactive &amp; Editable 2-Page Menu
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode('print-artwork')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                displayMode === 'print-artwork'
                  ? 'bg-[#D4AF37] text-[#0F0B08]'
                  : 'text-[#F7F2EB]/75 hover:text-[#F7F2EB]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Exact Print Master Preview
            </button>
          </div>
          <span className="text-xs text-[#F7F2EB]/65 hidden xl:inline">
            Click any dish or HD photo below to order online, or use the buttons on the right to edit prices or download 300 DPI print files.
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* 1. Page 1 High-Res Image */}
          <a
            href="/assets/print_menu/faminas-menu-page-1-300dpi.png"
            download="FAMINAS-Menu-Page-1-300DPI.png"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-[#D4AF37]/45 text-xs font-semibold text-[#F7F2EB] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            Page 1 (300 DPI)
          </a>

          {/* 2. Page 2 High-Res Image */}
          <a
            href="/assets/print_menu/faminas-menu-page-2-300dpi.png"
            download="FAMINAS-Menu-Page-2-300DPI.png"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-[#D4AF37]/45 text-xs font-semibold text-[#F7F2EB] transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#D4AF37]" />
            Page 2 (300 DPI)
          </a>

          {/* 3. Combined Two-Page Print-Ready PDF */}
          <a
            href="/assets/print_menu/faminas-official-menu-2page-print-ready.pdf"
            download="FAMINAS-Official-2Page-Menu-Print-Ready.pdf"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-xs font-bold text-[#0F0B08] transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            2-Page PDF
          </a>

          {/* Print Sheet Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-white/15 text-xs font-semibold text-[#F7F2EB] transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
            Print 8.5×11&quot;
          </button>

          {/* 4. Editable Version Toggle */}
          {displayMode === 'interactive' && (
            <button
              type="button"
              onClick={() => {
                setIsEditMode((prev) => !prev);
                if (isEditMode) {
                  notify('success', 'Saved all inline menu text and price edits.');
                }
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                isEditMode
                  ? 'bg-[#1E6B43] text-[#F7F2EB] border border-[#52B788]'
                  : 'bg-[#0F0B08] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[#D4AF37]/15'
              }`}
            >
              {isEditMode ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Done Editing
                </>
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Prices / Names
                </>
              )}
            </button>
          )}

          {isEditMode && (
            <button
              type="button"
              onClick={handleResetOfficialPrices}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#E63946]/15 hover:bg-[#E63946]/25 border border-[#E63946]/40 text-xs text-[#E63946]"
              title="Restore official reference menu names and prices"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* MODE B: EXACT PRINT MASTER ARTWORK VIEW */}
      {displayMode === 'print-artwork' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-[#0B0705]">
            <img
              src="/assets/print_menu/faminas-menu-page-1-300dpi.png"
              alt="FAMINAS Official Menu Page 1 — Sierra Leonean Specialties, Traditional Soups & Leaf Dishes, Meat, Grill & Pepper Soup"
              className="w-full h-auto block contrast-[1.04] saturate-[1.08]"
            />
          </div>
          <div className="rounded-xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-[#0B0705]">
            <img
              src="/assets/print_menu/faminas-menu-page-2-300dpi.png"
              alt="FAMINAS Official Menu Page 2 — Rice and Beans, American Favorites, Snacks and Small Chops, Natural Drinks"
              className="w-full h-auto block contrast-[1.04] saturate-[1.08]"
            />
          </div>
        </div>
      ) : (
        /* ===================================================================== */
        /* MODE A: TWO-PAGE SIDE-BY-SIDE INTERACTIVE & EDITABLE MENU SPREAD      */
        /* ===================================================================== */
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch print:block print:space-y-0">
          {/* =================================================================== */}
          {/* PAGE 1 (LEFT SHEET): SIERRA LEONEAN SPECIALTIES, SOUPS & GRILL      */}
          {/* =================================================================== */}
          <section
            aria-label="Faminas Menu Page 1"
            className="relative rounded-md overflow-hidden bg-gradient-to-b from-[#0E0906] via-[#160E09] to-[#0B0705] border-[2px] border-[#D4AF37] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between p-4 sm:p-5 print:rounded-none print:border print:break-after-page"
          >
            {renderPalmLeafCorner('top-left')}

            <div className="relative z-10">
              {renderSheetHeader([
                'Authentic',
                'Sierra Leonean',
                'and African Food',
                'Made with Love',
              ])}

              {/* CATEGORY 1: SIERRA LEONEAN SPECIALTIES */}
              <div className="pb-3.5 mb-3.5 border-b-[1.5px] border-[#D4AF37]/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  {/* Left: Section Banner + 6 Items */}
                  <div className="sm:col-span-7">
                    {renderSectionBanner('SIERRA LEONEAN SPECIALTIES', true)}
                    <div className="space-y-0.5">
                      {sierraLeoneanSpecialties.map((item) => renderDottedMenuItem(item))}
                    </div>
                  </div>

                  {/* Right: Large Plated Dish Photo */}
                  <div className="sm:col-span-5">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/achecke_grill_fish.jpg',
                      'Achecke with Grill Fish and Plantain',
                      sierraLeoneanSpecialties[0],
                      'h-40 sm:h-44'
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY 2: TRADITIONAL SOUPS AND LEAF DISHES */}
              <div className="pb-3.5 mb-3.5 border-b-[1.5px] border-[#D4AF37]/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  {/* Left + Center Column with Banner */}
                  <div className="sm:col-span-8">
                    {renderSectionBanner('TRADITIONAL SOUPS AND LEAF DISHES')}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                      {/* Left Photo: Cassava Leaf */}
                      <div className="sm:col-span-5">
                        {renderLuxuryPhotoFrame(
                          '/assets/menu_ref/cassava_leaf.jpg',
                          'Cassava Leaf',
                          traditionalSoupsAndLeaf[0],
                          'h-34 sm:h-38'
                        )}
                      </div>

                      {/* Center Listings */}
                      <div className="sm:col-span-7 space-y-0.5">
                        {traditionalSoupsAndLeaf.map((item) => renderDottedMenuItem(item))}
                      </div>
                    </div>
                  </div>

                  {/* Right Photo: Egusi Soup with Foofoo */}
                  <div className="sm:col-span-4">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/egusi_foofoo.jpg',
                      'Egusi Soup with Foofoo',
                      traditionalSoupsAndLeaf[5],
                      'h-40 sm:h-44'
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY 3: MEAT, GRILL AND PEPPER SOUP */}
              <div className="pb-2">
                {renderSectionBanner('MEAT, GRILL AND PEPPER SOUP')}
                <div className="space-y-0.5 mb-3">
                  {meatGrillPepperSoup.map((item) => renderDottedMenuItem(item))}
                </div>

                {/* 3 Featured Photos Row */}
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                  {renderLuxuryPhotoFrame(
                    '/assets/menu_ref/lamb_grill_plantain.jpg',
                    'Lamb Grill with Plantain',
                    meatGrillPepperSoup[1],
                    'h-26 sm:h-30',
                    true
                  )}
                  {renderLuxuryPhotoFrame(
                    '/assets/menu_ref/pepper_soup.jpg',
                    'Pepper Soup',
                    meatGrillPepperSoup[3],
                    'h-26 sm:h-30',
                    true
                  )}
                  {renderLuxuryPhotoFrame(
                    '/assets/menu_ref/chicken_wings_fries.jpg',
                    'Chicken Wings and Fries',
                    meatGrillPepperSoup[5],
                    'h-26 sm:h-30',
                    true
                  )}
                </div>
              </div>
            </div>

            {/* PAGE 1 FOOTER: ADDRESS, PHONE, WEBSITE + AFRICAN GEOMETRIC STRIP */}
            <div className="relative z-10 pt-2.5 mt-2 border-t border-[#D4AF37]/50 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#F7F2EB]">
                <div className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0B08] inline-flex items-center justify-center shrink-0">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  {isEditMode ? (
                    <input
                      type="text"
                      defaultValue={settings.address}
                      onBlur={(e) =>
                        saveRestaurantSettings({ ...settings, address: e.target.value })
                      }
                      className="bg-[#16110D] border border-[#D4AF37]/40 rounded px-2 py-0.5 text-xs text-[#F7F2EB]"
                    />
                  ) : (
                    <span className="font-serif text-[11px] sm:text-xs leading-tight">
                      577 Blackwood-Clementon Rd,
                      <br />
                      Lindenwold, NJ 08021
                    </span>
                  )}
                </div>

                <a
                  href="tel:+18565223029"
                  className="inline-flex items-center gap-1.5 hover:text-[#D4AF37] transition-colors"
                >
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0B08] inline-flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-serif font-bold text-sm sm:text-[17px] text-[#F7F2EB]">
                    (856) 522-3029
                  </span>
                </a>

                <div className="inline-flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#0F0B08] inline-flex items-center justify-center shrink-0">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-serif text-xs sm:text-[14px] text-[#F7F2EB]">
                    faminasrestaurant.com
                  </span>
                </div>
              </div>

              {/* Authentic West African Geometric Pattern Strip */}
              <div aria-hidden="true" className="w-full h-3.5 overflow-hidden rounded-xs border-y border-[#D4AF37]/60">
                <svg viewBox="0 0 600 16" preserveAspectRatio="none" className="w-full h-full">
                  {Array.from({ length: 20 }).map((_, i) => {
                    const x = i * 30;
                    return (
                      <g key={i}>
                        <polygon points={`${x},16 ${x + 15},0 ${x + 30},16`} fill="#E63946" />
                        <polygon points={`${x + 4},16 ${x + 15},4 ${x + 26},16`} fill="#D4AF37" />
                        <polygon points={`${x + 8},16 ${x + 15},8 ${x + 22},16`} fill="#1EB53A" />
                        <polygon points={`${x + 15},0 ${x + 30},16 ${x + 45},0`} fill="#0F0B08" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>
          </section>

          {/* =================================================================== */}
          {/* PAGE 2 (RIGHT SHEET): RICE & BEANS, AMERICAN, SMALL CHOPS & DRINKS  */}
          {/* =================================================================== */}
          <section
            aria-label="Faminas Menu Page 2"
            className="relative rounded-md overflow-hidden bg-gradient-to-b from-[#0E0906] via-[#160E09] to-[#0B0705] border-[2px] border-[#D4AF37] shadow-[0_20px_50px_rgba(0,0,0,0.85)] flex flex-col justify-between p-4 sm:p-5 print:rounded-none print:border"
          >
            {renderPalmLeafCorner('top-left')}
            {renderPalmLeafCorner('bottom-left')}

            <div className="relative z-10">
              {renderSheetHeader([
                'Fresh Ingredients',
                'Bold Flavors',
                'Great Food',
                'Always!',
              ])}

              {/* CATEGORY 4: RICE AND BEANS */}
              <div className="pb-3.5 mb-3.5 border-b-[1.5px] border-[#D4AF37]/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  <div className="sm:col-span-7">
                    {renderSectionBanner('RICE AND BEANS')}
                    <div className="space-y-1">
                      {riceAndBeans.map((item) => renderDottedMenuItem(item))}
                    </div>
                  </div>
                  <div className="sm:col-span-5">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/rice_beans_oxtail.jpg',
                      'Rice and Beans with Oxtail',
                      riceAndBeans[1],
                      'h-34 sm:h-38'
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY 5: AMERICAN FAVORITES */}
              <div className="pb-3.5 mb-3.5 border-b-[1.5px] border-[#D4AF37]/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  <div className="sm:col-span-6">
                    {renderSectionBanner('AMERICAN FAVORITES')}
                    <div className="space-y-1">
                      {americanFavorites.map((item) => renderDottedMenuItem(item))}
                    </div>
                  </div>

                  <div className="sm:col-span-6 grid grid-cols-2 gap-2.5">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/hamburger_fries.jpg',
                      'Hamburger and Fries',
                      americanFavorites[0],
                      'h-28 sm:h-32'
                    )}
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/cheesesteak_fries.jpg',
                      'Cheese Steak with Fries',
                      americanFavorites[1],
                      'h-28 sm:h-32'
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY 6: SNACKS AND SMALL CHOPS */}
              <div className="pb-3.5 mb-3.5 border-b-[1.5px] border-[#D4AF37]/60">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                  <div className="sm:col-span-6">
                    {renderSectionBanner('SNACKS AND SMALL CHOPS')}
                    <div className="space-y-1">
                      {snacksAndSmallChops.map((item) => renderDottedMenuItem(item))}
                    </div>
                  </div>

                  <div className="sm:col-span-6 grid grid-cols-2 gap-2.5">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/meat_pie.jpg',
                      'Meat Pie',
                      snacksAndSmallChops[0],
                      'h-26 sm:h-30'
                    )}
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/spring_roll.jpg',
                      'Spring Roll',
                      snacksAndSmallChops[3],
                      'h-26 sm:h-30'
                    )}
                  </div>
                </div>
              </div>

              {/* CATEGORY 7: NATURAL DRINKS + BOTTOM TAGLINE & SERVICE ICONS */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
                {/* Left Column: Natural Drinks + "Taste Sierra Leone in Every Bite" + Flag + Dine-In/Takeout/Delivery */}
                <div className="sm:col-span-6 flex flex-col justify-between h-full space-y-4">
                  <div>
                    {renderSectionBanner('NATURAL DRINKS')}
                    <div className="space-y-1">
                      {naturalDrinks.map((item) => renderDottedMenuItem(item))}
                    </div>
                  </div>

                  {/* Tilted Script + Waving Sierra Leone Flag */}
                  <div className="flex items-center gap-3 pt-1 pl-2">
                    <div className="font-serif italic text-[#E5C158] text-lg sm:text-xl leading-tight -rotate-6">
                      Taste Sierra Leone
                      <br />
                      <span className="pl-3">in Every Bite</span>
                    </div>
                    <div
                      className="inline-flex flex-col w-11 h-7 rounded-[3px] overflow-hidden border border-white/30 shadow-lg -rotate-6 shrink-0"
                      title="Sierra Leone Flag"
                    >
                      <span className="h-1/3 w-full bg-[#1EB53A]" />
                      <span className="h-1/3 w-full bg-[#FFFFFF]" />
                      <span className="h-1/3 w-full bg-[#0072C6]" />
                    </div>
                  </div>

                  {/* DINE-IN | TAKEOUT | DELIVERY Icons */}
                  <div className="flex items-center justify-end sm:justify-center gap-3 pt-1 text-[10px] sm:text-[11px] font-bold tracking-wider text-[#F7F2EB] uppercase">
                    <div className="flex flex-col items-center gap-1">
                      <UtensilsCrossed className="w-4 h-4 text-[#E5C158]" />
                      <span>DINE-IN</span>
                    </div>
                    <span className="h-6 w-[1px] bg-[#D4AF37]/50" />
                    <div className="flex flex-col items-center gap-1">
                      <ShoppingBag className="w-4 h-4 text-[#E5C158]" />
                      <span>TAKEOUT</span>
                    </div>
                    <span className="h-6 w-[1px] bg-[#D4AF37]/50" />
                    <div className="flex flex-col items-center gap-1">
                      <Truck className="w-4 h-4 text-[#E5C158]" />
                      <span>DELIVERY</span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Ginger Beer & Bissab Photos + Gold Brush-Stroke Tagline Badge */}
                <div className="sm:col-span-6 flex flex-col justify-between space-y-3">
                  <div className="grid grid-cols-2 gap-2.5">
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/ginger_beer.jpg',
                      'Ginger Beer',
                      naturalDrinks[0],
                      'h-26 sm:h-30'
                    )}
                    {renderLuxuryPhotoFrame(
                      '/assets/menu_ref/bissab.jpg',
                      'Bissab (Sorrel or Hibiscus)',
                      naturalDrinks[1],
                      'h-26 sm:h-30',
                      false,
                      <>
                        Bissab
                        <br />
                        <span className="text-[10px] sm:text-[11px] font-normal">
                          (Sorrel or Hibiscus)
                        </span>
                      </>
                    )}
                  </div>

                  {/* Gold Brush-Stroke Banner on Bottom Right */}
                  <div className="flex justify-end pt-1">
                    <div className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#C89B3C] via-[#ECCF79] to-[#B6862C] text-[#0F0B08] shadow-xl border border-[#FBF0B9]/60 -rotate-2">
                      <p className="font-serif italic font-bold text-xs sm:text-sm leading-tight text-center">
                        Good Food
                        <br />
                        Brings People Together{' '}
                        <span className="text-[#E62020] not-italic">♥</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* HD STUDIO DISH PHOTO LIGHTBOX MODAL */}
      {lightboxDish && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lightboxDish.label}
          onClick={() => setLightboxDish(null)}
          className="print:hidden fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-2xl w-full rounded-2xl overflow-hidden bg-[#120C08] border-2 border-[#D4AF37] shadow-[0_25px_70px_rgba(0,0,0,0.95)]"
          >
            <button
              type="button"
              onClick={() => setLightboxDish(null)}
              aria-label="Close photo preview"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-[#0B0705]/90 hover:bg-[#D4AF37] text-[#F7F2EB] hover:text-[#0B0705] border border-[#D4AF37]/60 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative aspect-[4/3] w-full bg-[#090604] overflow-hidden">
              <img
                src={lightboxDish.src}
                alt={lightboxDish.label}
                className="w-full h-full object-cover contrast-[1.07] saturate-[1.14]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#120C08] via-transparent to-transparent opacity-60" />
            </div>

            <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#D4AF37]/40">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  {lightboxDish.item.categoryName}
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB] mt-0.5">
                  {lightboxDish.item.name}
                </h3>
                <p className="text-xs sm:text-sm text-[#F7F2EB]/75 mt-1">
                  {lightboxDish.item.description}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-serif font-bold text-xl text-[#E5C158] tabular-nums">
                  ${lightboxDish.item.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const itemToOrder = lightboxDish.item;
                    setLightboxDish(null);
                    handleDishClick(itemToOrder);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-[#0F0B08] font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Order Dish
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
