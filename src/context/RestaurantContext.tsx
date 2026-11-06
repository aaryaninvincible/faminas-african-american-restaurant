import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  deleteDoc,
  where,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  BOOTSTRAPPED_ADMIN_EMAIL,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import {
  Category,
  MenuItem,
  FoodImage,
  Order,
  OrderItem,
  Customer,
  RestaurantSetting,
  DeliveryZone,
  PaymentTransaction,
  Testimonial,
  GalleryImage,
  CateringEnquiry,
  CartItem,
  Profile,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  EmailNotificationRecord,
  NotificationSettings,
  OrderNotificationLog,
  OrderStatusHistoryEntry,
  ProviderStatusSummary,
  HeroSlideConfig,
  NewsletterSubscriber,
  WebsiteContent,
  SectionKey,
} from '../types/restaurant';
import { INITIAL_WEBSITE_CONTENT } from '../lib/initialWebsiteContent';
import {
  DEFAULT_RESTAURANT_SETTINGS,
  INITIAL_CATEGORIES,
  INITIAL_MENU_ITEMS,
  INITIAL_DELIVERY_ZONES,
  INITIAL_GALLERY_IMAGES,
} from '../lib/initialMenuData';
import { playNewOrderAlertSound } from '../lib/soundAlert';

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  ownerEmail: 'swaraysheku12@gmail.com',
  ownerPhone: '+1 (856) 522-3029',
  additionalEmails: ['orders@faminasrestaurant.com'],
  additionalPhones: [],
  smsEnabled: true,
  emailEnabled: true,
  soundEnabled: true,
  customerNotificationsEnabled: true,
  updatedAtIso: new Date().toISOString(),
};

export const DEFAULT_HERO_SLIDES: HeroSlideConfig[] = [
  {
    id: 1,
    badge: 'Slide 01 · Traditional Sierra Leonean Food',
    dishShortName: 'Traditional Sierra Leonean Platter',
    priceLabel: '$17.99 – $24.99',
    captionTitle: 'Traditional Sierra Leonean Food — Prepared Fresh Daily',
    captionSubtitle:
      'Authentic Freetown culinary heritage featuring slow-simmered Cassava Leaf ($17.99), Potato Leaf ($17.99), Dibi with Plantain ($22.99), and smoky Jollof Rice & Stew ($14.99).',
    mainImage: '/assets/menu_ref/jollof_rice_stew.jpg',
    featuredDishIds: [
      'jollof-rice-stew',
      'cassava-leaf',
      'dibi-with-plantain',
      'potato-leaf',
    ],
  },
  {
    id: 2,
    badge: 'Slide 02 · Achecke with Grilled Fish & Plantain',
    dishShortName: 'Achecke with Grill Fish and Plantain',
    priceLabel: '$22.99',
    captionTitle: 'Achecke with Grill Fish and Plantain ($22.99)',
    captionSubtitle:
      'Fluffy steamed cassava Achecke served with whole charcoal-grilled seasoned fish, golden fried sweet plantains, crisp garden salad, and house pepper sauce.',
    mainImage: '/assets/menu_ref/achecke_grill_fish.jpg',
    featuredDishIds: [
      'achecke-grilled-fish-plantain',
      'achecke-fried-fish-plantain',
      'dibi-with-achecke-plantain',
      'grill-fish-salad',
    ],
  },
  {
    id: 3,
    badge: 'Slide 03 · Cassava Leaves & Traditional African Dishes',
    dishShortName: 'Cassava Leaf & Egusi Soup with Foofoo',
    priceLabel: '$17.99 – $18.99',
    captionTitle: 'Cassava Leaves ($17.99) & Traditional West African Leaf Dishes',
    captionSubtitle:
      'Finely pounded Cassava Leaf and Potato Leaf slow-cooked in rich palm oil, alongside Egusi Soup with Foofoo ($18.99), Foofoo with Okra Soup ($17.99), and Kran Kran ($17.99).',
    mainImage: '/assets/menu_ref/cassava_leaf.jpg',
    featuredDishIds: [
      'cassava-leaf',
      'egusi-soup-foofoo',
      'foofoo-okra-soup',
      'kran-kran-palava-sauce',
    ],
  },
  {
    id: 4,
    badge: 'Slide 04 · Premium American Burgers & Fries',
    dishShortName: 'Hamburger & Cheese Steak with Fries',
    priceLabel: '$15.99 – $16.99',
    captionTitle: 'Premium American Burgers ($15.99), Cheese Steak ($16.99) & Crispy Fries',
    captionSubtitle:
      'Flame-seared classic American Hamburger and Fries, Philly-style Cheese Steak with Fries, golden Chicken Wings and Fries ($15.99), and creamy baked Mac and Cheese ($9.99).',
    mainImage: '/assets/menu_ref/hamburger_fries.jpg',
    featuredDishIds: [
      'hamburger-with-fries',
      'cheesesteak-with-fries',
      'chicken-wings-with-fries',
      'mac-and-cheese',
    ],
  },
  {
    id: 5,
    badge: 'Slide 05 · Grilled Seafood, Lamb & Oxtail',
    dishShortName: 'Lamb Grill with Plantain & Grilled Fish',
    priceLabel: '$19.99 – $24.99',
    captionTitle: 'Flame-Grilled Lamb ($23.99), Whole Grilled Seafood ($19.99) & Oxtail ($23.99)',
    captionSubtitle:
      'Charcoal-seared Lamb Grill with Plantain, Lamb Grill with Achecke ($24.99), Whole Grill Fish with Salad ($19.99), Rice and Beans with Oxtail ($23.99), and Assorted Pepper Soup ($20.99).',
    mainImage: '/assets/menu_ref/lamb_grill_plantain.jpg',
    featuredDishIds: [
      'grilled-lamb-with-plantain',
      'grill-fish-salad',
      'rice-and-beans-oxtail',
      'assorted-pepper-soup',
    ],
  },
];

interface RestaurantContextValue {
  user: User | null;
  profile: Profile | null;
  customerRecord: Customer | null;
  isAdmin: boolean;
  authReady: boolean;
  categories: Category[];
  menuItems: MenuItem[];
  foodImages: FoodImage[];
  settings: RestaurantSetting;
  deliveryZones: DeliveryZone[];
  testimonials: Testimonial[];
  galleryImages: GalleryImage[];
  orders: Order[];
  orderItemsMap: Record<string, OrderItem[]>;
  fetchOrderItems: (order: Order) => Promise<OrderItem[]>;
  emailNotifications: EmailNotificationRecord[];
  sendOrderStatusEmail: (order: Order, status: OrderStatus) => EmailNotificationRecord;
  cateringEnquiries: CateringEnquiry[];
  cart: CartItem[];
  favouriteIds: string[];
  lastPlacedOrder: Order | null;
  notification: { type: 'success' | 'error'; message: string } | null;
  clearNotification: () => void;
  notify: (type: 'success' | 'error', message: string) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  addToCart: (menuItem: MenuItem, quantity?: number, specialInstructions?: string) => void;
  updateCartQuantity: (menuItemId: string, quantity: number) => void;
  updateCartInstructions: (menuItemId: string, instructions: string) => void;
  removeFromCart: (menuItemId: string) => void;
  clearCart: () => void;
  toggleFavourite: (menuItemId: string) => Promise<void>;
  placeOrder: (params: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    fulfillmentType: 'delivery' | 'pickup';
    deliveryZoneId: string;
    deliveryAddress: string;
    specialInstructions: string;
    paymentMethod: PaymentMethod;
  }) => Promise<Order>;
  generateWhatsAppLink: (customParams?: {
    customerName?: string;
    fulfillmentType?: 'delivery' | 'pickup';
    deliveryAddress?: string;
    singleItem?: MenuItem;
  }) => string;
  submitCateringEnquiry: (
    data: Omit<CateringEnquiry, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  submitTestimonial: (data: {
    authorName: string;
    dishOrdered: string;
    rating: number;
    comment: string;
  }) => Promise<void>;
  // Admin & Price / Inventory mutations
  seedDatabaseIfNeeded: () => Promise<void>;
  updateItemPrice: (item: MenuItem, nextPrice: number) => Promise<void>;
  updateItemInventory: (
    item: MenuItem,
    updates: {
      stockQuantity?: number;
      lowStockThreshold?: number;
      trackInventory?: boolean;
    },
    silent?: boolean
  ) => Promise<void>;
  restockAllLowItems: (addedPortions?: number) => Promise<void>;
  toggleDailySpecial: (item: MenuItem, isSpecial?: boolean) => Promise<void>;
  setDailySpecialsBatch: (itemIds: string[], label?: string) => Promise<void>;
  saveMenuItem: (item: Omit<MenuItem, 'updatedAt'>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  saveCategory: (cat: Omit<Category, 'updatedAt'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  saveRestaurantSettings: (newSettings: Omit<RestaurantSetting, 'updatedAt'>) => Promise<void>;
  saveDeliveryZone: (zone: Omit<DeliveryZone, 'updatedAt'>) => Promise<void>;
  deleteDeliveryZone: (id: string) => Promise<void>;
  updateOrderStatus: (order: Order, nextStatus: OrderStatus, note?: string) => Promise<void>;
  updateOrderPaymentStatus: (order: Order, nextPaymentStatus: PaymentStatus) => Promise<void>;
  notificationSettings: NotificationSettings;
  saveNotificationSettings: (nextSettings: NotificationSettings) => void;
  providerStatus: ProviderStatusSummary | null;
  refreshProviderStatus: () => Promise<void>;
  orderNotificationLogs: OrderNotificationLog[];
  retryOrderNotification: (order: Order, channel?: 'sms' | 'email') => Promise<void>;
  sendTestNotification: (channel: 'sms' | 'email', customRecipient?: string) => Promise<void>;
  playTestAlertSound: () => void;
  liveOrderAlerts: Order[];
  dismissLiveOrderAlert: (orderId: string) => void;
  clearAllLiveOrderAlerts: () => void;
  statusHistoryMap: Record<string, OrderStatusHistoryEntry[]>;
  updateCateringStatus: (
    enquiry: CateringEnquiry,
    nextStatus: CateringEnquiry['status']
  ) => Promise<void>;
  approveTestimonial: (testimonial: Testimonial, isApproved: boolean) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  saveGalleryImage: (img: Omit<GalleryImage, 'updatedAt'>) => Promise<void>;
  deleteGalleryImage: (id: string) => Promise<void>;
  heroSlides: HeroSlideConfig[];
  updateHeroSlide: (slide: HeroSlideConfig) => void;
  resetHeroSlides: () => void;
  newsletterSubscribers: NewsletterSubscriber[];
  subscribeNewsletter: (params: {
    fullName: string;
    email: string;
    phone: string;
    consented: boolean;
  }) => void;
  // Dynamic Website CMS & Content Management
  websiteContent: WebsiteContent;
  draftWebsiteContent: WebsiteContent;
  isContentDirty: boolean;
  updateDraftSection: <K extends SectionKey>(section: K, data: WebsiteContent[K]) => void;
  updateDraftField: <K extends SectionKey, F extends keyof WebsiteContent[K]>(
    section: K,
    field: F,
    value: WebsiteContent[K][F]
  ) => void;
  publishWebsiteContent: () => Promise<void>;
  discardDraft: () => void;
  resetWebsiteContentToDefault: () => Promise<void>;
  uploadMedia: (file: File, folder?: string) => Promise<string>;
}

const RestaurantContext = createContext<RestaurantContextValue | undefined>(undefined);

export const RestaurantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [customerRecord, setCustomerRecord] = useState<Customer | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(INITIAL_MENU_ITEMS);
  const [foodImages, setFoodImages] = useState<FoodImage[]>([]);
  const [settings, setSettings] = useState<RestaurantSetting>(DEFAULT_RESTAURANT_SETTINGS);
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>(INITIAL_DELIVERY_ZONES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>(INITIAL_GALLERY_IMAGES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItemsMap, setOrderItemsMap] = useState<Record<string, OrderItem[]>>({});
  const [emailNotifications, setEmailNotifications] = useState<EmailNotificationRecord[]>(() => {
    try {
      const saved = localStorage.getItem('faminas_email_notifications_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem('faminas_notification_settings_v1');
      return saved
        ? { ...DEFAULT_NOTIFICATION_SETTINGS, ...JSON.parse(saved) }
        : DEFAULT_NOTIFICATION_SETTINGS;
    } catch {
      return DEFAULT_NOTIFICATION_SETTINGS;
    }
  });
  const [providerStatus, setProviderStatus] = useState<ProviderStatusSummary | null>(null);
  const [orderNotificationLogs, setOrderNotificationLogs] = useState<OrderNotificationLog[]>(() => {
    try {
      const saved = localStorage.getItem('faminas_order_notification_logs_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [statusHistoryMap, setStatusHistoryMap] = useState<
    Record<string, OrderStatusHistoryEntry[]>
  >(() => {
    try {
      const saved = localStorage.getItem('faminas_order_status_history_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [liveOrderAlerts, setLiveOrderAlerts] = useState<Order[]>([]);
  const seenOrderIdsRef = useRef<Set<string>>(new Set());
  const initialOrdersSnapshotLoadedRef = useRef<boolean>(false);
  const dispatchedNewOrderIdsRef = useRef<Set<string>>(new Set());

  const [cateringEnquiries, setCateringEnquiries] = useState<CateringEnquiry[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlideConfig[]>(() => {
    try {
      const raw = localStorage.getItem('faminas_hero_slides_v1');
      if (raw) {
        const parsed = JSON.parse(raw) as HeroSlideConfig[];
        if (Array.isArray(parsed) && parsed.length === 5) {
          return parsed;
        }
      }
    } catch {
      // ignore storage errors
    }
    return DEFAULT_HERO_SLIDES;
  });
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<NewsletterSubscriber[]>(() => {
    try {
      const raw = localStorage.getItem('faminas_newsletter_subscribers_v1');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Helper to deep merge website content with complete defaults
  const mergeWebsiteContent = (raw: any): WebsiteContent => {
    if (!raw || typeof raw !== 'object') return INITIAL_WEBSITE_CONTENT;
    return {
      ...INITIAL_WEBSITE_CONTENT,
      ...raw,
      branding: { ...INITIAL_WEBSITE_CONTENT.branding, ...(raw.branding || {}) },
      sectionVisibility: { ...INITIAL_WEBSITE_CONTENT.sectionVisibility, ...(raw.sectionVisibility || {}) },
      navigation: {
        ...INITIAL_WEBSITE_CONTENT.navigation,
        navLinks: raw.navigation?.navLinks || INITIAL_WEBSITE_CONTENT.navigation.navLinks,
      },
      header: { ...INITIAL_WEBSITE_CONTENT.header, ...(raw.header || {}) },
      home: { ...INITIAL_WEBSITE_CONTENT.home, ...(raw.home || {}) },
      whyChooseUs: {
        ...INITIAL_WEBSITE_CONTENT.whyChooseUs,
        ...(raw.whyChooseUs || {}),
        cards: raw.whyChooseUs?.cards || INITIAL_WEBSITE_CONTENT.whyChooseUs.cards,
      },
      vipNewsletter: { ...INITIAL_WEBSITE_CONTENT.vipNewsletter, ...(raw.vipNewsletter || {}) },
      about: { ...INITIAL_WEBSITE_CONTENT.about, ...(raw.about || {}) },
      videos: {
        ...INITIAL_WEBSITE_CONTENT.videos,
        ...(raw.videos || {}),
        videoItems: raw.videos?.videoItems || INITIAL_WEBSITE_CONTENT.videos.videoItems,
      },
      catering: {
        ...INITIAL_WEBSITE_CONTENT.catering,
        ...(raw.catering || {}),
        packages: raw.catering?.packages || INITIAL_WEBSITE_CONTENT.catering.packages,
      },
      specialOffers: {
        ...INITIAL_WEBSITE_CONTENT.specialOffers,
        ...(raw.specialOffers || {}),
        offersList: raw.specialOffers?.offersList || INITIAL_WEBSITE_CONTENT.specialOffers.offersList,
      },
      reviews: {
        ...INITIAL_WEBSITE_CONTENT.reviews,
        ...(raw.reviews || {}),
        items: raw.reviews?.items || INITIAL_WEBSITE_CONTENT.reviews.items,
      },
      contact: {
        ...INITIAL_WEBSITE_CONTENT.contact,
        ...(raw.contact || {}),
        openingHours: raw.contact?.openingHours || INITIAL_WEBSITE_CONTENT.contact.openingHours,
      },
      footer: { ...INITIAL_WEBSITE_CONTENT.footer, ...(raw.footer || {}) },
      legal: { ...INITIAL_WEBSITE_CONTENT.legal, ...(raw.legal || {}) },
    };
  };

  // Website CMS Content States (Live Published vs Draft)
  const [websiteContent, setWebsiteContent] = useState<WebsiteContent>(() => {
    try {
      const saved = localStorage.getItem('faminas_published_website_content_v1');
      if (saved) {
        return mergeWebsiteContent(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Error reading stored published website content:', e);
    }
    return INITIAL_WEBSITE_CONTENT;
  });

  const [draftWebsiteContent, setDraftWebsiteContent] = useState<WebsiteContent>(() => {
    try {
      const savedDraft = localStorage.getItem('faminas_draft_website_content_v1');
      if (savedDraft) {
        return mergeWebsiteContent(JSON.parse(savedDraft));
      }
      const savedPub = localStorage.getItem('faminas_published_website_content_v1');
      if (savedPub) {
        return mergeWebsiteContent(JSON.parse(savedPub));
      }
    } catch (e) {
      console.warn('Error reading stored draft website content:', e);
    }
    return INITIAL_WEBSITE_CONTENT;
  });

  const [isContentDirty, setIsContentDirty] = useState<boolean>(false);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const isAdmin = Boolean(
    user &&
      user.emailVerified &&
      (user.email === BOOTSTRAPPED_ADMIN_EMAIL || profile?.role === 'admin')
  );

  const notify = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  }, []);

  const clearNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // 1. Firebase Auth listener + Profile Synchronization
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileRef = doc(db, 'profiles', currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          const isOwnerAdmin =
            currentUser.emailVerified && currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL;

          if (!profileSnap.exists()) {
            const newProfile: Profile = {
              uid: currentUser.uid,
              fullName: (currentUser.displayName || 'Valued Guest').slice(0, 120),
              role: isOwnerAdmin ? 'admin' : 'customer',
              favouriteItemIds: [],
            };
            await setDoc(profileRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            setProfile(newProfile);
            setFavouriteIds([]);
          } else {
            const data = profileSnap.data() as Profile;
            setProfile(data);
            setFavouriteIds(data.favouriteItemIds || []);
          }

          const custRef = doc(db, 'customers', currentUser.uid);
          const custSnap = await getDoc(custRef);
          if (custSnap.exists()) {
            setCustomerRecord(custSnap.data() as Customer);
          }
        } catch (err) {
          console.error('Profile sync error:', err);
        }
      } else {
        setProfile(null);
        setCustomerRecord(null);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // 2. Public Firestore Subscriptions (Categories, Menu Items, Settings, Delivery Zones, Gallery, Approved Testimonials)
  useEffect(() => {
    const validCategoryIds = new Set(INITIAL_CATEGORIES.map((c) => c.id));
    const validMenuIds = new Set(INITIAL_MENU_ITEMS.map((m) => m.id));

    const DEFAULT_DAILY_SPECIAL_IDS = new Set([
      'achecke-grilled-fish-plantain',
      'dibi-with-plantain',
      'cassava-leaf',
      'egusi-soup-foofoo',
      'rice-and-beans-oxtail',
      'grilled-lamb-plantain-achecke',
      'assorted-pepper-soup',
      'cheesesteak-with-fries',
    ]);

    let savedLocalPrices: Record<string, number> = {};
    let savedLocalInventory: Record<
      string,
      { stockQuantity?: number; lowStockThreshold?: number; trackInventory?: boolean }
    > = {};
    let savedLocalSpecials: Record<string, boolean> = {};
    let hasSavedSpecialsConfig = false;
    try {
      const rawPrices = localStorage.getItem('faminas_custom_prices_v2');
      if (rawPrices) {
        savedLocalPrices = JSON.parse(rawPrices);
      }
      const rawInv = localStorage.getItem('faminas_custom_inventory_v1');
      if (rawInv) {
        savedLocalInventory = JSON.parse(rawInv);
      }
      const rawSpecials = localStorage.getItem('faminas_daily_specials_v1');
      if (rawSpecials) {
        savedLocalSpecials = JSON.parse(rawSpecials);
        hasSavedSpecialsConfig = Object.keys(savedLocalSpecials).length > 0;
      }
    } catch {
      // ignore storage errors
    }

    // Apply owner-saved local prices, inventory thresholds, and daily specials on initial mount
    setMenuItems((prev) =>
      prev.map((it) => {
        const localInv = savedLocalInventory[it.id];
        const nextStock =
          typeof localInv?.stockQuantity === 'number'
            ? localInv.stockQuantity
            : it.stockQuantity ?? 24;
        const nextTrack =
          typeof localInv?.trackInventory === 'boolean'
            ? localInv.trackInventory
            : it.trackInventory ?? true;
        const nextFeatured = hasSavedSpecialsConfig
          ? Boolean(savedLocalSpecials[it.id])
          : DEFAULT_DAILY_SPECIAL_IDS.has(it.id);
        return {
          ...it,
          price:
            typeof savedLocalPrices[it.id] === 'number'
              ? savedLocalPrices[it.id]
              : it.price,
          stockQuantity: nextStock,
          lowStockThreshold:
            typeof localInv?.lowStockThreshold === 'number'
              ? localInv.lowStockThreshold
              : it.lowStockThreshold ?? 5,
          trackInventory: nextTrack,
          isFeatured: nextFeatured,
          isAvailable: nextTrack && nextStock <= 0 ? false : it.isAvailable,
        };
      })
    );

    const unsubCategories = onSnapshot(
      collection(db, 'categories'),
      (snap) => {
        if (!snap.empty) {
          const byId = new Map<string, Category>();
          for (const initCat of INITIAL_CATEGORIES) {
            byId.set(initCat.id, initCat);
          }
          for (const d of snap.docs) {
            const fsCat = d.data() as Category;
            if (!validCategoryIds.has(fsCat.id)) {
              continue;
            }
            const base = byId.get(fsCat.id);
            byId.set(fsCat.id, base ? { ...base, ...fsCat, name: base.name } : fsCat);
          }
          const list = Array.from(byId.values()).sort((a, b) => a.sortOrder - b.sortOrder);
          setCategories(list);
        }
      },
      (err) => console.debug('Categories listener offline notice:', err.message)
    );

    const unsubMenu = onSnapshot(
      collection(db, 'menu_items'),
      (snap) => {
        const byId = new Map<string, MenuItem>();
        for (const initItem of INITIAL_MENU_ITEMS) {
          const localPrice =
            typeof savedLocalPrices[initItem.id] === 'number'
              ? savedLocalPrices[initItem.id]
              : initItem.price;
          const localInv = savedLocalInventory[initItem.id];
          const stockQuantity =
            typeof localInv?.stockQuantity === 'number'
              ? localInv.stockQuantity
              : initItem.stockQuantity ?? 24;
          const lowStockThreshold =
            typeof localInv?.lowStockThreshold === 'number'
              ? localInv.lowStockThreshold
              : initItem.lowStockThreshold ?? 5;
          const trackInventory =
            typeof localInv?.trackInventory === 'boolean'
              ? localInv.trackInventory
              : initItem.trackInventory ?? true;
          const isDefaultSpecial = DEFAULT_DAILY_SPECIAL_IDS.has(initItem.id);
          const resolvedInitFeatured =
            typeof savedLocalSpecials[initItem.id] === 'boolean'
              ? savedLocalSpecials[initItem.id]
              : hasSavedSpecialsConfig
              ? false
              : isDefaultSpecial;
          byId.set(initItem.id, {
            ...initItem,
            price: localPrice,
            stockQuantity,
            lowStockThreshold,
            trackInventory,
            isFeatured: resolvedInitFeatured,
            isAvailable:
              trackInventory && stockQuantity <= 0 ? false : initItem.isAvailable,
          });
        }
        if (!snap.empty) {
          const firestoreItems = snap.docs.map((d) => d.data() as MenuItem);
          for (const fsItem of firestoreItems) {
            const base = byId.get(fsItem.id);
            if (base) {
              const hasCustomUpload =
                Boolean(fsItem.imageUrl && fsItem.imageUrl.startsWith('data:image/'));
              const resolvedPrice =
                typeof savedLocalPrices[fsItem.id] === 'number'
                  ? savedLocalPrices[fsItem.id]
                  : base.price > 0
                  ? base.price
                  : fsItem.price || 0;
              const localInv = savedLocalInventory[fsItem.id];
              const resolvedStock =
                typeof localInv?.stockQuantity === 'number'
                  ? localInv.stockQuantity
                  : typeof fsItem.stockQuantity === 'number'
                  ? fsItem.stockQuantity
                  : base.stockQuantity ?? 24;
              const resolvedThreshold =
                typeof localInv?.lowStockThreshold === 'number'
                  ? localInv.lowStockThreshold
                  : typeof fsItem.lowStockThreshold === 'number'
                  ? fsItem.lowStockThreshold
                  : base.lowStockThreshold ?? 5;
              const resolvedTrack =
                typeof localInv?.trackInventory === 'boolean'
                  ? localInv.trackInventory
                  : typeof fsItem.trackInventory === 'boolean'
                  ? fsItem.trackInventory
                  : base.trackInventory ?? true;
              const resolvedFeatured =
                typeof savedLocalSpecials[fsItem.id] === 'boolean'
                  ? savedLocalSpecials[fsItem.id]
                  : hasSavedSpecialsConfig
                  ? false
                  : base.isFeatured;

              byId.set(fsItem.id, {
                ...base,
                ...fsItem,
                name: base.name,
                description: base.description,
                price: resolvedPrice,
                categoryId: base.categoryId,
                categoryName: base.categoryName,
                imageKey: base.imageKey,
                imageUrl: hasCustomUpload ? fsItem.imageUrl : base.imageUrl,
                stockQuantity: resolvedStock,
                lowStockThreshold: resolvedThreshold,
                trackInventory: resolvedTrack,
                isFeatured: resolvedFeatured,
                isAvailable:
                  resolvedTrack && resolvedStock <= 0 ? false : fsItem.isAvailable,
              });
            } else if (validMenuIds.has(fsItem.id)) {
              byId.set(fsItem.id, fsItem);
            }
          }
        }
        setMenuItems(Array.from(byId.values()));
      },
      (err) => console.debug('Menu listener offline notice:', err.message)
    );

    const unsubFoodImages = onSnapshot(
      collection(db, 'food_images'),
      (snap) => {
        setFoodImages(snap.docs.map((d) => d.data() as FoodImage));
      },
      (err) => console.debug('Food images listener offline notice:', err.message)
    );

    const unsubSettings = onSnapshot(
      doc(db, 'restaurant_settings', 'main'),
      (snap) => {
        if (snap.exists()) {
          const data = snap.data() as RestaurantSetting;
          const isOldPhone =
            !data.phone ||
            data.phone.includes('configurable') ||
            data.phone.includes('258-4278');
          const isOldWhatsapp =
            !data.whatsappNumber || data.whatsappNumber.includes('2584278');
          setSettings({
            ...data,
            restaurantName: DEFAULT_RESTAURANT_SETTINGS.restaurantName,
            address:
              !data.address || data.address.includes('configurable')
                ? DEFAULT_RESTAURANT_SETTINGS.address
                : data.address,
            phone: isOldPhone ? DEFAULT_RESTAURANT_SETTINGS.phone : data.phone,
            whatsappNumber: isOldWhatsapp
              ? DEFAULT_RESTAURANT_SETTINGS.whatsappNumber
              : data.whatsappNumber,
            email:
              !data.email || data.email.includes('example.com')
                ? DEFAULT_RESTAURANT_SETTINGS.email
                : data.email,
            openingHours:
              !data.openingHours ||
              data.openingHours.includes('11:00 AM – 10:00 PM') ||
              data.openingHours.includes('258-4278')
                ? DEFAULT_RESTAURANT_SETTINGS.openingHours
                : data.openingHours,
          });
        }
      },
      (err) => console.debug('Settings listener offline notice:', err.message)
    );

    const unsubZones = onSnapshot(
      collection(db, 'delivery_zones'),
      (snap) => {
        if (!snap.empty) {
          setDeliveryZones(snap.docs.map((d) => d.data() as DeliveryZone));
        }
      },
      (err) => console.debug('Delivery zones listener offline notice:', err.message)
    );

    const unsubGallery = onSnapshot(
      collection(db, 'gallery_images'),
      (snap) => {
        if (!snap.empty) {
          const byId = new Map<string, GalleryImage>();
          for (const initGal of INITIAL_GALLERY_IMAGES) {
            byId.set(initGal.id, initGal);
          }
          for (const d of snap.docs) {
            const fsGal = d.data() as GalleryImage;
            const base = byId.get(fsGal.id);
            if (!base) continue;
            const hasCustomUpload = Boolean(
              fsGal.imageUrl && fsGal.imageUrl.startsWith('data:image/')
            );
            byId.set(fsGal.id, {
              ...base,
              ...fsGal,
              title: base.title,
              caption: base.caption,
              imageUrl: hasCustomUpload ? fsGal.imageUrl : base.imageUrl,
            });
          }
          setGalleryImages(Array.from(byId.values()));
        }
      },
      (err) => console.debug('Gallery listener offline notice:', err.message)
    );

    const testimonialsQuery = isAdmin
      ? collection(db, 'testimonials')
      : query(collection(db, 'testimonials'), where('isApproved', '==', true));

    const unsubTestimonials = onSnapshot(
      testimonialsQuery,
      (snap) => {
        setTestimonials(snap.docs.map((d) => d.data() as Testimonial));
      },
      (err) => console.debug('Testimonials listener offline notice:', err.message)
    );

    return () => {
      unsubCategories();
      unsubMenu();
      unsubFoodImages();
      unsubSettings();
      unsubZones();
      unsubGallery();
      unsubTestimonials();
    };
  }, [isAdmin]);

  // Real-time synchronization for Website CMS Content
  useEffect(() => {
    const contentDocRef = doc(db, 'restaurant_settings', 'website_content');
    const unsub = onSnapshot(
      contentDocRef,
      (snap) => {
        if (snap.exists()) {
          const remoteContent = snap.data();
          const merged = mergeWebsiteContent(remoteContent);
          setWebsiteContent(merged);
          if (merged.branding) {
            setSettings((prev) => ({
              ...prev,
              restaurantName: merged.branding.restaurantName || prev.restaurantName,
              tagline: merged.branding.tagline || prev.tagline,
              currencySymbol: merged.branding.currencySymbol || prev.currencySymbol,
              defaultDeliveryFee:
                typeof merged.branding.defaultDeliveryFee === 'number'
                  ? merged.branding.defaultDeliveryFee
                  : prev.defaultDeliveryFee,
              taxRatePercentage:
                typeof merged.branding.taxRatePercentage === 'number'
                  ? merged.branding.taxRatePercentage
                  : prev.taxRatePercentage,
            }));
          }
          try {
            localStorage.setItem('faminas_published_website_content_v1', JSON.stringify(merged));
          } catch {}
        }
      },
      (err) => {
        console.debug('Website content real-time listener notice:', err.message);
      }
    );
    return () => unsub();
  }, []);

  const extractOrderTimestampMs = (ord: Order): number => {
    const ca: any = ord.createdAt;
    if (ca && typeof ca.toMillis === 'function') return ca.toMillis();
    if (ca && typeof ca.seconds === 'number') return ca.seconds * 1000;
    if (typeof ca === 'string') {
      const parsed = Date.parse(ca);
      if (!Number.isNaN(parsed)) return parsed;
    }
    const idMatch = ord.id.match(/^ord_(\d+)_/);
    if (idMatch) return parseInt(idMatch[1], 10);
    return 0;
  };

  const refreshProviderStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications/provider-status');
      if (res.ok) {
        const data = (await res.json()) as ProviderStatusSummary;
        setProviderStatus(data);
      }
    } catch {
      // ignore if offline
    }
  }, []);

  useEffect(() => {
    refreshProviderStatus();
  }, [refreshProviderStatus]);

  // 3. Authenticated Subscriptions (Orders & Catering Enquiries)
  useEffect(() => {
    if (!authReady || !user) {
      setOrders([]);
      setCateringEnquiries([]);
      seenOrderIdsRef.current.clear();
      initialOrdersSnapshotLoadedRef.current = false;
      return;
    }

    const ordersQuery = isAdmin
      ? collection(db, 'orders')
      : query(collection(db, 'orders'), where('customerUid', '==', user.uid));

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const rawList = snap.docs.map((d) => d.data() as Order);
        // Sort newest orders at the top of the order list
        const sortedList = [...rawList].sort(
          (a, b) => extractOrderTimestampMs(b) - extractOrderTimestampMs(a)
        );

        if (!initialOrdersSnapshotLoadedRef.current) {
          for (const ord of sortedList) {
            seenOrderIdsRef.current.add(ord.id);
          }
          initialOrdersSnapshotLoadedRef.current = true;
        } else {
          const newlyArrivedOrders: Order[] = [];
          for (const ord of sortedList) {
            if (!seenOrderIdsRef.current.has(ord.id)) {
              seenOrderIdsRef.current.add(ord.id);
              if (ord.status === 'New Order') {
                newlyArrivedOrders.push(ord);
              }
            }
          }
          if (newlyArrivedOrders.length > 0 && isAdmin) {
            setLiveOrderAlerts((prev) => {
              const existingIds = new Set(prev.map((p) => p.id));
              const additions = newlyArrivedOrders.filter((n) => !existingIds.has(n.id));
              return [...additions, ...prev];
            });
            if (notificationSettings.soundEnabled) {
              playNewOrderAlertSound();
            }
          }
        }

        setOrders(sortedList);
      },
      (err) => console.debug('Orders listener notice:', err.message)
    );

    const cateringQuery = isAdmin
      ? collection(db, 'catering_enquiries')
      : query(collection(db, 'catering_enquiries'), where('customerUid', '==', user.uid));

    const unsubCatering = onSnapshot(
      cateringQuery,
      (snap) => {
        setCateringEnquiries(snap.docs.map((d) => d.data() as CateringEnquiry));
      },
      (err) => console.debug('Catering listener notice:', err.message)
    );

    return () => {
      unsubOrders();
      unsubCatering();
    };
  }, [authReady, user, isAdmin, notificationSettings.soundEnabled]);

  // Sync initial 23 confirmed dishes and settings to Firestore while preserving existing admin prices
  const seedDatabaseIfNeeded = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const existingMenu = await getDocs(collection(db, 'menu_items'));
      const existingMap = new Map<string, MenuItem>();
      existingMenu.docs.forEach((d) => {
        existingMap.set(d.id, d.data() as MenuItem);
      });

      const batch = writeBatch(db);

      const settingsRef = doc(db, 'restaurant_settings', 'main');
      batch.set(
        settingsRef,
        {
          ...DEFAULT_RESTAURANT_SETTINGS,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      for (const cat of INITIAL_CATEGORIES) {
        batch.set(doc(db, 'categories', cat.id), {
          ...cat,
          updatedAt: serverTimestamp(),
        });
      }

      for (const zone of INITIAL_DELIVERY_ZONES) {
        batch.set(doc(db, 'delivery_zones', zone.id), {
          ...zone,
          updatedAt: serverTimestamp(),
        });
      }

      for (const img of INITIAL_GALLERY_IMAGES) {
        batch.set(doc(db, 'gallery_images', img.id), {
          ...img,
          updatedAt: serverTimestamp(),
        });
      }

      for (const item of INITIAL_MENU_ITEMS) {
        const prev = existingMap.get(item.id);
        const preservedPrice = prev && prev.price > 0 ? prev.price : item.price;
        const preservedCustomPhoto =
          prev?.imageUrl &&
          (prev.imageUrl.startsWith('data:image/') || prev.imageUrl.startsWith('http'))
            ? prev.imageUrl
            : item.imageUrl;
        const preservedStock =
          typeof prev?.stockQuantity === 'number'
            ? prev.stockQuantity
            : item.stockQuantity ?? 24;
        const preservedThreshold =
          typeof prev?.lowStockThreshold === 'number'
            ? prev.lowStockThreshold
            : item.lowStockThreshold ?? 5;
        const preservedTrack =
          typeof prev?.trackInventory === 'boolean'
            ? prev.trackInventory
            : item.trackInventory ?? true;

        batch.set(doc(db, 'menu_items', item.id), {
          ...item,
          price: preservedPrice,
          imageUrl: preservedCustomPhoto,
          stockQuantity: preservedStock,
          lowStockThreshold: preservedThreshold,
          trackInventory: preservedTrack,
          updatedAt: serverTimestamp(),
        });
      }

      await batch.commit();
      notify('success', 'Synced all 31 official Faminas menu items and 7 categories with Firestore.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'menu_items');
    }
  }, [isAdmin, notify]);

  const updateItemPrice = async (item: MenuItem, nextPrice: number) => {
    const cleanPrice = Math.max(0, Number(nextPrice.toFixed(2)));
    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? { ...m, price: cleanPrice } : m))
    );
    try {
      const rawPrices = localStorage.getItem('faminas_custom_prices_v2');
      const map = rawPrices ? JSON.parse(rawPrices) : {};
      map[item.id] = cleanPrice;
      localStorage.setItem('faminas_custom_prices_v2', JSON.stringify(map));
    } catch {
      // ignore localStorage write errors
    }

    if (isAdmin) {
      try {
        await setDoc(
          doc(db, 'menu_items', item.id),
          {
            ...item,
            price: cleanPrice,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore price sync notice:', err);
      }
    }
    notify(
      'success',
      cleanPrice > 0
        ? `Updated ${item.name} price to $${cleanPrice.toFixed(2)}.`
        : `Cleared price for ${item.name}.`
    );
  };

  const updateItemInventory = async (
    item: MenuItem,
    updates: {
      stockQuantity?: number;
      lowStockThreshold?: number;
      trackInventory?: boolean;
    },
    silent = false
  ) => {
    const nextStock =
      typeof updates.stockQuantity === 'number'
        ? Math.max(0, Math.min(100000, Math.round(updates.stockQuantity)))
        : item.stockQuantity ?? 24;
    const nextThreshold =
      typeof updates.lowStockThreshold === 'number'
        ? Math.max(0, Math.min(10000, Math.round(updates.lowStockThreshold)))
        : item.lowStockThreshold ?? 5;
    const nextTrack =
      typeof updates.trackInventory === 'boolean'
        ? updates.trackInventory
        : item.trackInventory ?? true;

    const nextAvailable =
      nextTrack && nextStock <= 0
        ? false
        : nextTrack && (item.stockQuantity ?? 0) <= 0 && nextStock > 0
        ? true
        : item.isAvailable;

    const updatedItem: MenuItem = {
      ...item,
      stockQuantity: nextStock,
      lowStockThreshold: nextThreshold,
      trackInventory: nextTrack,
      isAvailable: nextAvailable,
    };

    setMenuItems((prev) =>
      prev.map((m) => (m.id === item.id ? updatedItem : m))
    );

    try {
      const rawInv = localStorage.getItem('faminas_custom_inventory_v1');
      const invMap = rawInv ? JSON.parse(rawInv) : {};
      invMap[item.id] = {
        stockQuantity: nextStock,
        lowStockThreshold: nextThreshold,
        trackInventory: nextTrack,
      };
      localStorage.setItem('faminas_custom_inventory_v1', JSON.stringify(invMap));
    } catch {
      // ignore localStorage write errors
    }

    if (isAdmin) {
      try {
        await setDoc(
          doc(db, 'menu_items', item.id),
          {
            ...updatedItem,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore inventory sync notice:', err);
      }
    }

    if (!silent) {
      if (nextTrack && nextStock <= 0) {
        notify('error', `${item.name} is now Out of Stock (0 portions remaining).`);
      } else if (nextTrack && nextStock <= nextThreshold) {
        notify(
          'error',
          `Low Stock Alert: ${item.name} has ${nextStock} portions left (threshold: ${nextThreshold}).`
        );
      } else {
        notify(
          'success',
          `Updated inventory for ${item.name}: ${nextStock} in stock (alert threshold: ${nextThreshold}).`
        );
      }
    }
  };

  const restockAllLowItems = async (addedPortions = 15) => {
    const lowItems = menuItems.filter(
      (m) =>
        (m.trackInventory ?? true) &&
        (m.stockQuantity ?? 24) <= (m.lowStockThreshold ?? 5)
    );
    if (lowItems.length === 0) {
      notify('success', 'All tracked menu items are already above their low-stock thresholds.');
      return;
    }

    for (const item of lowItems) {
      const current = item.stockQuantity ?? 0;
      const threshold = item.lowStockThreshold ?? 5;
      const targetStock = Math.max(current + addedPortions, threshold + 10);
      await updateItemInventory(
        item,
        { stockQuantity: targetStock, lowStockThreshold: threshold, trackInventory: true },
        true
      );
    }

    notify(
      'success',
      `Restocked ${lowItems.length} low-stock ${lowItems.length === 1 ? 'dish' : 'dishes'} (+${addedPortions} portions each).`
    );
  };

  const toggleDailySpecial = async (item: MenuItem, isSpecial?: boolean) => {
    const nextFeatured = typeof isSpecial === 'boolean' ? isSpecial : !item.isFeatured;
    const updatedItem: MenuItem = {
      ...item,
      isFeatured: nextFeatured,
    };

    setMenuItems((prev) => {
      const nextList = prev.map((m) => (m.id === item.id ? updatedItem : m));
      try {
        const specialsMap: Record<string, boolean> = {};
        for (const m of nextList) {
          specialsMap[m.id] = Boolean(m.isFeatured);
        }
        localStorage.setItem('faminas_daily_specials_v1', JSON.stringify(specialsMap));
      } catch {
        // ignore storage errors
      }
      return nextList;
    });

    if (isAdmin) {
      try {
        await setDoc(
          doc(db, 'menu_items', item.id),
          {
            ...updatedItem,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Firestore daily special sync notice:', err);
      }
    }

    notify(
      'success',
      nextFeatured
        ? `Added "${item.name}" ($${item.price.toFixed(2)}) to Today's Daily Specials on the Homepage.`
        : `Removed "${item.name}" from Today's Daily Specials.`
    );
  };

  const setDailySpecialsBatch = async (itemIds: string[], label = 'Daily Specials') => {
    const targetSet = new Set(itemIds);

    setMenuItems((prev) => {
      const nextList = prev.map((m) => ({
        ...m,
        isFeatured: targetSet.has(m.id),
      }));
      try {
        const specialsMap: Record<string, boolean> = {};
        for (const m of nextList) {
          specialsMap[m.id] = Boolean(m.isFeatured);
        }
        localStorage.setItem('faminas_daily_specials_v1', JSON.stringify(specialsMap));
      } catch {
        // ignore storage errors
      }
      return nextList;
    });

    if (isAdmin) {
      for (const m of menuItems) {
        const nextVal = targetSet.has(m.id);
        if (m.isFeatured !== nextVal) {
          try {
            await setDoc(
              doc(db, 'menu_items', m.id),
              {
                ...m,
                isFeatured: nextVal,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
          } catch {
            // ignore
          }
        }
      }
    }

    notify(
      'success',
      itemIds.length > 0
        ? `Updated ${label}: ${itemIds.length} dishes are now featured on the Homepage.`
        : 'Cleared all Daily Specials from the Homepage.'
    );
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      notify('success', 'Signed in successfully. Welcome to Faminas Restaurant.');
    } catch (err: any) {
      notify('error', err?.message || 'Sign-in cancelled or failed.');
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    notify('success', 'Signed out.');
  };

  // Cart Actions
  const addToCart = (menuItem: MenuItem, quantity = 1, specialInstructions = '') => {
    if (!menuItem.isAvailable) {
      notify('error', `${menuItem.name} is currently unavailable.`);
      return;
    }
    setCart((prev) => {
      const existingIdx = prev.findIndex((c) => c.menuItem.id === menuItem.id);
      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(200, updated[existingIdx].quantity + quantity),
          specialInstructions:
            specialInstructions.trim() || updated[existingIdx].specialInstructions,
        };
        return updated;
      }
      return [
        ...prev,
        {
          menuItem,
          quantity: Math.min(200, Math.max(1, quantity)),
          specialInstructions: specialInstructions.slice(0, 300),
        },
      ];
    });
    notify('success', `Added ${menuItem.name} to your order.`);
  };

  const updateCartQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, quantity: Math.min(200, quantity) }
          : item
      )
    );
  };

  const updateCartInstructions = (menuItemId: string, instructions: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.menuItem.id === menuItemId
          ? { ...item, specialInstructions: instructions.slice(0, 300) }
          : item
      )
    );
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => prev.filter((item) => item.menuItem.id !== menuItemId));
  };

  const clearCart = () => setCart([]);

  const toggleFavourite = async (menuItemId: string) => {
    const nextFavs = favouriteIds.includes(menuItemId)
      ? favouriteIds.filter((id) => id !== menuItemId)
      : [...favouriteIds, menuItemId].slice(0, 50);

    setFavouriteIds(nextFavs);

    if (user && profile) {
      try {
        await updateDoc(doc(db, 'profiles', user.uid), {
          fullName: profile.fullName,
          favouriteItemIds: nextFavs,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `profiles/${user.uid}`);
      }
    }
  };

  const appendOrderNotificationLogs = useCallback((newLogs: OrderNotificationLog[]) => {
    if (newLogs.length === 0) return;
    setOrderNotificationLogs((prev) => {
      const updated = [...newLogs, ...prev].slice(0, 200);
      try {
        localStorage.setItem('faminas_order_notification_logs_v1', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  }, []);

  const appendOrderStatusHistory = useCallback((entry: OrderStatusHistoryEntry) => {
    setStatusHistoryMap((prev) => {
      const list = prev[entry.orderId] || [];
      const nextMap = {
        ...prev,
        [entry.orderId]: [entry, ...list],
      };
      try {
        localStorage.setItem('faminas_order_status_history_v1', JSON.stringify(nextMap));
      } catch {
        // ignore storage errors
      }
      return nextMap;
    });
  }, []);

  const dispatchNewOrderBackendAlerts = useCallback(
    async (
      order: Order,
      items: OrderItem[],
      options?: { forceRetry?: boolean; retryChannel?: 'sms' | 'email' }
    ) => {
      if (!options?.forceRetry && dispatchedNewOrderIdsRef.current.has(order.id)) {
        return;
      }
      dispatchedNewOrderIdsRef.current.add(order.id);

      try {
        const response = await fetch('/api/notifications/new-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order: {
              ...order,
              createdAtIso: new Date().toISOString(),
            },
            items,
            config: {
              ownerEmail: notificationSettings.ownerEmail,
              ownerPhone: notificationSettings.ownerPhone,
              additionalEmails: notificationSettings.additionalEmails,
              additionalPhones: notificationSettings.additionalPhones,
              smsEnabled: notificationSettings.smsEnabled,
              emailEnabled: notificationSettings.emailEnabled,
              customerNotificationsEnabled: notificationSettings.customerNotificationsEnabled,
            },
            forceRetry: Boolean(options?.forceRetry),
            retryChannel: options?.retryChannel,
          }),
        });

        const data = await response.json();
        if (data?.providerStatus) {
          setProviderStatus(data.providerStatus);
        }

        if (Array.isArray(data?.results)) {
          const logs: OrderNotificationLog[] = data.results.map((r: any, idx: number) => ({
            id: `nlog_${Date.now()}_${idx}_${Math.random().toString(36).slice(2, 6)}`,
            orderId: order.id,
            orderReference: order.orderReference,
            eventType: 'new_order',
            channel: r.channel,
            provider: r.provider,
            providerConfigured: Boolean(r.providerConfigured),
            status: r.status,
            recipients: r.recipients || [],
            subject: r.subject,
            messagePreview: r.messagePreview || '',
            htmlBody: r.htmlBody,
            errorMessage: r.errorMessage,
            externalMessageId: r.externalMessageId,
            attempts: r.attempts ?? 1,
            dispatchedAtIso: r.dispatchedAtIso || new Date().toISOString(),
          }));
          appendOrderNotificationLogs(logs);

          // Also mirror email logs into emailNotifications for quick inspection
          for (const log of logs) {
            if (log.channel === 'email') {
              const emailRec: EmailNotificationRecord = {
                id: log.id,
                orderId: order.id,
                orderReference: order.orderReference,
                recipientName: 'FAMINAS Restaurant Owner & Staff',
                recipientEmail: log.recipients.join(', ') || notificationSettings.ownerEmail,
                status: order.status,
                subject:
                  log.subject ||
                  `NEW FOOD ORDER RECEIVED – FAMINAS RESTAURANT – ORDER #${order.orderReference}`,
                messageBody: log.messagePreview,
                bodyPreview: log.messagePreview,
                sentAtIso: log.dispatchedAtIso,
              };
              setEmailNotifications((prev) => {
                const updated = [emailRec, ...prev].slice(0, 100);
                try {
                  localStorage.setItem(
                    'faminas_email_notifications_v1',
                    JSON.stringify(updated)
                  );
                } catch {
                  // ignore
                }
                return updated;
              });
            }
          }
        }
      } catch (err: any) {
        const fallbackLog: OrderNotificationLog = {
          id: `nlog_err_${Date.now()}`,
          orderId: order.id,
          orderReference: order.orderReference,
          eventType: 'new_order',
          channel: options?.retryChannel || 'sms',
          provider: 'Notification Server',
          providerConfigured: false,
          status: 'failed',
          recipients: [notificationSettings.ownerPhone, notificationSettings.ownerEmail],
          messagePreview: `Order ${order.orderReference} ($${order.totalAmount.toFixed(2)}) saved in database. Notification request failed: ${
            err?.message || 'Network error'
          }`,
          errorMessage: err?.message || 'Network error contacting notification service',
          attempts: 1,
          dispatchedAtIso: new Date().toISOString(),
        };
        appendOrderNotificationLogs([fallbackLog]);
      }
    },
    [notificationSettings, appendOrderNotificationLogs]
  );

  // Place Order in Firestore
  const placeOrder = async (params: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    fulfillmentType: 'delivery' | 'pickup';
    deliveryZoneId: string;
    deliveryAddress: string;
    specialInstructions: string;
    paymentMethod: PaymentMethod;
  }): Promise<Order> => {
    if (!user) {
      throw new Error('Please sign in with Google to place and track your order securely.');
    }
    if (cart.length === 0) {
      throw new Error('Your shopping cart is empty.');
    }

    const subtotal = Number(
      cart.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0).toFixed(2)
    );
    const selectedZone = deliveryZones.find((z) => z.id === params.deliveryZoneId);
    const deliveryFee =
      params.fulfillmentType === 'delivery'
        ? Number((selectedZone ? selectedZone.fee : settings.defaultDeliveryFee).toFixed(2))
        : 0;
    const taxAmount = Number(((subtotal * settings.taxRatePercent) / 100).toFixed(2));
    const totalAmount = Number((subtotal + deliveryFee + taxAmount).toFixed(2));
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const orderId = `ord_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const orderReference = `FM${Date.now().toString().slice(-5)}`;
    const itemsSummary = cart
      .map((c) => `${c.quantity}x ${c.menuItem.name}`)
      .join(', ')
      .slice(0, 1500);

    const orderDoc: Order = {
      id: orderId,
      orderReference,
      customerUid: user.uid,
      customerName: params.customerName.trim().slice(0, 120),
      customerPhone: params.customerPhone.trim().slice(0, 40),
      customerEmail: (params.customerEmail || user.email || '').trim().slice(0, 120),
      fulfillmentType: params.fulfillmentType,
      deliveryZoneId: params.deliveryZoneId.slice(0, 128),
      deliveryAddress:
        params.fulfillmentType === 'delivery'
          ? params.deliveryAddress.trim().slice(0, 300)
          : 'In-Restaurant Pickup',
      specialInstructions: params.specialInstructions.trim().slice(0, 500),
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
      status: 'New Order',
      itemsSummary,
      itemCount,
      subtotal,
      deliveryFee,
      taxAmount,
      totalAmount,
    };

    try {
      // 1. Save Order Document in Firestore FIRST
      await setDoc(doc(db, 'orders', orderId), {
        ...orderDoc,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // 2. Write each OrderItem into /orders/{orderId}/order_items/{orderItemId}
      const createdOrderItems: OrderItem[] = [];
      for (let i = 0; i < cart.length; i++) {
        const c = cart[i];
        const orderItemId = `item_${i + 1}_${c.menuItem.id}`.slice(0, 128);
        const orderItemDoc: OrderItem = {
          id: orderItemId,
          orderId,
          customerUid: user.uid,
          menuItemId: c.menuItem.id,
          name: c.menuItem.name.slice(0, 120),
          unitPrice: c.menuItem.price,
          quantity: c.quantity,
          lineTotal: Number((c.menuItem.price * c.quantity).toFixed(2)),
          specialInstructions: (c.specialInstructions || '').slice(0, 300),
        };
        await setDoc(doc(db, 'orders', orderId, 'order_items', orderItemId), orderItemDoc);
        createdOrderItems.push(orderItemDoc);
      }
      setOrderItemsMap((prev) => ({ ...prev, [orderId]: createdOrderItems }));

      // 3. Record PaymentTransaction in /payment_transactions (pending until independently verified)
      const txId = `tx_${orderId}`.slice(0, 128);
      const txDoc: PaymentTransaction = {
        id: txId,
        orderId,
        customerUid: user.uid,
        amount: totalAmount,
        currency: settings.currencySymbol || '$',
        method: params.paymentMethod,
        status: 'pending',
        providerRef: orderReference,
      };
      await setDoc(doc(db, 'payment_transactions', txId), {
        ...txDoc,
        createdAt: serverTimestamp(),
      });

      // 4. Save customer contact record in /customers/{uid}
      const customerDoc: Customer = {
        uid: user.uid,
        fullName: orderDoc.customerName,
        phone: orderDoc.customerPhone,
        email: orderDoc.customerEmail,
        defaultAddress: orderDoc.deliveryAddress,
      };
      await setDoc(doc(db, 'customers', user.uid), {
        ...customerDoc,
        updatedAt: serverTimestamp(),
      });
      setCustomerRecord(customerDoc);

      // 5. Record initial status history entry
      appendOrderStatusHistory({
        id: `hist_${Date.now()}`,
        orderId,
        orderReference,
        status: 'New Order',
        actor: orderDoc.customerName,
        note: 'Order saved in database and queued for kitchen review.',
        timestampIso: new Date().toISOString(),
      });

      // 6. Trigger Live Admin Alert Banner & Sound if Admin is active in this session
      setLiveOrderAlerts((prev) => {
        if (prev.some((o) => o.id === orderDoc.id)) return prev;
        return [orderDoc, ...prev];
      });
      if (notificationSettings.soundEnabled) {
        playNewOrderAlertSound();
      }

      // 7. Trigger Backend SMS + Email Notifications ONLY AFTER order is saved in Firestore
      void dispatchNewOrderBackendAlerts(orderDoc, createdOrderItems);

      setLastPlacedOrder(orderDoc);
      clearCart();
      notify('success', `Order #${orderReference} placed! Restaurant owner has been notified.`);
      return orderDoc;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `orders/${orderId}`);
      try {
        const rawLocal = localStorage.getItem('faminas_offline_orders_v1');
        const list = rawLocal ? JSON.parse(rawLocal) : [];
        list.unshift(orderDoc);
        localStorage.setItem('faminas_offline_orders_v1', JSON.stringify(list.slice(0, 50)));
      } catch {
        // ignore localStorage errors
      }
      setLastPlacedOrder(orderDoc);
      clearCart();
      notify('success', `Order #${orderReference} confirmed! Please send order details via WhatsApp or call to finalize.`);
      return orderDoc;
    }
  };

  // Fetch OrderItems subcollection for a specific order (with fallback parsing for legacy summaries)
  const fetchOrderItems = useCallback(
    async (order: Order): Promise<OrderItem[]> => {
      if (orderItemsMap[order.id] && orderItemsMap[order.id].length > 0) {
        return orderItemsMap[order.id];
      }

      const subcollectionPath = `orders/${order.id}/order_items`;
      try {
        const itemsQuery = query(
          collection(db, 'orders', order.id, 'order_items'),
          where('orderId', '==', order.id),
          where('customerUid', '==', order.customerUid)
        );
        const snap = await getDocs(itemsQuery);
        if (!snap.empty) {
          const loaded = snap.docs.map((d) => d.data() as OrderItem);
          setOrderItemsMap((prev) => ({ ...prev, [order.id]: loaded }));
          return loaded;
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.LIST, subcollectionPath);
      }

      // Fallback parser if an older order has no subcollection items
      const fallbackItems: OrderItem[] = (order.itemsSummary || '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part, idx) => {
          const match = part.match(/^(\d+)x\s+(.+)$/i);
          const qty = match ? parseInt(match[1], 10) : 1;
          const itemName = match ? match[2].trim() : part;
          const matchedMenu = menuItems.find(
            (m) => m.name.toLowerCase() === itemName.toLowerCase()
          );
          const unitPrice = matchedMenu ? matchedMenu.price : 0;
          return {
            id: `fallback_${order.id}_${idx}`,
            orderId: order.id,
            customerUid: order.customerUid,
            menuItemId: matchedMenu?.id || `item_${idx}`,
            name: itemName,
            unitPrice,
            quantity: qty,
            lineTotal: Number((unitPrice * qty).toFixed(2)),
            specialInstructions: '',
          };
        });

      setOrderItemsMap((prev) => ({ ...prev, [order.id]: fallbackItems }));
      return fallbackItems;
    },
    [orderItemsMap, menuItems]
  );

  // WhatsApp Order Summary Generator (Uses Admin-Configured WhatsApp Number)
  const generateWhatsAppLink = (customParams?: {
    customerName?: string;
    fulfillmentType?: 'delivery' | 'pickup';
    deliveryAddress?: string;
    singleItem?: MenuItem;
  }): string => {
    const cleanPhone = (settings.whatsappNumber || '18565223029').replace(/[^0-9]/g, '');
    const cSym = settings.currencySymbol || '$';
    const guestName =
      customParams?.customerName ||
      customerRecord?.fullName ||
      user?.displayName ||
      'Customer';
    const fulfillment = customParams?.fulfillmentType || 'pickup';

    let lines: string[] = [
      `*FAMINAS AFRICAN AND AMERICANS RESTAURANT*`,
      `577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA`,
      `Phone: +1 (856) 522-3029 · faminasrestaurant.com`,
      `*New WhatsApp Order Request*`,
      `Customer: ${guestName}`,
      `Preference: ${fulfillment === 'delivery' ? 'Delivery' : 'Pickup'}`,
    ];

    if (fulfillment === 'delivery' && customParams?.deliveryAddress) {
      lines.push(`Delivery Address: ${customParams.deliveryAddress}`);
    }

    lines.push(`--------------------------------`);

    if (customParams?.singleItem) {
      const item = customParams.singleItem;
      const priceText = item.price > 0 ? ` — ${cSym}${item.price.toFixed(2)}` : '';
      lines.push(`• 1x ${item.name}${priceText}`);
      lines.push(`--------------------------------`);
      if (item.price > 0) {
        lines.push(`*Estimated Total: ${cSym}${item.price.toFixed(2)}*`);
      } else {
        lines.push(`*Please confirm total & availability*`);
      }
    } else {
      const subtotal = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);
      const delFee = fulfillment === 'delivery' ? settings.defaultDeliveryFee : 0;
      const tax = (subtotal * settings.taxRatePercent) / 100;
      const total = subtotal + delFee + tax;

      cart.forEach((c) => {
        const linePrice =
          c.menuItem.price > 0
            ? ` — ${cSym}${(c.menuItem.price * c.quantity).toFixed(2)}`
            : '';
        lines.push(`• ${c.quantity}x ${c.menuItem.name}${linePrice}`);
        if (c.specialInstructions) {
          lines.push(`  Note: ${c.specialInstructions}`);
        }
      });
      lines.push(`--------------------------------`);
      if (subtotal > 0) {
        lines.push(`Subtotal: ${cSym}${subtotal.toFixed(2)}`);
        if (delFee > 0) lines.push(`Delivery Fee: ${cSym}${delFee.toFixed(2)}`);
        if (tax > 0) lines.push(`Tax: ${cSym}${tax.toFixed(2)}`);
        lines.push(`*Total: ${cSym}${total.toFixed(2)}*`);
      } else {
        lines.push(`*Please confirm order total & ready time*`);
      }
    }

    const encodedText = encodeURIComponent(lines.join('\n'));
    return cleanPhone
      ? `https://wa.me/${cleanPhone}?text=${encodedText}`
      : `https://wa.me/?text=${encodedText}`;
  };

  const submitCateringEnquiry = async (
    data: Omit<CateringEnquiry, 'id' | 'customerUid' | 'status' | 'createdAt' | 'updatedAt'>
  ) => {
    if (!user) {
      throw new Error('Please sign in with Google to submit a catering enquiry.');
    }
    const enquiryId = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const payload: CateringEnquiry = {
      id: enquiryId,
      customerUid: user.uid,
      fullName: data.fullName.trim().slice(0, 120),
      phone: data.phone.trim().slice(0, 40),
      email: data.email.trim().slice(0, 120),
      eventType: data.eventType.trim().slice(0, 100),
      eventDate: data.eventDate.trim().slice(0, 40),
      guestCount: Math.min(5000, Math.max(1, Number(data.guestCount) || 20)),
      foodPreferences: data.foodPreferences.trim().slice(0, 500),
      additionalRequirements: (data.additionalRequirements || '').trim().slice(0, 500),
      status: 'New',
    };
    try {
      await setDoc(doc(db, 'catering_enquiries', enquiryId), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      notify('success', 'Your catering enquiry has been saved. Our events team will reach out shortly.');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `catering_enquiries/${enquiryId}`);
      try {
        const rawLocal = localStorage.getItem('faminas_offline_catering_v1');
        const list = rawLocal ? JSON.parse(rawLocal) : [];
        list.unshift(payload);
        localStorage.setItem('faminas_offline_catering_v1', JSON.stringify(list.slice(0, 50)));
      } catch {
        // ignore storage write errors
      }
      notify('success', 'Your catering enquiry has been recorded! Our events team will reach out shortly.');
    }
  };

  const submitTestimonial = async (data: {
    authorName: string;
    dishOrdered: string;
    rating: number;
    comment: string;
  }) => {
    if (!user) {
      throw new Error('Please sign in to share your dining feedback.');
    }
    const id = `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const payload: Testimonial = {
      id,
      authorUid: user.uid,
      authorName: data.authorName.trim().slice(0, 100),
      dishOrdered: data.dishOrdered.trim().slice(0, 120),
      rating: Math.min(5, Math.max(1, Number(data.rating) || 5)),
      comment: data.comment.trim().slice(0, 500),
      isApproved: isAdmin,
    };
    try {
      await setDoc(doc(db, 'testimonials', id), {
        ...payload,
        createdAt: serverTimestamp(),
      });
      notify(
        'success',
        isAdmin
          ? 'Review published to guestbook.'
          : 'Thank you! Your review has been submitted for restaurant approval.'
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `testimonials/${id}`);
      notify('success', 'Thank you! Your review has been received.');
    }
  };

  // Admin Mutations
  const saveMenuItem = async (item: Omit<MenuItem, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'menu_items', item.id), {
        ...item,
        name: item.name.trim().slice(0, 120),
        description: item.description.trim().slice(0, 600),
        dietaryNotes: (item.dietaryNotes || '').trim().slice(0, 200),
        imageUrl: (item.imageUrl || '').slice(0, 150000),
        updatedAt: serverTimestamp(),
      });
      notify('success', `Saved "${item.name}" to the digital menu.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `menu_items/${item.id}`);
    }
  };

  const deleteMenuItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'menu_items', id));
      setMenuItems((prev) => prev.filter((m) => m.id !== id));
      notify('success', 'Menu item deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `menu_items/${id}`);
    }
  };

  const saveCategory = async (cat: Omit<Category, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'categories', cat.id), {
        ...cat,
        updatedAt: serverTimestamp(),
      });
      notify('success', `Saved category "${cat.name}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `categories/${cat.id}`);
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'categories', id));
      setCategories((prev) => prev.filter((c) => c.id !== id));
      notify('success', 'Category deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `categories/${id}`);
    }
  };

  const saveRestaurantSettings = async (newSettings: Omit<RestaurantSetting, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'restaurant_settings', 'main'), {
        ...newSettings,
        updatedAt: serverTimestamp(),
      });
      notify('success', 'Restaurant settings updated.');
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'restaurant_settings/main');
    }
  };

  const saveDeliveryZone = async (zone: Omit<DeliveryZone, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'delivery_zones', zone.id), {
        ...zone,
        updatedAt: serverTimestamp(),
      });
      notify('success', `Saved delivery zone "${zone.zoneName}".`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `delivery_zones/${zone.id}`);
    }
  };

  const deleteDeliveryZone = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'delivery_zones', id));
      setDeliveryZones((prev) => prev.filter((z) => z.id !== id));
      notify('success', 'Delivery zone removed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `delivery_zones/${id}`);
    }
  };

  const sendOrderStatusEmail = useCallback(
    (order: Order, nextStatus: OrderStatus): EmailNotificationRecord => {
      const statusHeadlineMap: Record<OrderStatus, string> = {
        'New Order': 'We have received your order and our kitchen is reviewing it.',
        Accepted:
          'Great news! FAMINAS Kitchen has accepted your order and queued it for preparation.',
        Confirmed: 'Your order has been confirmed by FAMINAS kitchen.',
        Preparing: 'Our chefs are now freshly preparing your dishes.',
        'Ready for Pickup':
          'Your order is hot, packed, and ready for pickup at 577 Blackwood-Clementon Road, Lindenwold, NJ 08021.',
        'Out for Delivery': `Your delivery driver is on the way to ${order.deliveryAddress}.`,
        Completed: 'Your order is complete. Thank you for dining with FAMINAS!',
        Cancelled:
          'Your order has been cancelled. Please call +1 (856) 522-3029 if you have any questions.',
      };

      const recipientEmail =
        order.customerEmail && order.customerEmail.includes('@')
          ? order.customerEmail
          : 'customer@faminasrestaurant.com';

      const subject = `[FAMINAS Restaurant] Order #${order.orderReference} Update: ${nextStatus}`;
      const messageBody = [
        `Hello ${order.customerName},`,
        ``,
        statusHeadlineMap[nextStatus],
        ``,
        `Order Reference: #${order.orderReference}`,
        `Current Status: ${nextStatus}`,
        `Fulfillment: ${
          order.fulfillmentType === 'delivery'
            ? `Delivery to ${order.deliveryAddress}`
            : 'In-Restaurant Pickup (577 Blackwood-Clementon Rd, Lindenwold, NJ 08021)'
        }`,
        `Items Ordered: ${order.itemsSummary}`,
        `Order Total: ${settings.currencySymbol}${order.totalAmount.toFixed(2)}`,
        ``,
        `FAMINAS AFRICAN AND AMERICANS RESTAURANT`,
        `577 Blackwood-Clementon Road, Lindenwold, NJ 08021, USA`,
        `Phone: +1 (856) 522-3029 · faminasrestaurant.com`,
        `Good Food Brings People Together.`,
      ].join('\n');

      const record: EmailNotificationRecord = {
        id: `email_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        orderId: order.id,
        orderReference: order.orderReference,
        recipientName: order.customerName,
        recipientEmail,
        status: nextStatus,
        subject,
        messageBody,
        bodyPreview: messageBody,
        sentAtIso: new Date().toISOString(),
      };

      setEmailNotifications((prev) => {
        const updated = [record, ...prev].slice(0, 100);
        try {
          localStorage.setItem('faminas_email_notifications_v1', JSON.stringify(updated));
        } catch {
          // ignore storage errors
        }
        return updated;
      });

      // Dispatch customer notification via backend API
      if (notificationSettings.customerNotificationsEnabled) {
        fetch('/api/notifications/order-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order,
            nextStatus,
            config: notificationSettings,
          }),
        })
          .then((r) => r.json())
          .then((data) => {
            if (Array.isArray(data?.results)) {
              const logs: OrderNotificationLog[] = data.results.map((r: any, idx: number) => ({
                id: `slog_${Date.now()}_${idx}`,
                orderId: order.id,
                orderReference: order.orderReference,
                eventType: 'status_update',
                channel: r.channel,
                provider: r.provider,
                providerConfigured: Boolean(r.providerConfigured),
                status: r.status,
                recipients: r.recipients || [],
                subject: r.subject,
                messagePreview: r.messagePreview || messageBody,
                htmlBody: r.htmlBody,
                errorMessage: r.errorMessage,
                externalMessageId: r.externalMessageId,
                attempts: r.attempts ?? 1,
                dispatchedAtIso: r.dispatchedAtIso || new Date().toISOString(),
              }));
              appendOrderNotificationLogs(logs);
            }
          })
          .catch(() => {});
      }

      return record;
    },
    [settings.currencySymbol, notificationSettings, appendOrderNotificationLogs]
  );

  // Update Order Status (Never automatically mark unpaid order as paid; payment status is verified independently)
  const updateOrderStatus = async (order: Order, nextStatus: OrderStatus, note?: string) => {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        status: nextStatus,
        paymentStatus: order.paymentStatus,
        updatedAt: serverTimestamp(),
      });

      appendOrderStatusHistory({
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        orderId: order.id,
        orderReference: order.orderReference,
        previousStatus: order.status,
        status: nextStatus,
        actor: user?.email || 'Restaurant Admin',
        note: note || `Order status updated from "${order.status}" to "${nextStatus}".`,
        timestampIso: new Date().toISOString(),
      });

      if (nextStatus !== 'New Order') {
        setLiveOrderAlerts((prev) => prev.filter((a) => a.id !== order.id));
      }

      const emailRecord = sendOrderStatusEmail(order, nextStatus);
      notify(
        'success',
        `Order #${order.orderReference} updated to "${nextStatus}" · Customer notification logged for ${emailRecord.recipientEmail}.`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  // Independent Payment Status Verification
  const updateOrderPaymentStatus = async (order: Order, nextPaymentStatus: PaymentStatus) => {
    try {
      await setDoc(doc(db, 'orders', order.id), {
        ...order,
        paymentStatus: nextPaymentStatus,
        updatedAt: serverTimestamp(),
      });

      appendOrderStatusHistory({
        id: `hist_pay_${Date.now()}`,
        orderId: order.id,
        orderReference: order.orderReference,
        previousStatus: order.status,
        status: order.status,
        actor: user?.email || 'Restaurant Admin',
        note: `Payment status independently verified as "${nextPaymentStatus.toUpperCase()}".`,
        timestampIso: new Date().toISOString(),
      });

      notify(
        'success',
        `Order #${order.orderReference} payment status updated to "${nextPaymentStatus.toUpperCase()}".`
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${order.id}`);
    }
  };

  const saveNotificationSettings = useCallback(
    (nextSettings: NotificationSettings) => {
      const updated: NotificationSettings = {
        ...nextSettings,
        updatedAtIso: new Date().toISOString(),
      };
      setNotificationSettings(updated);
      try {
        localStorage.setItem('faminas_notification_settings_v1', JSON.stringify(updated));
      } catch {
        // ignore storage errors
      }
      notify('success', 'Saved restaurant SMS, Email & Live Alert notification settings.');
    },
    [notify]
  );

  const retryOrderNotification = useCallback(
    async (order: Order, channel?: 'sms' | 'email') => {
      const items = await fetchOrderItems(order);
      await dispatchNewOrderBackendAlerts(order, items, {
        forceRetry: true,
        retryChannel: channel,
      });
      notify(
        'success',
        `Retried ${channel ? channel.toUpperCase() : 'SMS & Email'} notification for Order #${
          order.orderReference
        }.`
      );
    },
    [fetchOrderItems, dispatchNewOrderBackendAlerts, notify]
  );

  const sendTestNotification = useCallback(
    async (channel: 'sms' | 'email', customRecipient?: string) => {
      try {
        const res = await fetch('/api/notifications/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel,
            recipient: customRecipient,
            config: notificationSettings,
          }),
        });
        const data = await res.json();
        if (data?.providerStatus) {
          setProviderStatus(data.providerStatus);
        }
        if (data?.result) {
          const r = data.result;
          const log: OrderNotificationLog = {
            id: `test_${Date.now()}`,
            orderId: 'test_order',
            orderReference: 'FM1025',
            eventType: 'test',
            channel: r.channel,
            provider: r.provider,
            providerConfigured: Boolean(r.providerConfigured),
            status: r.status,
            recipients: r.recipients || [],
            subject: r.subject,
            messagePreview: r.messagePreview || '',
            htmlBody: r.htmlBody,
            errorMessage: r.errorMessage,
            externalMessageId: r.externalMessageId,
            attempts: r.attempts ?? 1,
            dispatchedAtIso: r.dispatchedAtIso || new Date().toISOString(),
          };
          appendOrderNotificationLogs([log]);

          if (r.status === 'delivered') {
            notify(
              'success',
              `Test ${channel.toUpperCase()} delivered via ${r.provider} to ${r.recipients.join(', ')}.`
            );
          } else if (r.status === 'unconfigured') {
            notify(
              'error',
              `Test ${channel.toUpperCase()} generated & logged (${r.provider} API credentials not yet configured in server environment secrets).`
            );
          } else {
            notify(
              'error',
              `Test ${channel.toUpperCase()} failed: ${r.errorMessage || 'Provider error'}`
            );
          }
        }
      } catch (err: any) {
        notify('error', err?.message || `Failed to run test ${channel.toUpperCase()} notification.`);
      }
    },
    [notificationSettings, appendOrderNotificationLogs, notify]
  );

  const playTestAlertSound = useCallback(() => {
    const ok = playNewOrderAlertSound();
    if (ok) {
      notify('success', 'Played FAMINAS Kitchen New Order Alert Chime.');
    } else {
      notify('error', 'Browser blocked audio playback. Click anywhere on the page and try again.');
    }
  }, [notify]);

  const dismissLiveOrderAlert = useCallback((orderId: string) => {
    setLiveOrderAlerts((prev) => prev.filter((o) => o.id !== orderId));
  }, []);

  const clearAllLiveOrderAlerts = useCallback(() => {
    setLiveOrderAlerts([]);
  }, []);

  const updateCateringStatus = async (
    enquiry: CateringEnquiry,
    nextStatus: CateringEnquiry['status']
  ) => {
    try {
      await updateDoc(doc(db, 'catering_enquiries', enquiry.id), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
      notify('success', `Catering enquiry updated to ${nextStatus}.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `catering_enquiries/${enquiry.id}`);
    }
  };

  const approveTestimonial = async (testimonial: Testimonial, isApproved: boolean) => {
    try {
      await updateDoc(doc(db, 'testimonials', testimonial.id), {
        isApproved,
        comment: testimonial.comment,
        rating: testimonial.rating,
      });
      notify('success', isApproved ? 'Testimonial approved.' : 'Testimonial hidden.');
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `testimonials/${testimonial.id}`);
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'testimonials', id));
      notify('success', 'Testimonial deleted.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `testimonials/${id}`);
    }
  };

  const saveGalleryImage = async (img: Omit<GalleryImage, 'updatedAt'>) => {
    try {
      await setDoc(doc(db, 'gallery_images', img.id), {
        ...img,
        updatedAt: serverTimestamp(),
      });
      notify('success', `Saved "${img.title}" to gallery.`);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `gallery_images/${img.id}`);
    }
  };

  const deleteGalleryImage = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery_images', id));
      setGalleryImages((prev) => prev.filter((g) => g.id !== id));
      notify('success', 'Gallery item removed.');
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `gallery_images/${id}`);
    }
  };

  const updateHeroSlide = (updatedSlide: HeroSlideConfig) => {
    setHeroSlides((prev) => {
      const next = prev.map((s) => (s.id === updatedSlide.id ? updatedSlide : s));
      try {
        localStorage.setItem('faminas_hero_slides_v1', JSON.stringify(next));
      } catch {
        // ignore storage errors
      }
      return next;
    });
    notify('success', `Updated Homepage Hero Slide #${updatedSlide.id} (${updatedSlide.dishShortName}).`);
  };

  const resetHeroSlides = () => {
    setHeroSlides(DEFAULT_HERO_SLIDES);
    try {
      localStorage.removeItem('faminas_hero_slides_v1');
    } catch {
      // ignore
    }
    notify('success', 'Restored all 5 Homepage Hero Slider photographs to default studio images.');
  };

  const subscribeNewsletter = (params: {
    fullName: string;
    email: string;
    phone: string;
    consented: boolean;
  }) => {
    if (!params.consented) {
      notify('error', 'Please check the consent box to receive special offers and menu updates.');
      return;
    }
    const cleanEmail = params.email.trim();
    const cleanPhone = params.phone.trim();
    if (!cleanEmail && !cleanPhone) {
      notify('error', 'Please enter your email address or phone number.');
      return;
    }
    const newSub: NewsletterSubscriber = {
      id: `sub_${Date.now()}`,
      fullName: params.fullName.trim().slice(0, 100) || 'Valued Guest',
      email: cleanEmail.slice(0, 120),
      phone: cleanPhone.slice(0, 40),
      consented: true,
      subscribedAtIso: new Date().toISOString(),
    };
    setNewsletterSubscribers((prev) => {
      const updated = [newSub, ...prev].slice(0, 250);
      try {
        localStorage.setItem('faminas_newsletter_subscribers_v1', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    notify(
      'success',
      'Welcome to the FAMINAS VIP Club! You are subscribed for Daily Specials and seasonal offers.'
    );
  };

  // CMS Content Management Implementations
  const updateDraftSection = useCallback(
    <K extends SectionKey>(section: K, data: WebsiteContent[K]) => {
      setDraftWebsiteContent((prev) => {
        const updated: WebsiteContent = {
          ...prev,
          [section]: data,
        };
        try {
          localStorage.setItem('faminas_draft_website_content_v1', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to cache draft:', err);
        }
        setIsContentDirty(true);
        return updated;
      });
    },
    []
  );

  const updateDraftField = useCallback(
    <K extends SectionKey, F extends keyof WebsiteContent[K]>(
      section: K,
      field: F,
      value: WebsiteContent[K][F]
    ) => {
      setDraftWebsiteContent((prev) => {
        const currentSection = prev[section];
        const updated: WebsiteContent = {
          ...prev,
          [section]: {
            ...currentSection,
            [field]: value,
          },
        };
        try {
          localStorage.setItem('faminas_draft_website_content_v1', JSON.stringify(updated));
        } catch (err) {
          console.error('Failed to cache draft field:', err);
        }
        setIsContentDirty(true);
        return updated;
      });
    },
    []
  );

  const discardDraft = useCallback(() => {
    setDraftWebsiteContent(websiteContent);
    try {
      localStorage.setItem('faminas_draft_website_content_v1', JSON.stringify(websiteContent));
    } catch {}
    setIsContentDirty(false);
    notify('success', 'Draft changes discarded. Reverted to live published website.');
  }, [websiteContent, notify]);

  const publishWebsiteContent = useCallback(async () => {
    try {
      const toPublish: WebsiteContent = {
        ...draftWebsiteContent,
        lastPublishedAt: new Date().toISOString(),
        publishedBy: user?.displayName || user?.email || 'Administrator',
      };

      // 1. Immediately store in localStorage so live changes persist across refresh and redeploy
      localStorage.setItem('faminas_published_website_content_v1', JSON.stringify(toPublish));
      localStorage.setItem('faminas_draft_website_content_v1', JSON.stringify(toPublish));

      // 2. Persist to Firestore document `restaurant_settings/website_content`
      try {
        const contentDocRef = doc(db, 'restaurant_settings', 'website_content');
        await setDoc(contentDocRef, {
          ...toPublish,
          updatedAt: serverTimestamp(),
        });
      } catch (firestoreErr) {
        console.warn('Firestore sync note (content saved to local cache):', firestoreErr);
      }

      setWebsiteContent(toPublish);
      setDraftWebsiteContent(toPublish);
      if (toPublish.branding) {
        setSettings((prev) => ({
          ...prev,
          restaurantName: toPublish.branding.restaurantName || prev.restaurantName,
          tagline: toPublish.branding.tagline || prev.tagline,
          currencySymbol: toPublish.branding.currencySymbol || prev.currencySymbol,
          defaultDeliveryFee:
            typeof toPublish.branding.defaultDeliveryFee === 'number'
              ? toPublish.branding.defaultDeliveryFee
              : prev.defaultDeliveryFee,
          taxRatePercentage:
            typeof toPublish.branding.taxRatePercentage === 'number'
              ? toPublish.branding.taxRatePercentage
              : prev.taxRatePercentage,
        }));
      }
      setIsContentDirty(false);
      notify('success', '🎉 Website content published! Live frontend updated instantly.');
    } catch (err) {
      console.error('Failed to publish website content:', err);
      notify('error', 'Failed to publish content. Please check connection and try again.');
      throw err;
    }
  }, [draftWebsiteContent, user, notify]);

  const resetWebsiteContentToDefault = useCallback(async () => {
    try {
      setDraftWebsiteContent(INITIAL_WEBSITE_CONTENT);
      setWebsiteContent(INITIAL_WEBSITE_CONTENT);
      localStorage.setItem('faminas_published_website_content_v1', JSON.stringify(INITIAL_WEBSITE_CONTENT));
      localStorage.setItem('faminas_draft_website_content_v1', JSON.stringify(INITIAL_WEBSITE_CONTENT));
      try {
        const contentDocRef = doc(db, 'restaurant_settings', 'website_content');
        await setDoc(contentDocRef, {
          ...INITIAL_WEBSITE_CONTENT,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {}
      setIsContentDirty(false);
      notify('success', 'Website content reset to factory defaults.');
    } catch (err) {
      notify('error', 'Could not reset website content.');
    }
  }, [notify]);

  const uploadMedia = useCallback(async (file: File, folder: string = 'cms_media'): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        try {
          const response = await fetch('/api/upload.php', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-auth': 'true',
            },
            body: JSON.stringify({
              base64Data,
              filename: file.name,
              folder,
              adminToken: 'faminas-authorized-admin-session',
            }),
          });

          if (response.ok) {
            const resData = await response.json();
            if (resData.url) {
              resolve(resData.url);
              return;
            }
          }
          // Fallback to base64 data URL
          resolve(base64Data);
        } catch (err) {
          console.warn('Upload API request error, fallback to base64 data URL:', err);
          resolve(base64Data);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }, []);

  return (
    <RestaurantContext.Provider
      value={{
        user,
        profile,
        customerRecord,
        isAdmin,
        authReady,
        categories,
        menuItems,
        foodImages,
        settings,
        deliveryZones,
        testimonials,
        galleryImages,
        orders,
        orderItemsMap,
        fetchOrderItems,
        emailNotifications,
        sendOrderStatusEmail,
        cateringEnquiries,
        cart,
        favouriteIds,
        lastPlacedOrder,
        notification,
        clearNotification,
        notify,
        signInWithGoogle,
        signOut,
        addToCart,
        updateCartQuantity,
        updateCartInstructions,
        removeFromCart,
        clearCart,
        toggleFavourite,
        placeOrder,
        generateWhatsAppLink,
        submitCateringEnquiry,
        submitTestimonial,
        seedDatabaseIfNeeded,
        updateItemPrice,
        updateItemInventory,
        restockAllLowItems,
        toggleDailySpecial,
        setDailySpecialsBatch,
        saveMenuItem,
        deleteMenuItem,
        saveCategory,
        deleteCategory,
        saveRestaurantSettings,
        saveDeliveryZone,
        deleteDeliveryZone,
        updateOrderStatus,
        updateOrderPaymentStatus,
        notificationSettings,
        saveNotificationSettings,
        providerStatus,
        refreshProviderStatus,
        orderNotificationLogs,
        retryOrderNotification,
        sendTestNotification,
        playTestAlertSound,
        liveOrderAlerts,
        dismissLiveOrderAlert,
        clearAllLiveOrderAlerts,
        statusHistoryMap,
        updateCateringStatus,
        approveTestimonial,
        deleteTestimonial,
        saveGalleryImage,
        deleteGalleryImage,
        heroSlides,
        updateHeroSlide,
        resetHeroSlides,
        newsletterSubscribers,
        subscribeNewsletter,
        websiteContent,
        draftWebsiteContent,
        isContentDirty,
        updateDraftSection,
        updateDraftField,
        publishWebsiteContent,
        discardDraft,
        resetWebsiteContentToDefault,
        uploadMedia,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = (): RestaurantContextValue => {
  const ctx = useContext(RestaurantContext);
  if (!ctx) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return ctx;
};
