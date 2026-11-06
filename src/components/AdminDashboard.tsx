import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Edit3,
  Check,
  Database,
  Settings,
  ShoppingBag,
  Utensils,
  Calendar,
  Image as ImageIcon,
  ShieldAlert,
  AlertTriangle,
  PackageCheck,
  RefreshCw,
  Search,
  Mail,
  Send,
  Sparkles,
  Star,
  Globe,
  Download,
  Copy,
  ExternalLink,
  Bell,
  Volume2,
  VolumeX,
  Phone,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  Layout,
} from 'lucide-react';
import { WebsiteContentEditor } from './WebsiteContentEditor';
import { useRestaurant } from '../context/RestaurantContext';
import { getCulinaryVisualUrl } from '../lib/culinaryVisuals';
import {
  generateGoogleMerchantXmlFeed,
  generateGoogleMerchantTsvFeed,
  resolveAbsoluteImageUrl,
} from '../lib/googleMerchantSeo';
import {
  Category,
  CuisineGroup,
  CuisineType,
  GalleryCategory,
  GalleryImage,
  MenuItem,
  Order,
  OrderStatus,
  PaymentStatus,
  SpiceLevel,
} from '../types/restaurant';

const ORDER_STATUSES: OrderStatus[] = [
  'New Order',
  'Accepted',
  'Preparing',
  'Ready for Pickup',
  'Out for Delivery',
  'Completed',
  'Cancelled',
];

export const AdminDashboard: React.FC<{ onPreviewWebsite?: () => void }> = ({
  onPreviewWebsite,
}) => {
  const {
    user,
    isAdmin,
    signInWithGoogle,
    categories,
    menuItems,
    orders,
    orderItemsMap,
    fetchOrderItems,
    cateringEnquiries,
    testimonials,
    galleryImages,
    settings,
    deliveryZones,
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
    emailNotifications,
    sendOrderStatusEmail,
    updateCateringStatus,
    approveTestimonial,
    deleteTestimonial,
    saveGalleryImage,
    deleteGalleryImage,
    heroSlides,
    updateHeroSlide,
    resetHeroSlides,
    newsletterSubscribers,
    isContentDirty,
    notify,
  } = useRestaurant();

  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'website-cms'
    | 'orders'
    | 'notifications'
    | 'daily-specials'
    | 'google-merchant'
    | 'menu'
    | 'catering'
    | 'gallery'
    | 'settings'
  >('overview');
  const [expandedEmailLogOrderId, setExpandedEmailLogOrderId] = useState<string | null>(null);
  const [expandedOrderDetailsId, setExpandedOrderDetailsId] = useState<string | null>(null);
  const [confirmRejectOrderId, setConfirmRejectOrderId] = useState<string | null>(null);
  const [notifForm, setNotifForm] = useState(notificationSettings);
  const [additionalEmailsInput, setAdditionalEmailsInput] = useState(
    notificationSettings.additionalEmails.join(', ')
  );
  const [additionalPhonesInput, setAdditionalPhonesInput] = useState(
    notificationSettings.additionalPhones.join(', ')
  );
  const [testingSms, setTestingSms] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  // Daily Specials Filter & Search State
  const [dailySpecialCategory, setDailySpecialCategory] = useState<string>('all');
  const [dailySpecialSearch, setDailySpecialSearch] = useState<string>('');

  // Menu Inventory Filter & Search State
  const [inventoryFilter, setInventoryFilter] = useState<
    'all' | 'low_stock' | 'out_of_stock' | 'healthy'
  >('all');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  // Menu Item Editor State
  const [editingItem, setEditingItem] = useState<Omit<MenuItem, 'updatedAt'>>({
    id: '',
    name: '',
    categoryId: categories[0]?.id || 'cat-sierra-leonean-specialties',
    categoryName: categories[0]?.name || 'Category A: Sierra Leonean Specialties',
    cuisineType: 'Sierra Leonean',
    description: '',
    price: 0,
    imageKey: 'achecke_grilled_fish',
    imageUrl: '',
    isAvailable: true,
    isPopular: false,
    isFeatured: false,
    spiceLevel: 'Medium',
    prepTimeMinutes: 20,
    dietaryNotes: 'Gluten-Free',
    stockQuantity: 24,
    lowStockThreshold: 5,
    trackInventory: true,
  });
  const [isEditingExisting, setIsEditingExisting] = useState(false);

  // Category Editor State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryGroup, setNewCategoryGroup] = useState<CuisineGroup>('African & West African');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState(settings);

  // Delivery Zone State
  const [zoneName, setZoneName] = useState('');
  const [zoneFee, setZoneFee] = useState(0);
  const [zoneMinutes, setZoneMinutes] = useState(35);

  // Gallery Form State
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCategory, setGalleryCategory] = useState<GalleryCategory>('Sierra Leonean Dishes');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageKey, setGalleryImageKey] = useState('jollof_rice');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-[#16110D] border border-white/10 rounded-xl text-center">
        <ShieldAlert className="w-10 h-10 text-[#D4AF37] mx-auto mb-4" />
        <h1 className="font-serif-display text-3xl font-bold text-[#F7F2EB]">
          Restaurant Owner Administration
        </h1>
        <p className="text-sm text-[#F7F2EB]/70 mt-2 mb-6">
          Sign in with your verified administrator Google account to manage orders, menu items, prices, and restaurant settings.
        </p>
        <button
          onClick={signInWithGoogle}
          className="px-6 py-3 rounded-lg bg-[#D4AF37] text-[#0F0B08] font-semibold text-sm hover:bg-[#E2C15A] transition-colors"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-[#16110D] border border-white/10 rounded-xl text-center">
        <ShieldAlert className="w-10 h-10 text-[#E63946] mx-auto mb-4" />
        <h1 className="font-serif-display text-3xl font-bold text-[#F7F2EB]">
          Administrator Access Required
        </h1>
        <p className="text-sm text-[#F7F2EB]/70 mt-2">
          Signed in as <span className="text-[#F7F2EB] font-medium">{user.email}</span>. Only authorised restaurant administrators can modify menu items, orders, or restaurant settings.
        </p>
      </div>
    );
  }

  // Metrics Calculation
  const totalOrders = orders.length;
  const pendingNewOrdersList = orders.filter((o) => o.status === 'New Order');
  const pendingOrders = pendingNewOrdersList.length;
  const confirmedOrders = orders.filter(
    (o) => o.status === 'Accepted' || o.status === 'Confirmed'
  ).length;
  const preparingOrders = orders.filter((o) => o.status === 'Preparing').length;
  const completedOrders = orders.filter((o) => o.status === 'Completed').length;
  const cancelledOrders = orders.filter((o) => o.status === 'Cancelled').length;
  const totalSales = orders
    .filter((o) => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  // Failed or Unconfigured Notification Logs requiring attention
  const failedOrUnconfiguredLogs = orderNotificationLogs.filter(
    (log) =>
      log.eventType === 'new_order' &&
      (log.status === 'failed' || log.status === 'unconfigured')
  );

  // Active Live Alert Orders (Combine realtime alerts + any New Order in database)
  const activeBannerOrders: Order[] = [
    ...liveOrderAlerts,
    ...pendingNewOrdersList.filter((po) => !liveOrderAlerts.some((la) => la.id === po.id)),
  ];

  const handleToggleViewOrder = async (order: Order) => {
    if (expandedOrderDetailsId === order.id) {
      setExpandedOrderDetailsId(null);
      return;
    }
    setExpandedOrderDetailsId(order.id);
    await fetchOrderItems(order);
  };

  const handleAcceptOrder = async (order: Order) => {
    await updateOrderStatus(
      order,
      'Accepted',
      'Order accepted by restaurant admin in dashboard.'
    );
    dismissLiveOrderAlert(order.id);
  };

  const handleConfirmRejectOrder = async (order: Order) => {
    await updateOrderStatus(
      order,
      'Cancelled',
      'Order rejected/cancelled by restaurant admin after confirmation.'
    );
    setConfirmRejectOrderId(null);
    dismissLiveOrderAlert(order.id);
  };

  const popularDishes = menuItems.filter((m) => m.isPopular);
  const dailySpecialItems = menuItems.filter((m) => m.isFeatured);

  const filteredSpecialsCandidates = menuItems.filter((item) => {
    if (dailySpecialCategory !== 'all' && item.categoryId !== dailySpecialCategory) {
      return false;
    }
    if (dailySpecialSearch.trim()) {
      const q = dailySpecialSearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.categoryName.toLowerCase().includes(q) ||
        item.cuisineType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Inventory & Low-Stock Metrics
  const trackedItems = menuItems.filter((m) => m.trackInventory !== false);
  const outOfStockItems = trackedItems.filter((m) => (m.stockQuantity ?? 24) <= 0);
  const lowStockItems = trackedItems.filter((m) => {
    const qty = m.stockQuantity ?? 24;
    const threshold = m.lowStockThreshold ?? 5;
    return qty > 0 && qty <= threshold;
  });
  const alertedInventoryItems = [...outOfStockItems, ...lowStockItems].sort(
    (a, b) => (a.stockQuantity ?? 0) - (b.stockQuantity ?? 0)
  );
  const healthyStockItems = trackedItems.filter(
    (m) => (m.stockQuantity ?? 24) > (m.lowStockThreshold ?? 5)
  );

  const filteredAdminMenuItems = menuItems.filter((item) => {
    const matchesSearch =
      !menuSearchQuery.trim() ||
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      item.categoryName.toLowerCase().includes(menuSearchQuery.toLowerCase());
    if (!matchesSearch) return false;

    const isTracked = item.trackInventory !== false;
    const qty = item.stockQuantity ?? 24;
    const threshold = item.lowStockThreshold ?? 5;

    if (inventoryFilter === 'low_stock') {
      return isTracked && qty <= threshold;
    }
    if (inventoryFilter === 'out_of_stock') {
      return isTracked && qty <= 0;
    }
    if (inventoryFilter === 'healthy') {
      return !isTracked || qty > threshold;
    }
    return true;
  });

  const compressAndReadImage = (
    file: File,
    onResult: (dataUrl: string) => void
  ) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const compressed = canvas.toDataURL('image/jpeg', 0.78);
          onResult(compressed);
        } else {
          onResult(reader.result as string);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    compressAndReadImage(file, (dataUrl) => {
      setEditingItem((prev) => ({ ...prev, imageUrl: dataUrl }));
    });
  };

  const handleSaveMenuItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.name.trim()) return;
    const cleanId =
      editingItem.id.trim() ||
      editingItem.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
    const matchedCat = categories.find((c) => c.id === editingItem.categoryId);

    const stockQty =
      typeof editingItem.stockQuantity === 'number'
        ? Math.max(0, Math.round(editingItem.stockQuantity))
        : 24;
    const thresholdQty =
      typeof editingItem.lowStockThreshold === 'number'
        ? Math.max(0, Math.round(editingItem.lowStockThreshold))
        : 5;
    const trackInv = editingItem.trackInventory !== false;

    await saveMenuItem({
      ...editingItem,
      id: cleanId,
      categoryName: matchedCat ? matchedCat.name : editingItem.categoryName,
      price: Number(editingItem.price) || 0,
      prepTimeMinutes: Number(editingItem.prepTimeMinutes) || 15,
      stockQuantity: stockQty,
      lowStockThreshold: thresholdQty,
      trackInventory: trackInv,
      isAvailable: trackInv && stockQty <= 0 ? false : editingItem.isAvailable,
    });

    setEditingItem({
      id: '',
      name: '',
      categoryId: categories[0]?.id || 'cat-sierra-leonean-specialties',
      categoryName: categories[0]?.name || 'Category A: Sierra Leonean Specialties',
      cuisineType: 'Sierra Leonean',
      description: '',
      price: 0,
      imageKey: 'cassava_leaves',
      imageUrl: '',
      isAvailable: true,
      isPopular: false,
      isFeatured: false,
      spiceLevel: 'Medium',
      prepTimeMinutes: 20,
      dietaryNotes: 'Freshly Prepared',
      stockQuantity: 24,
      lowStockThreshold: 5,
      trackInventory: true,
    });
    setIsEditingExisting(false);
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const slug = newCategoryName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const id = `cat-${slug}`;
    await saveCategory({
      id,
      name: newCategoryName.trim(),
      slug,
      cuisineGroup: newCategoryGroup,
      description: newCategoryDesc.trim() || `${newCategoryName} selection.`,
      sortOrder: categories.length + 1,
      isActive: true,
    });
    setNewCategoryName('');
    setNewCategoryDesc('');
  };

  const handleAddDeliveryZone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneName.trim()) return;
    const id = `zone_${Date.now()}`;
    await saveDeliveryZone({
      id,
      zoneName: zoneName.trim(),
      fee: Number(zoneFee) || 0,
      estimatedMinutes: Number(zoneMinutes) || 35,
      isActive: true,
    });
    setZoneName('');
    setZoneFee(0);
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryCaption.trim()) return;
    const id = `gal_${Date.now()}`;
    const item: Omit<GalleryImage, 'updatedAt'> = {
      id,
      title: galleryTitle.trim(),
      category: galleryCategory,
      caption: galleryCaption.trim(),
      imageKey: galleryImageKey,
      imageUrl: galleryImageUrl.trim(),
    };
    await saveGalleryImage(item);
    setGalleryTitle('');
    setGalleryCaption('');
    setGalleryImageUrl('');
  };

  const handleDownloadMerchantXml = () => {
    const xmlContent = generateGoogleMerchantXmlFeed(menuItems, settings);
    const blob = new Blob([xmlContent], { type: 'application/rss+xml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google-merchant-feed.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(
      'success',
      `Downloaded Google Merchant XML Feed (${menuItems.length} dishes with photos & USD prices).`
    );
  };

  const handleDownloadMerchantTsv = () => {
    const tsvContent = generateGoogleMerchantTsvFeed(menuItems, settings);
    const blob = new Blob([tsvContent], {
      type: 'text/tab-separated-values;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'google-merchant-products.tsv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(
      'success',
      `Downloaded Google Merchant Spreadsheet TSV (${menuItems.length} dishes).`
    );
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify('success', `Copied ${label} to clipboard.`);
    } catch {
      notify('error', `Unable to copy ${label}.`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header & Database Sync Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-white/10">
        <div>
          <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">
            Faminas Management Console
          </span>
          <h1 className="font-serif-display text-3xl md:text-4xl font-bold text-[#F7F2EB] mt-1">
            Restaurant Administration
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Sound Alert Toggle + Test Chime */}
          <button
            type="button"
            onClick={() => {
              const nextSound = !notificationSettings.soundEnabled;
              const updated = { ...notificationSettings, soundEnabled: nextSound };
              saveNotificationSettings(updated);
              setNotifForm(updated);
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
              notificationSettings.soundEnabled
                ? 'bg-[#254B37]/40 border-[#52B788]/50 text-[#52B788]'
                : 'bg-[#16110D] border-white/15 text-[#F7F2EB]/65'
            }`}
          >
            {notificationSettings.soundEnabled ? (
              <Volume2 className="w-4 h-4" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span>Sound Alert: {notificationSettings.soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          <button
            type="button"
            onClick={playTestAlertSound}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg bg-[#16110D] hover:bg-white/10 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] transition-colors cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            Test Chime
          </button>

          <button
            onClick={seedDatabaseIfNeeded}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E6B43] hover:bg-[#175636] text-xs font-semibold text-[#F7F2EB] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Database className="w-4 h-4" />
            Sync All 32 Official Menu Items &amp; Prices to Firestore
          </button>
        </div>
      </div>

      {/* =========================================================================
          PROMINENT LIVE NEW ORDER ALERT BANNER (SMS + EMAIL + SOUND + QUICK ACCEPT)
          ========================================================================= */}
      {activeBannerOrders.length > 0 && (
        <div
          role="alert"
          aria-live="assertive"
          className="mt-6 p-5 sm:p-6 rounded-2xl bg-[#21150F] border-2 border-[#C9A45C] shadow-2xl space-y-4"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#C9A45C]/30 pb-4">
            <div className="flex items-start gap-3.5">
              <div className="p-3 rounded-xl bg-[#E63946] text-[#FFFFFF] shrink-0 animate-pulse">
                <Bell className="w-6 h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded bg-[#E63946] text-[#FFFFFF] text-[11px] font-mono font-bold uppercase tracking-wider">
                    LIVE NEW ORDER ALERT ({activeBannerOrders.length})
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#254B37] text-[#FFFFFF] text-[11px] font-semibold">
                    Saved in Database · SMS &amp; Email Triggered
                  </span>
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-[#F7F3EA] mt-1">
                  New Customer {activeBannerOrders.length === 1 ? 'Order' : 'Orders'} Waiting for Kitchen Acceptance
                </h2>
                <p className="text-xs text-[#F7F3EA]/75 mt-0.5">
                  Review the order details below and click <strong>Accept Order</strong> to notify the customer and start kitchen preparation.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={playTestAlertSound}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#3B3029] hover:bg-[#3B3029]/80 border border-[#C9A45C]/40 text-xs font-semibold text-[#C9A45C] cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Replay Chime
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('orders')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#C9A45C] hover:bg-[#B89146] text-xs font-bold text-[#21150F] cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Open Orders Queue ({pendingOrders})
              </button>
              {liveOrderAlerts.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllLiveOrderAlerts}
                  className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#F7F3EA]/70 cursor-pointer"
                >
                  Dismiss Banner
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeBannerOrders.slice(0, 4).map((alertOrd) => {
              const cleanRef = alertOrd.orderReference.startsWith('#')
                ? alertOrd.orderReference
                : `#${alertOrd.orderReference}`;
              return (
                <div
                  key={alertOrd.id}
                  className="p-4 rounded-xl bg-[#16110D] border border-[#C9A45C]/45 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-base font-extrabold text-[#C9A45C]">
                          {cleanRef}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#254B37] text-[#FFFFFF] text-[10px] font-bold uppercase">
                          {alertOrd.fulfillmentType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-white/10 text-[#F7F3EA] text-[10px] font-mono uppercase">
                          Payment: {alertOrd.paymentStatus}
                        </span>
                      </div>
                      <span className="font-mono text-lg font-extrabold text-[#C9A45C] tabular-nums">
                        {settings.currencySymbol}
                        {alertOrd.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#F7F3EA]">
                      {alertOrd.customerName} ·{' '}
                      <span className="font-mono text-xs text-[#C9A45C]">
                        {alertOrd.customerPhone}
                      </span>
                    </p>
                    <p className="text-xs text-[#F7F3EA]/85 line-clamp-2">
                      <strong>Items:</strong> {alertOrd.itemsSummary}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('orders');
                        void handleToggleViewOrder(alertOrd);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B3029] hover:bg-[#3B3029]/80 border border-[#C9A45C]/40 text-xs font-bold text-[#F7F3EA] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#C9A45C]" />
                      View Order
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAcceptOrder(alertOrd)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#254B37] hover:bg-[#1D3B2B] text-xs font-bold text-[#FFFFFF] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A45C]" />
                      Accept Order
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('orders');
                        setConfirmRejectOrderId(alertOrd.id);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E63946]/20 hover:bg-[#E63946] text-[#E63946] hover:text-[#FFFFFF] border border-[#E63946]/40 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Order
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =========================================================================
          FAILED / UNCONFIGURED SMS OR EMAIL NOTIFICATION RETRY WARNING BANNER
          ========================================================================= */}
      {failedOrUnconfiguredLogs.length > 0 && (
        <div className="mt-5 p-4 rounded-xl bg-[#16110D] border border-[#F4A261]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#F4A261] shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F4A261]">
                Notification Delivery Notice ({failedOrUnconfiguredLogs.length} Logged)
              </h3>
              <p className="text-xs text-[#F7F2EB]/80 mt-0.5">
                All customer orders are safely stored in Firestore.{' '}
                {failedOrUnconfiguredLogs[0].errorMessage ||
                  'One or more external SMS/Email notifications require provider secret configuration or retry.'}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {orders[0] && (
              <button
                type="button"
                disabled={retryingOrderId === orders[0].id}
                onClick={async () => {
                  setRetryingOrderId(orders[0].id);
                  await retryOrderNotification(orders[0]);
                  setRetryingOrderId(null);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C9A45C] text-[#21150F] text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Retry Latest Order Alert
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setNotifForm(notificationSettings);
                setAdditionalEmailsInput(notificationSettings.additionalEmails.join(', '));
                setAdditionalPhonesInput(notificationSettings.additionalPhones.join(', '));
                setActiveTab('notifications');
              }}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F7F2EB] cursor-pointer"
            >
              Configure SMS &amp; Email Settings
            </button>
          </div>
        </div>
      )}

      {/* Persistent Global Low-Stock Warning Banner */}
      {alertedInventoryItems.length > 0 && (
        <div
          role="region"
          aria-label="Low stock inventory alerts"
          className={`mt-6 p-5 rounded-xl border transition-all ${
            outOfStockItems.length > 0
              ? 'bg-[#E63946]/10 border-[#E63946]/45'
              : 'bg-[#F4A261]/10 border-[#F4A261]/45'
          }`}
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div
                className={`p-2.5 rounded-lg shrink-0 mt-0.5 ${
                  outOfStockItems.length > 0
                    ? 'bg-[#E63946]/20 text-[#E63946]'
                    : 'bg-[#F4A261]/20 text-[#F4A261]'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#F7F2EB]">
                    Kitchen Inventory Alert: {alertedInventoryItems.length}{' '}
                    {alertedInventoryItems.length === 1
                      ? 'Dish Requires Attention'
                      : 'Dishes Require Attention'}
                  </h2>
                  {outOfStockItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#E63946] text-[#F7F2EB] text-[11px] font-bold">
                      {outOfStockItems.length} Out of Stock
                    </span>
                  )}
                  {lowStockItems.length > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#F4A261] text-[#0F0B08] text-[11px] font-bold">
                      {lowStockItems.length} Low Stock
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F7F2EB]/75 mt-1">
                  The following menu items have reached or fallen below their configured low-stock portion thresholds:
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {alertedInventoryItems.map((item) => {
                    const qty = item.stockQuantity ?? 0;
                    const thresh = item.lowStockThreshold ?? 5;
                    const isDepleted = qty <= 0;
                    return (
                      <div
                        key={item.id}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs ${
                          isDepleted
                            ? 'bg-[#0F0B08]/90 border-[#E63946]/50 text-[#F7F2EB]'
                            : 'bg-[#0F0B08]/90 border-[#F4A261]/45 text-[#F7F2EB]'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isDepleted ? 'bg-[#E63946]' : 'bg-[#F4A261]'
                          }`}
                        />
                        <span className="font-semibold">{item.name}</span>
                        <span
                          className={`font-mono font-bold tabular-nums ${
                            isDepleted ? 'text-[#E63946]' : 'text-[#F4A261]'
                          }`}
                        >
                          {qty} left
                        </span>
                        <span className="text-[#F7F2EB]/50 text-[11px] font-mono">
                          (min {thresh})
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            updateItemInventory(item, {
                              stockQuantity: qty + 10,
                            })
                          }
                          className="ml-1 px-2 py-0.5 rounded bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0F0B08] font-mono text-[11px] font-bold transition-colors"
                          title={`Add 10 portions to ${item.name}`}
                        >
                          +10
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => restockAllLowItems(15)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E6B43] hover:bg-[#175636] text-xs font-semibold text-[#F7F2EB] transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Restock All (+15)
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('menu');
                  setInventoryFilter('low_stock');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-xs font-semibold text-[#0F0B08] transition-colors"
              >
                <Utensils className="w-3.5 h-3.5" />
                Manage Thresholds ({alertedInventoryItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-4 border-b border-white/10 mb-8">
        {[
          {
            id: 'overview',
            label: 'Overview & KPIs',
            icon: ShoppingBag,
            alertCount: alertedInventoryItems.length,
            badgeStyle: 'warning',
          },
          {
            id: 'website-cms',
            label: 'Website CMS & Live Content',
            icon: Layout,
            alertCount: isContentDirty ? 1 : 0,
            badgeStyle: 'red',
          },
          {
            id: 'orders',
            label: `Orders (${orders.length})`,
            icon: ShoppingBag,
            alertCount: pendingOrders,
            badgeStyle: 'red',
          },
          {
            id: 'notifications',
            label: 'SMS, Email & Alert Settings',
            icon: Bell,
            alertCount: failedOrUnconfiguredLogs.length,
            badgeStyle: 'warning',
          },
          {
            id: 'daily-specials',
            label: `Daily Specials (${dailySpecialItems.length})`,
            icon: Sparkles,
            alertCount: 0,
            badgeStyle: 'warning',
          },
          {
            id: 'google-merchant',
            label: `Google Search & Merchant (${menuItems.length})`,
            icon: Globe,
            alertCount: 0,
            badgeStyle: 'warning',
          },
          {
            id: 'menu',
            label: `Menu, Inventory & Photos (${menuItems.length})`,
            icon: Utensils,
            alertCount: alertedInventoryItems.length,
            badgeStyle: 'warning',
          },
          {
            id: 'catering',
            label: `Catering & Reviews (${cateringEnquiries.length})`,
            icon: Calendar,
            alertCount: 0,
            badgeStyle: 'warning',
          },
          {
            id: 'gallery',
            label: `Gallery (${galleryImages.length})`,
            icon: ImageIcon,
            alertCount: 0,
            badgeStyle: 'warning',
          },
          {
            id: 'settings',
            label: 'Restaurant Settings',
            icon: Settings,
            alertCount: 0,
            badgeStyle: 'warning',
          },
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'settings') setSettingsForm(settings);
                if (tab.id === 'notifications') {
                  setNotifForm(notificationSettings);
                  setAdditionalEmailsInput(notificationSettings.additionalEmails.join(', '));
                  setAdditionalPhonesInput(notificationSettings.additionalPhones.join(', '));
                  void refreshProviderStatus();
                }
              }}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isCurrent
                  ? 'bg-[#D4AF37] text-[#0F0B08]'
                  : 'bg-[#16110D] text-[#F7F2EB]/75 hover:text-[#F7F2EB] border border-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {tab.label}
              {tab.alertCount > 0 && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                    tab.badgeStyle === 'red'
                      ? 'bg-[#E63946] text-[#FFFFFF] shadow-sm'
                      : isCurrent
                      ? 'bg-[#0F0B08] text-[#F4A261]'
                      : outOfStockItems.length > 0
                      ? 'bg-[#E63946] text-[#F7F2EB]'
                      : 'bg-[#F4A261] text-[#0F0B08]'
                  }`}
                >
                  {tab.badgeStyle === 'red' ? `${tab.alertCount} NEW` : tab.alertCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Total Sales</span>
              <p className="font-mono text-2xl font-bold text-[#D4AF37] tabular-nums mt-1">
                {settings.currencySymbol}
                {totalSales.toFixed(2)}
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Total Orders</span>
              <p className="font-mono text-2xl font-bold text-[#F7F2EB] tabular-nums mt-1">
                {totalOrders}
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Pending · New Orders</span>
              <p className="font-mono text-2xl font-bold text-[#F4A261] tabular-nums mt-1">
                {pendingOrders}
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Confirmed &amp; Preparing</span>
              <p className="font-mono text-2xl font-bold text-[#52B788] tabular-nums mt-1">
                {confirmedOrders + preparingOrders}
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Completed Orders</span>
              <p className="font-mono text-2xl font-bold text-[#40916C] tabular-nums mt-1">
                {completedOrders}
              </p>
            </div>
            <div
              onClick={() => {
                setActiveTab('menu');
                setInventoryFilter('low_stock');
              }}
              className={`p-5 rounded-xl border cursor-pointer transition-colors ${
                alertedInventoryItems.length > 0
                  ? 'bg-[#16110D] border-[#F4A261]/50 hover:border-[#F4A261]'
                  : 'bg-[#16110D] border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#F7F2EB]/60">Low Stock / Out Alerts</span>
                <AlertTriangle
                  className={`w-4 h-4 ${
                    alertedInventoryItems.length > 0 ? 'text-[#F4A261]' : 'text-[#52B788]'
                  }`}
                />
              </div>
              <p
                className={`font-mono text-2xl font-bold tabular-nums mt-1 ${
                  outOfStockItems.length > 0
                    ? 'text-[#E63946]'
                    : alertedInventoryItems.length > 0
                    ? 'text-[#F4A261]'
                    : 'text-[#52B788]'
                }`}
              >
                {alertedInventoryItems.length}
                <span className="text-xs font-normal text-[#F7F2EB]/60 ml-1.5">
                  ({outOfStockItems.length} out · {lowStockItems.length} low)
                </span>
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Active Menu Dishes</span>
              <p className="font-mono text-2xl font-bold text-[#F7F2EB] tabular-nums mt-1">
                {menuItems.filter((m) => m.isAvailable).length} / {menuItems.length}
              </p>
            </div>
            <div className="p-5 bg-[#16110D] border border-white/10 rounded-xl">
              <span className="text-xs text-[#F7F2EB]/60">Catering Enquiries</span>
              <p className="font-mono text-2xl font-bold text-[#D4AF37] tabular-nums mt-1">
                {cateringEnquiries.length}
              </p>
            </div>
          </div>

          {/* Dedicated Low-Stock & Inventory Threshold Center on Overview */}
          <div className="p-6 bg-[#16110D] border border-[#D4AF37]/30 rounded-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <AlertTriangle
                    className={`w-5 h-5 ${
                      alertedInventoryItems.length > 0 ? 'text-[#F4A261]' : 'text-[#52B788]'
                    }`}
                  />
                  <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                    Low-Stock Warning Center &amp; Threshold Monitor
                  </h2>
                </div>
                <p className="text-xs text-[#F7F2EB]/65 mt-1">
                  Monitor dishes approaching depletion, adjust minimum alert thresholds, or restock portions directly.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {alertedInventoryItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => restockAllLowItems(15)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#1E6B43] hover:bg-[#175636] text-xs font-semibold text-[#F7F2EB] transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Restock All Low Dishes (+15)
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('menu');
                    setInventoryFilter('all');
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] transition-colors"
                >
                  Configure All 31 Dish Thresholds
                </button>
              </div>
            </div>

            {alertedInventoryItems.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0F0B08] border border-[#52B788]/30 flex items-center gap-3 text-sm text-[#52B788]">
                <PackageCheck className="w-5 h-5 shrink-0" />
                <span>
                  All tracked dishes are currently stocked above their alert thresholds ({healthyStockItems.length} healthy dishes).
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alertedInventoryItems.map((dish) => {
                  const stock = dish.stockQuantity ?? 0;
                  const threshold = dish.lowStockThreshold ?? 5;
                  const isOut = stock <= 0;
                  const ratio =
                    threshold > 0
                      ? Math.min(100, Math.round((stock / (threshold * 2)) * 100))
                      : 100;

                  return (
                    <div
                      key={dish.id}
                      className={`p-4 rounded-xl bg-[#0F0B08] border flex flex-col justify-between gap-3 ${
                        isOut ? 'border-[#E63946]/50' : 'border-[#F4A261]/45'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                isOut
                                  ? 'bg-[#E63946] text-[#F7F2EB]'
                                  : 'bg-[#F4A261] text-[#0F0B08]'
                              }`}
                            >
                              {isOut ? 'Out of Stock' : 'Low Stock Warning'}
                            </span>
                            <span className="text-[11px] text-[#F7F2EB]/60">
                              {dish.categoryName}
                            </span>
                          </div>
                          <h3 className="font-serif-display text-lg font-bold text-[#F7F2EB] mt-1">
                            {dish.name}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            updateItemInventory(dish, {
                              stockQuantity: stock + 10,
                            })
                          }
                          className="px-3 py-1.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-[#0F0B08] font-mono text-xs font-bold shrink-0 transition-colors"
                        >
                          +10 Restock
                        </button>
                      </div>

                      {/* Stock Progress Indicator */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#F7F2EB]/70">
                            Remaining:{' '}
                            <strong
                              className={`font-mono ${
                                isOut ? 'text-[#E63946]' : 'text-[#F4A261]'
                              }`}
                            >
                              {stock} portions
                            </strong>
                          </span>
                          <span className="text-[#F7F2EB]/60 font-mono">
                            Alert Threshold: ≤ {threshold} portions
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isOut ? 'bg-[#E63946]' : 'bg-[#F4A261]'
                            }`}
                            style={{ width: `${Math.max(6, ratio)}%` }}
                          />
                        </div>
                      </div>

                      {/* Direct Inline Stock & Threshold Controls */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-xs">
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#F7F2EB]/65">Stock:</span>
                          <button
                            type="button"
                            onClick={() =>
                              updateItemInventory(dish, {
                                stockQuantity: Math.max(0, stock - 1),
                              })
                            }
                            className="p-1 rounded bg-[#16110D] border border-white/15 text-[#F7F2EB] hover:border-[#D4AF37]"
                            aria-label={`Decrease stock for ${dish.name}`}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <input
                            type="number"
                            min="0"
                            aria-label={`Current stock for ${dish.name}`}
                            value={stock}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!Number.isNaN(val)) {
                                updateItemInventory(dish, { stockQuantity: val }, true);
                              }
                            }}
                            className="w-14 px-2 py-1 rounded bg-[#16110D] border border-white/15 font-mono text-center text-[#F7F2EB] tabular-nums"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateItemInventory(dish, {
                                stockQuantity: stock + 1,
                              })
                            }
                            className="p-1 rounded bg-[#16110D] border border-white/15 text-[#F7F2EB] hover:border-[#D4AF37]"
                            aria-label={`Increase stock for ${dish.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[#F7F2EB]/65">Alert Threshold ≤</span>
                          <input
                            type="number"
                            min="0"
                            max="1000"
                            aria-label={`Low stock alert threshold for ${dish.name}`}
                            value={threshold}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10);
                              if (!Number.isNaN(val)) {
                                updateItemInventory(dish, { lowStockThreshold: val });
                              }
                            }}
                            className="w-14 px-2 py-1 rounded bg-[#16110D] border border-[#D4AF37]/40 font-mono text-center text-[#D4AF37] font-bold tabular-nums"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="p-6 bg-[#16110D] border border-white/10 rounded-xl">
            <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB] mb-4">
              Popular &amp; Featured Dishes ({popularDishes.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {popularDishes.map((dish) => (
                <div
                  key={dish.id}
                  className="flex items-center justify-between p-3.5 bg-[#0F0B08] border border-white/10 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-semibold text-[#F7F2EB]">{dish.name}</p>
                    <p className="text-xs text-[#F7F2EB]/60">{dish.categoryName}</p>
                  </div>
                  <span className="font-mono text-sm font-semibold text-[#D4AF37] tabular-nums">
                    {dish.price > 0
                      ? `${settings.currencySymbol}${dish.price.toFixed(2)}`
                      : 'Inquire'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Featured Daily Specials Overview Showcase */}
          <div className="p-6 bg-[#16110D] border border-[#D4AF37]/40 rounded-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                    Today&apos;s Daily Specials ({dailySpecialItems.length} Featured on Homepage)
                  </h2>
                </div>
                <p className="text-xs text-[#F7F2EB]/65 mt-1">
                  Dishes selected below are displayed prominently in the Daily Specials section on the Homepage with separate food photos and prices written underneath.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('daily-specials')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-xs font-bold text-[#0F0B08] transition-colors shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Manage Daily Specials ({dailySpecialItems.length})
              </button>
            </div>

            {dailySpecialItems.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#0F0B08] border border-white/10 text-center space-y-3">
                <p className="text-sm text-[#F7F2EB]/75">
                  No dishes are currently marked as Today&apos;s Daily Specials.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('daily-specials')}
                  className="px-4 py-2 rounded-lg bg-[#D4AF37] text-[#0F0B08] text-xs font-bold"
                >
                  Select Today&apos;s Daily Specials
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
                {dailySpecialItems.map((item) => {
                  const photoSrc = getCulinaryVisualUrl(
                    item.imageKey,
                    item.name,
                    item.categoryName,
                    item.imageUrl
                  );
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col rounded-xl bg-[#0F0B08] border border-[#D4AF37]/40 overflow-hidden shadow-lg"
                    >
                      {/* Separate Clean Food Photo Frame */}
                      <div className="aspect-[4/3] w-full bg-[#090604] overflow-hidden border-b border-[#D4AF37]/35">
                        <img
                          src={photoSrc}
                          alt={item.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>
                      {/* Dish Name & Price Written Underneath the Image */}
                      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2 text-center bg-[#120D09]">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                            {item.categoryName}
                          </span>
                          <h3 className="font-serif-display text-sm font-bold text-[#F7F2EB] mt-0.5 leading-snug">
                            {item.name}
                          </h3>
                          <p className="font-mono text-base font-extrabold text-[#D4AF37] tabular-nums mt-1">
                            {settings.currencySymbol}
                            {item.price.toFixed(2)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDailySpecial(item, false)}
                          className="w-full py-1.5 px-2.5 rounded-lg bg-white/5 hover:bg-[#E63946]/20 border border-white/10 hover:border-[#E63946]/40 text-[11px] font-semibold text-[#F7F2EB]/80 hover:text-[#E63946] transition-colors"
                        >
                          Remove Special
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: DAILY SPECIALS MANAGEMENT */}
      {activeTab === 'daily-specials' && (
        <div className="space-y-8">
          {/* Header & Preset Controls */}
          <div className="p-6 bg-[#16110D] border border-[#D4AF37]/45 rounded-xl space-y-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Homepage Showcase Controller
                </span>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#F7F2EB] mt-1">
                  Today&apos;s Featured Daily Specials ({dailySpecialItems.length} Selected)
                </h2>
                <p className="text-xs sm:text-sm text-[#F7F2EB]/75 mt-1">
                  Select which dishes to feature for the day. Featured dishes appear prominently on the Homepage with each food photo displayed separately and its price written clearly underneath.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    setDailySpecialsBatch(
                      [
                        'achecke-grilled-fish-plantain',
                        'dibi-with-plantain',
                        'cassava-leaf',
                        'egusi-soup-foofoo',
                        'rice-and-beans-oxtail',
                        'grilled-lamb-plantain-achecke',
                        'assorted-pepper-soup',
                        'cheesesteak-with-fries',
                      ],
                      'Signature Sierra Leonean & American Specials'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-xs font-bold text-[#0F0B08] transition-colors"
                >
                  Feature 8 Signature Specials
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDailySpecialsBatch(
                      [
                        'achecke-grilled-fish-plantain',
                        'dibi-achecke-plantain',
                        'cassava-leaf',
                        'potato-leaf-green',
                        'foofoo-okra-soup',
                        'jollof-rice-and-stew',
                      ],
                      'Sierra Leonean Classics'
                    )
                  }
                  className="px-3.5 py-2 rounded-lg bg-[#1E6B43] hover:bg-[#175636] text-xs font-semibold text-[#F7F2EB] transition-colors"
                >
                  Sierra Leonean Classics Set
                </button>
                {dailySpecialItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setDailySpecialsBatch([], 'Daily Specials')}
                    className="px-3.5 py-2 rounded-lg bg-white/5 hover:bg-[#E63946]/20 border border-white/15 hover:border-[#E63946]/40 text-xs font-semibold text-[#F7F2EB]/80 hover:text-[#E63946] transition-colors"
                  >
                    Clear All ({dailySpecialItems.length})
                  </button>
                )}
              </div>
            </div>

            {/* Active Daily Specials Preview Grid (Separate Food Photos + Price Written Underneath) */}
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold mb-3">
                Currently Live on Homepage ({dailySpecialItems.length} Dishes)
              </h3>
              {dailySpecialItems.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0F0B08] border border-white/10 text-center text-sm text-[#F7F2EB]/65">
                  No Daily Specials are currently active. Click &ldquo;Feature as Today&apos;s Special&rdquo; on any dish below to showcase it on the Homepage.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {dailySpecialItems.map((item) => {
                    const photoSrc = getCulinaryVisualUrl(
                      item.imageKey,
                      item.name,
                      item.categoryName,
                      item.imageUrl
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col rounded-xl bg-[#0F0B08] border-2 border-[#D4AF37]/75 overflow-hidden shadow-xl"
                      >
                        {/* Separate Unobstructed Dish Photo */}
                        <div className="aspect-[4/3] w-full bg-[#090604] overflow-hidden border-b border-[#D4AF37]/45">
                          <img
                            src={photoSrc}
                            alt={item.name}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>

                        {/* Dish Name + Price Written Underneath the Photo */}
                        <div className="p-4 flex flex-col flex-1 justify-between gap-3 bg-[#140E0A] text-center">
                          <div>
                            <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold block">
                              Featured Daily Special
                            </span>
                            <h4 className="font-serif-display text-base font-bold text-[#F7F2EB] mt-1 leading-snug">
                              {item.name}
                            </h4>
                            <div className="mt-2 pt-2 border-t border-[#D4AF37]/25 flex items-center justify-center gap-1.5">
                              <span className="font-mono text-lg font-extrabold text-[#D4AF37] tabular-nums">
                                {settings.currencySymbol}
                                {item.price.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => toggleDailySpecial(item, false)}
                            className="w-full py-2 px-3 rounded-lg bg-[#E63946]/15 hover:bg-[#E63946] text-[#E63946] hover:text-[#F7F2EB] border border-[#E63946]/35 text-xs font-semibold transition-colors"
                          >
                            Remove from Today&apos;s Specials
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* All 32 Dishes Selector Grid — Separate Photos with Price Underneath */}
          <div className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                  All Restaurant Dishes — Click to Feature or Adjust Price
                </h3>
                <p className="text-xs text-[#F7F2EB]/65 mt-0.5">
                  Every dish is shown in its own separate frame with its price written underneath the photo.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={dailySpecialCategory}
                  onChange={(e) => setDailySpecialCategory(e.target.value)}
                  aria-label="Filter dishes by category"
                  className="px-3 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-xs text-[#F7F2EB]"
                >
                  <option value="all">All Categories ({menuItems.length})</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>

                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-[#F7F2EB]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={dailySpecialSearch}
                    onChange={(e) => setDailySpecialSearch(e.target.value)}
                    placeholder="Search dish name..."
                    className="w-full pl-8 pr-3 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-xs text-[#F7F2EB] placeholder:text-[#F7F2EB]/40"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredSpecialsCandidates.map((item) => {
                const photoSrc = getCulinaryVisualUrl(
                  item.imageKey,
                  item.name,
                  item.categoryName,
                  item.imageUrl
                );
                const isFeaturedToday = Boolean(item.isFeatured);

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col rounded-xl overflow-hidden border transition-all ${
                      isFeaturedToday
                        ? 'bg-[#140E0A] border-2 border-[#D4AF37] shadow-[0_10px_25px_rgba(212,175,55,0.18)]'
                        : 'bg-[#0F0B08] border-white/15 hover:border-[#D4AF37]/50'
                    }`}
                  >
                    {/* Separate Clean Dish Image */}
                    <div className="aspect-[4/3] w-full bg-[#090604] overflow-hidden border-b border-[#D4AF37]/30">
                      <img
                        src={photoSrc}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    {/* Dish Name & Price Written Underneath */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-3 text-center">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#D4AF37]/90 font-semibold block">
                          {item.categoryName}
                        </span>
                        <h4 className="font-serif-display text-base font-bold text-[#F7F2EB] mt-1 leading-snug">
                          {item.name}
                        </h4>

                        {/* Price Written Underneath with Inline Price Input */}
                        <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-center gap-1.5">
                          <span className="font-mono text-sm font-bold text-[#D4AF37]">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`Price for ${item.name}`}
                            defaultValue={item.price.toFixed(2)}
                            onBlur={(e) => {
                              const nextVal = parseFloat(e.target.value);
                              if (!Number.isNaN(nextVal) && nextVal !== item.price) {
                                updateItemPrice(item, nextVal);
                              }
                            }}
                            className="w-20 bg-[#16110D] border border-[#D4AF37]/40 rounded px-2 py-0.5 font-mono text-sm font-extrabold text-[#D4AF37] text-center focus:outline-none focus:border-[#D4AF37] tabular-nums"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleDailySpecial(item, !isFeaturedToday)}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors ${
                          isFeaturedToday
                            ? 'bg-[#D4AF37] text-[#0F0B08] hover:bg-[#E2C15A]'
                            : 'bg-white/10 text-[#F7F2EB] hover:bg-[#D4AF37] hover:text-[#0F0B08]'
                        }`}
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            isFeaturedToday ? 'fill-[#0F0B08] text-[#0F0B08]' : ''
                          }`}
                        />
                        {isFeaturedToday
                          ? 'Featured Today (Active)'
                          : "Feature as Today's Special"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB: GOOGLE SEARCH & GOOGLE MERCHANT CENTER HUB */}
      {activeTab === 'google-merchant' && (
        <div className="space-y-8">
          {/* Top Status & Export Controls Card */}
          <div className="p-6 bg-[#16110D] border border-[#D4AF37]/50 rounded-xl space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-[#1E6B43]/30 border border-[#52B788]/40 text-[#52B788] text-xs font-bold uppercase tracking-wider mb-2">
                  <Globe className="w-3.5 h-3.5" />
                  Google Search · Google Shopping · Schema.org Active
                </div>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#F7F2EB]">
                  Google Merchant Center &amp; Google Search Visibility Hub
                </h2>
                <p className="text-xs sm:text-sm text-[#F7F2EB]/75 mt-1">
                  Your website is configured with live Schema.org <code className="text-[#D4AF37]">Restaurant</code>, <code className="text-[#D4AF37]">Menu</code>, and <code className="text-[#D4AF37]">Product</code> JSON-LD structured data plus an automated Google Merchant RSS 2.0 XML product feed so customers see FAMINAS AFRICAN AND AMERICANS RESTAURANT and your dishes with photos and prices when searching on Google.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadMerchantXml}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#E2C15A] text-xs font-bold text-[#0F0B08] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Merchant XML Feed
                </button>
                <button
                  type="button"
                  onClick={handleDownloadMerchantTsv}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1E6B43] hover:bg-[#175636] text-xs font-bold text-[#F7F2EB] transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Google Sheets TSV
                </button>
              </div>
            </div>

            {/* Feed Endpoints for Google Merchant Center Scheduled Fetch & Google Search Console */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                    Google Merchant Scheduled Fetch Feed URL (XML)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1E6B43]/30 text-[#52B788] text-[10px] font-mono font-bold">
                    {menuItems.length} Products Ready
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://faminasrestaurant.com/google-merchant-feed.xml"
                    aria-label="Google Merchant Feed URL"
                    className="flex-1 bg-[#16110D] border border-white/15 rounded-lg px-3 py-2 font-mono text-xs text-[#F7F2EB]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'https://faminasrestaurant.com/google-merchant-feed.xml',
                        'Google Merchant Feed URL'
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0F0B08] text-xs font-bold inline-flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <a
                    href="/google-merchant-feed.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-[#F7F2EB] border border-white/10 shrink-0"
                    title="Open XML Feed"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-[#F7F2EB]/60">
                  Paste this URL into <strong>Google Merchant Center → Products → Feeds → Scheduled Fetch</strong> so Google automatically syncs all 32 dishes, photos, and USD prices daily.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                    Google Search Console Sitemap URL
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#1E6B43]/30 text-[#52B788] text-[10px] font-mono font-bold">
                    Storebot-Google Allowed
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value="https://faminasrestaurant.com/sitemap.xml"
                    aria-label="Google Sitemap URL"
                    className="flex-1 bg-[#16110D] border border-white/15 rounded-lg px-3 py-2 font-mono text-xs text-[#F7F2EB]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'https://faminasrestaurant.com/sitemap.xml',
                        'Google Sitemap URL'
                      )
                    }
                    className="px-3 py-2 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0F0B08] text-xs font-bold inline-flex items-center gap-1 transition-colors shrink-0"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </button>
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-[#F7F2EB] border border-white/10 shrink-0"
                    title="Open Sitemap XML"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                <p className="text-[11px] text-[#F7F2EB]/60">
                  Submit this sitemap in <strong>Google Search Console</strong> (<code className="text-[#D4AF37]">search.google.com/search-console</code>) to index all menu pages and rich snippets.
                </p>
              </div>
            </div>
          </div>

          {/* LIVE GOOGLE SEARCH & GOOGLE SHOPPING APPEARANCE PREVIEW */}
          <div className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                Live Search Engine Appearance Preview
              </span>
              <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB] mt-0.5">
                How Customers See FAMINAS When They Search on Google
              </h3>
            </div>

            {/* Simulated Google Search Result Snippet */}
            <div className="p-5 rounded-xl bg-[#0F0B08] border border-white/15 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-[#F7F2EB]/75">
                  <span className="w-6 h-6 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 flex items-center justify-center font-serif font-bold text-[#D4AF37]">
                    F
                  </span>
                  <div>
                    <p className="font-semibold text-[#F7F2EB] leading-tight">
                      FAMINAS AFRICAN AND AMERICANS RESTAURANT
                    </p>
                    <p className="text-[11px] text-[#F7F2EB]/60">
                      https://faminasrestaurant.com · Lindenwold, NJ
                    </p>
                  </div>
                </div>
                <h4 className="text-lg sm:text-xl font-semibold text-[#8AB4F8] pt-1">
                  Faminas African &amp; Americans Restaurant – Lindenwold, NJ
                </h4>
                <p className="text-xs sm:text-sm text-[#F7F2EB]/80 leading-relaxed max-w-3xl">
                  Authentic Sierra Leonean, West African &amp; American cuisine at 577 Blackwood-Clementon Rd, Lindenwold, NJ 08021, USA. Order Achecke with Grill Fish ($22.99), Dibi ($22.99), Cassava Leaf ($17.99), Egusi Soup with Foofoo ($18.99), and Jollof Rice ($14.99) online. Phone: +1 (856) 522-3029.
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-[#52B788] font-medium">
                  <span>Cuisine: Sierra Leonean · West African · American</span>
                  <span>·</span>
                  <span>Price Range: $4.50 – $24.99 USD</span>
                  <span>·</span>
                  <span>577 Blackwood-Clementon Rd, Lindenwold, NJ 08021</span>
                  <span>·</span>
                  <span>+1 (856) 522-3029</span>
                </div>
              </div>

              {/* Google Merchant Center Dish Carousel Preview (Separate Photos + Price Written Underneath) */}
              <div className="pt-4 border-t border-white/10 space-y-3">
                <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold block">
                  Google Merchant Center · Menu &amp; Shopping Dish Results (Separate Photos with Price Underneath)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3.5">
                  {menuItems.slice(0, 6).map((item) => {
                    const imgSrc = getCulinaryVisualUrl(
                      item.imageKey,
                      item.name,
                      item.categoryName,
                      item.imageUrl
                    );
                    return (
                      <div
                        key={item.id}
                        className="flex flex-col rounded-lg bg-[#16110D] border border-[#D4AF37]/40 overflow-hidden"
                      >
                        <div className="aspect-[4/3] w-full bg-[#090604] overflow-hidden border-b border-[#D4AF37]/30">
                          <img
                            src={imgSrc}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-2.5 text-center space-y-0.5">
                          <p className="font-serif text-xs font-bold text-[#F7F2EB] line-clamp-1">
                            {item.name}
                          </p>
                          <p className="font-mono text-sm font-extrabold text-[#D4AF37] tabular-nums">
                            {settings.currencySymbol}
                            {item.price.toFixed(2)}
                          </p>
                          <p className="text-[10px] text-[#52B788]">
                            {item.isAvailable ? 'In stock · Order online' : 'Out of stock'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* COMPLETE 32-DISH GOOGLE MERCHANT PRODUCT FEED CATALOG */}
          <div className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                  Indexed Google Merchant Products ({menuItems.length} Dishes)
                </h3>
                <p className="text-xs text-[#F7F2EB]/65 mt-0.5">
                  Every dish below is automatically included in your Google Merchant XML Feed and Schema.org Product JSON-LD with its separate photo and USD price written underneath.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {menuItems.map((item) => {
                const photoSrc = getCulinaryVisualUrl(
                  item.imageKey,
                  item.name,
                  item.categoryName,
                  item.imageUrl
                );
                return (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-xl bg-[#0F0B08] border border-[#D4AF37]/40 overflow-hidden shadow-md"
                  >
                    {/* Separate Clean Food Photo */}
                    <div className="aspect-[4/3] w-full bg-[#080503] overflow-hidden border-b border-[#D4AF37]/35">
                      <img
                        src={photoSrc}
                        alt={item.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Dish Name, Price & Google Merchant Metadata Written Underneath */}
                    <div className="p-4 flex flex-col flex-1 justify-between gap-2.5 text-center bg-[#120D09]">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold block">
                          {item.categoryName}
                        </span>
                        <h4 className="font-serif-display text-base font-bold text-[#F7F2EB] mt-0.5 leading-snug">
                          {item.name}
                        </h4>
                        <p className="font-mono text-lg font-extrabold text-[#D4AF37] tabular-nums mt-1">
                          {settings.currencySymbol}
                          {item.price.toFixed(2)} USD
                        </p>
                      </div>

                      <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono">
                        <span className="text-[#F7F2EB]/60 truncate max-w-[130px]" title={resolveAbsoluteImageUrl(item)}>
                          ID: {item.id}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold ${
                            item.isAvailable
                              ? 'bg-[#1E6B43]/30 text-[#52B788]'
                              : 'bg-[#E63946]/25 text-[#E63946]'
                          }`}
                        >
                          {item.isAvailable ? 'in_stock' : 'out_of_stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT & AUTOMATIC NEW ORDER ALERT SYSTEM */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Automatic New Order Alert System Overview Bar */}
          <div className="p-5 bg-[#16110D] border border-[#C9A45C]/45 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-lg bg-[#C9A45C]/15 text-[#C9A45C] shrink-0 mt-0.5">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-[#F7F2EB]">
                    Automatic Order Alert &amp; Kitchen Workflow System
                  </h2>
                  <span className="px-2 py-0.5 rounded bg-[#254B37] text-[#FFFFFF] text-[11px] font-bold">
                    SMS · Email · Live Sound Active
                  </span>
                  {pendingOrders > 0 && (
                    <span className="px-2 py-0.5 rounded bg-[#E63946] text-[#FFFFFF] text-[11px] font-mono font-bold">
                      {pendingOrders} Pending New {pendingOrders === 1 ? 'Order' : 'Orders'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#F7F2EB]/75 mt-1">
                  Newest orders appear at the top. Every saved order triggers SMS to{' '}
                  <strong>{notificationSettings.ownerPhone}</strong> and HTML email to{' '}
                  <strong>{notificationSettings.ownerEmail}</strong>. Payment status is verified
                  independently from order preparation status.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => {
                  setNotifForm(notificationSettings);
                  setAdditionalEmailsInput(notificationSettings.additionalEmails.join(', '));
                  setAdditionalPhonesInput(notificationSettings.additionalPhones.join(', '));
                  setActiveTab('notifications');
                }}
                className="px-3.5 py-2 rounded-lg bg-[#C9A45C] text-[#21150F] font-bold cursor-pointer"
              >
                Notification Settings &amp; Logs ({orderNotificationLogs.length})
              </button>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 bg-[#16110D] border border-white/10 rounded-xl text-center">
              <p className="text-base text-[#F7F2EB]/70">No customer orders placed yet.</p>
            </div>
          ) : (
            orders.map((order) => {
              const cleanRef = order.orderReference.startsWith('#')
                ? order.orderReference
                : `#${order.orderReference}`;
              const orderEmails = emailNotifications.filter((e) => e.orderId === order.id);
              const orderAlertLogs = orderNotificationLogs.filter((l) => l.orderId === order.id);
              const orderHistory = statusHistoryMap[order.id] || [];
              const detailedItems = orderItemsMap[order.id] || [];
              const isDetailsOpen = expandedOrderDetailsId === order.id;
              const isEmailLogOpen = expandedEmailLogOrderId === order.id;
              const isConfirmingReject = confirmRejectOrderId === order.id;

              return (
                <div
                  key={order.id}
                  className={`p-6 bg-[#16110D] border rounded-xl space-y-4 transition-all ${
                    order.status === 'New Order'
                      ? 'border-[#C9A45C] shadow-lg'
                      : 'border-white/10'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2.5">
                        {order.status === 'New Order' && (
                          <span className="px-2.5 py-0.5 rounded bg-[#E63946] text-[#FFFFFF] text-[10px] font-mono font-extrabold uppercase tracking-wider">
                            NEW ORDER
                          </span>
                        )}
                        <span className="font-mono text-lg font-extrabold text-[#C9A45C]">
                          {cleanRef}
                        </span>
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                        <span className="text-sm font-bold text-[#F7F2EB]">
                          {order.customerName}
                        </span>
                        <span aria-hidden="true" className="text-white/30">
                          ·
                        </span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="inline-flex items-center gap-1 text-xs font-mono text-[#C9A45C] hover:underline"
                        >
                          <Phone className="w-3 h-3" />
                          {order.customerPhone}
                        </a>
                        {order.customerEmail && (
                          <>
                            <span aria-hidden="true" className="text-white/30">
                              ·
                            </span>
                            <span className="inline-flex items-center gap-1 text-xs text-[#F7F2EB]/80">
                              <Mail className="w-3 h-3 text-[#C9A45C]" />
                              {order.customerEmail}
                            </span>
                          </>
                        )}
                        <span className="px-2.5 py-0.5 rounded bg-[#254B37]/40 border border-[#52B788]/40 text-xs uppercase tracking-wider text-[#52B788] font-bold">
                          {order.fulfillmentType}
                        </span>
                      </div>

                      <p className="text-sm text-[#F7F2EB] font-medium">{order.itemsSummary}</p>

                      {order.fulfillmentType === 'delivery' && (
                        <p className="text-xs text-[#F7F2EB]/75">
                          <strong className="text-[#C9A45C]">Delivery Address:</strong>{' '}
                          {order.deliveryAddress}
                        </p>
                      )}
                      {order.specialInstructions && (
                        <p className="text-xs text-[#C9A45C] bg-[#0F0B08] px-3 py-1.5 rounded-lg border border-[#C9A45C]/30">
                          <strong>Customer Instructions:</strong> {order.specialInstructions}
                        </p>
                      )}

                      {/* Totals + Independent Payment Verification Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-[#F7F2EB]/70 pt-1">
                        <span className="tabular-nums">
                          Subtotal: {settings.currencySymbol}
                          {order.subtotal.toFixed(2)}
                        </span>
                        <span className="tabular-nums">
                          Delivery: {settings.currencySymbol}
                          {order.deliveryFee.toFixed(2)}
                        </span>
                        <span className="tabular-nums">
                          Tax: {settings.currencySymbol}
                          {order.taxAmount.toFixed(2)}
                        </span>
                        <span className="font-mono text-sm font-extrabold text-[#C9A45C] tabular-nums">
                          Total: {settings.currencySymbol}
                          {order.totalAmount.toFixed(2)}
                        </span>
                        <span className="text-white/25">|</span>
                        <span className="font-mono text-[11px] text-[#F7F2EB]/80">
                          Method: <strong>{order.paymentMethod.replace(/_/g, ' ')}</strong>
                        </span>
                        <div className="inline-flex items-center gap-1.5">
                          <span className="text-[11px] text-[#F7F2EB]/70">Payment Status:</span>
                          <select
                            aria-label={`Payment status for order ${order.orderReference}`}
                            value={order.paymentStatus}
                            onChange={(e) =>
                              updateOrderPaymentStatus(order, e.target.value as PaymentStatus)
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold uppercase border cursor-pointer ${
                              order.paymentStatus === 'verified'
                                ? 'bg-[#254B37]/40 border-[#52B788] text-[#52B788]'
                                : order.paymentStatus === 'failed'
                                ? 'bg-[#E63946]/20 border-[#E63946] text-[#E63946]'
                                : 'bg-[#0F0B08] border-[#C9A45C]/50 text-[#C9A45C]'
                            }`}
                          >
                            <option value="pending">PENDING (UNPAID)</option>
                            <option value="verified">VERIFIED (PAID)</option>
                            <option value="failed">FAILED</option>
                            <option value="refunded">REFUNDED</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Primary Order Action Buttons: View Order · Accept Order · Reject Order */}
                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleViewOrder(order)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0F0B08] hover:bg-white/10 border border-[#C9A45C]/45 text-xs font-bold text-[#C9A45C] transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isDetailsOpen ? 'Hide Order Details' : 'View Order'}
                        </button>

                        {order.status !== 'Accepted' &&
                          order.status !== 'Completed' &&
                          order.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => handleAcceptOrder(order)}
                              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#254B37] hover:bg-[#1D3B2B] text-xs font-bold text-[#FFFFFF] shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A45C]" />
                              Accept Order
                            </button>
                          )}

                        {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmRejectOrderId(isConfirmingReject ? null : order.id)
                            }
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#E63946]/15 hover:bg-[#E63946] text-[#E63946] hover:text-[#FFFFFF] border border-[#E63946]/40 text-xs font-bold transition-colors cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject Order
                          </button>
                        )}
                      </div>

                      {/* Full 7-Status Progression Controls */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {ORDER_STATUSES.map((st) => {
                          const isCurrentStatus =
                            order.status === st ||
                            (st === 'Accepted' && order.status === 'Confirmed');
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                if (st === 'Cancelled' && order.status !== 'Cancelled') {
                                  setConfirmRejectOrderId(order.id);
                                } else {
                                  void updateOrderStatus(order, st);
                                }
                              }}
                              className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                                isCurrentStatus
                                  ? 'bg-[#C9A45C] text-[#21150F] font-bold'
                                  : 'bg-[#0F0B08] text-[#F7F2EB]/75 hover:text-[#F7F2EB] border border-white/10'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Confirmation Prompt before Rejecting/Cancelling an Order */}
                  {isConfirmingReject && (
                    <div className="p-4 rounded-xl bg-[#E63946]/15 border border-[#E63946] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="text-xs text-[#F7F2EB]">
                        <strong className="text-[#E63946] uppercase tracking-wider block mb-0.5">
                          Confirm Order Rejection / Cancellation
                        </strong>
                        Are you sure you want to reject and cancel Order <strong>{cleanRef}</strong>{' '}
                        for <strong>{order.customerName}</strong>? This will notify the customer.
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleConfirmRejectOrder(order)}
                          className="px-4 py-2 rounded-lg bg-[#E63946] text-[#FFFFFF] text-xs font-bold cursor-pointer"
                        >
                          Yes, Reject &amp; Cancel Order
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRejectOrderId(null)}
                          className="px-3.5 py-2 rounded-lg bg-[#0F0B08] text-[#F7F2EB] border border-white/15 text-xs font-semibold cursor-pointer"
                        >
                          Keep Order Active
                        </button>
                      </div>
                    </div>
                  )}

                  {/* EXPANDABLE FULL ORDER VIEW: Itemized Dishes + Notification Logs + Status History */}
                  {isDetailsOpen && (
                    <div className="p-5 rounded-xl bg-[#0F0B08] border border-[#C9A45C]/40 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                        <div>
                          <h3 className="text-xs uppercase tracking-wider text-[#C9A45C] font-bold">
                            Complete Itemized Order &amp; Audit Details · {cleanRef}
                          </h3>
                          <p className="text-xs text-[#F7F2EB]/65 mt-0.5">
                            Every dish, unit price, customer instruction, notification log, and status change timestamp
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={retryingOrderId === order.id}
                          onClick={async () => {
                            setRetryingOrderId(order.id);
                            await retryOrderNotification(order);
                            setRetryingOrderId(null);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A45C]/20 hover:bg-[#C9A45C] text-[#C9A45C] hover:text-[#21150F] text-xs font-bold transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Retry SMS &amp; Email Alert
                        </button>
                      </div>

                      {/* Itemized Food Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="border-b border-white/10 text-[#C9A45C] uppercase text-[11px]">
                              <th className="py-2 pr-3">Dish Name</th>
                              <th className="py-2 px-3 text-center">Qty</th>
                              <th className="py-2 px-3 text-right">Unit Price</th>
                              <th className="py-2 pl-3 text-right">Line Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/10">
                            {detailedItems.map((it) => (
                              <tr key={it.id}>
                                <td className="py-2.5 pr-3 font-semibold text-[#F7F2EB]">
                                  {it.name}
                                  {it.specialInstructions && (
                                    <span className="block text-[11px] text-[#C9A45C] font-normal">
                                      Note: {it.specialInstructions}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-center font-mono text-[#F7F2EB]">
                                  {it.quantity}
                                </td>
                                <td className="py-2.5 px-3 text-right font-mono text-[#F7F2EB]/80">
                                  {settings.currencySymbol}
                                  {it.unitPrice.toFixed(2)}
                                </td>
                                <td className="py-2.5 pl-3 text-right font-mono font-bold text-[#C9A45C]">
                                  {settings.currencySymbol}
                                  {it.lineTotal.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Two-Column Audit View: SMS/Email Delivery Logs & Status History */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-white/10">
                        <div className="p-3.5 rounded-lg bg-[#16110D] border border-white/10 space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#C9A45C] font-bold block">
                            SMS &amp; Email Notification Delivery Logs ({orderAlertLogs.length})
                          </span>
                          {orderAlertLogs.length === 0 ? (
                            <p className="text-xs text-[#F7F2EB]/60">
                              No notification logs recorded for this order yet.
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {orderAlertLogs.map((log) => (
                                <div
                                  key={log.id}
                                  className="p-2.5 rounded bg-[#0F0B08] border border-white/10 text-[11px] space-y-1"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-mono font-bold uppercase text-[#C9A45C]">
                                      {log.channel} · {log.provider}
                                    </span>
                                    <span
                                      className={`px-2 py-0.5 rounded font-mono font-bold uppercase text-[10px] ${
                                        log.status === 'delivered'
                                          ? 'bg-[#254B37] text-[#FFFFFF]'
                                          : log.status === 'unconfigured'
                                          ? 'bg-[#F4A261]/25 text-[#F4A261]'
                                          : 'bg-[#E63946]/25 text-[#E63946]'
                                      }`}
                                    >
                                      {log.status}
                                    </span>
                                  </div>
                                  <p className="text-[#F7F2EB]/75">
                                    To: {log.recipients.join(', ') || 'Configured Owner'}
                                  </p>
                                  {log.errorMessage && (
                                    <p className="text-[#F4A261]">{log.errorMessage}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="p-3.5 rounded-lg bg-[#16110D] border border-white/10 space-y-2">
                          <span className="text-[11px] uppercase tracking-wider text-[#C9A45C] font-bold block">
                            Order Status History Timeline ({orderHistory.length})
                          </span>
                          {orderHistory.length === 0 ? (
                            <p className="text-xs text-[#F7F2EB]/60">
                              Current status: <strong>{order.status}</strong>
                            </p>
                          ) : (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                              {orderHistory.map((h) => (
                                <div
                                  key={h.id}
                                  className="p-2.5 rounded bg-[#0F0B08] border border-white/10 text-[11px] space-y-0.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-[#C9A45C]">{h.status}</span>
                                    <span className="font-mono text-[10px] text-[#F7F2EB]/55">
                                      {new Date(h.timestampIso).toLocaleString()}
                                    </span>
                                  </div>
                                  {h.note && <p className="text-[#F7F2EB]/80">{h.note}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Automated Email Dispatch Status Bar & Preview Toggle */}
                  <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2 text-[#F7F2EB]/75">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#0F0B08] border border-white/10 text-[#52B788] font-medium">
                        <Mail className="w-3.5 h-3.5" />
                        Order Notifications:
                      </span>
                      <span>
                        SMS &amp; Email configured for{' '}
                        <strong className="text-[#F7F2EB]">{notificationSettings.ownerPhone}</strong>{' '}
                        &amp;{' '}
                        <strong className="text-[#C9A45C]">{notificationSettings.ownerEmail}</strong>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => retryOrderNotification(order, 'sms')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-[#C9A45C]/40 text-xs font-semibold text-[#C9A45C] transition-colors cursor-pointer"
                      >
                        <Phone className="w-3 h-3" />
                        Retry Owner SMS
                      </button>
                      <button
                        type="button"
                        onClick={() => sendOrderStatusEmail(order, order.status)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0F0B08] hover:bg-white/5 border border-[#C9A45C]/40 text-xs font-semibold text-[#C9A45C] transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                        Send Status Email
                      </button>
                      {orderEmails.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedEmailLogOrderId(isEmailLogOpen ? null : order.id)
                          }
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-[#F7F2EB] transition-colors cursor-pointer"
                        >
                          {isEmailLogOpen
                            ? 'Hide Email Preview'
                            : `Preview Email (${orderEmails.length})`}
                        </button>
                      )}
                    </div>
                  </div>

                  {isEmailLogOpen && orderEmails.length > 0 && (
                    <div className="p-4 rounded-xl bg-[#0F0B08] border border-[#D4AF37]/30 space-y-3">
                      <h4 className="text-xs uppercase tracking-wider text-[#D4AF37] font-bold">
                        Formatted Email Log · {cleanRef}
                      </h4>
                      <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                        {orderEmails.map((em) => (
                          <div
                            key={em.id}
                            className="p-3 rounded-lg bg-[#16110D] border border-white/10 space-y-1.5 text-xs"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="font-semibold text-[#D4AF37]">{em.subject}</span>
                              <span className="font-mono text-[11px] text-[#52B788]">
                                Recipient: {em.recipientEmail}
                              </span>
                            </div>
                            <pre className="text-[11px] text-[#F7F2EB]/80 whitespace-pre-wrap font-sans leading-relaxed">
                              {em.bodyPreview || em.messageBody}
                            </pre>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2B: SMS, EMAIL & ADMIN ALERT NOTIFICATION SETTINGS & TEST CENTER */}
      {activeTab === 'notifications' && (
        <div className="space-y-8">
          {/* Provider Configuration Status & Diagnostics */}
          <div className="p-6 bg-[#16110D] border border-[#C9A45C]/45 rounded-2xl space-y-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#C9A45C] font-bold">
                  Real-Time Notification Infrastructure
                </span>
                <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#F7F2EB] mt-0.5">
                  Automatic New Order Alert System (SMS + Email + Live Dashboard)
                </h2>
                <p className="text-xs text-[#F7F2EB]/75 mt-1">
                  Configure owner and staff phone numbers and email addresses, test SMS and HTML email alerts, and inspect delivery logs.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={testingSms}
                  onClick={async () => {
                    setTestingSms(true);
                    await sendTestNotification('sms', notifForm.ownerPhone);
                    setTestingSms(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#254B37] hover:bg-[#1D3B2B] text-xs font-bold text-[#FFFFFF] border border-[#C9A45C]/40 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Phone className="w-3.5 h-3.5 text-[#C9A45C]" />
                  {testingSms ? 'Sending Test SMS...' : 'Send Test SMS'}
                </button>
                <button
                  type="button"
                  disabled={testingEmail}
                  onClick={async () => {
                    setTestingEmail(true);
                    await sendTestNotification('email', notifForm.ownerEmail);
                    setTestingEmail(false);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#B89146] text-xs font-bold text-[#21150F] transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {testingEmail ? 'Sending Test Email...' : 'Send Test Email'}
                </button>
                <button
                  type="button"
                  onClick={playTestAlertSound}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0F0B08] hover:bg-white/10 border border-[#C9A45C]/40 text-xs font-bold text-[#C9A45C] transition-colors cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Test Sound Alert
                </button>
              </div>
            </div>

            {/* Live Server Provider Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                    1. Twilio SMS Gateway
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      providerStatus?.smsConfigured
                        ? 'bg-[#254B37] text-[#FFFFFF]'
                        : 'bg-[#F4A261]/20 text-[#F4A261]'
                    }`}
                  >
                    {providerStatus?.smsConfigured ? 'LIVE CREDENTIALS SET' : 'SECRETS PENDING'}
                  </span>
                </div>
                <p className="text-xs text-[#F7F2EB]/80">
                  Target Owner Phone: <strong className="font-mono">{notifForm.ownerPhone}</strong>
                </p>
                <p className="text-[11px] text-[#F7F2EB]/60">
                  Server env vars: <code>TWILIO_ACCOUNT_SID</code>, <code>TWILIO_AUTH_TOKEN</code>,{' '}
                  <code>TWILIO_FROM_PHONE</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                    2. Transactional Email (Resend / SendGrid)
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      providerStatus?.emailConfigured
                        ? 'bg-[#254B37] text-[#FFFFFF]'
                        : 'bg-[#F4A261]/20 text-[#F4A261]'
                    }`}
                  >
                    {providerStatus?.emailConfigured ? 'LIVE CREDENTIALS SET' : 'SECRETS PENDING'}
                  </span>
                </div>
                <p className="text-xs text-[#F7F2EB]/80">
                  Target Owner Email: <strong className="font-mono">{notifForm.ownerEmail}</strong>
                </p>
                <p className="text-[11px] text-[#F7F2EB]/60">
                  Server env vars: <code>RESEND_API_KEY</code> or <code>SENDGRID_API_KEY</code>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C9A45C]">
                    3. Admin Live Alert &amp; Sound
                  </span>
                  <span className="px-2 py-0.5 rounded bg-[#254B37] text-[#FFFFFF] text-[10px] font-mono font-bold uppercase">
                    REAL-TIME ACTIVE
                  </span>
                </div>
                <p className="text-xs text-[#F7F2EB]/80">
                  Firestore real-time listener + Web Audio API kitchen bell chime
                </p>
                <p className="text-[11px] text-[#52B788]">
                  Triggers immediately when an order is saved in Firestore.
                </p>
              </div>
            </div>

            {/* Notification Settings Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const parsedEmails = additionalEmailsInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const parsedPhones = additionalPhonesInput
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean);
                const updated = {
                  ...notifForm,
                  additionalEmails: parsedEmails,
                  additionalPhones: parsedPhones,
                  updatedAtIso: new Date().toISOString(),
                };
                saveNotificationSettings(updated);
              }}
              className="p-5 rounded-xl bg-[#0F0B08] border border-white/10 space-y-4"
            >
              <h3 className="font-serif-display text-xl font-bold text-[#F7F2EB]">
                Configure Owner &amp; Staff Notification Recipients
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#F7F2EB]/75 mb-1">
                    Restaurant Official Notification Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={notifForm.ownerEmail}
                    onChange={(e) => setNotifForm({ ...notifForm, ownerEmail: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#16110D] border border-white/15 text-sm text-[#F7F2EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F7F2EB]/75 mb-1">
                    Restaurant Owner SMS Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={notifForm.ownerPhone}
                    onChange={(e) => setNotifForm({ ...notifForm, ownerPhone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#16110D] border border-white/15 text-sm text-[#F7F2EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F7F2EB]/75 mb-1">
                    Additional Staff Email Addresses (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="orders@faminasrestaurant.com, manager@faminasrestaurant.com"
                    value={additionalEmailsInput}
                    onChange={(e) => setAdditionalEmailsInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#16110D] border border-white/15 text-sm text-[#F7F2EB]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F7F2EB]/75 mb-1">
                    Additional Staff SMS Phone Numbers (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="+18565223029"
                    value={additionalPhonesInput}
                    onChange={(e) => setAdditionalPhonesInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#16110D] border border-white/15 text-sm text-[#F7F2EB]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifForm.smsEnabled}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, smsEnabled: e.target.checked })
                    }
                    className="accent-[#C9A45C]"
                  />
                  Enable SMS Notifications
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifForm.emailEnabled}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, emailEnabled: e.target.checked })
                    }
                    className="accent-[#C9A45C]"
                  />
                  Enable Email Notifications
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifForm.soundEnabled}
                    onChange={(e) =>
                      setNotifForm({ ...notifForm, soundEnabled: e.target.checked })
                    }
                    className="accent-[#C9A45C]"
                  />
                  Enable Admin Dashboard Sound
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifForm.customerNotificationsEnabled}
                    onChange={(e) =>
                      setNotifForm({
                        ...notifForm,
                        customerNotificationsEnabled: e.target.checked,
                      })
                    }
                    className="accent-[#C9A45C]"
                  />
                  Enable Customer Status Alerts
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C9A45C] hover:bg-[#B89146] text-[#21150F] font-bold text-xs transition-colors cursor-pointer"
                >
                  Save Notification Settings
                </button>
              </div>
            </form>
          </div>

          {/* Complete SMS & Email Notification Dispatch & Retry Log */}
          <div className="p-6 bg-[#16110D] border border-white/10 rounded-2xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
              <div>
                <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                  SMS &amp; Email Notification Delivery Audit Log ({orderNotificationLogs.length})
                </h3>
                <p className="text-xs text-[#F7F2EB]/65">
                  Inspect exact SMS and Email payloads, provider delivery status, and retry any failed notifications.
                </p>
              </div>
            </div>

            {orderNotificationLogs.length === 0 ? (
              <div className="p-8 rounded-xl bg-[#0F0B08] border border-white/10 text-center space-y-3">
                <p className="text-sm text-[#F7F2EB]/70">
                  No SMS or Email notifications logged yet. Click <strong>Send Test SMS</strong> or{' '}
                  <strong>Send Test Email</strong> above, or place a new customer order.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {orderNotificationLogs.slice(0, 25).map((log) => (
                  <div
                    key={log.id}
                    className="p-4 rounded-xl bg-[#0F0B08] border border-white/10 space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded bg-[#C9A45C]/20 text-[#C9A45C] text-[11px] font-mono font-bold uppercase">
                          {log.channel}
                        </span>
                        <span className="font-mono text-xs font-bold text-[#F7F2EB]">
                          Order #{log.orderReference}
                        </span>
                        <span className="text-xs text-[#F7F2EB]/65">
                          via {log.provider} · To: {log.recipients.join(', ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            log.status === 'delivered'
                              ? 'bg-[#254B37] text-[#FFFFFF]'
                              : log.status === 'unconfigured'
                              ? 'bg-[#F4A261]/20 text-[#F4A261]'
                              : 'bg-[#E63946]/20 text-[#E63946]'
                          }`}
                        >
                          {log.status}
                        </span>
                        <span className="font-mono text-[11px] text-[#F7F2EB]/50">
                          {new Date(log.dispatchedAtIso).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {log.subject && (
                      <p className="text-xs font-bold text-[#C9A45C]">Subject: {log.subject}</p>
                    )}

                    <pre className="p-3 rounded-lg bg-[#16110D] border border-white/10 text-[11px] text-[#F7F2EB]/85 whitespace-pre-wrap font-mono leading-relaxed">
                      {log.messagePreview}
                    </pre>

                    {log.errorMessage && (
                      <p className="text-xs text-[#F4A261]">
                        <strong>Provider Diagnostic:</strong> {log.errorMessage}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MENU, PRICING & FOOD PHOTOGRAPHY MANAGEMENT */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Add / Edit Food Item Form */}
          <div className="lg:col-span-1 space-y-6">
            <form
              onSubmit={handleSaveMenuItemSubmit}
              className="p-6 bg-[#16110D] border border-[#D4AF37]/30 rounded-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
                  {isEditingExisting ? 'Edit Dish & Photo' : 'Add New Menu Dish'}
                </h2>
                {isEditingExisting && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingExisting(false);
                      setEditingItem({
                        id: '',
                        name: '',
                        categoryId: categories[0]?.id || 'cat-rice-dishes',
                        categoryName: categories[0]?.name || 'Rice Dishes',
                        cuisineType: 'Sierra Leonean',
                        description: '',
                        price: 0,
                        imageKey: 'cassava_leaves',
                        imageUrl: '',
                        isAvailable: true,
                        isPopular: false,
                        isFeatured: false,
                        spiceLevel: 'Medium',
                        prepTimeMinutes: 20,
                        dietaryNotes: 'Freshly Prepared',
                      });
                    }}
                    className="text-xs text-[#D4AF37] hover:underline"
                  >
                    Reset Form
                  </button>
                )}
              </div>

              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Dish Name *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  placeholder="e.g. Cassava Leaves (Kankain)"
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#F7F2EB]/70 mb-1">
                    Price ({settings.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={editingItem.price}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#F7F2EB]/70 mb-1">Prep Mins</label>
                  <input
                    type="number"
                    min="1"
                    max="240"
                    value={editingItem.prepTimeMinutes}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        prepTimeMinutes: parseInt(e.target.value, 10) || 15,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Category *</label>
                <select
                  value={editingItem.categoryId}
                  onChange={(e) => {
                    const cat = categories.find((c) => c.id === e.target.value);
                    setEditingItem({
                      ...editingItem,
                      categoryId: e.target.value,
                      categoryName: cat ? cat.name : editingItem.categoryName,
                    });
                  }}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#F7F2EB]/70 mb-1">Cuisine Type</label>
                  <select
                    value={editingItem.cuisineType}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        cuisineType: e.target.value as CuisineType,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                  >
                    {(
                      [
                        'Sierra Leonean',
                        'West African',
                        'American',
                        'Seafood',
                        'Sides',
                        'Drinks',
                      ] as CuisineType[]
                    ).map((ct) => (
                      <option key={ct} value={ct}>
                        {ct}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#F7F2EB]/70 mb-1">Spice Level</label>
                  <select
                    value={editingItem.spiceLevel}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        spiceLevel: e.target.value as SpiceLevel,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                  >
                    {(['Mild', 'Medium', 'Authentic Hot', 'Custom'] as SpiceLevel[]).map((sp) => (
                      <option key={sp} value={sp}>
                        {sp}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  maxLength={600}
                  value={editingItem.description}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, description: e.target.value })
                  }
                  placeholder="Describe ingredients, flavour profile, and accompaniments..."
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>

              {/* Food Image Management: Preset Selector + Custom Upload + URL + Reset */}
              <div className="p-3.5 rounded-lg bg-[#0F0B08] border border-[#D4AF37]/25 space-y-3">
                <label className="block text-xs font-semibold text-[#D4AF37]">
                  Food Photograph Management (Upload, Replace, or Choose Dish Photo)
                </label>

                <div className="relative aspect-[4/3] w-full rounded-lg overflow-hidden border border-white/10 bg-[#16110D]">
                  <img
                    src={
                      editingItem.imageUrl && editingItem.imageUrl.trim().length > 5
                        ? editingItem.imageUrl
                        : `/assets/food/${editingItem.imageKey || 'cassava_leaves'}.jpg`
                    }
                    alt={editingItem.name || 'Dish Preview'}
                    className="w-full h-full object-cover"
                  />
                  {editingItem.imageUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setEditingItem((prev) => ({
                          ...prev,
                          imageUrl: `/assets/food/${prev.imageKey || 'cassava_leaves'}.jpg`,
                        }))
                      }
                      className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#0F0B08]/90 border border-white/20 text-[11px] text-[#E63946] hover:bg-[#0F0B08]"
                    >
                      Reset to Built-In Dish Photo
                    </button>
                  )}
                </div>

                <div>
                  <span className="block text-[11px] text-[#F7F2EB]/65 mb-1">
                    1. Built-In Dish Photograph Preset
                  </span>
                  <select
                    value={editingItem.imageKey}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        imageKey: e.target.value,
                        imageUrl: `/assets/food/${e.target.value}.jpg`,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[#16110D] border border-white/15 text-xs text-[#F7F2EB]"
                  >
                    <optgroup label="African & Sierra Leonean Cuisine">
                      <option value="cassava_leaves">Cassava Leaves (Kankain)</option>
                      <option value="potato_leaves">Potato Leaves</option>
                      <option value="jollof_rice">Jollof Rice</option>
                      <option value="fried_rice">Fried Rice</option>
                      <option value="palm_oil_rice">Palm Oil Rice</option>
                      <option value="groundnut_soup">Groundnut Soup</option>
                      <option value="palm_nut_soup">Palm Nut Soup</option>
                      <option value="okra_soup">Okra Soup</option>
                      <option value="egusi_soup">Egusi Soup</option>
                      <option value="grilled_fish">Grilled Fish</option>
                      <option value="fried_fish">Fried Fish</option>
                      <option value="fufu">Fufu</option>
                      <option value="eba">Eba</option>
                      <option value="pounded_yam">Pounded Yam</option>
                      <option value="fried_plantain">Fried Plantain</option>
                      <option value="palava_sauce">Rice &amp; Traditional African Sauces</option>
                    </optgroup>
                    <optgroup label="American & Other Favorites">
                      <option value="cheeseburger">Burgers</option>
                      <option value="chicken_wings">Chicken Wings</option>
                      <option value="fried_chicken">Fried Chicken</option>
                      <option value="grilled_chicken">Grilled Chicken</option>
                      <option value="french_fries">French Fries</option>
                      <option value="red_snapper">Seafood / Red Snapper</option>
                      <option value="steak">Steak</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <span className="block text-[11px] text-[#F7F2EB]/65 mb-1">
                    2. Upload Custom Food Photo from Computer / Phone (Auto-Optimized)
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="w-full text-xs text-[#F7F2EB]/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#D4AF37] file:text-[#0F0B08] cursor-pointer"
                  />
                </div>

                <div>
                  <span className="block text-[11px] text-[#F7F2EB]/65 mb-1">
                    3. Or Paste Direct Image URL
                  </span>
                  <input
                    type="text"
                    value={editingItem.imageUrl || ''}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, imageUrl: e.target.value })
                    }
                    placeholder="/assets/food/cassava_leaves.jpg or https://..."
                    className="w-full px-3 py-1.5 rounded-lg bg-[#16110D] border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>
              </div>

              {/* Inventory & Low-Stock Threshold Configuration Box */}
              <div className="p-3.5 rounded-lg bg-[#0F0B08] border border-[#D4AF37]/25 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#D4AF37] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Inventory &amp; Low-Stock Threshold
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-[11px] text-[#F7F2EB]/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingItem.trackInventory !== false}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          trackInventory: e.target.checked,
                        })
                      }
                      className="accent-[#D4AF37]"
                    />
                    Track Stock
                  </label>
                </div>

                {editingItem.trackInventory !== false && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#F7F2EB]/65 mb-1">
                          Current Stock (Portions)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100000"
                          value={editingItem.stockQuantity ?? 24}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              stockQuantity: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#16110D] border border-white/15 font-mono text-xs text-[#F7F2EB] tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#F7F2EB]/65 mb-1">
                          Low-Stock Alert Threshold
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="10000"
                          value={editingItem.lowStockThreshold ?? 5}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              lowStockThreshold: Math.max(0, parseInt(e.target.value, 10) || 0),
                            })
                          }
                          className="w-full px-3 py-1.5 rounded-lg bg-[#16110D] border border-[#D4AF37]/40 font-mono text-xs text-[#D4AF37] font-bold tabular-nums"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded bg-[#16110D] border border-white/10">
                      <span className="text-[#F7F2EB]/65">Status Preview:</span>
                      {(editingItem.stockQuantity ?? 24) <= 0 ? (
                        <span className="font-mono font-bold text-[#E63946]">
                          OUT OF STOCK (0 left)
                        </span>
                      ) : (editingItem.stockQuantity ?? 24) <=
                        (editingItem.lowStockThreshold ?? 5) ? (
                        <span className="font-mono font-bold text-[#F4A261]">
                          LOW STOCK ALERT ({editingItem.stockQuantity ?? 0} ≤{' '}
                          {editingItem.lowStockThreshold ?? 5})
                        </span>
                      ) : (
                        <span className="font-mono font-bold text-[#52B788]">
                          HEALTHY STOCK ({editingItem.stockQuantity ?? 24} portions)
                        </span>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isAvailable}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isAvailable: e.target.checked })
                    }
                    className="accent-[#D4AF37]"
                  />
                  Available
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isPopular}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isPopular: e.target.checked })
                    }
                    className="accent-[#D4AF37]"
                  />
                  Popular Favourite
                </label>
                <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingItem.isFeatured}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, isFeatured: e.target.checked })
                    }
                    className="accent-[#D4AF37]"
                  />
                  Homepage Featured
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg bg-[#D4AF37] text-[#0F0B08] font-semibold text-xs hover:bg-[#E2C15A] transition-colors"
              >
                {isEditingExisting ? 'Save Dish, Inventory & Photo Changes' : 'Add Dish to Menu'}
              </button>
            </form>

            {/* Category Creator */}
            <form
              onSubmit={handleAddCategory}
              className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-3"
            >
              <h3 className="font-serif-display text-xl font-bold text-[#F7F2EB]">
                Add Menu Category
              </h3>
              <input
                type="text"
                placeholder="Category Name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
              />
              <select
                value={newCategoryGroup}
                onChange={(e) => setNewCategoryGroup(e.target.value as CuisineGroup)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
              >
                <option value="African & West African">African &amp; West African</option>
                <option value="American Favourites">American Favourites</option>
                <option value="Sides & Drinks">Sides &amp; Drinks</option>
              </select>
              <button
                type="submit"
                className="w-full py-2 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F7F2EB] transition-colors"
              >
                Create Category
              </button>
            </form>
          </div>

          {/* Right Column: Inventory Filter Bar + All Menu Items List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Inventory Filter & Search Toolbar */}
            <div className="p-4 bg-[#16110D] border border-white/10 rounded-xl space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { id: 'all', label: `All Dishes (${menuItems.length})` },
                    {
                      id: 'low_stock',
                      label: `Low Stock Alerts (${alertedInventoryItems.length})`,
                      alert: alertedInventoryItems.length > 0,
                    },
                    {
                      id: 'out_of_stock',
                      label: `Out of Stock (${outOfStockItems.length})`,
                      danger: outOfStockItems.length > 0,
                    },
                    {
                      id: 'healthy',
                      label: `Healthy Stock (${healthyStockItems.length})`,
                    },
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setInventoryFilter(f.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        inventoryFilter === f.id
                          ? 'bg-[#D4AF37] text-[#0F0B08]'
                          : f.danger
                          ? 'bg-[#E63946]/15 text-[#E63946] border border-[#E63946]/35 hover:bg-[#E63946]/25'
                          : f.alert
                          ? 'bg-[#F4A261]/15 text-[#F4A261] border border-[#F4A261]/35 hover:bg-[#F4A261]/25'
                          : 'bg-[#0F0B08] text-[#F7F2EB]/75 border border-white/10 hover:text-[#F7F2EB]'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-[#F7F2EB]/45 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={menuSearchQuery}
                    onChange={(e) => setMenuSearchQuery(e.target.value)}
                    placeholder="Filter dish or category..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#0F0B08] border border-white/15 text-xs text-[#F7F2EB] placeholder:text-[#F7F2EB]/40"
                  />
                </div>
              </div>
            </div>

            {filteredAdminMenuItems.length === 0 ? (
              <div className="p-8 bg-[#16110D] border border-white/10 rounded-xl text-center text-sm text-[#F7F2EB]/65">
                No menu items match the selected inventory filter.
              </div>
            ) : (
              filteredAdminMenuItems.map((item) => {
                const trackInv = item.trackInventory !== false;
                const stock = item.stockQuantity ?? 24;
                const threshold = item.lowStockThreshold ?? 5;
                const isOut = trackInv && stock <= 0;
                const isLow = trackInv && stock > 0 && stock <= threshold;

                return (
                  <div
                    key={item.id}
                    className={`p-4 bg-[#16110D] border rounded-xl flex flex-col gap-3.5 transition-colors ${
                      isOut
                        ? 'border-[#E63946]/60 bg-[#E63946]/[0.04]'
                        : isLow
                        ? 'border-[#F4A261]/60 bg-[#F4A261]/[0.04]'
                        : 'border-white/10 hover:border-[#D4AF37]/40'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center shrink-0 bg-[#0F0B08] border border-[#D4AF37]/35 rounded-lg overflow-hidden w-24">
                          <img
                            src={getCulinaryVisualUrl(
                              item.imageKey,
                              item.name,
                              item.categoryName,
                              item.imageUrl
                            )}
                            alt={item.name}
                            className="w-24 h-16 object-cover bg-[#0F0B08]"
                          />
                          <span className="w-full py-0.5 text-center font-mono text-[11px] font-bold text-[#D4AF37] bg-[#140E0A] border-t border-[#D4AF37]/30 tabular-nums">
                            {settings.currencySymbol}
                            {item.price.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-[#F7F2EB]/60">
                            <span className="text-[#D4AF37] font-medium">
                              {item.categoryName}
                            </span>
                            <span>·</span>
                            <span>{item.cuisineType}</span>
                            <span>·</span>
                            <span
                              className={
                                item.isAvailable ? 'text-[#52B788]' : 'text-[#E63946]'
                              }
                            >
                              {item.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                            {item.isFeatured && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[10px] font-bold uppercase">
                                <Sparkles className="w-2.5 h-2.5" />
                                Daily Special
                              </span>
                            )}

                            {/* Stock Alert Status Badge */}
                            {trackInv && (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                  isOut
                                    ? 'bg-[#E63946] text-[#F7F2EB]'
                                    : isLow
                                    ? 'bg-[#F4A261] text-[#0F0B08]'
                                    : 'bg-[#52B788]/15 text-[#52B788] border border-[#52B788]/30'
                                }`}
                              >
                                {(isOut || isLow) && (
                                  <AlertTriangle className="w-2.5 h-2.5" />
                                )}
                                {isOut
                                  ? 'Out of Stock (0)'
                                  : isLow
                                  ? `Low Stock: ${stock} left (Min ${threshold})`
                                  : `In Stock: ${stock}`}
                              </span>
                            )}
                          </div>
                          <h4 className="font-serif-display text-lg font-bold text-[#F7F2EB] mt-0.5">
                            {item.name}
                          </h4>
                          <p className="text-xs text-[#F7F2EB]/65 line-clamp-1">
                            {item.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <div className="inline-flex items-center gap-1 bg-[#0F0B08] border border-[#D4AF37]/45 rounded-lg px-2.5 py-1">
                          <span className="font-mono text-xs font-bold text-[#D4AF37]">
                            {settings.currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            aria-label={`Price in dollars for ${item.name}`}
                            placeholder="Set Price"
                            defaultValue={item.price > 0 ? item.price.toFixed(2) : ''}
                            onBlur={(e) => {
                              const val = parseFloat(e.target.value);
                              if (!Number.isNaN(val) && val !== item.price) {
                                updateItemPrice(item, val);
                              }
                            }}
                            className="w-20 bg-transparent font-mono text-xs font-bold text-[#F7F2EB] placeholder:text-[#F7F2EB]/40 focus:outline-none tabular-nums"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleDailySpecial(item, !item.isFeatured)}
                          className={`px-2.5 py-1.5 rounded text-xs font-semibold inline-flex items-center gap-1 border transition-colors ${
                            item.isFeatured
                              ? 'bg-[#D4AF37] text-[#0F0B08] border-[#D4AF37]'
                              : 'bg-white/5 hover:bg-white/10 text-[#F7F2EB]/80 border-white/10'
                          }`}
                          title="Toggle Today's Daily Special on Homepage"
                        >
                          <Sparkles className="w-3 h-3" />
                          {item.isFeatured ? 'Daily Special' : '+ Daily Special'}
                        </button>
                        <button
                          onClick={() =>
                            saveMenuItem({ ...item, isAvailable: !item.isAvailable })
                          }
                          className="px-2.5 py-1.5 rounded bg-white/5 hover:bg-white/10 text-xs text-[#F7F2EB] border border-white/10"
                        >
                          {item.isAvailable ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => {
                            setEditingItem({
                              ...item,
                              stockQuantity: item.stockQuantity ?? 24,
                              lowStockThreshold: item.lowStockThreshold ?? 5,
                              trackInventory: item.trackInventory ?? true,
                            });
                            setIsEditingExisting(true);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-2.5 py-1.5 rounded bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] border border-[#D4AF37]/30 inline-flex items-center gap-1 text-xs font-medium"
                          title="Edit Dish, Inventory & Photo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          Edit / Photo
                        </button>
                        <button
                          onClick={() => deleteMenuItem(item.id)}
                          className="p-2 rounded bg-[#E63946]/15 hover:bg-[#E63946]/30 text-[#E63946]"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Inline Inventory & Low-Stock Threshold Controls Row */}
                    <div className="pt-2.5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-4">
                        <label className="inline-flex items-center gap-1.5 text-[#F7F2EB]/80 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trackInv}
                            onChange={(e) =>
                              updateItemInventory(item, {
                                trackInventory: e.target.checked,
                              })
                            }
                            className="accent-[#D4AF37]"
                          />
                          <span>Track Inventory</span>
                        </label>

                        {trackInv && (
                          <>
                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[#F7F2EB]/60">Current Stock:</span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateItemInventory(item, {
                                    stockQuantity: Math.max(0, stock - 1),
                                  })
                                }
                                className="p-1 rounded bg-[#0F0B08] border border-white/15 text-[#F7F2EB] hover:border-[#D4AF37]"
                                aria-label={`Decrease stock for ${item.name}`}
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min="0"
                                max="100000"
                                aria-label={`Stock quantity for ${item.name}`}
                                value={stock}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!Number.isNaN(val)) {
                                    updateItemInventory(
                                      item,
                                      { stockQuantity: val },
                                      true
                                    );
                                  }
                                }}
                                className={`w-16 px-2 py-1 rounded bg-[#0F0B08] border font-mono text-center font-bold tabular-nums ${
                                  isOut
                                    ? 'border-[#E63946] text-[#E63946]'
                                    : isLow
                                    ? 'border-[#F4A261] text-[#F4A261]'
                                    : 'border-white/15 text-[#F7F2EB]'
                                }`}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  updateItemInventory(item, {
                                    stockQuantity: stock + 1,
                                  })
                                }
                                className="p-1 rounded bg-[#0F0B08] border border-white/15 text-[#F7F2EB] hover:border-[#D4AF37]"
                                aria-label={`Increase stock for ${item.name}`}
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="inline-flex items-center gap-1.5">
                              <span className="text-[#F7F2EB]/60">
                                Low-Stock Threshold ≤
                              </span>
                              <input
                                type="number"
                                min="0"
                                max="10000"
                                aria-label={`Low stock threshold for ${item.name}`}
                                value={threshold}
                                onChange={(e) => {
                                  const val = parseInt(e.target.value, 10);
                                  if (!Number.isNaN(val)) {
                                    updateItemInventory(item, {
                                      lowStockThreshold: val,
                                    });
                                  }
                                }}
                                className="w-16 px-2 py-1 rounded bg-[#0F0B08] border border-[#D4AF37]/40 font-mono text-center text-[#D4AF37] font-bold tabular-nums"
                              />
                              <span className="text-[#F7F2EB]/45 text-[11px]">
                                portions
                              </span>
                            </div>
                          </>
                        )}
                      </div>

                      {trackInv && (isLow || isOut) && (
                        <button
                          type="button"
                          onClick={() =>
                            updateItemInventory(item, {
                              stockQuantity: stock + 10,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D4AF37] hover:bg-[#E2C15A] text-[#0F0B08] font-mono text-[11px] font-bold transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                          Restock +10 Portions
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 4: CATERING ENQUIRIES & CUSTOMER REVIEWS */}
      {activeTab === 'catering' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
              Catering &amp; Event Enquiries ({cateringEnquiries.length})
            </h2>
            {cateringEnquiries.length === 0 ? (
              <div className="p-8 bg-[#16110D] border border-white/10 rounded-xl text-sm text-[#F7F2EB]/65">
                No catering enquiries submitted yet.
              </div>
            ) : (
              cateringEnquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-5 bg-[#16110D] border border-white/10 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F7F2EB]">{enq.fullName}</span>
                    <span className="text-xs text-[#D4AF37] font-medium">{enq.status}</span>
                  </div>
                  <p className="text-xs text-[#F7F2EB]/70">
                    {enq.eventType} · Date: {enq.eventDate} · Guests: {enq.guestCount}
                  </p>
                  <p className="text-xs text-[#F7F2EB]/70">
                    Phone: {enq.phone} · Email: {enq.email}
                  </p>
                  <p className="text-xs text-[#F7F2EB]/85">
                    Preferences: {enq.foodPreferences}
                  </p>
                  {enq.additionalRequirements && (
                    <p className="text-xs text-[#F7F2EB]/65">
                      Notes: {enq.additionalRequirements}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {(['New', 'Reviewed', 'Quoted', 'Confirmed', 'Archived'] as const).map(
                      (st) => (
                        <button
                          key={st}
                          onClick={() => updateCateringStatus(enq, st)}
                          className={`px-2.5 py-1 rounded text-xs ${
                            enq.status === st
                              ? 'bg-[#D4AF37] text-[#0F0B08] font-semibold'
                              : 'bg-[#0F0B08] text-[#F7F2EB]/70 border border-white/10'
                          }`}
                        >
                          {st}
                        </button>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
              Customer Testimonials ({testimonials.length})
            </h2>
            {testimonials.length === 0 ? (
              <div className="p-8 bg-[#16110D] border border-white/10 rounded-xl text-sm text-[#F7F2EB]/65">
                No customer reviews submitted yet.
              </div>
            ) : (
              testimonials.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 bg-[#16110D] border border-white/10 rounded-xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#F7F2EB]">
                      {rev.authorName} · {rev.dishOrdered}
                    </span>
                    <span className="text-xs font-mono text-[#D4AF37]">
                      {rev.rating} / 5
                    </span>
                  </div>
                  <p className="text-sm text-[#F7F2EB]/80">{rev.comment}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => approveTestimonial(rev, !rev.isApproved)}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#1E6B43] text-xs text-[#F7F2EB]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {rev.isApproved ? 'Approved (Click to Hide)' : 'Approve Review'}
                    </button>
                    <button
                      onClick={() => deleteTestimonial(rev.id)}
                      className="px-3 py-1 rounded bg-[#E63946]/20 text-xs text-[#E63946]"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: GALLERY MANAGEMENT */}
      {activeTab === 'gallery' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={handleAddGalleryItem}
            className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-4 h-fit"
          >
            <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
              Add Gallery Photo
            </h2>
            <input
              type="text"
              required
              placeholder="Photo Title"
              value={galleryTitle}
              onChange={(e) => setGalleryTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
            />
            <select
              value={galleryCategory}
              onChange={(e) => setGalleryCategory(e.target.value as GalleryCategory)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
            >
              {[
                'Sierra Leonean Dishes',
                'West African Traditional',
                'American Meals',
                'Seafood',
                'Restaurant Interior',
                'Food Preparation',
                'Catering Events',
              ].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <textarea
              rows={2}
              required
              placeholder="Caption"
              value={galleryCaption}
              onChange={(e) => setGalleryCaption(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
            />
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-lg bg-[#D4AF37] text-[#0F0B08] font-semibold text-xs"
            >
              Add to Gallery
            </button>
          </form>

          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {galleryImages.map((img) => (
              <div
                key={img.id}
                className="p-4 bg-[#16110D] border border-white/10 rounded-xl flex items-start justify-between gap-3"
              >
                <div>
                  <span className="text-xs text-[#D4AF37]">{img.category}</span>
                  <h4 className="font-serif-display text-lg font-bold text-[#F7F2EB]">
                    {img.title}
                  </h4>
                  <p className="text-xs text-[#F7F2EB]/70 mt-1">{img.caption}</p>
                </div>
                <button
                  onClick={() => deleteGalleryImage(img.id)}
                  className="p-2 rounded bg-[#E63946]/15 text-[#E63946] shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: WEBSITE CMS CONTENT MANAGEMENT */}
      {activeTab === 'website-cms' && (
        <WebsiteContentEditor onPreviewWebsite={onPreviewWebsite} />
      )}

      {/* TAB 6: RESTAURANT SETTINGS & DELIVERY ZONES */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await saveRestaurantSettings(settingsForm);
            }}
            className="lg:col-span-2 p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-4"
          >
            <h2 className="font-serif-display text-2xl font-bold text-[#F7F2EB]">
              Restaurant Configuration &amp; Payment Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Restaurant Name</label>
                <input
                  type="text"
                  value={settingsForm.restaurantName}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, restaurantName: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settingsForm.tagline}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, tagline: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={settingsForm.phone}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, phone: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">
                  Owner WhatsApp Number (International digits, e.g. 1234567890)
                </label>
                <input
                  type="text"
                  placeholder="Configure owner WhatsApp number"
                  value={settingsForm.whatsappNumber}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Email Address</label>
                <input
                  type="email"
                  value={settingsForm.email}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, email: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Restaurant Address</label>
                <input
                  type="text"
                  value={settingsForm.address}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">Opening Hours</label>
                <input
                  type="text"
                  value={settingsForm.openingHours}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, openingHours: e.target.value })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">
                  Default Delivery Fee ({settingsForm.currencySymbol})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={settingsForm.defaultDeliveryFee}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      defaultDeliveryFee: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F7F2EB]/70 mb-1">
                  Applicable Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settingsForm.taxRatePercent}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      taxRatePercent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.pickupEnabled}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, pickupEnabled: e.target.checked })
                  }
                  className="accent-[#D4AF37]"
                />
                Pickup Enabled
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.deliveryEnabled}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, deliveryEnabled: e.target.checked })
                  }
                  className="accent-[#D4AF37]"
                />
                Delivery Enabled
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.cashOnPickupEnabled}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      cashOnPickupEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#D4AF37]"
                />
                Cash on Pickup
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.cashOnDeliveryEnabled}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      cashOnDeliveryEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#D4AF37]"
                />
                Cash on Delivery
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.onlineCardEnabled}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      onlineCardEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#D4AF37]"
                />
                Online Card Payment
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#F7F2EB]">
                <input
                  type="checkbox"
                  checked={settingsForm.whatsappOrderingEnabled}
                  onChange={(e) =>
                    setSettingsForm({
                      ...settingsForm,
                      whatsappOrderingEnabled: e.target.checked,
                    })
                  }
                  className="accent-[#D4AF37]"
                />
                WhatsApp Ordering
              </label>
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 rounded-lg bg-[#D4AF37] text-[#0F0B08] font-semibold text-xs hover:bg-[#E2C15A] transition-colors"
            >
              Save Restaurant Configuration
            </button>
          </form>

          {/* Delivery Zones Manager */}
          <div className="space-y-4">
            <form
              onSubmit={handleAddDeliveryZone}
              className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-3"
            >
              <h3 className="font-serif-display text-xl font-bold text-[#F7F2EB]">
                Delivery Zones &amp; Fees
              </h3>
              <input
                type="text"
                required
                placeholder="Zone Name (e.g. Downtown 0-3 mi)"
                value={zoneName}
                onChange={(e) => setZoneName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB]"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Fee"
                  value={zoneFee}
                  onChange={(e) => setZoneFee(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                />
                <input
                  type="number"
                  min="5"
                  placeholder="Est. Mins"
                  value={zoneMinutes}
                  onChange={(e) => setZoneMinutes(parseInt(e.target.value, 10) || 35)}
                  className="w-full px-3.5 py-2 rounded-lg bg-[#0F0B08] border border-white/15 text-sm text-[#F7F2EB] tabular-nums"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F7F2EB]"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Delivery Zone
              </button>
            </form>

            <div className="space-y-2">
              {deliveryZones.map((z) => (
                <div
                  key={z.id}
                  className="p-3.5 bg-[#16110D] border border-white/10 rounded-lg flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium text-[#F7F2EB]">{z.zoneName}</p>
                    <p className="text-xs text-[#F7F2EB]/60 tabular-nums">
                      Fee: {settings.currencySymbol}
                      {z.fee.toFixed(2)} · ~{z.estimatedMinutes} mins
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDeliveryZone(z.id)}
                    className="p-1.5 text-[#E63946] hover:bg-[#E63946]/15 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* VIP Newsletter Subscribers List */}
            <div className="p-6 bg-[#16110D] border border-white/10 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-display text-xl font-bold text-[#F7F2EB]">
                  VIP Newsletter Subscribers ({newsletterSubscribers.length})
                </h3>
                <span className="text-[11px] uppercase tracking-wider text-[#52B788] font-bold">
                  Consented Opt-Ins
                </span>
              </div>
              {newsletterSubscribers.length === 0 ? (
                <p className="text-xs text-[#F7F2EB]/65">
                  Customer signups from the Homepage VIP Club form will appear here.
                </p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {newsletterSubscribers.map((sub) => (
                    <div
                      key={sub.id}
                      className="p-2.5 rounded-lg bg-[#0F0B08] border border-white/10 text-xs flex flex-wrap items-center justify-between gap-2"
                    >
                      <div>
                        <span className="font-semibold text-[#F7F2EB]">{sub.fullName}</span>
                        <span className="text-[#D4AF37] ml-2 font-mono">
                          {sub.email || sub.phone}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#F7F2EB]/50">
                        {new Date(sub.subscribedAtIso).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Full-Width 5-Slide Homepage Hero Slider Manager */}
          <div className="lg:col-span-12 p-6 sm:p-8 bg-[#16110D] border border-[#D4AF37]/40 rounded-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold">
                  Homepage Hero Banner Customization
                </span>
                <h3 className="font-serif-display text-2xl font-bold text-[#F7F2EB] mt-0.5">
                  Manage 5 Rotating Homepage Hero Photographs
                </h3>
                <p className="text-xs text-[#F7F2EB]/70 mt-1">
                  Customize or upload high-resolution food photography for any of the 5 rotating slides on the Homepage banner.
                </p>
              </div>
              <button
                type="button"
                onClick={resetHeroSlides}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-[#D4AF37]/40 text-xs font-semibold text-[#D4AF37] shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Default 5 Slides
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {heroSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="flex flex-col rounded-xl bg-[#0F0B08] border border-[#D4AF37]/40 overflow-hidden"
                >
                  <div className="aspect-[4/3] w-full bg-[#080503] overflow-hidden border-b border-[#D4AF37]/35">
                    <img
                      src={slide.mainImage}
                      alt={slide.dishShortName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3.5 flex flex-col flex-1 justify-between gap-3">
                    <div className="space-y-1 text-center">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#D4AF37] font-bold block">
                        Slide 0{slide.id}
                      </span>
                      <input
                        type="text"
                        value={slide.dishShortName}
                        onChange={(e) =>
                          updateHeroSlide({
                            ...slide,
                            dishShortName: e.target.value,
                          })
                        }
                        aria-label={`Slide ${slide.id} title`}
                        className="w-full px-2 py-1 rounded bg-[#16110D] border border-white/15 text-xs font-bold text-center text-[#F7F2EB]"
                      />
                      <input
                        type="text"
                        value={slide.priceLabel}
                        onChange={(e) =>
                          updateHeroSlide({
                            ...slide,
                            priceLabel: e.target.value,
                          })
                        }
                        aria-label={`Slide ${slide.id} price label`}
                        className="w-full px-2 py-1 rounded bg-[#16110D] border border-[#D4AF37]/35 text-xs font-mono font-bold text-center text-[#D4AF37]"
                      />
                    </div>

                    <label className="w-full py-2 px-3 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-[#0F0B08] border border-[#D4AF37]/45 text-[11px] font-bold text-center cursor-pointer transition-colors">
                      Upload Slide Photo
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          compressAndReadImage(file, (dataUrl) => {
                            updateHeroSlide({
                              ...slide,
                              mainImage: dataUrl,
                            });
                          });
                        }}
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
