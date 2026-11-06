export type PageRoute =
  | 'home'
  | 'about'
  | 'menu'
  | 'ordering'
  | 'food-details'
  | 'gallery'
  | 'catering'
  | 'contact'
  | 'cart'
  | 'checkout'
  | 'order-confirmation'
  | 'admin'
  | 'privacy'
  | 'terms';

export type OrderStatus =
  | 'New Order'
  | 'Accepted'
  | 'Confirmed'
  | 'Preparing'
  | 'Ready for Pickup'
  | 'Out for Delivery'
  | 'Completed'
  | 'Cancelled';

export type PaymentMethod =
  | 'cash_on_pickup'
  | 'cash_on_delivery'
  | 'online_card'
  | 'whatsapp_order';

export type PaymentStatus = 'pending' | 'verified' | 'failed' | 'refunded';

export type CuisineGroup =
  | 'African & West African'
  | 'American Favourites'
  | 'Sides & Drinks';

export type CuisineType =
  | 'Sierra Leonean'
  | 'West African'
  | 'American'
  | 'Seafood'
  | 'Small Chops'
  | 'Natural Drinks'
  | 'Sides'
  | 'Drinks';

export type SpiceLevel = 'Mild' | 'Medium' | 'Hot' | 'Authentic Hot' | 'Custom';

export interface Profile {
  uid: string;
  fullName: string;
  role: 'customer' | 'admin';
  favouriteItemIds: string[];
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  cuisineGroup: CuisineGroup;
  description: string;
  sortOrder: number;
  isActive: boolean;
  updatedAt?: unknown;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  cuisineType: CuisineType;
  description: string;
  price: number;
  imageKey: string;
  imageUrl: string;
  isAvailable: boolean;
  isPopular: boolean;
  isFeatured: boolean;
  spiceLevel: SpiceLevel;
  prepTimeMinutes: number;
  dietaryNotes: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  trackInventory?: boolean;
  updatedAt?: unknown;
}

export interface FoodImage {
  id: string;
  menuItemId: string;
  title: string;
  imageUrl: string;
  altText: string;
  updatedAt?: unknown;
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  customerUid: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  specialInstructions: string;
}

export interface Order {
  id: string;
  orderReference: string;
  customerUid: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryZoneId: string;
  deliveryAddress: string;
  specialInstructions: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  itemsSummary: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  taxAmount: number;
  totalAmount: number;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface Customer {
  uid: string;
  fullName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  updatedAt?: unknown;
}

export interface RestaurantSetting {
  restaurantName: string;
  tagline: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHours: string;
  currencySymbol: string;
  defaultDeliveryFee: number;
  taxRatePercent: number;
  pickupEnabled: boolean;
  deliveryEnabled: boolean;
  cashOnPickupEnabled: boolean;
  cashOnDeliveryEnabled: boolean;
  onlineCardEnabled: boolean;
  whatsappOrderingEnabled: boolean;
  instagramUrl: string;
  facebookUrl: string;
  updatedAt?: unknown;
}

export interface DeliveryZone {
  id: string;
  zoneName: string;
  fee: number;
  estimatedMinutes: number;
  isActive: boolean;
  updatedAt?: unknown;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  customerUid: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  providerRef: string;
  createdAt?: unknown;
}

export interface Testimonial {
  id: string;
  authorUid: string;
  authorName: string;
  dishOrdered: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt?: unknown;
}

export type GalleryCategory =
  | 'Sierra Leonean Dishes'
  | 'West African Traditional'
  | 'American Meals'
  | 'Seafood'
  | 'Restaurant Interior'
  | 'Food Preparation'
  | 'Catering Events';

export interface GalleryImage {
  id: string;
  title: string;
  category: GalleryCategory;
  caption: string;
  imageKey: string;
  imageUrl: string;
  updatedAt?: unknown;
}

export interface CateringEnquiry {
  id: string;
  customerUid: string;
  fullName: string;
  phone: string;
  email: string;
  eventType: string;
  eventDate: string;
  guestCount: number;
  foodPreferences: string;
  additionalRequirements: string;
  status: 'New' | 'Reviewed' | 'Quoted' | 'Confirmed' | 'Archived';
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EmailNotificationRecord {
  id: string;
  orderId: string;
  orderReference: string;
  recipientName: string;
  recipientEmail: string;
  status: OrderStatus;
  subject: string;
  messageBody: string;
  bodyPreview?: string;
  sentAtIso: string;
}

export interface NotificationSettings {
  ownerEmail: string;
  ownerPhone: string;
  additionalEmails: string[];
  additionalPhones: string[];
  smsEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  customerNotificationsEnabled: boolean;
  updatedAtIso: string;
}

export interface OrderNotificationLog {
  id: string;
  orderId: string;
  orderReference: string;
  eventType: 'new_order' | 'status_update' | 'test';
  channel: 'sms' | 'email';
  provider: string;
  providerConfigured: boolean;
  status: 'delivered' | 'failed' | 'unconfigured' | 'disabled' | 'duplicate_skipped';
  recipients: string[];
  subject?: string;
  messagePreview: string;
  htmlBody?: string;
  errorMessage?: string;
  externalMessageId?: string;
  attempts: number;
  dispatchedAtIso: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  orderId: string;
  orderReference: string;
  previousStatus?: OrderStatus;
  status: OrderStatus;
  actor: string;
  note?: string;
  timestampIso: string;
}

export interface ProviderStatusSummary {
  smsConfigured: boolean;
  smsProvider: string;
  twilioFromPhone: string | null;
  emailConfigured: boolean;
  emailProvider: string;
  fromEmail: string;
  defaultOwnerPhone: string;
  defaultOwnerEmail: string;
}

export interface HeroSlideConfig {
  id: number;
  badge: string;
  dishShortName: string;
  priceLabel: string;
  captionTitle: string;
  captionSubtitle: string;
  mainImage: string;
  featuredDishIds: string[];
}

export interface NewsletterSubscriber {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  consented: boolean;
  subscribedAtIso: string;
}





export interface WebsiteHeaderContent {
  announcementText: string;
  announcementActive: boolean;
  announcementLink: string;
  logoUrl: string;
  phone: string;
  addressShort: string;
}

export interface WebsiteHomeContent {
  heroTitle: string;
  heroSubtitle: string;
  heroTagline: string;
  heroBadge: string;
  exploreMenuBtnText: string;
  orderOnlineBtnText: string;
  welcomeHeading: string;
  welcomeText: string;
  featuredDishesTitle: string;
  slides: HeroSlideConfig[];
}

export interface WebsiteAboutStat {
  label: string;
  value: string;
}

export interface WebsiteAboutContent {
  title: string;
  subtitle: string;
  storyParagraph1: string;
  storyParagraph2: string;
  storyParagraph3: string;
  founderName: string;
  founderRole: string;
  founderBio: string;
  founderImage: string;
  culinaryTraditionTitle: string;
  culinaryTraditionText: string;
  stats: WebsiteAboutStat[];
}

export interface WebsiteVideoItem {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: string;
  isFeatured: boolean;
}

export interface WebsiteVideosContent {
  title: string;
  subtitle: string;
  videoItems: WebsiteVideoItem[];
}

export interface WebsiteCateringPackage {
  id: string;
  name: string;
  pricePerPerson: number;
  description: string;
  features: string[];
  badge?: string;
}

export interface WebsiteCateringContent {
  heroTitle: string;
  heroSubtitle: string;
  description: string;
  minGuests: number;
  packages: WebsiteCateringPackage[];
}

export interface WebsiteSpecialOffersContent {
  active: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  discountPercentage: number;
  promoCode: string;
  expiryDate: string;
  ctaText: string;
  imageUrl: string;
}

export interface WebsiteReviewItem {
  id: string;
  authorUid?: string;
  authorName: string;
  dishOrdered: string;
  rating: number;
  comment: string;
  isApproved: boolean;
}

export interface WebsiteReviewsContent {
  sectionTitle: string;
  sectionSubtitle: string;
  googleRating: number;
  totalReviewsCount: number;
  items: WebsiteReviewItem[];
}

export interface WebsiteOpeningHour {
  days: string;
  hours: string;
}

export interface WebsiteContactContent {
  heading: string;
  subheading: string;
  address: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  openingHours: WebsiteOpeningHour[];
  googleMapsEmbedUrl: string;
}

export interface WebsiteFooterContent {
  aboutText: string;
  copyrightText: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;
}

export interface WebsiteContent {
  header: WebsiteHeaderContent;
  home: WebsiteHomeContent;
  about: WebsiteAboutContent;
  videos: WebsiteVideosContent;
  catering: WebsiteCateringContent;
  specialOffers: WebsiteSpecialOffersContent;
  reviews: WebsiteReviewsContent;
  contact: WebsiteContactContent;
  footer: WebsiteFooterContent;
  lastPublishedAt?: string;
  publishedBy?: string;
}

export type SectionKey =
  | 'header'
  | 'home'
  | 'about'
  | 'videos'
  | 'catering'
  | 'specialOffers'
  | 'reviews'
  | 'contact'
  | 'footer';
