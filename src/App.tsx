import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Menu as MenuIcon,
  X,
  ArrowRight,
  MessageCircle,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  Clock,
  Mail,
  Heart,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  User as UserIcon,
  LogOut,
  Send,
  Flame,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { RestaurantProvider, useRestaurant } from './context/RestaurantContext';
import { FaminasLogo } from './components/FaminasLogo';
import { FoodCard } from './components/FoodCard';
import { AdminDashboard } from './components/AdminDashboard';
import { DeliveryRouteTrackerMap } from './components/DeliveryRouteTrackerMap';
import { PrintReadyMenuSheet } from './components/PrintReadyMenuSheet';
import { CulinaryVideoShowcase } from './components/CulinaryVideoShowcase';
import { PromotionalOfferBanners } from './components/PromotionalOfferBanners';
import { LuxuryPreloader } from './components/LuxuryPreloader';
import { DesktopNavbar } from './components/DesktopNavbar';
import { getCulinaryVisualUrl } from './lib/culinaryVisuals';
import { buildGoogleMerchantAndRestaurantJsonLd } from './lib/googleMerchantSeo';
import {
  CuisineGroup,
  GalleryCategory,
  MenuItem,
  Order,
  OrderStatus,
  PageRoute,
  PaymentMethod,
} from './types/restaurant';

interface HeroSlide {
  id: number;
  dishShortName: string;
  priceLabel: string;
  cookingStatus: string;
  badge: string;
  captionTitle: string;
  captionSubtitle: string;
  namedDishes: string[];
  mainImage: string;
  secondaryImages: { src: string; label: string }[];
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    dishShortName: 'Achecke & Grill Fish',
    priceLabel: '$22.99',
    cookingStatus: 'Sizzling Live on the Charcoal Grill',
    badge: 'Sierra Leonean Specialties',
    captionTitle: 'Achecke with Grill Fish and Plantain ($22.99) & Dibi ($22.99)',
    captionSubtitle:
      'Fluffy steamed cassava Achecke served with whole charcoal-grilled or crispy fried fish and sweet plantain, alongside flame-roasted Dibi goat meat and spiced Kankakan (Suya).',
    namedDishes: [
      'Achecke with Grill Fish & Plantain · $22.99',
      'Achecke with Fry Fish & Plantain · $20.99',
      'Dibi with Achecke & Plantain · $24.99',
      'Kankakan (Suya) · $16.99',
    ],
    mainImage: '/assets/menu_ref/achecke_grill_fish.jpg?v=natural2',
    secondaryImages: [
      { src: '/assets/menu_ref/lamb_grill_plantain.jpg?v=natural2', label: 'Dibi & Plantain · $22.99' },
      { src: '/assets/menu_ref/cassava_leaf.jpg?v=natural2', label: 'Cassava Leaf · $17.99' },
    ],
  },
  {
    id: 2,
    dishShortName: 'Cassava Leaf & Egusi Foofoo',
    priceLabel: '$17.99',
    cookingStatus: 'Simmering Slowly in Traditional Pots',
    badge: 'Traditional Soups & Leaf Dishes',
    captionTitle: 'Cassava Leaf ($17.99), Potato Leaf ($17.99) & Egusi Soup with Foofoo ($18.99)',
    captionSubtitle:
      'Authentic Sierra Leonean Cassava Leaf and Potato Leaf (Green) slow-simmered in red palm oil, alongside Foofoo with Okra Soup, Foofoo with Sawa, Kran Kran, and Egusi Soup.',
    namedDishes: [
      'Cassava Leaf · $17.99',
      'Potato Leaf (Green) · $17.99',
      'Foofoo with Okra Soup · $17.99',
      'Egusi Soup with Foofoo · $18.99',
    ],
    mainImage: '/assets/menu_ref/cassava_leaf.jpg?v=natural2',
    secondaryImages: [
      { src: '/assets/menu_ref/egusi_foofoo.jpg?v=natural2', label: 'Egusi Soup & Foofoo · $18.99' },
      { src: '/assets/menu_ref/achecke_grill_fish.jpg?v=natural2', label: 'Achecke & Grill Fish · $22.99' },
    ],
  },
  {
    id: 3,
    dishShortName: 'Lamb Grill & Pepper Soup',
    priceLabel: '$20.99',
    cookingStatus: 'Boiling Aromatic & Flame-Grilled Fresh',
    badge: 'Meat, Grill & Pepper Soup',
    captionTitle: 'Lamb Grill with Plantain ($23.99), Pepper Soup ($20.99) & Wings ($15.99)',
    captionSubtitle:
      'Tender Roast Beef with Peanut Butter, flame-grilled Lamb with plantain or Achecke, Pepper Chicken, and steaming Assorted Pepper Soup with goat meat, cow feet, strip, cow skin, and beef.',
    namedDishes: [
      'Roast Beef with Peanut Butter · $19.99',
      'Lamb Grill with Plantain · $23.99',
      'Assorted Pepper Soup · $20.99',
      'Chicken Wings & Fries · $15.99',
    ],
    mainImage: '/assets/menu_ref/lamb_grill_plantain.jpg?v=natural2',
    secondaryImages: [
      { src: '/assets/menu_ref/pepper_soup.jpg?v=natural2', label: 'Pepper Soup · $20.99' },
      { src: '/assets/menu_ref/chicken_wings_fries.jpg?v=natural2', label: 'Chicken Wings & Fries · $15.99' },
    ],
  },
  {
    id: 4,
    dishShortName: 'Rice & Beans with Oxtail',
    priceLabel: '$23.99',
    cookingStatus: 'Steaming Hot with Fire-Roasted Tomatoes',
    badge: 'Rice and Beans',
    captionTitle: 'Rice and Beans with Oxtail ($23.99) & Jollof Rice and Stew ($14.99)',
    captionSubtitle:
      'Smoky West African Jollof Rice and Stew, hearty Rice and Beans with slow-braised Oxtail, Black Eye Beans with Oil, and Black Eyes Beans with Palm Oil.',
    namedDishes: [
      'Jollof Rice and Stew · $14.99',
      'Rice and Beans with Oxtail · $23.99',
      'Black Eye Beans with Oil · $10.99',
      'Black Eyes Beans with Palm Oil · $11.99',
    ],
    mainImage: '/assets/menu_ref/rice_beans_oxtail.jpg?v=natural2',
    secondaryImages: [
      { src: '/assets/menu_ref/achecke_grill_fish.jpg?v=natural2', label: 'Achecke & Grill Fish · $22.99' },
      { src: '/assets/menu_ref/pepper_soup.jpg?v=natural2', label: 'Pepper Soup · $20.99' },
    ],
  },
  {
    id: 5,
    dishShortName: 'American Favorites & Drinks',
    priceLabel: '$15.99',
    cookingStatus: 'Flame-Seared & Freshly Baked Daily',
    badge: 'American Favorites, Small Chops & Natural Drinks',
    captionTitle: 'Hamburger & Fries ($15.99), Cheese Steak ($16.99), Meat Pie & Natural Drinks',
    captionSubtitle:
      'Classic Hamburger and Fries, Cheese Steak with Fries, Mac and Cheese, Mash Potatoes, golden Meat Pie, Fish Pie, Puff Puff, Spring Roll, Ginger Beer, and chilled Bissab.',
    namedDishes: [
      'Hamburger and Fries · $15.99',
      'Cheese Steak with Fries · $16.99',
      'Meat Pie ($4.50) & Spring Roll ($5.99)',
      'Ginger Beer & Bissab · $4.99',
    ],
    mainImage: '/assets/menu_ref/hamburger_fries.jpg?v=natural2',
    secondaryImages: [
      { src: '/assets/menu_ref/cheesesteak_fries.jpg?v=natural2', label: 'Cheese Steak & Fries · $16.99' },
      { src: '/assets/menu_ref/meat_pie.jpg?v=natural2', label: 'Meat Pie · $4.50' },
    ],
  },
];

const ORDER_TIMELINE_STEPS: OrderStatus[] = [
  'New Order',
  'Accepted',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Completed',
];

function FaminasPlatform() {
  const {
    user,
    isAdmin,
    categories,
    menuItems,
    settings,
    deliveryZones,
    testimonials,
    galleryImages,
    orders,
    orderItemsMap,
    fetchOrderItems,
    cart,
    favouriteIds,
    lastPlacedOrder,
    notification,
    clearNotification,
    signInWithGoogle,
    signOut,
    addToCart,
    updateCartQuantity,
    updateCartInstructions,
    removeFromCart,
    toggleFavourite,
    placeOrder,
    generateWhatsAppLink,
    submitCateringEnquiry,
    submitTestimonial,
    updateItemPrice,
    heroSlides,
    subscribeNewsletter,
    websiteContent,
  } = useRestaurant();

  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedDish, setSelectedDish] = useState<MenuItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewDeliveryStage, setPreviewDeliveryStage] =
    useState<OrderStatus>('Out for Delivery');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [loadingOrderItemsIds, setLoadingOrderItemsIds] = useState<Record<string, boolean>>({});
  const [previewSummaryExpanded, setPreviewSummaryExpanded] = useState<boolean>(true);
  const [menuDisplayTab, setMenuDisplayTab] = useState<'print-sheet' | 'interactive-grid'>('interactive-grid');
  const [menuLayoutStyle, setMenuLayoutStyle] = useState<'cards' | 'rows'>('cards');
  const [quickFilterMode, setQuickFilterMode] = useState<'all' | 'popular' | 'signature' | 'favourites'>('all');

  // Newsletter Subscription Form State (with explicit consent checkbox)
  const [subName, setSubName] = useState('');
  const [subEmail, setSubEmail] = useState('');
  const [subPhone, setSubPhone] = useState('');
  const [subConsent, setSubConsent] = useState(false);

  const toggleOrderSummaryExpansion = async (ord: Order) => {
    const nextExpanded = !expandedOrderIds[ord.id];
    setExpandedOrderIds((prev) => ({ ...prev, [ord.id]: nextExpanded }));

    if (nextExpanded && !orderItemsMap[ord.id]) {
      setLoadingOrderItemsIds((prev) => ({ ...prev, [ord.id]: true }));
      try {
        await fetchOrderItems(ord);
      } finally {
        setLoadingOrderItemsIds((prev) => ({ ...prev, [ord.id]: false }));
      }
    }
  };

  // Automatic Homepage Hero Slider State (5-second interval)
  const [activeSlide, setActiveSlide] = useState(0);
  const [isSliderPaused, setIsSliderPaused] = useState(false);
  const activeSlidesList =
    websiteContent?.home?.slides && websiteContent.home.slides.length > 0
      ? websiteContent.home.slides
      : heroSlides.length > 0
      ? heroSlides
      : HERO_SLIDES;

  useEffect(() => {
    if (currentPage !== 'home' || isSliderPaused) return;
    const timer = window.setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % activeSlidesList.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [currentPage, isSliderPaused, activeSlidesList.length]);

  const goToPrevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + activeSlidesList.length) % activeSlidesList.length);
  };

  const goToNextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % activeSlidesList.length);
  };

  // Luxury Preloader State
  const [showPreloader, setShowPreloader] = useState(true);

  // Menu Filtering & Sorting State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisineGroup, setSelectedCuisineGroup] = useState<'All' | CuisineGroup>('All');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');
  const [onlyFavourites, setOnlyFavourites] = useState(false);

  // Food Details Page State
  const [detailQty, setDetailQty] = useState(1);
  const [detailInstructions, setDetailInstructions] = useState('');

  // Gallery Filter State
  const [selectedGalleryCat, setSelectedGalleryCat] = useState<'All' | GalleryCategory>('All');

  // Checkout Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState<'delivery' | 'pickup'>('pickup');
  const [selectedZoneId, setSelectedZoneId] = useState<string>(deliveryZones[0]?.id || 'zone-central');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_on_pickup');
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Catering Form State
  const [catName, setCatName] = useState('');
  const [catPhone, setCatPhone] = useState('');
  const [catEmail, setCatEmail] = useState('');
  const [catEventType, setCatEventType] = useState('Wedding Banquet');
  const [catDate, setCatDate] = useState('');
  const [catGuests, setCatGuests] = useState(50);
  const [catFoodPrefs, setCatFoodPrefs] = useState(
    'Sierra Leone Jollof Rice, Cassava Leaves (Kankain), Fried Red Snapper, and Grilled Chicken Wings'
  );
  const [catNotes, setCatNotes] = useState('');
  const [cateringSubmitted, setCateringSubmitted] = useState(false);

  // Guestbook / Testimonial Form State
  const [revName, setRevName] = useState('');
  const [revDish, setRevDish] = useState('Sierra Leone Jollof Rice');
  const [revRating, setRevRating] = useState(5);
  const [revComment, setRevComment] = useState('');

  // Animated Notification Toast State (slide-in & fade-out CSS transitions)
  const [renderedNotification, setRenderedNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [isToastVisible, setIsToastVisible] = useState(false);

  const dismissToastWithTransition = React.useCallback(() => {
    setIsToastVisible(false);
    window.setTimeout(() => {
      clearNotification();
      setRenderedNotification(null);
    }, 300);
  }, [clearNotification]);

  useEffect(() => {
    if (!notification) {
      setIsToastVisible(false);
      const cleanupTimer = window.setTimeout(() => {
        setRenderedNotification(null);
      }, 300);
      return () => window.clearTimeout(cleanupTimer);
    }

    setRenderedNotification(notification);
    const rafId = window.requestAnimationFrame(() => {
      setIsToastVisible(true);
    });

    const autoHideTimer = window.setTimeout(() => {
      dismissToastWithTransition();
    }, 3700);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(autoHideTimer);
    };
  }, [notification, dismissToastWithTransition]);

  // Pre-fill checkout fields when user logs in
  useEffect(() => {
    if (user) {
      if (!customerName && user.displayName) setCustomerName(user.displayName);
      if (!customerEmail && user.email) setCustomerEmail(user.email);
      if (!revName && user.displayName) setRevName(user.displayName);
    }
  }, [user, customerName, customerEmail, revName]);

  // Dynamic SEO Document Title Update per Page
  useEffect(() => {
    const titles: Record<PageRoute, string> = {
      home: 'Faminas African & Americans Restaurant – Lindenwold, NJ',
      about: 'About Us | Faminas African & Americans Restaurant',
      menu: 'Our Digital Food Menu | Faminas African & Americans Restaurant',
      ordering: 'Order Online | Faminas African & Americans Restaurant',
      'food-details': `${
        selectedDish
          ? `${selectedDish.name} ($${selectedDish.price.toFixed(2)})`
          : 'Dish Details'
      } | Faminas Restaurant`,
      gallery: 'Food & Restaurant Gallery | Faminas Restaurant',
      catering: 'Catering & Private Events | Faminas Restaurant',
      contact: 'Contact & Hours | Faminas Restaurant',
      cart: 'Your Shopping Bag | Faminas Restaurant',
      checkout: 'Secure Checkout | Faminas Restaurant',
      'order-confirmation': 'Order Confirmation & Live Status | Faminas Restaurant',
      admin: 'Admin Dashboard | Faminas Restaurant',
      privacy: 'Privacy Policy | Faminas Restaurant',
      terms: 'Terms and Conditions | Faminas Restaurant',
    };
    document.title = titles[currentPage] || 'Faminas African & Americans Restaurant – Lindenwold, NJ';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedDish]);

  // Live Google Search & Google Merchant Center Schema.org JSON-LD Synchronization
  useEffect(() => {
    const scriptId = 'faminas-live-merchant-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }
    const structuredData = buildGoogleMerchantAndRestaurantJsonLd(
      menuItems,
      categories,
      settings
    );
    scriptEl.textContent = JSON.stringify(structuredData);
  }, [menuItems, categories, settings]);

  // Support Google Search & Google Merchant Product Deep Links (?dish=... or ?page=...)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const dishParam = params.get('dish');
      const pageParam = params.get('page') as PageRoute | null;
      if (dishParam && menuItems.length > 0) {
        const matched = menuItems.find((m) => m.id === dishParam);
        if (matched) {
          setSelectedDish(matched);
          setCurrentPage('food-details');
          return;
        }
      }
      if (
        pageParam &&
        ['home', 'about', 'menu', 'ordering', 'gallery', 'catering', 'contact', 'admin'].includes(
          pageParam
        )
      ) {
        setCurrentPage(pageParam);
      }
    } catch {
      // ignore URL parsing errors
    }
  }, [menuItems]);

  const navigateTo = (page: PageRoute) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openFoodDetails = (item: MenuItem) => {
    setSelectedDish(item);
    setDetailQty(1);
    setDetailInstructions('');
    navigateTo('food-details');
  };

  const handleSingleItemWhatsApp = (item: MenuItem) => {
    const link = generateWhatsAppLink({ singleItem: item });
    window.location.href = link;
  };

  // Filtered and Sorted Menu Items
  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter((item) => {
        if ((onlyFavourites || quickFilterMode === 'favourites') && !favouriteIds.includes(item.id)) {
          return false;
        }
        if (quickFilterMode === 'popular' && !item.isPopular) {
          return false;
        }
        if (quickFilterMode === 'signature' && !item.isFeatured) {
          return false;
        }
        if (selectedCategoryId !== 'all' && item.categoryId !== selectedCategoryId) {
          return false;
        }
        if (selectedCuisineGroup !== 'All') {
          const cat = categories.find((c) => c.id === item.categoryId);
          if (cat && cat.cuisineGroup !== selectedCuisineGroup) return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          return (
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.categoryName.toLowerCase().includes(q) ||
            item.cuisineType.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return Number(b.isPopular) - Number(a.isPopular);
      });
  }, [
    menuItems,
    categories,
    onlyFavourites,
    quickFilterMode,
    favouriteIds,
    selectedCategoryId,
    selectedCuisineGroup,
    searchQuery,
    sortBy,
  ]);

  // Unique key to trigger smooth fade-in + upward transition when category/filter/search changes
  const menuAnimationKey = `${currentPage}_${selectedCuisineGroup}_${selectedCategoryId}_${quickFilterMode}_${onlyFavourites}_${sortBy}_${searchQuery.trim()}_${menuLayoutStyle}`;

  // Cart Totals Calculation
  const cartItemCount = cart.reduce((sum, c) => sum + c.quantity, 0);
  const cartSubtotal = Number(
    cart.reduce((sum, c) => sum + c.menuItem.price * c.quantity, 0).toFixed(2)
  );
  const activeDeliveryZone = deliveryZones.find((z) => z.id === selectedZoneId);
  const calculatedDeliveryFee =
    fulfillmentType === 'delivery'
      ? Number(
          (activeDeliveryZone ? activeDeliveryZone.fee : settings.defaultDeliveryFee).toFixed(2)
        )
      : 0;
  const calculatedTax = Number(
    ((cartSubtotal * settings.taxRatePercent) / 100).toFixed(2)
  );
  const calculatedTotal = Number(
    (cartSubtotal + calculatedDeliveryFee + calculatedTax).toFixed(2)
  );

  const dailySpecialDishes = useMemo(
    () => menuItems.filter((m) => m.isFeatured),
    [menuItems]
  );

  const africanAndWestAfricanDishes = useMemo(
    () => menuItems.filter((m) => m.categoryId === 'cat-african-west-african'),
    [menuItems]
  );

  const traditionalSierraLeoneanDishes = useMemo(
    () => menuItems.filter((m) => m.categoryId === 'cat-sierra-leonean'),
    [menuItems]
  );

  const featuredAmericanDishes = useMemo(
    () =>
      menuItems.filter(
        (m) =>
          m.categoryId === 'cat-american-favourites' ||
          m.cuisineType === 'American' ||
          m.cuisineType === 'Seafood'
      ),
    [menuItems]
  );

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (!user) {
      setCheckoutError('Please sign in with Google above to place and track your order.');
      return;
    }
    if (!customerName.trim() || customerPhone.trim().length < 5) {
      setCheckoutError('Please enter your full name and a valid phone number.');
      return;
    }
    if (fulfillmentType === 'delivery' && deliveryAddress.trim().length < 5) {
      setCheckoutError('Please provide your full street address for delivery.');
      return;
    }

    setSubmittingOrder(true);
    try {
      await placeOrder({
        customerName,
        customerPhone,
        customerEmail,
        fulfillmentType,
        deliveryZoneId: selectedZoneId,
        deliveryAddress,
        specialInstructions: orderNotes,
        paymentMethod,
      });

      if (paymentMethod === 'whatsapp_order') {
        const waLink = generateWhatsAppLink({
          customerName,
          fulfillmentType,
          deliveryAddress,
        });
        window.location.href = waLink;
      } else {
        navigateTo('order-confirmation');
      }
    } catch (err: any) {
      setCheckoutError(err?.message || 'Unable to process order. Please check your details.');
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F3EA] text-[#21150F]">
      {/* LUXURY CULINARY SPLASH PRELOADER */}
      {showPreloader && (
        <LuxuryPreloader onComplete={() => setShowPreloader(false)} />
      )}

      {/* TOP ANNOUNCEMENT PROMO TICKER */}
      {websiteContent?.header?.announcementActive !== false && (
        <div className="bg-gradient-to-r from-[#21150F] via-[#254B37] to-[#21150F] text-[#F7F3EA] border-b border-[#C9A45C]/40 py-1.5 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide flex items-center justify-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[#C9A45C] shrink-0 animate-pulse-subtle" />
          <span>
            {websiteContent?.header?.announcementText || (
              <>
                <strong>SPECIAL PROMO:</strong> Get 15% OFF your order with code{' '}
                <span className="font-mono font-bold text-[#C9A45C] bg-black/40 px-1.5 py-0.5 rounded border border-[#C9A45C]/50">
                  FAMINAS15
                </span>{' '}
                · Free Sweet Plantains with 2 Platters!
              </>
            )}
          </span>
          <button
            type="button"
            onClick={() => navigateTo('ordering')}
            className="underline font-bold text-[#C9A45C] hover:text-[#FFFFFF] ml-1 transition-colors cursor-pointer"
          >
            Order Now →
          </button>
        </div>
      )}

      {/* 1. ELEGANT FIVE-STAR NAVIGATION HEADER (#21150F ESPRESSO BROWN WITH TRANSLUCENT GLASS) */}
      <header className="sticky top-0 z-40 faminas-glass-dark border-b border-[#C9A45C]/40 shadow-[0_10px_35px_rgba(0,0,0,0.4)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4 lg:gap-6">
          {/* Zone 1: Official FAMINAS Brand Lockup */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="text-left focus:outline-none whitespace-nowrap shrink-0 group transition-transform duration-300 hover:scale-[1.02]"
          >
            <FaminasLogo size="sm" />
          </button>

          {/* Zone 2: Clean Desktop Navigation Links with Smooth Cursor-Following Sliding Pill */}
          <DesktopNavbar currentPage={currentPage} onNavigate={navigateTo} />

          {/* Zone 3: Prominent Order Online CTA + Order Bag + Mobile Menu Trigger */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => navigateTo('ordering')}
              className="btn-sheen hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#254B37] to-[#1D3B2B] text-[#FFFFFF] hover:shadow-[0_6px_20px_rgba(37,75,55,0.45)] border border-[#C9A45C]/60 transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Utensils className="w-3.5 h-3.5 text-[#C9A45C]" />
              <span>Order Online</span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('cart')}
              className="btn-sheen relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] text-[#21150F] hover:shadow-[0_8px_24px_rgba(201,164,92,0.4)] transition-all duration-300 hover:-translate-y-0.5 whitespace-nowrap shrink-0 tabular-nums cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#21150F]" />
              <span>
                Bag ({cartItemCount})
                {cartSubtotal > 0 ? ` · ${settings.currencySymbol}${cartSubtotal.toFixed(2)}` : ''}
              </span>
              {cartItemCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#254B37] ring-2 ring-white animate-pulse-subtle shrink-0" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle Navigation Menu"
              className="lg:hidden p-2.5 rounded-xl text-[#F7F3EA] bg-white/5 hover:bg-white/10 border border-[#C9A45C]/45 backdrop-blur-md transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Ambient Gold Bottom Hairline */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#C9A45C]/65 to-transparent pointer-events-none" />

        {/* One-Hand Friendly Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden faminas-glass-dark border-b border-[#C9A45C]/45 px-4 py-5 space-y-2 animate-category-fade shadow-2xl">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/10">
              <button
                type="button"
                onClick={() => navigateTo('ordering')}
                className="btn-sheen py-3 px-4 rounded-xl bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] text-[#21150F] font-bold text-xs uppercase tracking-wider text-center shadow-md"
              >
                Order Online
              </button>
              <button
                type="button"
                onClick={() => navigateTo('menu')}
                className="btn-sheen py-3 px-4 rounded-xl bg-gradient-to-r from-[#254B37] to-[#1D3B2B] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider text-center border border-[#C9A45C]/60 shadow-md"
              >
                Explore Menu
              </button>
            </div>
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About Us' },
              { id: 'menu', label: 'Our Menu' },
              { id: 'ordering', label: 'Order Online' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'catering', label: 'Catering & Events' },
              { id: 'contact', label: 'Contact Us' },
              { id: 'order-confirmation', label: 'Track Live Orders' },
              ...(isAdmin ? [{ id: 'admin', label: 'Admin Dashboard' }] : []),
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => navigateTo(item.id as PageRoute)}
                className={`block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  currentPage === item.id
                    ? 'bg-gradient-to-r from-[#C9A45C]/25 to-[#254B37]/30 text-[#C9A45C] border border-[#C9A45C]/60'
                    : 'text-[#F7F3EA] hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Secondary Sub-Bar for Official Location, Direct Phone & Order Tracking */}
      <div className="bg-[#3B3029] border-b border-[#C9A45C]/30 text-xs text-[#F7F3EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-[#F7F3EA]/90">
            <span className="text-[#C9A45C] font-semibold">
              {websiteContent?.contact?.address || '577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA'}
            </span>
            <span aria-hidden="true">·</span>
            <a
              href={`tel:${(websiteContent?.contact?.phone || '+1 (856) 522-3029').replace(/[^0-9+]/g, '')}`}
              className="hover:text-[#C9A45C] transition-colors font-mono font-bold text-[#FFFFFF]"
            >
              {websiteContent?.contact?.phone || '+1 (856) 522-3029'}
            </a>
            <span aria-hidden="true">·</span>
            <span className="text-[#F7F3EA]/80 hidden sm:inline">
              {websiteContent?.home?.heroTagline || 'Good Food Brings People Together.'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigateTo('order-confirmation')}
              className="text-[#F7F3EA]/90 hover:text-[#C9A45C] transition-colors font-semibold cursor-pointer"
            >
              My Orders ({orders.length})
            </button>
            {isAdmin && (
              <button
                onClick={() => navigateTo('admin')}
                className="text-[#C9A45C] hover:underline font-bold cursor-pointer"
              >
                Admin Dashboard
              </button>
            )}
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-[#F7F3EA]/85 truncate max-w-[160px]">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={signOut}
                  className="inline-flex items-center gap-1 text-[#F7F3EA]/70 hover:text-[#FFFFFF] cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="inline-flex items-center gap-1.5 text-[#C9A45C] hover:underline font-semibold cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5" />
                Sign In with Google
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Animated Notification Toast (Frosted Glass Card) */}
      {renderedNotification && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-6 z-50 max-w-md px-5 py-4 rounded-2xl faminas-glass-dark border shadow-[0_20px_50px_rgba(0,0,0,0.65)] flex items-center gap-3.5 transition-all duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] transform ${
            renderedNotification.type === 'error'
              ? 'border-[#B91C1C]/80'
              : 'border-[#C9A45C]/80'
          } ${
            isToastVisible
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
          }`}
        >
          <span
            className={`w-3 h-3 rounded-full shrink-0 animate-pulse-subtle ${
              renderedNotification.type === 'error' ? 'bg-[#EF4444]' : 'bg-[#254B37] ring-2 ring-[#C9A45C]'
            }`}
          />
          <span
            className={`text-xs font-bold uppercase tracking-wider shrink-0 ${
              renderedNotification.type === 'error' ? 'text-[#FCA5A5]' : 'text-[#C9A45C]'
            }`}
          >
            {renderedNotification.type === 'error' ? 'Notice' : 'Confirmed'}
          </span>
          <span className="text-sm text-[#F7F3EA] leading-snug">
            {renderedNotification.message}
          </span>
          <button
            type="button"
            onClick={dismissToastWithTransition}
            aria-label="Dismiss notification"
            className="text-[#F7F3EA]/60 hover:text-[#FFFFFF] ml-2 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* MAIN PAGE ROUTER */}
      <main key={currentPage} className="flex-1 animate-fade-in-page">
        {/* =========================================================
            PAGE 1: HOMEPAGE — 12-SECTION FIVE-STAR LUXURY EXPERIENCE
            ========================================================= */}
        {currentPage === 'home' && (
          <div className="bg-[#F7F3EA] text-[#21150F]">
            {/* SECTION 2: FULL-WIDTH PREMIUM FOOD PHOTOGRAPHY SLIDER (#21150F ESPRESSO BROWN) */}
            <section
              aria-label="Featured Faminas Restaurant Photography Slider"
              onMouseEnter={() => setIsSliderPaused(true)}
              onMouseLeave={() => setIsSliderPaused(false)}
              className="relative w-full overflow-hidden bg-[#21150F] border-b-2 border-[#C9A45C]"
            >
              <div className="relative min-h-[540px] sm:min-h-[600px] lg:min-h-[650px] flex items-center">
                {activeSlidesList.map((slide, sIdx) => {
                  const isCurrent = sIdx === activeSlide;
                  return (
                    <div
                      key={slide.id}
                      aria-hidden={!isCurrent}
                      className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                        isCurrent ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                      }`}
                    >
                      <img
                        src={slide.mainImage}
                        alt={`${slide.dishShortName} – Faminas African and Americans Restaurant Lindenwold NJ`}
                        className="w-full h-full object-cover object-center animate-hero-kenburns"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#21150F]/95 via-[#21150F]/82 to-[#21150F]/55" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#21150F] via-transparent to-[#21150F]/45" />
                    </div>
                  );
                })}

                {/* Luminous Ambient Background Depth Lights */}
                <div className="absolute -top-24 left-1/4 w-96 h-96 rounded-full bg-[#C9A45C]/15 blur-[120px] pointer-events-none" />
                <div className="absolute -bottom-24 right-1/4 w-96 h-96 rounded-full bg-[#254B37]/25 blur-[130px] pointer-events-none" />

                <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 w-full">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
                    {/* Left Column: Five-Star Hero Heading, Tagline & CTA Buttons */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="inline-flex flex-wrap items-center gap-2 px-4 py-1.5 rounded-full bg-[#254B37]/90 backdrop-blur-md border border-[#C9A45C]/75 text-[#F7F3EA] text-xs font-bold uppercase tracking-widest shadow-[0_4px_18px_rgba(37,75,55,0.4)]">
                        <Flame className="w-3.5 h-3.5 text-[#C9A45C] animate-pulse-subtle" />
                        <span>{activeSlidesList[activeSlide]?.badge}</span>
                      </div>

                      <div className="space-y-2.5">
                        <h1 className="font-serif-display text-3xl sm:text-5xl lg:text-6xl font-bold text-[#FFFFFF] tracking-tight leading-[1.08] drop-shadow-md">
                          {websiteContent?.home?.heroTitle || 'FAMINAS AFRICAN AND AMERICAN CUISINE'}
                        </h1>
                        <p className="font-serif-display text-xl sm:text-2xl text-[#C9A45C] font-semibold">
                          {websiteContent?.home?.heroSubtitle || 'Authentic Flavors. Fresh Ingredients. A Taste of Home.'}
                        </p>
                        <p className="text-sm sm:text-base font-semibold text-[#F7F3EA]/90 tracking-wide">
                          {websiteContent?.home?.heroTagline || 'Good Food Brings People Together.'}
                        </p>
                      </div>

                      {/* Active Slide Dish Caption (Translucent Smoked Glass Card) */}
                      <div
                        key={`caption-${activeSlide}`}
                        className="faminas-glass-dark-card p-5 sm:p-6 rounded-2xl border border-[#C9A45C]/60 space-y-2 max-w-2xl animate-category-fade shadow-[0_16px_45px_rgba(0,0,0,0.6)]"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h2 className="font-serif-display text-lg sm:text-2xl font-bold text-[#FFFFFF]">
                            {activeSlidesList[activeSlide]?.captionTitle}
                          </h2>
                          <span className="font-mono text-base sm:text-lg font-extrabold text-[#C9A45C] tabular-nums">
                            {activeSlidesList[activeSlide]?.priceLabel}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-[#F7F3EA]/85 leading-relaxed">
                          {activeSlidesList[activeSlide]?.captionSubtitle}
                        </p>
                      </div>

                      {/* Hero CTA Buttons: Explore Our Menu & Order Online */}
                      <div className="flex flex-wrap items-center gap-3.5 pt-1">
                        <button
                          type="button"
                          onClick={() => navigateTo('menu')}
                          className="btn-sheen inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#C9A45C] via-[#E2BE76] to-[#C9A45C] hover:bg-[#B89146] text-[#21150F] font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_14px_35px_rgba(201,164,92,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] cursor-pointer"
                        >
                          <Utensils className="w-4 h-4" />
                          <span>{websiteContent?.home?.exploreMenuBtnText || 'Explore Our Menu'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => navigateTo('ordering')}
                          className="btn-sheen inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#254B37] to-[#1A3828] text-[#FFFFFF] border-2 border-[#C9A45C]/80 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-[0_14px_35px_rgba(37,75,55,0.5)] cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
                          <span>{websiteContent?.home?.orderOnlineBtnText || 'Order Online'}</span>
                          <ArrowRight className="w-4 h-4 text-[#C9A45C]" />
                        </button>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#F7F3EA]/90">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                          577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA
                        </span>
                        <a
                          href="tel:+18565223029"
                          className="inline-flex items-center gap-1.5 font-mono font-bold text-[#C9A45C] hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          +1 (856) 522-3029
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Featured Slide Dish Showcase Card */}
                    <div className="lg:col-span-5">
                      <div
                        key={`hero-card-${activeSlide}`}
                        className="faminas-glass-dark-card rounded-3xl border-2 border-[#C9A45C] overflow-hidden shadow-[0_30px_70px_rgba(0,0,0,0.7)] animate-fade-up-card hover:border-[#F1D599] transition-all duration-500"
                      >
                        <div
                          onClick={() => navigateTo('ordering')}
                          className="aspect-[4/3] w-full bg-[#180E08] overflow-hidden border-b-2 border-[#C9A45C] cursor-pointer relative group"
                        >
                          <img
                            src={activeSlidesList[activeSlide]?.mainImage}
                            alt={activeSlidesList[activeSlide]?.dishShortName}
                            className="w-full h-full object-cover object-center food-card-image-zoom group-hover:scale-108 transition-transform duration-700"
                          />
                          <span className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-[#180E08]/85 backdrop-blur-md border border-[#C9A45C] text-[11px] font-bold uppercase tracking-wider text-[#C9A45C] shadow-lg">
                            Featured Dish {activeSlide + 1} of {activeSlidesList.length}
                          </span>
                        </div>

                        <div className="p-5 sm:p-6 text-center bg-gradient-to-b from-[#F7F3EA] to-[#EFE8D9] space-y-2.5">
                          <h3 className="font-serif-display text-xl sm:text-2xl font-bold text-[#21150F]">
                            {activeSlidesList[activeSlide]?.dishShortName}
                          </h3>
                          <p className="font-mono text-xl sm:text-2xl font-extrabold text-[#21150F] tabular-nums">
                            {activeSlidesList[activeSlide]?.priceLabel}
                          </p>
                          <div className="pt-2 flex items-center justify-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => navigateTo('ordering')}
                              className="btn-sheen px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] hover:bg-[#B89146] text-[#21150F] font-bold text-xs uppercase tracking-wider shadow-[0_4px_16px_rgba(201,164,92,0.3)] transition-all duration-300 cursor-pointer"
                            >
                              Order This Dish
                            </button>
                            <button
                              type="button"
                              onClick={() => navigateTo('menu')}
                              className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-[#21150F] hover:text-[#FFFFFF] border border-[#21150F]/25 text-[#21150F] font-semibold text-xs shadow-xs transition-all duration-300 cursor-pointer"
                            >
                              Explore Menu
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hero Slider Navigation Controls */}
                  <div className="mt-8 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {activeSlidesList.map((slide, idx) => {
                        const isActive = idx === activeSlide;
                        return (
                          <button
                            key={slide.id}
                            type="button"
                            onClick={() => setActiveSlide(idx)}
                            aria-label={`Show slide ${idx + 1}: ${slide.dishShortName}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border cursor-pointer ${
                              isActive
                                ? 'bg-[#C9A45C] text-[#21150F] border-[#C9A45C] font-bold shadow-md'
                                : 'bg-[#3B3029]/85 text-[#F7F3EA]/80 border-white/15 hover:border-[#C9A45C] hover:text-[#FFFFFF]'
                            }`}
                          >
                            <span className="font-mono text-[11px]">0{idx + 1}</span>
                            <span className="hidden md:inline truncate max-w-[150px]">
                              {slide.dishShortName}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={goToPrevSlide}
                        aria-label="Previous Hero Slide"
                        className="p-2.5 rounded-xl bg-[#3B3029] hover:bg-[#C9A45C] text-[#F7F3EA] hover:text-[#21150F] border border-[#C9A45C]/50 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNextSlide}
                        aria-label="Next Hero Slide"
                        className="p-2.5 rounded-xl bg-[#3B3029] hover:bg-[#C9A45C] text-[#F7F3EA] hover:text-[#21150F] border border-[#C9A45C]/50 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: WELCOME MESSAGE & RESTAURANT INTRODUCTION (#F7F3EA WARM IVORY) */}
            <section className="py-12 sm:py-16 bg-[#F7F3EA] border-b border-[#C9A45C]/30 relative overflow-hidden">
              {/* Subtle ambient glow behind welcome card */}
              <div className="absolute top-0 right-10 w-80 h-80 bg-[#C9A45C]/10 rounded-full blur-[90px] pointer-events-none" />

              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="p-7 sm:p-10 rounded-3xl faminas-glass-light-card border border-[#C9A45C]/55 shadow-[0_16px_45px_rgba(33,21,15,0.08)] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-3">
                    <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#254B37]/10 border border-[#254B37]/35 text-[#254B37] text-xs font-bold uppercase tracking-widest">
                      {websiteContent?.home?.heroBadge || 'Welcome to Faminas · Lindenwold, New Jersey'}
                    </span>
                    <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#21150F]">
                      {websiteContent?.home?.welcomeHeading || 'Good Food Brings People Together.'}
                    </h2>
                    <p className="text-sm sm:text-base text-[#3B3029] leading-relaxed">
                      {websiteContent?.home?.welcomeText || (
                        <>
                          Welcome to <strong>FAMINAS African and Americans Restaurant</strong> at{' '}
                          <strong>577 Blackwood-Clementon Road, Lindenwold, NJ 08021</strong>. We take
                          pride in preparing authentic Sierra Leonean and West African home-cooked
                          traditions alongside beloved American comfort dishes—crafted fresh daily with
                          warm hospitality for Dine-In, Takeout, Delivery, and Private Event Catering.
                        </>
                      )}
                    </p>
                  </div>
                  <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => navigateTo('menu')}
                      className="btn-sheen w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] hover:bg-[#B89146] text-[#21150F] font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(201,164,92,0.3)] hover:-translate-y-0.5 cursor-pointer"
                    >
                      <Utensils className="w-4 h-4" />
                      Explore Our Full Menu
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('ordering')}
                      className="btn-sheen w-full py-3.5 px-6 rounded-xl bg-[#21150F] hover:bg-[#341F14] text-[#F7F3EA] border border-[#C9A45C]/50 font-bold text-xs uppercase tracking-wider transition-all duration-300 inline-flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(33,21,15,0.25)] hover:-translate-y-0.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
                      Order Online for Pickup or Delivery
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* HIGH-IMPACT PROMOTIONAL OFFER BANNERS */}
            <PromotionalOfferBanners onNavigate={navigateTo} />

            {/* SECTION 4: FEATURED SIGNATURE DISHES & TODAY'S DAILY SPECIALS */}
            {dailySpecialDishes.length > 0 && (
              <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="p-6 sm:p-8 rounded-3xl faminas-glass-light-card border-2 border-[#C9A45C]/65 shadow-[0_20px_50px_rgba(33,21,15,0.1)] space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C9A45C]/35 pb-4">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#254B37] text-[#FFFFFF] text-xs font-bold uppercase tracking-widest mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#C9A45C]" />
                        Featured Signature Dishes · Today&apos;s Daily Specials
                      </div>
                      <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#21150F]">
                        Chef&apos;s Featured Signature Dishes
                      </h2>
                      <p className="text-xs sm:text-sm text-[#3B3029] mt-1">
                        Our most-requested Sierra Leonean, West African, and American dishes—each
                        plated separately with its official price written clearly underneath.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => navigateTo('admin')}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-[#21150F] hover:bg-[#3B3029] text-xs font-bold text-[#C9A45C] transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          Manage Specials
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigateTo('ordering')}
                        className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#C9A45C] hover:bg-[#B89146] text-xs font-bold text-[#21150F] transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        Order Online
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {dailySpecialDishes.map((item, idx) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        index={idx}
                        animationKey={`home-daily-specials-${dailySpecialDishes.length}`}
                        currencySymbol={settings.currencySymbol}
                        isFavourite={favouriteIds.includes(item.id)}
                        whatsappEnabled={settings.whatsappOrderingEnabled}
                        onAddToCart={(it) => addToCart(it, 1)}
                        onViewDetails={openFoodDetails}
                        onToggleFavourite={toggleFavourite}
                        onWhatsAppOrder={handleSingleItemWhatsApp}
                        onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* SECTION 5: AFRICAN AND SIERRA LEONEAN SPECIALTIES */}
            <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C9A45C]/40 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                    Authentic Freetown &amp; West African Kitchen
                  </span>
                  <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#21150F] mt-1">
                    African &amp; Sierra Leonean Specialties
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3B3029] mt-1">
                    Achecke with Grill Fish and Plantain, Cassava Leaf, Egusi Soup with Foofoo,
                    Jollof Rice, Rice and Beans with Oxtail, Lamb Grill, and Pepper Soup.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCuisineGroup('African & West African');
                    setMenuDisplayTab('interactive-grid');
                    navigateTo('menu');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#21150F] text-[#F7F3EA] font-bold text-xs uppercase tracking-wider hover:bg-[#3B3029] transition-colors shrink-0 cursor-pointer"
                >
                  <span>View All African Dishes</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#C9A45C]" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems
                  .filter(
                    (it) =>
                      it.categoryId === 'cat-sierra-leonean-specialties' ||
                      it.categoryId === 'cat-soups-leaf-dishes' ||
                      it.categoryId === 'cat-rice-and-beans' ||
                      it.categoryId === 'cat-meat-grill-pepper-soup'
                  )
                  .slice(0, 8)
                  .map((item, idx) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      index={idx}
                      animationKey="home-african-specialties"
                      currencySymbol={settings.currencySymbol}
                      isFavourite={favouriteIds.includes(item.id)}
                      whatsappEnabled={settings.whatsappOrderingEnabled}
                      onAddToCart={(it) => addToCart(it, 1)}
                      onViewDetails={openFoodDetails}
                      onToggleFavourite={toggleFavourite}
                      onWhatsAppOrder={handleSingleItemWhatsApp}
                      onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                    />
                  ))}
              </div>
            </section>

            {/* SECTION 6: AMERICAN FAVORITES */}
            <section className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C9A45C]/40 pb-4">
                <div>
                  <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                    Grilled Fresh to Order · Classic Comfort
                  </span>
                  <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#21150F] mt-1">
                    American Favorites &amp; Small Chops
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3B3029] mt-1">
                    Flame-grilled Hamburger and Fries, Philly-style Cheese Steak with Fries, Crispy
                    Chicken Wings, Mac and Cheese, Meat Pies, and Refreshing Natural Drinks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCuisineGroup('American Favourites');
                    setMenuDisplayTab('interactive-grid');
                    navigateTo('menu');
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A45C] text-[#21150F] font-bold text-xs uppercase tracking-wider hover:bg-[#B89146] transition-colors shrink-0 cursor-pointer"
                >
                  <span>Explore American Favorites</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {menuItems
                  .filter(
                    (it) =>
                      it.categoryId === 'cat-american-favorites' ||
                      it.categoryId === 'cat-snacks-small-chops' ||
                      it.categoryId === 'cat-natural-drinks' ||
                      it.id === 'sl-chicken-wings-fries'
                  )
                  .slice(0, 8)
                  .map((item, idx) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      index={idx}
                      animationKey="home-american-favorites"
                      currencySymbol={settings.currencySymbol}
                      isFavourite={favouriteIds.includes(item.id)}
                      whatsappEnabled={settings.whatsappOrderingEnabled}
                      onAddToCart={(it) => addToCart(it, 1)}
                      onViewDetails={openFoodDetails}
                      onToggleFavourite={toggleFavourite}
                      onWhatsAppOrder={handleSingleItemWhatsApp}
                      onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                    />
                  ))}
              </div>
            </section>

            {/* SECTION 7: WHY CUSTOMERS SHOULD VISIT FAMINAS (#21150F ESPRESSO BROWN FEATURE BAND) */}
            <section className="py-16 bg-[#21150F] text-[#F7F3EA] border-y-2 border-[#C9A45C]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  <div className="lg:col-span-5 space-y-4">
                    <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
                      Five-Star Hospitality in South Jersey
                    </span>
                    <h2 className="font-serif-display text-3xl md:text-4xl font-bold text-[#FFFFFF]">
                      Why Guests Love Dining at FAMINAS
                    </h2>
                    <p className="text-sm md:text-base text-[#F7F3EA]/85 leading-relaxed">
                      Located at <strong>577 Blackwood-Clementon Road, Lindenwold, NJ 08021</strong>,
                      we bring together traditional West African culinary craftsmanship and classic
                      American grilling in a welcoming, family-friendly setting.
                    </p>
                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => navigateTo('about')}
                        className="px-5 py-2.5 rounded-lg bg-[#C9A45C] text-[#21150F] text-xs font-bold uppercase tracking-wider hover:bg-[#B89146] transition-colors cursor-pointer"
                      >
                        Our Story
                      </button>
                      <a
                        href="https://www.google.com/maps/search/?api=1&query=577+Blackwood-Clementon+Road+Lindenwold+NJ+08021"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-lg bg-[#254B37] hover:bg-[#1D3B2B] border border-[#C9A45C]/50 text-xs font-bold text-[#FFFFFF] transition-colors inline-flex items-center gap-1.5"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#C9A45C]" />
                        Get Directions
                      </a>
                    </div>
                  </div>

                  <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-6 bg-[#3B3029] border border-[#C9A45C]/35 rounded-xl space-y-2">
                      <span className="text-xs font-mono font-bold text-[#C9A45C]">01</span>
                      <h3 className="font-serif-display text-xl font-bold text-[#FFFFFF]">
                        Authentic Sierra Leonean Recipes
                      </h3>
                      <p className="text-xs text-[#F7F3EA]/80 leading-relaxed">
                        True Freetown and West African preparation—from Cassava Leaf and Kran Kran
                        Palava Sauce to Achecke with Grill Fish, Foofoo, and Pepper Soup.
                      </p>
                    </div>
                    <div className="p-6 bg-[#3B3029] border border-[#C9A45C]/35 rounded-xl space-y-2">
                      <span className="text-xs font-mono font-bold text-[#C9A45C]">02</span>
                      <h3 className="font-serif-display text-xl font-bold text-[#FFFFFF]">
                        Something for Every Guest
                      </h3>
                      <p className="text-xs text-[#F7F3EA]/80 leading-relaxed">
                        Bridge generations at one table with rich African leaf stews alongside
                        classic American hamburgers, cheesesteaks, wings, and mac &amp; cheese.
                      </p>
                    </div>
                    <div className="p-6 bg-[#3B3029] border border-[#C9A45C]/35 rounded-xl space-y-2">
                      <span className="text-xs font-mono font-bold text-[#C9A45C]">03</span>
                      <h3 className="font-serif-display text-xl font-bold text-[#FFFFFF]">
                        Easy Online &amp; WhatsApp Ordering
                      </h3>
                      <p className="text-xs text-[#F7F3EA]/80 leading-relaxed">
                        Order directly through our website for pickup or delivery, or send an
                        instant itemized order via WhatsApp to +1 (856) 522-3029.
                      </p>
                    </div>
                    <div className="p-6 bg-[#3B3029] border border-[#C9A45C]/35 rounded-xl space-y-2">
                      <span className="text-xs font-mono font-bold text-[#C9A45C]">04</span>
                      <h3 className="font-serif-display text-xl font-bold text-[#FFFFFF]">
                        Freshly Prepared Generous Portions
                      </h3>
                      <p className="text-xs text-[#F7F3EA]/80 leading-relaxed">
                        Every plate is cooked with fresh ingredients, whole grilled fish, tender
                        meats, and vibrant spices—served clean and hot.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 8: CATERING AND SPECIAL OCCASIONS */}
            <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-7 sm:p-10 rounded-2xl bg-[#FFFFFF] border-2 border-[#C9A45C]/55 shadow-[0_14px_36px_rgba(33,21,15,0.07)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#254B37] text-[#FFFFFF] text-xs font-bold uppercase tracking-widest">
                    Weddings · Birthdays · Graduations · Corporate Events
                  </span>
                  <h2 className="font-serif-display text-2xl sm:text-4xl font-bold text-[#21150F]">
                    Full-Service African &amp; American Event Catering
                  </h2>
                  <p className="text-xs sm:text-sm text-[#3B3029] leading-relaxed">
                    Host an unforgettable celebration with custom banquet trays of Jollof Rice,
                    Achecke with Grilled Fish, Cassava Leaf, Roast Beef, Lamb Grill, Meat Pies, and
                    American crowd-pleasers across New Jersey, Philadelphia, and Delaware.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={() => navigateTo('catering')}
                    className="px-6 py-3.5 rounded-xl bg-[#C9A45C] hover:bg-[#B89146] text-[#21150F] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
                  >
                    Request a Catering Quote
                  </button>
                  <a
                    href="tel:+18565223029"
                    className="px-5 py-3.5 rounded-xl bg-[#21150F] hover:bg-[#3B3029] text-[#F7F3EA] font-bold text-xs uppercase tracking-wider transition-colors inline-flex items-center gap-2"
                  >
                    <Phone className="w-4 h-4 text-[#C9A45C]" />
                    Call (856) 522-3029
                  </a>
                </div>
              </div>
            </section>

            {/* LIVE KITCHEN VIDEOS & REAL CULINARY SHORTS SHOWCASE */}
            <CulinaryVideoShowcase
              menuItems={menuItems}
              onOrderDish={(it) => addToCart(it, 1)}
              onViewDishDetails={openFoodDetails}
            />

            {/* SECTION 9: BEAUTIFUL RESTAURANT FOOD GALLERY & OFFICIAL TWO-PAGE PRINT MENU */}
            <section className="py-8 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 space-y-10">
              <PrintReadyMenuSheet onSelectDish={openFoodDetails} />

              <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#C9A45C]/45 shadow-[0_12px_32px_rgba(33,21,15,0.06)] space-y-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#C9A45C]/30 pb-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                      Complete Culinary Gallery · Individual Dish Photography &amp; Pricing
                    </span>
                    <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#21150F] mt-1">
                      All Restaurant Dishes &amp; Official Prices ({menuItems.length} Dishes)
                    </h2>
                    <p className="text-xs sm:text-sm text-[#3B3029] mt-1">
                      Every dish is presented in its own separate frame with smooth hover zoom and
                      its official price written clearly underneath.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => navigateTo('gallery')}
                      className="px-4 py-2.5 rounded-lg bg-[#21150F] text-[#F7F3EA] font-bold text-xs uppercase tracking-wider hover:bg-[#3B3029] transition-colors cursor-pointer"
                    >
                      Open Photo Gallery
                    </button>
                    <button
                      type="button"
                      onClick={() => navigateTo('ordering')}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#C9A45C] text-[#21150F] font-bold text-xs uppercase tracking-wider hover:bg-[#B89146] transition-colors cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      Order Online
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {menuItems.map((item, idx) => (
                    <FoodCard
                      key={item.id}
                      item={item}
                      index={idx}
                      animationKey="home-all-dishes-grid"
                      currencySymbol={settings.currencySymbol}
                      isFavourite={favouriteIds.includes(item.id)}
                      whatsappEnabled={settings.whatsappOrderingEnabled}
                      onAddToCart={(it) => addToCart(it, 1)}
                      onViewDetails={openFoodDetails}
                      onToggleFavourite={toggleFavourite}
                      onWhatsAppOrder={handleSingleItemWhatsApp}
                      onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 10 & 11: GENUINE CUSTOMER TESTIMONIALS, LOCATION, VIP NEWSLETTER & GOOGLE SEO */}
            <section className="py-14 bg-[#F7F3EA] border-t border-[#C9A45C]/35">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                {/* Section 10: Customer Testimonials Using Genuine Reviews Only */}
                <div className="p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#C9A45C]/40 shadow-sm space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                        Verified Diner Guestbook · Genuine Reviews Only
                      </span>
                      <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#21150F] mt-1">
                        Real Community Feedback
                      </h2>
                    </div>
                    <button
                      onClick={() => navigateTo('contact')}
                      className="px-4 py-2.5 rounded-lg bg-[#21150F] hover:bg-[#3B3029] text-xs font-bold text-[#C9A45C] shrink-0 cursor-pointer"
                    >
                      Leave a Verified Review
                    </button>
                  </div>

                  {testimonials.length === 0 ? (
                    <div className="p-6 bg-[#F7F3EA] border border-[#C9A45C]/35 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#21150F]">
                          We only display genuine, verified reviews submitted by real FAMINAS guests.
                        </p>
                        <p className="text-xs text-[#3B3029] mt-1">
                          Dined with us recently at 577 Blackwood-Clementon Road? Sign in and share
                          your experience with our kitchen team.
                        </p>
                      </div>
                      <button
                        onClick={() => navigateTo('contact')}
                        className="px-4 py-2 rounded-lg bg-[#C9A45C] hover:bg-[#B89146] text-xs font-bold text-[#21150F] shrink-0 cursor-pointer"
                      >
                        Share Your Feedback
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {testimonials.map((t) => (
                        <div
                          key={t.id}
                          className="p-6 bg-[#F7F3EA] border border-[#C9A45C]/40 rounded-xl space-y-3"
                        >
                          <div className="flex items-center justify-between text-xs text-[#254B37]">
                            <span className="font-bold">{t.dishOrdered}</span>
                            <span className="font-mono font-bold text-[#21150F]">{t.rating} / 5</span>
                          </div>
                          <p className="text-sm text-[#21150F] leading-relaxed">
                            “{t.comment}”
                          </p>
                          <p className="text-xs text-[#3B3029] font-semibold">
                            — {t.authorName} · Verified Guest
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Section 11: Restaurant Location, VIP Newsletter & Local Google SEO */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Newsletter & Special Offers Signup */}
                  <div className="lg:col-span-7 p-6 sm:p-8 rounded-2xl bg-[#21150F] text-[#F7F3EA] border-2 border-[#C9A45C]/60 space-y-4 shadow-lg">
                    <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
                      VIP Guest Club · Daily Specials &amp; Seasonal Offers
                    </span>
                    <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FFFFFF]">
                      Receive Chef&apos;s Daily Specials &amp; Catering Promotions
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F7F3EA]/85 leading-relaxed">
                      Join our Lindenwold guest list to get notified when fresh batches of Achecke
                      with Grill Fish, Cassava Leaf, Rice and Beans with Oxtail, and weekend family
                      platters come out of the kitchen.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        subscribeNewsletter({
                          fullName: subName,
                          email: subEmail,
                          phone: subPhone,
                          consented: subConsent,
                        });
                        if (subConsent && (subEmail.trim() || subPhone.trim())) {
                          setSubName('');
                          setSubEmail('');
                          setSubPhone('');
                        }
                      }}
                      className="space-y-3 pt-1"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={subName}
                          onChange={(e) => setSubName(e.target.value)}
                          placeholder="Your Name"
                          className="px-3.5 py-2.5 rounded-lg bg-[#3B3029] border border-[#C9A45C]/40 text-xs sm:text-sm text-[#FFFFFF] placeholder:text-[#F7F3EA]/60 focus:outline-none focus:border-[#C9A45C]"
                        />
                        <input
                          type="email"
                          value={subEmail}
                          onChange={(e) => setSubEmail(e.target.value)}
                          placeholder="Email Address"
                          className="px-3.5 py-2.5 rounded-lg bg-[#3B3029] border border-[#C9A45C]/40 text-xs sm:text-sm text-[#FFFFFF] placeholder:text-[#F7F3EA]/60 focus:outline-none focus:border-[#C9A45C]"
                        />
                        <input
                          type="tel"
                          value={subPhone}
                          onChange={(e) => setSubPhone(e.target.value)}
                          placeholder="Mobile Phone (Optional)"
                          className="px-3.5 py-2.5 rounded-lg bg-[#3B3029] border border-[#C9A45C]/40 text-xs sm:text-sm text-[#FFFFFF] placeholder:text-[#F7F3EA]/60 focus:outline-none focus:border-[#C9A45C]"
                        />
                      </div>

                      <label className="flex items-start gap-2.5 text-xs text-[#F7F3EA]/85 cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={subConsent}
                          onChange={(e) => setSubConsent(e.target.checked)}
                          className="mt-0.5 accent-[#C9A45C]"
                        />
                        <span>
                          I consent to receive occasional menu updates, Daily Specials alerts, and
                          promotional offers from Faminas African and Americans Restaurant. You may
                          unsubscribe at any time.
                        </span>
                      </label>

                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#C9A45C] hover:bg-[#B89146] text-[#21150F] font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Subscribe for Special Offers
                      </button>
                    </form>
                  </div>

                  {/* Restaurant Location & Local SEO Discovery Box */}
                  <div className="lg:col-span-5 p-6 sm:p-8 rounded-2xl bg-[#FFFFFF] border border-[#C9A45C]/45 space-y-4 shadow-sm">
                    <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                      Visit Us in Lindenwold, New Jersey
                    </span>
                    <h3 className="font-serif-display text-2xl font-bold text-[#21150F]">
                      Location &amp; Google Search Discovery
                    </h3>
                    <div className="space-y-1.5 text-xs sm:text-sm text-[#3B3029]">
                      <p className="font-bold text-[#21150F]">
                        577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA
                      </p>
                      <p>
                        Phone:{' '}
                        <a
                          href="tel:+18565223029"
                          className="font-mono font-bold text-[#254B37] hover:underline"
                        >
                          +1 (856) 522-3029
                        </a>{' '}
                        · Website: <strong>faminasrestaurant.com</strong>
                      </p>
                      <p className="text-xs text-[#3B3029]/85 pt-1">{settings.openingHours}</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {[
                        'African restaurant in Lindenwold NJ',
                        'Sierra Leonean restaurant in New Jersey',
                        'West African food near Lindenwold',
                        'African food in New Jersey',
                        'Sierra Leonean food near me',
                      ].map((kw) => (
                        <button
                          key={kw}
                          type="button"
                          onClick={() => navigateTo('menu')}
                          className="px-2.5 py-1 rounded-md bg-[#F7F3EA] hover:bg-[#C9A45C] border border-[#C9A45C]/40 text-[11px] font-medium text-[#21150F] transition-colors cursor-pointer"
                        >
                          {kw}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* =========================================================
            PAGE 2: ABOUT US
            ========================================================= */}
        {currentPage === 'about' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
            <div className="p-8 rounded-2xl bg-[#21150F] border-2 border-[#C9A45C] text-[#F7F3EA] space-y-4 shadow-lg">
              <div className="pb-2">
                <FaminasLogo size="lg" />
              </div>
              <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-bold block">
                {websiteContent?.about?.subtitle || 'About Faminas African and Americans Restaurant · Lindenwold, New Jersey'}
              </span>
              <h1 className="font-serif-display text-3xl md:text-5xl font-bold text-[#FFFFFF]">
                {websiteContent?.about?.title || 'Where Sierra Leonean Tradition Meets American Hospitality.'}
              </h1>
              <p className="text-sm sm:text-base text-[#F7F3EA]/85 leading-relaxed">
                {websiteContent?.about?.storyParagraph1 ||
                  'At FAMINAS African and Americans Restaurant (577 Blackwood-Clementon Road, Lindenwold, NJ 08021), we celebrate the rich culinary tapestry of West Africa—especially the treasured home-cooked dishes of Sierra Leone—alongside beloved American classics.'}
              </p>
              {websiteContent?.about?.storyParagraph2 && (
                <p className="text-sm sm:text-base text-[#F7F3EA]/85 leading-relaxed pt-2 border-t border-white/10">
                  {websiteContent.about.storyParagraph2}
                </p>
              )}
              {websiteContent?.about?.storyParagraph3 && (
                <p className="text-sm sm:text-base text-[#F7F3EA]/80 leading-relaxed italic">
                  {websiteContent.about.storyParagraph3}
                </p>
              )}
            </div>

            {/* Founder Profile & Culinary Tradition Card */}
            {websiteContent?.about?.founderName && (
              <div className="p-8 bg-[#FFFFFF] border-2 border-[#C9A45C]/60 rounded-2xl shadow-md grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div className="md:col-span-4">
                  <div className="h-64 rounded-xl overflow-hidden border-2 border-[#C9A45C] shadow-lg">
                    <img
                      src={websiteContent.about.founderImage || '/assets/faminas_ceo_haja_yeabu_fofana.jpg'}
                      alt={websiteContent.about.founderName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/faminas_ceo_haja_yeabu_fofana.jpg';
                      }}
                    />
                  </div>
                </div>
                <div className="md:col-span-8 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#254B37] bg-[#254B37]/10 px-3 py-1 rounded-full">
                    {websiteContent.about.founderRole || 'Founder & Head Chef'}
                  </span>
                  <h2 className="font-serif-display text-3xl font-bold text-[#21150F]">
                    {websiteContent.about.founderName}
                  </h2>
                  <p className="text-sm text-[#3B3029] leading-relaxed">
                    {websiteContent.about.founderBio}
                  </p>
                  {websiteContent.about.culinaryTraditionTitle && (
                    <div className="pt-3 border-t border-[#C9A45C]/30 space-y-1">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                        {websiteContent.about.culinaryTraditionTitle}
                      </h4>
                      <p className="text-xs text-[#3B3029]/80">
                        {websiteContent.about.culinaryTraditionText}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Achievement Statistics */}
            {websiteContent?.about?.stats && websiteContent.about.stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {websiteContent.about.stats.map((st, sIdx) => (
                  <div
                    key={sIdx}
                    className="p-5 rounded-2xl bg-[#21150F] border border-[#C9A45C]/50 text-center space-y-1 shadow-sm"
                  >
                    <p className="font-serif-display text-2xl sm:text-3xl font-bold text-[#D4AF37]">
                      {st.value}
                    </p>
                    <p className="text-xs text-[#F7F2EB]/70 font-semibold">{st.label}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-7 bg-[#FFFFFF] border border-[#C9A45C]/50 rounded-2xl shadow-sm space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                  Authentic West African Heritage
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                  The Heart of Sierra Leone &amp; West Africa
                </h2>
                <p className="text-sm text-[#3B3029] leading-relaxed">
                  Our kitchen honours generations of West African culinary craft. Whether you crave
                  finely prepared Cassava Leaf, Potato Leaf (Green), smoky Jollof Rice and Stew,
                  Achecke with Grill Fish and Plantain, Kran Kran Palava Sauce, or Egusi Soup with
                  Foofoo, every dish is slow-simmered for authentic depth of flavour.
                </p>
              </div>

              <div className="p-7 bg-[#FFFFFF] border border-[#C9A45C]/50 rounded-2xl shadow-sm space-y-3">
                <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                  Classic American Grill
                </span>
                <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                  Beloved American Favourites
                </h2>
                <p className="text-sm text-[#3B3029] leading-relaxed">
                  We believe good food brings everyone to the same table. Alongside our African
                  specialties, our grill serves flame-seared Hamburgers and Fries, Philly-style
                  Cheese Steak with Fries, crispy Chicken Wings, creamy Mac and Cheese, and velvety
                  Mash Potatoes.
                </p>
              </div>
            </div>

            <div className="p-8 bg-[#21150F] border-2 border-[#C9A45C] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-[#F7F3EA]">
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[#FFFFFF]">
                  Ready to Experience Faminas?
                </h3>
                <p className="text-sm text-[#F7F3EA]/80 mt-1">
                  Explore our full digital menu or order freshly prepared African and American dishes online.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 shrink-0">
                <button
                  onClick={() => navigateTo('menu')}
                  className="px-5 py-2.5 rounded-lg bg-[#C9A45C] text-[#21150F] font-bold text-xs uppercase tracking-wider hover:bg-[#B89146] transition-colors cursor-pointer"
                >
                  Explore Our Menu
                </button>
                <button
                  onClick={() => navigateTo('ordering')}
                  className="px-5 py-2.5 rounded-lg bg-[#254B37] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider hover:bg-[#1D3B2B] border border-[#C9A45C]/50 transition-colors cursor-pointer"
                >
                  Order Online
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGES 3 & 4: OUR MENU & ONLINE ORDERING (#F7F3EA WARM IVORY)
            ========================================================= */}
        {(currentPage === 'menu' || currentPage === 'ordering') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#C9A45C]/45">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                  {currentPage === 'ordering'
                    ? 'Direct Online Ordering · Pickup & Delivery'
                    : 'Faminas Digital & Print Food Menu'}
                </span>
                <h1 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#21150F] mt-1">
                  {currentPage === 'ordering'
                    ? 'Build Your Order Online'
                    : 'Authentic African & American Menu'}
                </h1>
              </div>

              {/* Search & Sort Bar */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#3B3029]/60 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search Achecke, Cassava, Jollof, Burger..."
                    className="pl-9 pr-4 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#C9A45C]/55 text-xs text-[#21150F] placeholder:text-[#3B3029]/60 w-64 focus:outline-none focus:border-[#21150F] shadow-xs"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort menu items"
                  className="px-3.5 py-2.5 rounded-lg bg-[#FFFFFF] border border-[#C9A45C]/55 text-xs font-medium text-[#21150F] shadow-xs"
                >
                  <option value="popular">Sort: Popular Favourites</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Name: A to Z</option>
                </select>

                <button
                  type="button"
                  onClick={() => setOnlyFavourites((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    onlyFavourites
                      ? 'bg-[#C9A45C] text-[#21150F] border-[#C9A45C]'
                      : 'bg-[#FFFFFF] text-[#21150F] border-[#C9A45C]/55 hover:bg-[#21150F] hover:text-[#FFFFFF]'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  Saved ({favouriteIds.length})
                </button>
              </div>
            </div>

            {/* Official Two-Page Print-Ready Menu Sheet + Interactive Grid Switcher */}
            {currentPage === 'menu' && (
              <div className="space-y-6 pb-8 border-b border-[#C9A45C]/35">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-[#21150F] border border-[#C9A45C]/50">
                    <button
                      type="button"
                      onClick={() => setMenuDisplayTab('interactive-grid')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        menuDisplayTab === 'interactive-grid'
                          ? 'bg-[#C9A45C] text-[#21150F]'
                          : 'text-[#F7F3EA]/80 hover:text-[#FFFFFF]'
                      }`}
                    >
                      Interactive Online Menu Cards ({menuItems.length} Dishes)
                    </button>
                    <button
                      type="button"
                      onClick={() => setMenuDisplayTab('print-sheet')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        menuDisplayTab === 'print-sheet'
                          ? 'bg-[#C9A45C] text-[#21150F]'
                          : 'text-[#F7F3EA]/80 hover:text-[#FFFFFF]'
                      }`}
                    >
                      Official 2-Page Print Menu (Page 1 &amp; 2 + PDF + Editable)
                    </button>
                  </div>
                </div>

                {menuDisplayTab === 'print-sheet' && (
                  <PrintReadyMenuSheet onSelectDish={openFoodDetails} />
                )}
              </div>
            )}

            {/* Interactive Cuisine Group, Category & Quick Filter Tabs + Animated Card Grid */}
            {(currentPage === 'ordering' || menuDisplayTab === 'interactive-grid') && (
              <>
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Cuisine Group Tabs (Translucent Frosted Glass Capsule) */}
                    <div className="flex flex-wrap items-center gap-1.5 p-1.5 faminas-glass-light-card rounded-2xl border border-[#C9A45C]/50 shadow-sm">
                      {(
                        [
                          'All',
                          'African & West African',
                          'American Favourites',
                          'Sides & Drinks',
                        ] as const
                      ).map((grp) => (
                        <button
                          key={grp}
                          onClick={() => {
                            setSelectedCuisineGroup(grp);
                            setSelectedCategoryId('all');
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                            selectedCuisineGroup === grp
                              ? 'bg-gradient-to-r from-[#21150F] to-[#3B2215] text-[#C9A45C] border border-[#C9A45C]/60 shadow-[0_4px_16px_rgba(33,21,15,0.25)] scale-[1.02]'
                              : 'text-[#3B3029] hover:text-[#21150F] hover:bg-black/[0.04]'
                          }`}
                        >
                          {grp}
                        </button>
                      ))}
                    </div>

                    {/* Quick Filter Pills & Layout Toggle */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="inline-flex items-center gap-1 p-1.5 faminas-glass-light-card rounded-2xl border border-[#C9A45C]/50 shadow-sm">
                        {[
                          { id: 'all', label: 'All Dishes' },
                          { id: 'popular', label: 'Popular Dishes' },
                          { id: 'signature', label: 'Signature Specials' },
                        ].map((qf) => (
                          <button
                            key={qf.id}
                            type="button"
                            onClick={() => setQuickFilterMode(qf.id as any)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                              quickFilterMode === qf.id
                                ? 'bg-gradient-to-r from-[#254B37] to-[#1A3828] text-[#FFFFFF] shadow-[0_4px_14px_rgba(37,75,55,0.3)]'
                                : 'text-[#3B3029] hover:text-[#21150F] hover:bg-black/[0.04]'
                            }`}
                          >
                            {qf.label}
                          </button>
                        ))}
                      </div>

                      <div className="inline-flex items-center gap-1 p-1.5 faminas-glass-light-card rounded-2xl border border-[#C9A45C]/50 shadow-sm">
                        <button
                          type="button"
                          onClick={() => setMenuLayoutStyle('cards')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                            menuLayoutStyle === 'cards'
                              ? 'bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] text-[#21150F] shadow-[0_4px_14px_rgba(201,164,92,0.3)]'
                              : 'text-[#3B3029] hover:text-[#21150F] hover:bg-black/[0.04]'
                          }`}
                        >
                          Photo Cards
                        </button>
                        <button
                          type="button"
                          onClick={() => setMenuLayoutStyle('rows')}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${
                            menuLayoutStyle === 'rows'
                              ? 'bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] text-[#21150F] shadow-[0_4px_14px_rgba(201,164,92,0.3)]'
                              : 'text-[#3B3029] hover:text-[#21150F] hover:bg-black/[0.04]'
                          }`}
                        >
                          Horizontal Listings
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 7 Official Category Filter Tabs */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    <button
                      onClick={() => setSelectedCategoryId('all')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategoryId === 'all'
                          ? 'bg-gradient-to-r from-[#254B37] to-[#1A3828] text-[#FFFFFF] border-2 border-[#C9A45C] shadow-[0_6px_20px_rgba(37,75,55,0.35)] scale-[1.02]'
                          : 'faminas-glass-light-card text-[#21150F] hover:bg-[#21150F] hover:text-[#FFFFFF] border border-[#C9A45C]/50'
                      }`}
                    >
                      All 7 Categories ({menuItems.length})
                    </button>
                    {categories
                      .filter(
                        (c) =>
                          selectedCuisineGroup === 'All' || c.cuisineGroup === selectedCuisineGroup
                      )
                      .map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setSelectedCategoryId(cat.id)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap shrink-0 cursor-pointer ${
                            selectedCategoryId === cat.id
                              ? 'bg-gradient-to-r from-[#254B37] to-[#1A3828] text-[#FFFFFF] border-2 border-[#C9A45C] shadow-[0_6px_20px_rgba(37,75,55,0.35)] scale-[1.02]'
                              : 'faminas-glass-light-card text-[#21150F] hover:bg-[#21150F] hover:text-[#FFFFFF] border border-[#C9A45C]/50'
                          }`}
                        >
                          {cat.name.replace(/^Category [A-G]:\s*/i, '')}
                        </button>
                      ))}
                  </div>
                </div>

                {/* Menu Grid Organized by the 7 Categories */}
                {filteredMenuItems.length === 0 ? (
                  <div
                    key={`empty-${menuAnimationKey}`}
                    className="p-12 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl text-center space-y-3 animate-category-fade shadow-sm"
                  >
                    <p className="text-base font-semibold text-[#21150F]">
                      No dishes match your current filter or search query.
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategoryId('all');
                        setSelectedCuisineGroup('All');
                        setQuickFilterMode('all');
                        setOnlyFavourites(false);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-[#C9A45C] text-[#21150F] text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Reset Menu Filters
                    </button>
                  </div>
                ) : menuLayoutStyle === 'rows' ? (
                  <div
                    key={`rows-${menuAnimationKey}`}
                    className="space-y-8 animate-category-fade"
                  >
                    {categories.map((cat) => {
                      const catItems = filteredMenuItems.filter((it) => it.categoryId === cat.id);
                      if (catItems.length === 0) return null;
                      return (
                        <section
                          key={cat.id}
                          className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#C9A45C]/50 shadow-sm space-y-4"
                        >
                          <div className="border-b border-[#C9A45C]/35 pb-3 flex flex-wrap items-baseline justify-between gap-2">
                            <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                              {cat.name.replace(/^Category [A-G]:\s*/i, '')}
                            </h2>
                            <span className="text-xs text-[#3B3029]">{cat.description}</span>
                          </div>
                          <div className="divide-y divide-[#C9A45C]/25">
                            {catItems.map((item, idx) => {
                              const thumbSrc = getCulinaryVisualUrl(
                                item.imageKey,
                                item.name,
                                item.categoryName,
                                item.imageUrl
                              );
                              return (
                                <div
                                  key={item.id}
                                  style={{ animationDelay: `${Math.min(idx * 45, 300)}ms` }}
                                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-up-card"
                                >
                                  <div
                                    onClick={() => openFoodDetails(item)}
                                    className="flex items-center gap-3.5 cursor-pointer group"
                                  >
                                    <div className="w-16 h-12 rounded-lg overflow-hidden border border-[#C9A45C]/60 shrink-0">
                                      <img
                                        src={thumbSrc}
                                        alt={item.name}
                                        loading="lazy"
                                        className="w-full h-full object-cover food-card-image-zoom group-hover:scale-108 transition-transform duration-500"
                                      />
                                    </div>
                                    <div>
                                      <h3 className="font-serif-display text-lg font-bold text-[#21150F] group-hover:text-[#254B37] transition-colors">
                                        {item.name}
                                      </h3>
                                      <p className="text-xs text-[#3B3029] line-clamp-1">
                                        {item.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0">
                                    <span className="font-mono text-base sm:text-lg font-extrabold text-[#21150F] tabular-nums mr-1">
                                      {settings.currencySymbol}
                                      {item.price.toFixed(2)}
                                    </span>
                                    <button
                                      type="button"
                                      disabled={!item.isAvailable}
                                      onClick={() => addToCart(item, 1)}
                                      className="h-[42px] px-3.5 rounded-[10px] bg-[#21150F] hover:bg-[#3B3029] text-[#FFFFFF] border border-[#21150F] hover:border-[#C9A45C] font-bold text-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      <ShoppingBag className="w-4 h-4 text-[#C9A45C]" />
                                      Add to Cart
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openFoodDetails(item)}
                                      className="h-[42px] px-3.5 rounded-[10px] bg-[#F7F3EA] hover:bg-[#EDE4D3] border border-[#C9A45C] text-xs font-bold text-[#21150F] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                      View Details
                                    </button>
                                    {settings.whatsappOrderingEnabled && item.isAvailable && (
                                      <button
                                        type="button"
                                        onClick={() => handleSingleItemWhatsApp(item)}
                                        title={`Quick Order ${item.name} via WhatsApp`}
                                        aria-label={`Quick Order ${item.name} via WhatsApp`}
                                        className="w-[42px] h-[42px] rounded-[10px] bg-[#254B37] hover:bg-[#1D3B2B] text-[#FFFFFF] border-2 border-[#C9A45C] inline-flex items-center justify-center transition-all cursor-pointer shrink-0"
                                      >
                                        <MessageCircle className="w-4 h-4 text-[#FFFFFF]" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : selectedCategoryId === 'all' &&
                  selectedCuisineGroup === 'All' &&
                  quickFilterMode === 'all' &&
                  !searchQuery.trim() &&
                  !onlyFavourites ? (
                  <div
                    key={`all-cats-${menuAnimationKey}`}
                    className="space-y-14 animate-category-fade"
                  >
                    {categories.map((cat) => {
                      const catItems = filteredMenuItems.filter((it) => it.categoryId === cat.id);
                      if (catItems.length === 0) return null;
                      return (
                        <section
                          key={cat.id}
                          className="space-y-6 pt-6 first:pt-0 border-t first:border-t-0 border-[#C9A45C]/35 animate-category-fade"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                            <div>
                              <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                                {cat.cuisineGroup} · {catItems.length}{' '}
                                {catItems.length === 1 ? 'Dish' : 'Dishes'}
                              </span>
                              <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#21150F] mt-0.5">
                                {cat.name.replace(/^Category [A-G]:\s*/i, '')}
                              </h2>
                              <p className="text-xs sm:text-sm text-[#3B3029] mt-1">
                                {cat.description}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {catItems.map((item, idx) => (
                              <FoodCard
                                key={item.id}
                                item={item}
                                index={idx}
                                animationKey={`${menuAnimationKey}_${cat.id}`}
                                currencySymbol={settings.currencySymbol}
                                isFavourite={favouriteIds.includes(item.id)}
                                whatsappEnabled={settings.whatsappOrderingEnabled}
                                onAddToCart={(it) => addToCart(it, 1)}
                                onOrderNow={(it) => {
                                  addToCart(it, 1);
                                  navigateTo('checkout');
                                }}
                                onViewDetails={openFoodDetails}
                                onToggleFavourite={toggleFavourite}
                                onWhatsAppOrder={handleSingleItemWhatsApp}
                                onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div
                    key={`filtered-grid-${menuAnimationKey}`}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-category-fade"
                  >
                    {filteredMenuItems.map((item, idx) => (
                      <FoodCard
                        key={item.id}
                        item={item}
                        index={idx}
                        animationKey={menuAnimationKey}
                        currencySymbol={settings.currencySymbol}
                        isFavourite={favouriteIds.includes(item.id)}
                        whatsappEnabled={settings.whatsappOrderingEnabled}
                        onAddToCart={(it) => addToCart(it, 1)}
                        onOrderNow={(it) => {
                          addToCart(it, 1);
                          navigateTo('checkout');
                        }}
                        onViewDetails={openFoodDetails}
                        onToggleFavourite={toggleFavourite}
                        onWhatsAppOrder={handleSingleItemWhatsApp}
                        onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Restaurant Contact Banner on the Menu Page */}
            <div className="mt-14 p-8 rounded-2xl bg-[#21150F] border-2 border-[#C9A45C] shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 text-[#F7F3EA]">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <FaminasLogo size="sm" />
                </div>
                <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FFFFFF] pt-1">
                  FAMINAS AFRICAN AND AMERICANS RESTAURANT
                </h3>
                <p className="text-sm text-[#C9A45C] font-semibold tracking-wide">
                  Good Food Brings People Together.
                </p>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm text-[#F7F3EA]/90 pt-1">
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C9A45C]" />
                    577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA
                  </span>
                  <a
                    href="tel:+18565223029"
                    className="inline-flex items-center gap-1.5 font-mono font-bold text-[#C9A45C] hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    Phone: +1 (856) 522-3029
                  </a>
                  <span className="inline-flex items-center gap-1.5 text-[#F7F3EA]/80">
                    Website: faminasrestaurant.com
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="tel:+18565223029"
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#C9A45C] text-[#21150F] font-bold text-xs uppercase tracking-wider hover:bg-[#B89146] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call +1 (856) 522-3029
                </a>
                {settings.whatsappOrderingEnabled && (
                  <a
                    href={generateWhatsAppLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-[#254B37] text-[#FFFFFF] font-bold text-xs uppercase tracking-wider hover:bg-[#1D3B2B] border border-[#C9A45C]/50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-[#C9A45C]" />
                    WhatsApp Order
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 5: FOOD DETAILS (Contiguous Purchase Module)
            ========================================================= */}
        {currentPage === 'food-details' && selectedDish && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <button
              onClick={() => navigateTo('menu')}
              className="text-xs font-bold text-[#254B37] hover:underline mb-6 inline-block cursor-pointer"
            >
              ← Back to Full Digital Menu
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start bg-[#FFFFFF] border-2 border-[#C9A45C]/60 rounded-2xl p-6 lg:p-10 shadow-md">
              {/* Left Sticky Visual Frame */}
              <div className="lg:col-span-6 rounded-xl overflow-hidden border-2 border-[#C9A45C] bg-[#21150F] group">
                <img
                  src={getCulinaryVisualUrl(
                    selectedDish.imageKey,
                    selectedDish.name,
                    selectedDish.categoryName,
                    selectedDish.imageUrl
                  )}
                  alt={selectedDish.name}
                  referrerPolicy="no-referrer"
                  className="w-full aspect-[4/3] object-cover food-card-image-zoom group-hover:scale-108 transition-transform duration-500"
                />
              </div>

              {/* Right Contiguous Purchase Module */}
              <div className="lg:col-span-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#3B3029]">
                    <span className="uppercase tracking-wider text-[#254B37] font-bold">
                      {selectedDish.categoryName}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{selectedDish.cuisineType}</span>
                    <span aria-hidden="true">·</span>
                    <span>Spice: {selectedDish.spiceLevel}</span>
                    <span aria-hidden="true">·</span>
                    <span>~{selectedDish.prepTimeMinutes} mins</span>
                  </div>

                  <div className="flex items-baseline justify-between gap-4">
                    <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#21150F]">
                      {selectedDish.name}
                    </h1>
                    <span className="font-mono text-2xl font-extrabold text-[#21150F] tabular-nums shrink-0">
                      {selectedDish.price > 0
                        ? `${settings.currencySymbol}${selectedDish.price.toFixed(2)}`
                        : 'Inquire / Order'}
                    </span>
                  </div>

                  <p className="text-sm md:text-base text-[#3B3029] leading-relaxed pt-2">
                    {selectedDish.description}
                  </p>
                  {selectedDish.dietaryNotes && (
                    <p className="text-xs font-semibold text-[#254B37] pt-1">
                      {selectedDish.dietaryNotes}
                    </p>
                  )}
                </div>

                {/* Quantity & Special Instructions */}
                <div className="space-y-4 pt-4 border-t border-[#C9A45C]/35">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#21150F]">Select Quantity</span>
                    <div className="flex items-center gap-3 bg-[#F7F3EA] border border-[#C9A45C]/60 rounded-lg px-2 py-1">
                      <button
                        type="button"
                        onClick={() => setDetailQty((q) => Math.max(1, q - 1))}
                        className="p-1 text-[#21150F] hover:text-[#254B37]"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="font-mono text-sm font-bold text-[#21150F] tabular-nums w-6 text-center">
                        {detailQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setDetailQty((q) => Math.min(50, q + 1))}
                        className="p-1 text-[#21150F] hover:text-[#254B37]"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3B3029] mb-1.5">
                      Special Preparation Instructions (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={300}
                      value={detailInstructions}
                      onChange={(e) => setDetailInstructions(e.target.value)}
                      placeholder="e.g. Extra pepper sauce on the side, mild spice..."
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/55 text-sm text-[#21150F]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <button
                      type="button"
                      disabled={!selectedDish.isAvailable}
                      onClick={() => {
                        addToCart(selectedDish, detailQty, detailInstructions);
                        navigateTo('cart');
                      }}
                      className="flex-1 py-3.5 px-5 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-sm hover:bg-[#B89146] transition-colors whitespace-nowrap shrink-0 tabular-nums cursor-pointer"
                    >
                      Add to Cart
                      {selectedDish.price > 0
                        ? ` · ${settings.currencySymbol}${(selectedDish.price * detailQty).toFixed(2)}`
                        : ''}
                    </button>

                    {settings.whatsappOrderingEnabled && (
                      <button
                        type="button"
                        onClick={() => handleSingleItemWhatsApp(selectedDish)}
                        className="inline-flex items-center gap-2 py-3.5 px-5 rounded-xl bg-[#254B37] hover:bg-[#1D3B2B] text-[#FFFFFF] font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <MessageCircle className="w-4 h-4 text-[#C9A45C]" />
                        Order via WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 6: GALLERY
            ========================================================= */}
        {currentPage === 'gallery' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                Visual Culinary Showcase · Videos &amp; Natural Dish Photography
              </span>
              <h1 className="font-serif-display text-4xl font-bold text-[#21150F] mt-1">
                Faminas Food &amp; Live Kitchen Gallery
              </h1>
              <p className="text-sm text-[#3B3029] mt-1">
                Watch our real kitchen videos and explore every dish photographed separately with its official menu name and price written underneath.
              </p>
            </div>

            <div className="-mx-4 sm:-mx-6 lg:-mx-8">
              <CulinaryVideoShowcase
                menuItems={menuItems}
                onOrderDish={(it) => addToCart(it, 1)}
                onViewDishDetails={openFoodDetails}
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {(
                [
                  'All',
                  'Sierra Leonean Dishes',
                  'West African Traditional',
                  'American Meals',
                  'Seafood',
                ] as const
              ).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedGalleryCat(cat)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    selectedGalleryCat === cat
                      ? 'bg-[#21150F] text-[#C9A45C] border border-[#C9A45C]'
                      : 'bg-[#FFFFFF] text-[#3B3029] hover:text-[#21150F] border border-[#C9A45C]/35 shadow-sm'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div
              key={`gallery-${selectedGalleryCat}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-category-fade"
            >
              {menuItems
                .filter((item) => {
                  if (selectedGalleryCat === 'All') return true;
                  if (selectedGalleryCat === 'Sierra Leonean Dishes') {
                    return item.cuisineType === 'Sierra Leonean';
                  }
                  if (selectedGalleryCat === 'West African Traditional') {
                    return (
                      item.cuisineType === 'West African' ||
                      item.cuisineType === 'Small Chops' ||
                      item.cuisineType === 'Natural Drinks'
                    );
                  }
                  if (selectedGalleryCat === 'American Meals') {
                    return item.cuisineType === 'American';
                  }
                  if (selectedGalleryCat === 'Seafood') {
                    return (
                      item.cuisineType === 'Seafood' ||
                      item.name.toLowerCase().includes('fish')
                    );
                  }
                  return true;
                })
                .map((item, idx) => (
                  <FoodCard
                    key={item.id}
                    item={item}
                    index={idx}
                    animationKey={`gallery-${selectedGalleryCat}`}
                    currencySymbol={settings.currencySymbol}
                    isFavourite={favouriteIds.includes(item.id)}
                    whatsappEnabled={settings.whatsappOrderingEnabled}
                    onAddToCart={(it) => addToCart(it, 1)}
                    onViewDetails={openFoodDetails}
                    onToggleFavourite={toggleFavourite}
                    onWhatsAppOrder={handleSingleItemWhatsApp}
                    onUpdatePrice={isAdmin ? updateItemPrice : undefined}
                  />
                ))}
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 7: CATERING AND EVENTS
            ========================================================= */}
        {currentPage === 'catering' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
            <div className="space-y-3">
              <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                {websiteContent?.catering?.heroSubtitle || 'Private Events · Weddings · Corporate Banquets'}
              </span>
              <h1 className="font-serif-display text-4xl font-bold text-[#21150F]">
                {websiteContent?.catering?.heroTitle || 'Catering & Special Events'}
              </h1>
              <p className="text-sm md:text-base text-[#3B3029] max-w-2xl leading-relaxed">
                {websiteContent?.catering?.description ||
                  'Treat your guests to an unforgettable spread of Sierra Leonean Jollof Rice, Cassava Leaves, Fried Red Snapper, Peppered Goat Meat, and American crowd-pleasers.'}
              </p>
            </div>

            {/* Dynamic Catering Packages Grid */}
            {websiteContent?.catering?.packages && websiteContent.catering.packages.length > 0 && (
              <div className="space-y-4">
                <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                  Curated Catering Feast Packages
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {websiteContent.catering.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-6 rounded-2xl bg-[#FFFFFF] border-2 border-[#C9A45C]/50 shadow-md flex flex-col justify-between space-y-4 relative"
                    >
                      {pkg.badge && (
                        <span className="absolute -top-3 right-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#254B37] text-[#FFFFFF] shadow-sm">
                          {pkg.badge}
                        </span>
                      )}
                      <div className="space-y-2">
                        <h3 className="font-serif-display text-xl font-bold text-[#21150F]">
                          {pkg.name}
                        </h3>
                        <p className="font-mono text-2xl font-extrabold text-[#C9A45C]">
                          ${pkg.pricePerPerson.toFixed(2)}{' '}
                          <span className="text-xs text-[#3B3029]/70 font-sans font-normal">/ guest</span>
                        </p>
                        <p className="text-xs text-[#3B3029] leading-relaxed">
                          {pkg.description}
                        </p>
                        <div className="pt-3 border-t border-[#C9A45C]/25 space-y-1.5">
                          {pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} className="flex items-start gap-2 text-xs text-[#21150F]">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#254B37] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCatFoodPrefs(`Package Selection: ${pkg.name} ($${pkg.pricePerPerson}/person)`);
                          const formEl = document.getElementById('cateringQuoteForm');
                          if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#21150F] hover:bg-[#341F14] text-[#F7F3EA] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Select This Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form
              id="cateringQuoteForm"
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) {
                  await signInWithGoogle();
                  return;
                }
                await submitCateringEnquiry({
                  fullName: catName,
                  phone: catPhone,
                  email: catEmail,
                  eventType: catEventType,
                  eventDate: catDate,
                  guestCount: catGuests,
                  foodPreferences: catFoodPrefs,
                  additionalRequirements: catNotes,
                });
                setCateringSubmitted(true);
              }}
              className="p-8 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-lg space-y-5"
            >
              <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                Request a Custom Catering Quote
              </h2>

              {!user && (
                <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#C9A45C]/50 flex items-center justify-between gap-4">
                  <span className="text-xs text-[#3B3029] font-medium">
                    Sign in with Google to save and track your catering enquiry in our database.
                  </span>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="px-4 py-2 rounded-lg bg-[#C9A45C] text-[#21150F] text-xs font-bold shrink-0 cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={catPhone}
                    onChange={(e) => setCatPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={catEmail}
                    onChange={(e) => setCatEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">Event Type *</label>
                  <input
                    type="text"
                    required
                    value={catEventType}
                    onChange={(e) => setCatEventType(e.target.value)}
                    placeholder="Wedding, Birthday, Corporate, Graduation..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">Event Date *</label>
                  <input
                    type="date"
                    required
                    value={catDate}
                    onChange={(e) => setCatDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                    Estimated Number of Guests *
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={5000}
                    required
                    value={catGuests}
                    onChange={(e) => setCatGuests(parseInt(e.target.value, 10) || 25)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                  Food Preferences (African &amp; American Dishes) *
                </label>
                <textarea
                  rows={3}
                  required
                  value={catFoodPrefs}
                  onChange={(e) => setCatFoodPrefs(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                  Additional Requirements / Dietary Notes
                </label>
                <textarea
                  rows={2}
                  value={catNotes}
                  onChange={(e) => setCatNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-sm hover:bg-[#B89146] transition-colors cursor-pointer"
              >
                Submit Catering Enquiry
              </button>

              {cateringSubmitted && (
                <p className="text-xs font-semibold text-[#254B37] pt-2">
                  Thank you! Your catering enquiry has been saved to our database and sent to the
                  Faminas events team.
                </p>
              )}
            </form>
          </div>
        )}

        {/* =========================================================
            PAGE 8: CONTACT US & VERIFIED REVIEW SUBMISSION
            ========================================================= */}
        {currentPage === 'contact' && (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                  {websiteContent?.contact?.subheading || 'Visit or Reach Out'}
                </span>
                <h1 className="font-serif-display text-4xl font-bold text-[#21150F] mt-1">
                  {websiteContent?.contact?.heading || 'Contact Faminas Restaurant'}
                </h1>
              </div>

              <div className="space-y-4 p-6 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#254B37] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#21150F]">Restaurant Address</h3>
                    <p className="text-xs text-[#3B3029] mt-0.5">
                      {websiteContent?.contact?.address || settings.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#254B37] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#21150F]">Phone &amp; WhatsApp</h3>
                    <p className="text-xs text-[#3B3029] mt-0.5">
                      Phone:{' '}
                      <a
                        href={`tel:${(websiteContent?.contact?.phone || settings.phone).replace(/[^0-9+]/g, '')}`}
                        className="text-[#21150F] font-bold hover:text-[#254B37] hover:underline font-mono"
                      >
                        {websiteContent?.contact?.phone || settings.phone}
                      </a>
                      {websiteContent?.contact?.whatsappNumber && (
                        <span className="ml-3 text-[#254B37] font-semibold">
                          · WhatsApp: {websiteContent.contact.whatsappNumber}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#254B37] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-bold text-[#21150F]">Website &amp; Email</h3>
                    <p className="text-xs text-[#3B3029] mt-0.5">
                      faminasrestaurant.com · {websiteContent?.contact?.email || settings.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-[#254B37] shrink-0 mt-0.5" />
                  <div className="w-full">
                    <h3 className="text-sm font-bold text-[#21150F] mb-1">Dining &amp; Takeout Hours</h3>
                    {websiteContent?.contact?.openingHours && websiteContent.contact.openingHours.length > 0 ? (
                      <div className="space-y-1 text-xs text-[#3B3029]">
                        {websiteContent.contact.openingHours.map((oh, oIdx) => (
                          <div key={oIdx} className="flex justify-between max-w-xs">
                            <span className="font-medium">{oh.days}:</span>
                            <span className="font-mono">{oh.hours}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#3B3029] mt-0.5">{settings.openingHours}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Interactive Google Maps Embed */}
              {websiteContent?.contact?.googleMapsEmbedUrl && (
                <div className="rounded-2xl overflow-hidden border border-[#C9A45C]/45 shadow-md h-64">
                  <iframe
                    src={websiteContent.contact.googleMapsEmbedUrl}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={false}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Faminas Restaurant Map Location"
                  />
                </div>
              )}
            </div>

            {/* Verified Guest Review Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!user) {
                  await signInWithGoogle();
                  return;
                }
                await submitTestimonial({
                  authorName: revName,
                  dishOrdered: revDish,
                  rating: revRating,
                  comment: revComment,
                });
                setRevComment('');
              }}
              className="p-6 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-4"
            >
              <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                Share a Verified Dining Review
              </h2>
              <p className="text-xs text-[#3B3029]">
                We never display fake testimonials. Sign in with Google to submit your genuine
                feedback to our restaurant guestbook.
              </p>

              <input
                type="text"
                required
                placeholder="Your Name"
                value={revName}
                onChange={(e) => setRevName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={revDish}
                  onChange={(e) => setRevDish(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                >
                  {menuItems.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  value={revRating}
                  onChange={(e) => setRevRating(parseInt(e.target.value, 10))}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                >
                  <option value={5}>5 / 5 — Exceptional</option>
                  <option value={4}>4 / 5 — Great</option>
                  <option value={3}>3 / 5 — Good</option>
                  <option value={2}>2 / 5 — Fair</option>
                  <option value={1}>1 / 5 — Needs Improvement</option>
                </select>
              </div>
              <textarea
                rows={3}
                required
                minLength={5}
                maxLength={500}
                placeholder="Tell us about your meal..."
                value={revComment}
                onChange={(e) => setRevComment(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-xs hover:bg-[#B89146] transition-colors cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                Submit Verified Review
              </button>
            </form>
          </div>
        )}

        {/* =========================================================
            PAGE 9: SHOPPING CART
            ========================================================= */}
        {currentPage === 'cart' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <div className="flex items-center justify-between border-b border-[#C9A45C]/40 pb-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#254B37] font-bold">
                  Your Order Selection
                </span>
                <h1 className="font-serif-display text-4xl font-bold text-[#21150F] mt-1">
                  Shopping Cart ({cartItemCount})
                </h1>
              </div>
              <button
                onClick={() => navigateTo('menu')}
                className="text-xs font-bold text-[#254B37] hover:underline cursor-pointer"
              >
                + Add More Dishes
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="p-12 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md text-center space-y-4">
                <ShoppingBag className="w-10 h-10 text-[#C9A45C] mx-auto" />
                <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                  Your Order Bag is Empty
                </h2>
                <p className="text-sm text-[#3B3029] max-w-md mx-auto">
                  Explore our authentic Sierra Leonean Jollof Rice, Cassava Leaves, Fufu, and
                  classic American dishes to start your order.
                </p>
                <button
                  onClick={() => navigateTo('menu')}
                  className="px-6 py-3 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-xs cursor-pointer"
                >
                  Browse Full Menu
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.menuItem.id}
                      className="p-5 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif-display text-xl font-bold text-[#21150F]">
                            {item.menuItem.name}
                          </h3>
                          <span className="font-mono text-sm font-bold text-[#21150F] tabular-nums">
                            {settings.currencySymbol}
                            {(item.menuItem.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-[#3B3029]/80">
                          {settings.currencySymbol}
                          {item.menuItem.price.toFixed(2)} each · {item.menuItem.categoryName}
                        </p>
                        <input
                          type="text"
                          value={item.specialInstructions}
                          onChange={(e) =>
                            updateCartInstructions(item.menuItem.id, e.target.value)
                          }
                          placeholder="Add special instructions for this dish..."
                          className="w-full mt-2 px-3 py-1.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/40 text-xs text-[#21150F]"
                        />
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-2 bg-[#F7F3EA] border border-[#C9A45C]/45 rounded-lg px-2 py-1">
                          <button
                            onClick={() =>
                              updateCartQuantity(item.menuItem.id, item.quantity - 1)
                            }
                            className="p-1 text-[#21150F] hover:text-[#254B37]"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-mono text-xs font-bold text-[#21150F] tabular-nums w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(item.menuItem.id, item.quantity + 1)
                            }
                            className="p-1 text-[#21150F] hover:text-[#254B37]"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.menuItem.id)}
                          aria-label="Remove item"
                          className="p-2 rounded-lg text-[#9B2C2C] hover:bg-[#9B2C2C]/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary Box */}
                <div className="lg:col-span-4 p-6 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-4 h-fit">
                  <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                    Order Summary
                  </h2>
                  <div className="space-y-2 text-sm border-b border-[#C9A45C]/30 pb-4">
                    <div className="flex justify-between">
                      <span className="text-[#3B3029]">Item Subtotal</span>
                      <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                        {settings.currencySymbol}
                        {cartSubtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#3B3029]">
                        Delivery Charge ({fulfillmentType})
                      </span>
                      <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                        {settings.currencySymbol}
                        {calculatedDeliveryFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#3B3029]">
                        Applicable Tax ({settings.taxRatePercent}%)
                      </span>
                      <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                        {settings.currencySymbol}
                        {calculatedTax.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-baseline text-base font-bold text-[#21150F]">
                    <span>Estimated Total</span>
                    <span className="font-mono text-xl text-[#21150F] tabular-nums">
                      {settings.currencySymbol}
                      {calculatedTotal.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => navigateTo('checkout')}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-xs hover:bg-[#B89146] transition-colors cursor-pointer"
                  >
                    Proceed to Checkout
                  </button>

                  {settings.whatsappOrderingEnabled && (
                    <a
                      href={generateWhatsAppLink({ fulfillmentType })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#254B37] hover:bg-[#1D3B2B] text-[#FFFFFF] font-bold text-xs transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#C9A45C]" />
                      Order Summary via WhatsApp
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================
            PAGE 10: CHECKOUT
            ========================================================= */}
        {currentPage === 'checkout' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-serif-display text-4xl font-bold text-[#21150F] mb-8">
              Checkout &amp; Order Confirmation
            </h1>

            <form
              onSubmit={handleCheckoutSubmit}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-7 p-6 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-5">
                {!user && (
                  <div className="p-4 rounded-xl bg-[#F7F3EA] border border-[#C9A45C]/50 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-[#21150F]">
                        Sign In Required for Secure Order Tracking
                      </p>
                      <p className="text-xs text-[#3B3029] mt-0.5">
                        Sign in with Google so your order is securely linked to your account.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={signInWithGoogle}
                      className="px-4 py-2 rounded-lg bg-[#C9A45C] text-[#21150F] text-xs font-bold shrink-0 cursor-pointer"
                    >
                      Sign In
                    </button>
                  </div>
                )}

                {checkoutError && (
                  <div className="p-3.5 rounded-lg bg-[#9B2C2C]/10 border border-[#9B2C2C]/40 text-xs font-semibold text-[#9B2C2C]">
                    {checkoutError}
                  </div>
                )}

                {/* Fulfillment Selection */}
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-2">
                    Select Fulfillment Preference *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {settings.pickupEnabled && (
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('pickup')}
                        className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          fulfillmentType === 'pickup'
                            ? 'bg-[#21150F] text-[#C9A45C] border-[#21150F]'
                            : 'bg-[#F7F3EA] text-[#3B3029] border-[#C9A45C]/40'
                        }`}
                      >
                        Restaurant Pickup
                      </button>
                    )}
                    {settings.deliveryEnabled && (
                      <button
                        type="button"
                        onClick={() => setFulfillmentType('delivery')}
                        className={`py-2.5 px-4 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          fulfillmentType === 'delivery'
                            ? 'bg-[#21150F] text-[#C9A45C] border-[#21150F]'
                            : 'bg-[#F7F3EA] text-[#3B3029] border-[#C9A45C]/40'
                        }`}
                      >
                        Home / Office Delivery
                      </button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3B3029] mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3B3029] mb-1">Phone Number *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>

                {fulfillmentType === 'delivery' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                        Delivery Zone
                      </label>
                      <select
                        value={selectedZoneId}
                        onChange={(e) => setSelectedZoneId(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                      >
                        {deliveryZones.map((z) => (
                          <option key={z.id} value={z.id}>
                            {z.zoneName} ({settings.currencySymbol}
                            {z.fee.toFixed(2)} · ~{z.estimatedMinutes} mins)
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                        Full Delivery Street Address *
                      </label>
                      <textarea
                        rows={2}
                        required
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        placeholder="Street address, apartment/suite, city, postal code..."
                        className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-1">
                    Special Order Instructions (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={orderNotes}
                    onChange={(e) => setOrderNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#F7F3EA] border border-[#C9A45C]/45 text-sm text-[#21150F]"
                  />
                </div>

                {/* Configurable Payment Methods */}
                <div>
                  <label className="block text-xs font-semibold text-[#3B3029] mb-2">
                    Select Payment Method *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {settings.cashOnPickupEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_on_pickup')}
                        className={`p-3 rounded-lg border text-left text-xs font-bold cursor-pointer ${
                          paymentMethod === 'cash_on_pickup'
                            ? 'border-[#21150F] bg-[#21150F] text-[#C9A45C]'
                            : 'border-[#C9A45C]/40 bg-[#F7F3EA] text-[#3B3029]'
                        }`}
                      >
                        Cash on Pickup
                      </button>
                    )}
                    {settings.cashOnDeliveryEnabled && fulfillmentType === 'delivery' && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('cash_on_delivery')}
                        className={`p-3 rounded-lg border text-left text-xs font-bold cursor-pointer ${
                          paymentMethod === 'cash_on_delivery'
                            ? 'border-[#21150F] bg-[#21150F] text-[#C9A45C]'
                            : 'border-[#C9A45C]/40 bg-[#F7F3EA] text-[#3B3029]'
                        }`}
                      >
                        Cash on Delivery
                      </button>
                    )}
                    {settings.onlineCardEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('online_card')}
                        className={`p-3 rounded-lg border text-left text-xs font-bold cursor-pointer ${
                          paymentMethod === 'online_card'
                            ? 'border-[#21150F] bg-[#21150F] text-[#C9A45C]'
                            : 'border-[#C9A45C]/40 bg-[#F7F3EA] text-[#3B3029]'
                        }`}
                      >
                        Online Card Payment (Verified at Counter/Gateway)
                      </button>
                    )}
                    {settings.whatsappOrderingEnabled && (
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('whatsapp_order')}
                        className={`p-3 rounded-lg border text-left text-xs font-bold cursor-pointer ${
                          paymentMethod === 'whatsapp_order'
                            ? 'border-[#254B37] bg-[#254B37] text-[#FFFFFF]'
                            : 'border-[#C9A45C]/40 bg-[#F7F3EA] text-[#3B3029]'
                        }`}
                      >
                        Place &amp; Confirm via WhatsApp
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Totals & Place Order CTA */}
              <div className="lg:col-span-5 p-6 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-4 h-fit">
                <h2 className="font-serif-display text-2xl font-bold text-[#21150F]">
                  Final Order Breakdown
                </h2>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1 border-b border-[#C9A45C]/30 pb-3">
                  {cart.map((c) => (
                    <div
                      key={c.menuItem.id}
                      className="flex items-center justify-between text-xs text-[#21150F]"
                    >
                      <span>
                        {c.quantity}x {c.menuItem.name}
                      </span>
                      <span className="font-mono font-semibold tabular-nums">
                        {settings.currencySymbol}
                        {(c.menuItem.price * c.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 text-xs border-b border-[#C9A45C]/30 pb-3">
                  <div className="flex justify-between">
                    <span className="text-[#3B3029]">Item Subtotal</span>
                    <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                      {settings.currencySymbol}
                      {cartSubtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#3B3029]">Delivery Charge</span>
                    <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                      {settings.currencySymbol}
                      {calculatedDeliveryFee.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#3B3029]">
                      Applicable Taxes ({settings.taxRatePercent}%)
                    </span>
                    <span className="font-mono font-semibold text-[#21150F] tabular-nums">
                      {settings.currencySymbol}
                      {calculatedTax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline text-[#21150F]">
                  <span className="text-sm font-bold">Final Order Total</span>
                  <span className="font-mono text-2xl font-bold text-[#21150F] tabular-nums">
                    {settings.currencySymbol}
                    {calculatedTotal.toFixed(2)}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submittingOrder || cart.length === 0}
                  className="w-full py-3.5 px-5 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-sm hover:bg-[#B89146] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {submittingOrder ? 'Placing Order...' : 'Place Order Now'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* =========================================================
            PAGE 11: ORDER CONFIRMATION & LIVE STATUS TRACKER
            ========================================================= */}
        {currentPage === 'order-confirmation' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            {lastPlacedOrder && (
              <div className="p-8 bg-[#21150F] border border-[#C9A45C]/50 rounded-2xl shadow-xl space-y-5">
                <div className="flex items-center gap-3 text-[#C9A45C]">
                  <CheckCircle2 className="w-6 h-6" />
                  <span className="text-xs uppercase tracking-widest font-bold">
                    Order Confirmed · Unique Reference {lastPlacedOrder.orderReference}
                  </span>
                </div>
                <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#F7F3EA]">
                  Thank You, {lastPlacedOrder.customerName}!
                </h1>
                <p className="text-sm text-[#F7F3EA]/80">
                  Your order ({lastPlacedOrder.itemsSummary}) has been received by Faminas
                  Kitchen. Current Status:{' '}
                  <strong className="text-[#C9A45C]">{lastPlacedOrder.status}</strong>.
                </p>

                {lastPlacedOrder.fulfillmentType === 'delivery' &&
                  lastPlacedOrder.status !== 'Cancelled' && (
                    <DeliveryRouteTrackerMap
                      orderReference={lastPlacedOrder.orderReference}
                      status={lastPlacedOrder.status}
                      deliveryAddress={lastPlacedOrder.deliveryAddress}
                      customerName={lastPlacedOrder.customerName}
                      estimatedMinutes={
                        deliveryZones.find((z) => z.id === lastPlacedOrder.deliveryZoneId)
                          ?.estimatedMinutes || 35
                      }
                    />
                  )}
              </div>
            )}

            <div className="space-y-4">
              <h2 className="font-serif-display text-3xl font-bold text-[#21150F]">
                Live Order Status &amp; Order History
              </h2>

              {orders.length === 0 ? (
                <div className="space-y-6">
                  <div className="p-8 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md text-center space-y-3">
                    <p className="text-sm text-[#3B3029]">
                      {user
                        ? 'You have no recorded orders yet. Place a delivery order to track your meal live along our delivery route map below.'
                        : 'Sign in with Google to view your live order status and order history.'}
                    </p>
                    {!user && (
                      <button
                        onClick={signInWithGoogle}
                        className="px-5 py-2.5 rounded-xl bg-[#C9A45C] text-[#21150F] font-bold text-xs cursor-pointer"
                      >
                        Sign In with Google
                      </button>
                    )}
                  </div>

                  {/* Sample Order Status Card with Detailed Order Summary Expansion Toggle & Delivery Map Preview */}
                  <div className="p-6 bg-[#21150F] border border-[#C9A45C]/45 rounded-2xl shadow-xl space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#C9A45C]/25 pb-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-widest text-[#C9A45C] font-bold block mb-1">
                          Sample Order Status Card Preview
                        </span>
                        <span className="font-mono text-lg font-bold text-[#C9A45C]">
                          FAM-PREVIEW
                        </span>
                        <span className="mx-2 text-[#F7F3EA]/30">·</span>
                        <span className="text-xs uppercase tracking-wider text-[#F7F3EA]/75">
                          delivery
                        </span>
                        <p className="text-sm text-[#F7F3EA] mt-1">
                          1x Achecke with Grill Fish and Plantain ($22.99), 1x Cassava Leaf ($17.99), 1x Rice and Beans with Oxtail ($23.99)
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewSummaryExpanded((prev) => !prev)}
                          aria-expanded={previewSummaryExpanded}
                          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#3B3029] hover:bg-[#3B3029]/80 border border-[#C9A45C]/40 text-xs font-bold text-[#C9A45C] transition-colors cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>
                            {previewSummaryExpanded
                              ? 'Hide Detailed Order Summary'
                              : 'View Detailed Order Summary (3 items · $64.97)'}
                          </span>
                          {previewSummaryExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {previewSummaryExpanded && (
                      <div className="p-5 rounded-xl bg-[#3B3029]/60 border border-[#C9A45C]/30 space-y-4 transition-all duration-300">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A45C]/20 pb-3">
                          <div>
                            <h3 className="text-xs uppercase tracking-wider text-[#C9A45C] font-bold">
                              Itemized Order Breakdown &amp; Special Instructions
                            </h3>
                            <p className="text-xs text-[#F7F3EA]/70 mt-0.5">
                              Individual dish modifications, unit prices, and kitchen preparation notes
                            </p>
                          </div>
                          <span className="px-2.5 py-1 rounded bg-[#21150F] border border-[#C9A45C]/25 text-[11px] font-mono text-[#F7F3EA]/85">
                            Payment: Cash on Delivery · Total: $64.97
                          </span>
                        </div>

                        <div className="divide-y divide-[#C9A45C]/20">
                          {[
                            {
                              name: 'Achecke with Grill Fish and Plantain',
                              qty: 1,
                              price: '$22.99',
                              img: '/assets/menu_ref/achecke_grill_fish.jpg',
                              modifications:
                                'Fluffy steamed cassava Achecke with whole charcoal-grilled fish, golden fried sweet plantains, and fresh salad.',
                            },
                            {
                              name: 'Cassava Leaf',
                              qty: 1,
                              price: '$17.99',
                              img: '/assets/menu_ref/cassava_leaf.jpg',
                              modifications:
                                'Slow-simmered in rich palm oil with tender beef, smoked fish, and steamed white rice.',
                            },
                            {
                              name: 'Rice and Beans with Oxtail',
                              qty: 1,
                              price: '$23.99',
                              img: '/assets/menu_ref/rice_beans_oxtail.jpg',
                              modifications:
                                'Slow-braised tender oxtail served over traditional rice and beans with fried sweet plantains.',
                            },
                          ].map((sampleItem, sIdx) => (
                            <div
                              key={sIdx}
                              className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                            >
                              <div className="flex items-start gap-3">
                                <img
                                  src={sampleItem.img}
                                  alt={sampleItem.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-[#C9A45C]/40 shrink-0"
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2 py-0.5 rounded bg-[#C9A45C]/15 border border-[#C9A45C]/40 font-mono text-xs font-bold text-[#C9A45C]">
                                      {sampleItem.qty}x
                                    </span>
                                    <span className="font-serif-display text-base font-bold text-[#F7F3EA]">
                                      {sampleItem.name}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#F7F3EA]/80 bg-[#21150F] border border-[#C9A45C]/20 rounded-md px-2.5 py-1.5">
                                    <span className="text-[#C9A45C] font-semibold">
                                      Modifications / Notes:{' '}
                                    </span>
                                    {sampleItem.modifications}
                                  </p>
                                </div>
                              </div>
                              <div className="text-left sm:text-right shrink-0 pl-15 sm:pl-0">
                                <span className="font-mono text-sm font-bold text-[#C9A45C] tabular-nums block">
                                  {sampleItem.price}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[#C9A45C]/20 flex flex-wrap items-center justify-between gap-3 text-xs text-[#F7F3EA]/80">
                          <div>
                            <span className="text-[#C9A45C] font-semibold">
                              Order-Wide Instructions:{' '}
                            </span>
                            Please ring doorbell upon arrival and include extra napkins.
                          </div>
                          <div className="font-mono text-[#F7F3EA]/90">
                            Fulfillment: Home / Office Delivery
                          </div>
                        </div>
                      </div>
                    )}

                    <DeliveryRouteTrackerMap
                      orderReference="FAM-PREVIEW"
                      status={previewDeliveryStage}
                      deliveryAddress="Greater Lindenwold & Camden County Delivery Area, NJ"
                      customerName={user?.displayName || 'Valued Guest'}
                      estimatedMinutes={30}
                      isPreview={true}
                      onSelectPreviewStage={setPreviewDeliveryStage}
                    />
                  </div>
                </div>
              ) : (
                orders.map((ord) => {
                  const normalizedTimelineStatus: OrderStatus =
                    ord.status === 'Confirmed' ? 'Accepted' : ord.status;
                  const activeStepIdx = ORDER_TIMELINE_STEPS.indexOf(normalizedTimelineStatus);
                  const orderZone = deliveryZones.find((z) => z.id === ord.deliveryZoneId);
                  const isExpanded = Boolean(expandedOrderIds[ord.id]);
                  const isLoadingItems = Boolean(loadingOrderItemsIds[ord.id]);
                  const detailedItems = orderItemsMap[ord.id] || [];

                  return (
                    <div
                      key={ord.id}
                      className="p-6 bg-[#21150F] border border-[#C9A45C]/45 rounded-2xl shadow-xl space-y-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#C9A45C]/25 pb-4">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-lg font-bold text-[#C9A45C]">
                              {ord.orderReference}
                            </span>
                            <span className="text-[#F7F3EA]/30">·</span>
                            <span className="px-2.5 py-0.5 rounded bg-white/5 border border-white/10 text-xs uppercase tracking-wider text-[#F7F3EA]/80">
                              {ord.fulfillmentType}
                            </span>
                            <span className="px-2.5 py-0.5 rounded bg-[#C9A45C]/15 border border-[#C9A45C]/35 text-xs font-semibold text-[#C9A45C]">
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-sm text-[#F7F3EA] pt-0.5">{ord.itemsSummary}</p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="text-right">
                            <span className="text-xs text-[#F7F3EA]/60 block">Order Total</span>
                            <span className="font-mono text-lg font-bold text-[#C9A45C] tabular-nums">
                              {ord.totalAmount > 0
                                ? `${settings.currencySymbol}${ord.totalAmount.toFixed(2)}`
                                : 'Confirmed at Counter'}
                            </span>
                          </div>

                          {/* Detailed Order Summary Expansion Toggle Button */}
                          <button
                            type="button"
                            onClick={() => toggleOrderSummaryExpansion(ord)}
                            aria-expanded={isExpanded}
                            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#3B3029] hover:bg-[#3B3029]/80 border border-[#C9A45C]/40 text-xs font-bold text-[#C9A45C] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>
                              {isExpanded
                                ? 'Hide Detailed Summary'
                                : `View Detailed Summary (${ord.itemCount || 1})`}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Detailed Order Summary Drawer */}
                      {isExpanded && (
                        <div className="p-5 rounded-xl bg-[#3B3029]/60 border border-[#C9A45C]/30 space-y-4 transition-all duration-300">
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#C9A45C]/20 pb-3">
                            <div>
                              <h3 className="text-xs uppercase tracking-wider text-[#C9A45C] font-bold">
                                Detailed Order Summary · {ord.orderReference}
                              </h3>
                              <p className="text-xs text-[#F7F3EA]/70 mt-0.5">
                                Individual item quantities, unit prices, and custom preparation
                                instructions
                              </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                              <span className="px-2.5 py-1 rounded bg-[#21150F] border border-[#C9A45C]/25 text-[#F7F3EA]/85">
                                Payment: {ord.paymentMethod.replace(/_/g, ' ')} ({ord.paymentStatus})
                              </span>
                            </div>
                          </div>

                          {isLoadingItems ? (
                            <p className="text-xs text-[#F7F3EA]/60 py-3">
                              Loading itemized order details...
                            </p>
                          ) : (
                            <div className="divide-y divide-[#C9A45C]/20">
                              {detailedItems.map((lineItem) => {
                                const matchedDish = menuItems.find(
                                  (m) =>
                                    m.id === lineItem.menuItemId ||
                                    m.name.toLowerCase() === lineItem.name.toLowerCase()
                                );
                                const dishThumb = matchedDish
                                  ? getCulinaryVisualUrl(
                                      matchedDish.imageKey,
                                      matchedDish.name,
                                      matchedDish.categoryName,
                                      matchedDish.imageUrl
                                    )
                                  : '/assets/food/jollof_rice.jpg';

                                return (
                                  <div
                                    key={lineItem.id}
                                    className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <img
                                        src={dishThumb}
                                        alt={lineItem.name}
                                        className="w-12 h-12 rounded-lg object-cover border border-[#C9A45C]/40 shrink-0"
                                      />
                                      <div className="space-y-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                          <span className="px-2 py-0.5 rounded bg-[#C9A45C]/15 border border-[#C9A45C]/40 font-mono text-xs font-bold text-[#C9A45C] tabular-nums">
                                            {lineItem.quantity}x
                                          </span>
                                          <span className="font-serif-display text-base font-bold text-[#F7F3EA]">
                                            {lineItem.name}
                                          </span>
                                          <span className="text-xs text-[#F7F3EA]/65 font-mono tabular-nums">
                                            (
                                            {lineItem.unitPrice > 0
                                              ? `${settings.currencySymbol}${lineItem.unitPrice.toFixed(2)} each`
                                              : 'Menu Price'}
                                            )
                                          </span>
                                        </div>

                                        <div className="text-xs rounded-md px-2.5 py-1.5 bg-[#21150F] border border-[#C9A45C]/20 text-[#F7F3EA]/85">
                                          <span className="text-[#C9A45C] font-semibold">
                                            Item Modifications / Special Instructions:{' '}
                                          </span>
                                          {lineItem.specialInstructions &&
                                          lineItem.specialInstructions.trim().length > 0 ? (
                                            <span>{lineItem.specialInstructions}</span>
                                          ) : (
                                            <span className="text-[#F7F3EA]/55 italic">
                                              Standard kitchen preparation — no custom modifications
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="text-left sm:text-right shrink-0 pl-15 sm:pl-0">
                                      <span className="text-[11px] text-[#F7F3EA]/55 block">
                                        Line Total
                                      </span>
                                      <span className="font-mono text-sm font-bold text-[#C9A45C] tabular-nums">
                                        {lineItem.lineTotal > 0
                                          ? `${settings.currencySymbol}${lineItem.lineTotal.toFixed(2)}`
                                          : 'Inquire / Order'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                          {/* Order-Level Special Instructions & Financial Breakdown */}
                          <div className="pt-3 border-t border-[#C9A45C]/20 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-lg bg-[#21150F] border border-[#C9A45C]/20 space-y-1.5">
                              <span className="uppercase tracking-wider text-[11px] text-[#C9A45C] font-bold block">
                                Order Notes &amp; Fulfillment Details
                              </span>
                              <p className="text-[#F7F3EA]/80">
                                <strong className="text-[#F7F3EA]">Special Instructions: </strong>
                                {ord.specialInstructions &&
                                ord.specialInstructions.trim().length > 0
                                  ? ord.specialInstructions
                                  : 'None provided'}
                              </p>
                              <p className="text-[#F7F3EA]/75">
                                <strong className="text-[#F7F3EA]">
                                  {ord.fulfillmentType === 'delivery'
                                    ? 'Delivery Address: '
                                    : 'Pickup Location: '}
                                </strong>
                                {ord.deliveryAddress}
                              </p>
                            </div>

                            <div className="p-3 rounded-lg bg-[#21150F] border border-[#C9A45C]/20 space-y-1.5 font-mono">
                              <div className="flex justify-between text-[#F7F3EA]/75">
                                <span>Items Subtotal ({ord.itemCount} items)</span>
                                <span className="tabular-nums">
                                  {settings.currencySymbol}
                                  {ord.subtotal.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-[#F7F3EA]/75">
                                <span>Delivery Fee</span>
                                <span className="tabular-nums">
                                  {settings.currencySymbol}
                                  {ord.deliveryFee.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-[#F7F3EA]/75">
                                <span>Tax</span>
                                <span className="tabular-nums">
                                  {settings.currencySymbol}
                                  {ord.taxAmount.toFixed(2)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm font-bold text-[#C9A45C] pt-1 border-t border-[#C9A45C]/20">
                                <span>Total</span>
                                <span className="tabular-nums">
                                  {settings.currencySymbol}
                                  {ord.totalAmount.toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 6-Status Progression Bar */}
                      {ord.status === 'Cancelled' ? (
                        <p className="text-xs font-semibold text-[#E63946]">
                          Order Status: Cancelled
                        </p>
                      ) : (
                        <div className="space-y-5">
                          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                            {ORDER_TIMELINE_STEPS.map((step, idx) => {
                              const reached = activeStepIdx >= idx;
                              return (
                                <div
                                  key={step}
                                  className={`p-2.5 rounded-lg border text-center text-xs ${
                                    reached
                                      ? 'bg-[#254B37] border-[#C9A45C] text-[#FFFFFF] font-bold'
                                      : 'bg-[#3B3029]/50 border-white/10 text-[#F7F3EA]/50'
                                  }`}
                                >
                                  {step}
                                </div>
                              );
                            })}
                          </div>

                          {/* Visual Delivery Route Progress Tracker Map for Active Delivery Orders */}
                          {ord.fulfillmentType === 'delivery' && (
                            <DeliveryRouteTrackerMap
                              orderReference={ord.orderReference}
                              status={ord.status}
                              deliveryAddress={ord.deliveryAddress}
                              customerName={ord.customerName}
                              estimatedMinutes={orderZone?.estimatedMinutes || 35}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* =========================================================
            ADMIN DASHBOARD
            ========================================================= */}
        {currentPage === 'admin' && (
          <AdminDashboard onPreviewWebsite={() => navigateTo('home')} />
        )}

        {/* =========================================================
            PAGE 12: PRIVACY POLICY
            ========================================================= */}
        {currentPage === 'privacy' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
            <div className="p-8 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-6">
              <h1 className="font-serif-display text-4xl font-bold text-[#21150F]">
                Privacy Policy
              </h1>
              <p className="text-sm text-[#3B3029] leading-relaxed">
                Faminas African and Americans Restaurant respects your privacy and protects your
                personal order and contact information using strict Attribute-Based Access Control
                security rules.
              </p>
              <div className="space-y-4 text-sm text-[#3B3029] leading-relaxed">
                <h2 className="font-serif-display text-2xl font-bold text-[#254B37]">
                  1. Information We Collect
                </h2>
                <p>
                  When you place an order or submit a catering enquiry, we collect your name, phone
                  number, delivery address (for delivery orders), and order preferences solely to
                  prepare and fulfill your meal.
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#254B37]">
                  2. Data Isolation &amp; Security
                </h2>
                <p>
                  Your customer profile, order records, and catering enquiries are strictly isolated
                  in our database so that only you and authorised restaurant administrators can view
                  them.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            PAGE 13: TERMS AND CONDITIONS
            ========================================================= */}
        {currentPage === 'terms' && (
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-6">
            <div className="p-8 bg-[#FFFFFF] border border-[#C9A45C]/45 rounded-2xl shadow-md space-y-6">
              <h1 className="font-serif-display text-4xl font-bold text-[#21150F]">
                Terms and Conditions
              </h1>
              <div className="space-y-4 text-sm text-[#3B3029] leading-relaxed">
                <h2 className="font-serif-display text-2xl font-bold text-[#254B37]">
                  1. Menu Availability &amp; Pricing
                </h2>
                <p>
                  All dishes at Faminas African and Americans Restaurant are freshly prepared. Menu
                  availability, delivery fees, and applicable taxes are displayed clearly prior to
                  checkout.
                </p>
                <h2 className="font-serif-display text-2xl font-bold text-[#254B37]">
                  2. Orders, Pickup &amp; Delivery
                </h2>
                <p>
                  Customers are responsible for providing accurate contact and delivery address
                  details. Online payments are verified prior to final order completion.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* FLOATING QUICK CART BAG PILL (When items exist in bag) */}
      {cartItemCount > 0 && currentPage !== 'cart' && currentPage !== 'checkout' && (
        <button
          type="button"
          onClick={() => navigateTo('cart')}
          className="fixed bottom-6 left-6 z-40 max-w-fit w-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-gradient-to-r from-[#C9A45C] to-[#E2BE76] text-[#21150F] border-2 border-white/80 shadow-[0_12px_36px_rgba(201,164,92,0.5)] text-xs font-extrabold uppercase tracking-wider transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 cursor-pointer tabular-nums animate-float-gentle btn-sheen"
        >
          <ShoppingBag className="w-4 h-4 text-[#21150F]" />
          <span className="whitespace-nowrap">View Bag ({cartItemCount}) · {settings.currencySymbol}{cartSubtotal.toFixed(2)}</span>
          <span className="w-2 h-2 rounded-full bg-[#254B37] ring-2 ring-white animate-pulse-subtle shrink-0" />
        </button>
      )}

      {/* FLOATING WHATSAPP ORDER BUTTON (Translucent Emerald Glass with Gold Halo) */}
      {settings.whatsappOrderingEnabled && (
        <a
          href={generateWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Order via WhatsApp"
          className="fixed bottom-6 right-6 z-40 max-w-fit w-auto inline-flex items-center gap-2.5 px-5 py-3 rounded-full faminas-glass-emerald border border-[#C9A45C]/75 text-[#FFFFFF] shadow-[0_14px_38px_rgba(37,75,55,0.45)] text-xs font-bold transition-all duration-300 hover:scale-105 hover:-translate-y-1 active:scale-95 cursor-pointer whitespace-nowrap btn-sheen"
        >
          <MessageCircle className="w-4 h-4 text-[#C9A45C]" />
          <span>WhatsApp Order</span>
        </a>
      )}

      {/* SECTION 12: PROFESSIONAL ESPRESSO BROWN FOOTER (#21150F) */}
      <footer className="bg-[#21150F] border-t-2 border-[#C9A45C]/50 mt-20 text-[#F7F3EA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <FaminasLogo size="md" />
            <p className="text-xs text-[#F7F3EA]/80 leading-relaxed">
              {websiteContent?.footer?.aboutText ||
                'FAMINAS AFRICAN AND AMERICANS RESTAURANT — GOOD FOOD BRINGS PEOPLE TOGETHER.'}
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-3 pt-2">
              {websiteContent?.footer?.facebookUrl && (
                <a
                  href={websiteContent.footer.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-black/40 text-xs text-[#C9A45C] hover:text-[#FFFFFF] border border-[#C9A45C]/30"
                >
                  Facebook
                </a>
              )}
              {websiteContent?.footer?.instagramUrl && (
                <a
                  href={websiteContent.footer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-black/40 text-xs text-[#C9A45C] hover:text-[#FFFFFF] border border-[#C9A45C]/30"
                >
                  Instagram
                </a>
              )}
              {websiteContent?.footer?.tiktokUrl && (
                <a
                  href={websiteContent.footer.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-black/40 text-xs text-[#C9A45C] hover:text-[#FFFFFF] border border-[#C9A45C]/30"
                >
                  TikTok
                </a>
              )}
              {websiteContent?.footer?.youtubeUrl && (
                <a
                  href={websiteContent.footer.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded bg-black/40 text-xs text-[#C9A45C] hover:text-[#FFFFFF] border border-[#C9A45C]/30"
                >
                  YouTube
                </a>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#C9A45C] font-bold mb-3">
              Explore
            </h3>
            <ul className="space-y-2 text-xs text-[#F7F3EA]/80">
              <li>
                <button onClick={() => navigateTo('home')} className="hover:text-[#C9A45C] cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('menu')} className="hover:text-[#C9A45C] cursor-pointer">
                  Digital Food Menu
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ordering')} className="hover:text-[#C9A45C] cursor-pointer">
                  Online Ordering
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('catering')} className="hover:text-[#C9A45C] cursor-pointer">
                  Catering &amp; Events
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('gallery')} className="hover:text-[#C9A45C] cursor-pointer">
                  Food Gallery
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#C9A45C] font-bold mb-3">
              Customer Care &amp; Legal
            </h3>
            <ul className="space-y-2 text-xs text-[#F7F3EA]/80">
              <li>
                <button onClick={() => navigateTo('about')} className="hover:text-[#C9A45C] cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contact')} className="hover:text-[#C9A45C] cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('order-confirmation')}
                  className="hover:text-[#C9A45C] cursor-pointer"
                >
                  Order Status Tracker
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacy')} className="hover:text-[#C9A45C] cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('terms')} className="hover:text-[#C9A45C] cursor-pointer">
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('admin')} className="hover:text-[#C9A45C] cursor-pointer">
                  Owner Admin Console
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-2 text-xs text-[#F7F3EA]/80">
            <h3 className="uppercase tracking-wider text-[#C9A45C] font-bold mb-3">
              Location &amp; Contact
            </h3>
            <p className="text-[#F7F3EA] font-medium">{settings.address}</p>
            <p>
              Phone:{' '}
              <a href="tel:+18565223029" className="text-[#C9A45C] hover:underline font-mono">
                +1 (856) 522-3029
              </a>
            </p>
            <p>Website: faminasrestaurant.com</p>
            <p className="text-[#F7F3EA]/65 pt-1">{settings.openingHours}</p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#C9A45C]">
              <a
                href="/google-merchant-feed.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Google Merchant Product Feed (XML)
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                Google Sitemap
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-[#C9A45C]/25 py-5 text-center text-xs text-[#F7F3EA]/60">
          {websiteContent?.footer?.copyrightText || (
            <>
              © {new Date().getFullYear()} FAMINAS AFRICAN AND AMERICANS RESTAURANT ·
              faminasrestaurant.com · 577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA · Phone:
              +1 (856) 522-3029 · Indexed for Google Search &amp; Google Merchant Center
            </>
          )}
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <RestaurantProvider>
      <FaminasPlatform />
    </RestaurantProvider>
  );
}
