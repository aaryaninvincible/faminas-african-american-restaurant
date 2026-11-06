import React, { useState } from 'react';
import {
  Home,
  Info,
  Utensils,
  Video,
  Sparkles,
  Star,
  Phone,
  Check,
  RefreshCw,
  Upload,
  Trash2,
  Eye,
  Plus,
  AlertCircle,
  Save,
  ImageIcon,
  Calendar,
  Layers,
  Globe,
  Sliders,
  DollarSign,
  Clock,
  MapPin,
  Mail,
  Share2,
} from 'lucide-react';
import { useRestaurant } from '../context/RestaurantContext';
import {
  SectionKey,
  WebsiteVideoItem,
  WebsiteCateringPackage,
  WebsiteReviewItem,
  HeroSlideConfig,
} from '../types/restaurant';

type CmsTab =
  | 'header'
  | 'home'
  | 'about'
  | 'videos'
  | 'catering'
  | 'specialOffers'
  | 'reviews'
  | 'contact'
  | 'footer';

export const WebsiteContentEditor: React.FC<{ onPreviewWebsite?: () => void }> = ({
  onPreviewWebsite,
}) => {
  const {
    websiteContent,
    draftWebsiteContent,
    isContentDirty,
    updateDraftSection,
    updateDraftField,
    publishWebsiteContent,
    discardDraft,
    resetWebsiteContentToDefault,
    uploadMedia,
    notify,
  } = useRestaurant();

  const [activeCmsTab, setActiveCmsTab] = useState<CmsTab>('home');
  const [isPublishing, setIsPublishing] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  // Helper for uploading image or video and updating draft field
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    section: SectionKey,
    field: string,
    folder: string = 'cms_media'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(`${section}.${field}`);
    try {
      const url = await uploadMedia(file, folder);
      updateDraftField(section as any, field as any, url as any);
      notify('success', `Uploaded media successfully: ${file.name}`);
    } catch (err: any) {
      notify('error', `Failed to upload media: ${err.message || 'Error'}`);
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await publishWebsiteContent();
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* =========================================================================
          CMS TOP ACTION BAR: STATUS, DRAFT INDICATOR, PUBLISH & PREVIEW
          ========================================================================= */}
      <div className="p-5 rounded-2xl bg-[#1C140E] border-2 border-[#D4AF37]/50 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold font-serif-display text-[#FFFFFF] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D4AF37]" />
              Website Content Management System (CMS)
            </h2>
            {isContentDirty ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#E63946]/20 text-[#FF6B6B] border border-[#E63946]/40 animate-pulse">
                <AlertCircle className="w-3.5 h-3.5" />
                Unpublished Draft Changes
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2A9D8F]/20 text-[#2A9D8F] border border-[#2A9D8F]/40">
                <Check className="w-3.5 h-3.5" />
                Live Frontend Synchronized
              </span>
            )}
          </div>
          <p className="text-xs text-[#F7F2EB]/70">
            Edit any text, section, image, or video below. Changes are saved automatically in your working draft and will update the live website immediately upon publishing.
          </p>
          {websiteContent.lastPublishedAt && (
            <p className="text-[11px] text-[#F7F2EB]/50 font-mono">
              Last published: {new Date(websiteContent.lastPublishedAt).toLocaleString()} by {websiteContent.publishedBy || 'Admin'}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
          {onPreviewWebsite && (
            <button
              onClick={onPreviewWebsite}
              className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#F7F2EB] flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-[#D4AF37]" />
              Preview Live Site
            </button>
          )}

          {isContentDirty && (
            <button
              onClick={discardDraft}
              className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-xs font-semibold text-red-300 border border-red-800/40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Discard Draft
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm('Reset all website text, banners, and default media back to initial Sierra Leonean restaurant settings?')) {
                resetWebsiteContentToDefault();
              }
            }}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-[11px] text-[#F7F2EB]/60 hover:text-[#F7F2EB] transition-colors cursor-pointer"
            title="Restore default authentic content"
          >
            Reset Defaults
          </button>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isContentDirty
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#F4A261] text-[#0F0B08] hover:opacity-95 ring-2 ring-[#D4AF37]/50'
                : 'bg-[#D4AF37] text-[#0F0B08] hover:bg-[#C29D26]'
            }`}
          >
            {isPublishing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Publishing Live...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Publish Changes Live
              </>
            )}
          </button>
        </div>
      </div>

      {/* =========================================================================
          SECTION SELECTION SUB-TABS
          ========================================================================= */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'header', label: 'Header & Top Bar', icon: Globe },
          { id: 'home', label: 'Home Page & Slider', icon: Home },
          { id: 'about', label: 'About Us & Bio', icon: Info },
          { id: 'videos', label: 'Kitchen Videos & Reels', icon: Video },
          { id: 'catering', label: 'Catering Packages', icon: Calendar },
          { id: 'specialOffers', label: 'Special Offers', icon: Sparkles },
          { id: 'reviews', label: 'Customer Reviews', icon: Star },
          { id: 'contact', label: 'Contact Us & Hours', icon: Phone },
          { id: 'footer', label: 'Footer & Socials', icon: Share2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCmsTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveCmsTab(tab.id as CmsTab)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-[#D4AF37] text-[#0F0B08] shadow-md font-bold'
                  : 'bg-[#1C140E] text-[#F7F2EB]/75 hover:text-[#F7F2EB] border border-white/10'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          TAB 1: HEADER & TOP BAR
          ========================================================================= */}
      {activeCmsTab === 'header' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-[#FFFFFF]">Header & Announcement Bar Settings</h3>
            <p className="text-xs text-[#F7F2EB]/60">Customize the announcement ribbon, restaurant contact numbers, and top bar branding.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Top Announcement Banner Text</label>
              <input
                type="text"
                value={draftWebsiteContent.header.announcementText}
                onChange={(e) => updateDraftField('header', 'announcementText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                placeholder="e.g. Authentic Sierra Leonean & American Cuisine in Lindenwold..."
              />
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-black/25 border border-white/10">
              <input
                type="checkbox"
                id="headerAnnouncementActive"
                checked={draftWebsiteContent.header.announcementActive}
                onChange={(e) => updateDraftField('header', 'announcementActive', e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
              />
              <label htmlFor="headerAnnouncementActive" className="text-xs font-semibold text-[#F7F2EB] cursor-pointer">
                Show Announcement Banner at Top of Website
              </label>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Header Phone Number</label>
              <input
                type="text"
                value={draftWebsiteContent.header.phone}
                onChange={(e) => updateDraftField('header', 'phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Short Address / City Line</label>
              <input
                type="text"
                value={draftWebsiteContent.header.addressShort}
                onChange={(e) => updateDraftField('header', 'addressShort', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Logo Image (URL or Upload File)</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={draftWebsiteContent.header.logoUrl}
                  onChange={(e) => updateDraftField('header', 'logoUrl', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
                <label className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-[#0F0B08] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  {uploadingField === 'header.logoUrl' ? 'Uploading...' : 'Upload Logo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'header', 'logoUrl', 'branding')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: HOME PAGE & HERO SLIDES
          ========================================================================= */}
      {activeCmsTab === 'home' && (
        <div className="space-y-6">
          {/* Main Hero Headlines */}
          <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-5">
            <div className="border-b border-white/10 pb-4">
              <h3 className="text-base font-bold text-[#FFFFFF]">Homepage Hero & Welcome Section</h3>
              <p className="text-xs text-[#F7F2EB]/60">Manage main headlines, welcome badge, introductory paragraph, and CTA button labels.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Hero Badge Tag</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.heroBadge}
                  onChange={(e) => updateDraftField('home', 'heroBadge', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Hero Tagline</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.heroTagline}
                  onChange={(e) => updateDraftField('home', 'heroTagline', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Main Hero Title</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.heroTitle}
                  onChange={(e) => updateDraftField('home', 'heroTitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Hero Subtitle</label>
                <textarea
                  rows={2}
                  value={draftWebsiteContent.home.heroSubtitle}
                  onChange={(e) => updateDraftField('home', 'heroSubtitle', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Primary Button Text (Explore Menu)</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.exploreMenuBtnText}
                  onChange={(e) => updateDraftField('home', 'exploreMenuBtnText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Secondary Button Text (Order Online)</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.orderOnlineBtnText}
                  onChange={(e) => updateDraftField('home', 'orderOnlineBtnText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Welcome Card Heading</label>
                <input
                  type="text"
                  value={draftWebsiteContent.home.welcomeHeading}
                  onChange={(e) => updateDraftField('home', 'welcomeHeading', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-[#F7F2EB]">Welcome Paragraph</label>
                <textarea
                  rows={3}
                  value={draftWebsiteContent.home.welcomeText}
                  onChange={(e) => updateDraftField('home', 'welcomeText', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* Hero Slider Photos & Cards Editor */}
          <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-base font-bold text-[#FFFFFF]">Homepage Photography Slider (5 Showcase Slides)</h3>
                <p className="text-xs text-[#F7F2EB]/60">Replace images, change prices, edit badges and descriptions for each slide.</p>
              </div>
            </div>

            <div className="space-y-6">
              {draftWebsiteContent.home.slides.map((slide, sIdx) => (
                <div key={slide.id} className="p-5 rounded-xl bg-black/35 border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#D4AF37] uppercase">Slide #{slide.id} · {slide.dishShortName}</span>
                    <span className="text-xs font-mono text-[#F4A261]">{slide.priceLabel}</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Image Preview & Upload */}
                    <div className="space-y-2">
                      <div className="h-36 rounded-lg overflow-hidden bg-black/60 border border-white/15 relative group">
                        <img
                          src={slide.mainImage}
                          alt={slide.captionTitle}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/menu_ref/achecke_grill_fish.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                          <label className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0F0B08] text-xs font-bold cursor-pointer flex items-center gap-1">
                            <Upload className="w-3.5 h-3.5" />
                            Replace Image
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  const url = await uploadMedia(file, 'slides');
                                  const updatedSlides = [...draftWebsiteContent.home.slides];
                                  updatedSlides[sIdx] = { ...updatedSlides[sIdx], mainImage: url };
                                  updateDraftField('home', 'slides', updatedSlides);
                                  notify('success', `Updated Slide #${slide.id} photo.`);
                                } catch (err: any) {
                                  notify('error', 'Upload failed: ' + err.message);
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={slide.mainImage}
                        onChange={(e) => {
                          const updatedSlides = [...draftWebsiteContent.home.slides];
                          updatedSlides[sIdx] = { ...updatedSlides[sIdx], mainImage: e.target.value };
                          updateDraftField('home', 'slides', updatedSlides);
                        }}
                        placeholder="Image URL"
                        className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-[#F7F2EB]"
                      />
                    </div>

                    {/* Texts & Badges */}
                    <div className="md:col-span-2 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Badge Tag</label>
                          <input
                            type="text"
                            value={slide.badge}
                            onChange={(e) => {
                              const updatedSlides = [...draftWebsiteContent.home.slides];
                              updatedSlides[sIdx] = { ...updatedSlides[sIdx], badge: e.target.value };
                              updateDraftField('home', 'slides', updatedSlides);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Price Label</label>
                          <input
                            type="text"
                            value={slide.priceLabel}
                            onChange={(e) => {
                              const updatedSlides = [...draftWebsiteContent.home.slides];
                              updatedSlides[sIdx] = { ...updatedSlides[sIdx], priceLabel: e.target.value };
                              updateDraftField('home', 'slides', updatedSlides);
                            }}
                            className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Dish Name / Short Title</label>
                        <input
                          type="text"
                          value={slide.dishShortName}
                          onChange={(e) => {
                            const updatedSlides = [...draftWebsiteContent.home.slides];
                            updatedSlides[sIdx] = { ...updatedSlides[sIdx], dishShortName: e.target.value };
                            updateDraftField('home', 'slides', updatedSlides);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Slide Headline Title</label>
                        <input
                          type="text"
                          value={slide.captionTitle}
                          onChange={(e) => {
                            const updatedSlides = [...draftWebsiteContent.home.slides];
                            updatedSlides[sIdx] = { ...updatedSlides[sIdx], captionTitle: e.target.value };
                            updateDraftField('home', 'slides', updatedSlides);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Slide Subtitle & Ingredients Description</label>
                        <textarea
                          rows={2}
                          value={slide.captionSubtitle}
                          onChange={(e) => {
                            const updatedSlides = [...draftWebsiteContent.home.slides];
                            updatedSlides[sIdx] = { ...updatedSlides[sIdx], captionSubtitle: e.target.value };
                            updateDraftField('home', 'slides', updatedSlides);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: ABOUT US & FOUNDER BIO
          ========================================================================= */}
      {activeCmsTab === 'about' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-[#FFFFFF]">About Us Page, Heritage & Founder Details</h3>
            <p className="text-xs text-[#F7F2EB]/60">Customize the Faminas brand story, Haja Yeabu Fofana founder bio, statistics, and culinary tradition.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">About Us Main Page Title</label>
              <input
                type="text"
                value={draftWebsiteContent.about.title}
                onChange={(e) => updateDraftField('about', 'title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Subtitle / Heritage Statement</label>
              <input
                type="text"
                value={draftWebsiteContent.about.subtitle}
                onChange={(e) => updateDraftField('about', 'subtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Story Paragraph 1 (Heritage & Location)</label>
              <textarea
                rows={3}
                value={draftWebsiteContent.about.storyParagraph1}
                onChange={(e) => updateDraftField('about', 'storyParagraph1', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Story Paragraph 2 (Culinary Philosophy)</label>
              <textarea
                rows={3}
                value={draftWebsiteContent.about.storyParagraph2}
                onChange={(e) => updateDraftField('about', 'storyParagraph2', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Story Paragraph 3 (Community Invitation)</label>
              <textarea
                rows={2}
                value={draftWebsiteContent.about.storyParagraph3}
                onChange={(e) => updateDraftField('about', 'storyParagraph3', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            {/* Founder Profile Details */}
            <div className="p-5 rounded-xl bg-black/35 border border-white/10 md:col-span-2 space-y-4">
              <h4 className="text-sm font-bold text-[#D4AF37]">Founder / Head Chef Profile</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-44 rounded-xl overflow-hidden bg-black/50 border border-white/15 relative group">
                    <img
                      src={draftWebsiteContent.about.founderImage}
                      alt={draftWebsiteContent.about.founderName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/faminas_ceo_haja_yeabu_fofana.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                      <label className="px-3 py-1.5 rounded-lg bg-[#D4AF37] text-[#0F0B08] text-xs font-bold cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        Replace Portrait
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, 'about', 'founderImage', 'founder')}
                        />
                      </label>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={draftWebsiteContent.about.founderImage}
                    onChange={(e) => updateDraftField('about', 'founderImage', e.target.value)}
                    placeholder="Portrait URL"
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-[#F7F2EB]"
                  />
                </div>

                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Founder Full Name</label>
                    <input
                      type="text"
                      value={draftWebsiteContent.about.founderName}
                      onChange={(e) => updateDraftField('about', 'founderName', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Founder Role</label>
                    <input
                      type="text"
                      value={draftWebsiteContent.about.founderRole}
                      onChange={(e) => updateDraftField('about', 'founderRole', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Founder Biography & Heritage</label>
                    <textarea
                      rows={3}
                      value={draftWebsiteContent.about.founderBio}
                      onChange={(e) => updateDraftField('about', 'founderBio', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Culinary Tradition Details */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Culinary Tradition Section Heading</label>
              <input
                type="text"
                value={draftWebsiteContent.about.culinaryTraditionTitle}
                onChange={(e) => updateDraftField('about', 'culinaryTraditionTitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Culinary Tradition Text</label>
              <textarea
                rows={2}
                value={draftWebsiteContent.about.culinaryTraditionText}
                onChange={(e) => updateDraftField('about', 'culinaryTraditionText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            {/* Statistics Counters */}
            <div className="p-4 rounded-xl bg-black/35 border border-white/10 md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-[#D4AF37]">Restaurant Achievement Statistics (4 Cards)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {draftWebsiteContent.about.stats.map((st, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-black/40 border border-white/10 space-y-1">
                    <input
                      type="text"
                      value={st.value}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.about.stats];
                        updated[idx] = { ...updated[idx], value: e.target.value };
                        updateDraftField('about', 'stats', updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-black/50 text-sm font-bold text-[#D4AF37] border border-white/15 text-center"
                    />
                    <input
                      type="text"
                      value={st.label}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.about.stats];
                        updated[idx] = { ...updated[idx], label: e.target.value };
                        updateDraftField('about', 'stats', updated);
                      }}
                      className="w-full px-2 py-1 rounded bg-transparent text-[11px] text-[#F7F2EB]/75 text-center border-none"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: KITCHEN VIDEOS & REELS
          ========================================================================= */}
      {activeCmsTab === 'videos' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Kitchen Video Reels & Showcases</h3>
              <p className="text-xs text-[#F7F2EB]/60">Upload MP4 video files directly or link YouTube/Vimeo URLs. Manage titles, posters and featured clips.</p>
            </div>
            <button
              onClick={() => {
                const newVid: WebsiteVideoItem = {
                  id: `vid-${Date.now()}`,
                  title: 'New Kitchen Preparation Video',
                  description: 'Authentic West African slow-cooking and plating.',
                  videoUrl: '/assets/videos/reel_achecke_fish.mp4',
                  thumbnailUrl: '/assets/videos/vid_F9kEOXK_2M8.jpg',
                  duration: '1:00',
                  isFeatured: true,
                };
                updateDraftField('videos', 'videoItems', [newVid, ...draftWebsiteContent.videos.videoItems]);
                notify('success', 'Added new video reel item. Fill in the details below.');
              }}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0F0B08] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add New Video Reel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Video Showcase Section Title</label>
              <input
                type="text"
                value={draftWebsiteContent.videos.title}
                onChange={(e) => updateDraftField('videos', 'title', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Subtitle</label>
              <input
                type="text"
                value={draftWebsiteContent.videos.subtitle}
                onChange={(e) => updateDraftField('videos', 'subtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
          </div>

          {/* Videos Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            {draftWebsiteContent.videos.videoItems.map((vid, vIdx) => (
              <div key={vid.id} className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-[#D4AF37]">Reel #{vIdx + 1}</span>
                  <button
                    onClick={() => {
                      const updated = draftWebsiteContent.videos.videoItems.filter((_, idx) => idx !== vIdx);
                      updateDraftField('videos', 'videoItems', updated);
                      notify('success', 'Video removed from reel.');
                    }}
                    className="p-1 rounded text-red-400 hover:bg-red-950/40 cursor-pointer"
                    title="Remove Video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#F7F2EB]/70 block">Video Title</label>
                  <input
                    type="text"
                    value={vid.title}
                    onChange={(e) => {
                      const updated = [...draftWebsiteContent.videos.videoItems];
                      updated[vIdx] = { ...updated[vIdx], title: e.target.value };
                      updateDraftField('videos', 'videoItems', updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-semibold text-[#F7F2EB]/70 block">Description</label>
                  <input
                    type="text"
                    value={vid.description}
                    onChange={(e) => {
                      const updated = [...draftWebsiteContent.videos.videoItems];
                      updated[vIdx] = { ...updated[vIdx], description: e.target.value };
                      updateDraftField('videos', 'videoItems', updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#F7F2EB]/70 block">Video File or URL (MP4 / WebM / YouTube URL)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={vid.videoUrl}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.videos.videoItems];
                        updated[vIdx] = { ...updated[vIdx], videoUrl: e.target.value };
                        updateDraftField('videos', 'videoItems', updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-[#F7F2EB]"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#F7F2EB] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Upload MP4
                      <input
                        type="file"
                        accept="video/mp4,video/webm,video/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadMedia(file, 'videos');
                            const updated = [...draftWebsiteContent.videos.videoItems];
                            updated[vIdx] = { ...updated[vIdx], videoUrl: url };
                            updateDraftField('videos', 'videoItems', updated);
                            notify('success', `Uploaded video file: ${file.name}`);
                          } catch (err: any) {
                            notify('error', 'Upload failed: ' + err.message);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-[#F7F2EB]/70 block">Thumbnail / Poster Image</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={vid.thumbnailUrl}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.videos.videoItems];
                        updated[vIdx] = { ...updated[vIdx], thumbnailUrl: e.target.value };
                        updateDraftField('videos', 'videoItems', updated);
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-[11px] text-[#F7F2EB]"
                    />
                    <label className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#F7F2EB] text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      Poster
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          try {
                            const url = await uploadMedia(file, 'video_posters');
                            const updated = [...draftWebsiteContent.videos.videoItems];
                            updated[vIdx] = { ...updated[vIdx], thumbnailUrl: url };
                            updateDraftField('videos', 'videoItems', updated);
                            notify('success', `Uploaded poster: ${file.name}`);
                          } catch (err: any) {
                            notify('error', 'Upload failed: ' + err.message);
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`vid-featured-${vid.id}`}
                      checked={vid.isFeatured}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.videos.videoItems];
                        updated[vIdx] = { ...updated[vIdx], isFeatured: e.target.checked };
                        updateDraftField('videos', 'videoItems', updated);
                      }}
                      className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                    />
                    <label htmlFor={`vid-featured-${vid.id}`} className="text-xs text-[#F7F2EB] cursor-pointer">
                      Featured on Homepage
                    </label>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-[#F7F2EB]/60">
                    <Clock className="w-3.5 h-3.5" />
                    <input
                      type="text"
                      value={vid.duration}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.videos.videoItems];
                        updated[vIdx] = { ...updated[vIdx], duration: e.target.value };
                        updateDraftField('videos', 'videoItems', updated);
                      }}
                      className="w-16 px-2 py-0.5 rounded bg-black/40 border border-white/10 text-xs text-center text-[#F7F2EB]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: CATERING PACKAGES
          ========================================================================= */}
      {activeCmsTab === 'catering' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Catering Hero & Tiered Packages</h3>
              <p className="text-xs text-[#F7F2EB]/60">Configure pricing per person, included dishes, minimum guests, and banquet options.</p>
            </div>
            <button
              onClick={() => {
                const newPkg: WebsiteCateringPackage = {
                  id: `cat-${Date.now()}`,
                  name: 'Custom Party Buffet Package',
                  pricePerPerson: 22.99,
                  badge: 'New Package',
                  description: 'Tailored West African & American menu for your event.',
                  features: ['Choice of Jollof or Fried Rice', 'Stewed Chicken & Beef', 'Sweet Fried Plantains', 'Full Chafing Dish Setup'],
                };
                updateDraftField('catering', 'packages', [...draftWebsiteContent.catering.packages, newPkg]);
                notify('success', 'Added catering package.');
              }}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0F0B08] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Catering Package
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-bold text-[#F7F2EB] block">Catering Hero Title</label>
              <input
                type="text"
                value={draftWebsiteContent.catering.heroTitle}
                onChange={(e) => updateDraftField('catering', 'heroTitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#F7F2EB] block">Minimum Guests</label>
              <input
                type="number"
                value={draftWebsiteContent.catering.minGuests}
                onChange={(e) => updateDraftField('catering', 'minGuests', Number(e.target.value) || 15)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-xs font-bold text-[#F7F2EB] block">Catering Subtitle & Description</label>
              <textarea
                rows={2}
                value={draftWebsiteContent.catering.description}
                onChange={(e) => updateDraftField('catering', 'description', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
          </div>

          {/* Catering Packages Cards */}
          <div className="space-y-4 pt-2">
            {draftWebsiteContent.catering.packages.map((pkg, pIdx) => (
              <div key={pkg.id} className="p-5 rounded-xl bg-black/35 border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[#D4AF37]">{pkg.name}</span>
                    {pkg.badge && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40">
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const updated = draftWebsiteContent.catering.packages.filter((_, idx) => idx !== pIdx);
                      updateDraftField('catering', 'packages', updated);
                      notify('success', 'Removed catering package.');
                    }}
                    className="p-1 rounded text-red-400 hover:bg-red-950/40 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Package Name</label>
                    <input
                      type="text"
                      value={pkg.name}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.catering.packages];
                        updated[pIdx] = { ...updated[pIdx], name: e.target.value };
                        updateDraftField('catering', 'packages', updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Price Per Person ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={pkg.pricePerPerson}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.catering.packages];
                        updated[pIdx] = { ...updated[pIdx], pricePerPerson: parseFloat(e.target.value) || 0 };
                        updateDraftField('catering', 'packages', updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Badge / Tag (e.g. Most Popular)</label>
                    <input
                      type="text"
                      value={pkg.badge || ''}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.catering.packages];
                        updated[pIdx] = { ...updated[pIdx], badge: e.target.value };
                        updateDraftField('catering', 'packages', updated);
                      }}
                      className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Package Description</label>
                  <input
                    type="text"
                    value={pkg.description}
                    onChange={(e) => {
                      const updated = [...draftWebsiteContent.catering.packages];
                      updated[pIdx] = { ...updated[pIdx], description: e.target.value };
                      updateDraftField('catering', 'packages', updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Included Menu Features (one per line)</label>
                  <textarea
                    rows={3}
                    value={pkg.features.join('\n')}
                    onChange={(e) => {
                      const lines = e.target.value.split('\n').filter((l) => l.trim().length > 0);
                      const updated = [...draftWebsiteContent.catering.packages];
                      updated[pIdx] = { ...updated[pIdx], features: lines };
                      updateDraftField('catering', 'packages', updated);
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: SPECIAL OFFERS & PROMO BANNER
          ========================================================================= */}
      {activeCmsTab === 'specialOffers' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-[#FFFFFF]">Special Offers & Promotional Banner</h3>
            <p className="text-xs text-[#F7F2EB]/60">Configure checkout promo codes, discount percentages, promo banner graphics, and text.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-black/25 border border-white/10 md:col-span-2">
              <input
                type="checkbox"
                id="promoActive"
                checked={draftWebsiteContent.specialOffers.active}
                onChange={(e) => updateDraftField('specialOffers', 'active', e.target.checked)}
                className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
              />
              <label htmlFor="promoActive" className="text-xs font-semibold text-[#F7F2EB] cursor-pointer">
                Display Promotional Offer Banner across Frontend
              </label>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Banner Title</label>
              <input
                type="text"
                value={draftWebsiteContent.specialOffers.bannerTitle}
                onChange={(e) => updateDraftField('specialOffers', 'bannerTitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Banner Subtitle & Terms</label>
              <textarea
                rows={2}
                value={draftWebsiteContent.specialOffers.bannerSubtitle}
                onChange={(e) => updateDraftField('specialOffers', 'bannerSubtitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Promo Coupon Code</label>
              <input
                type="text"
                value={draftWebsiteContent.specialOffers.promoCode}
                onChange={(e) => updateDraftField('specialOffers', 'promoCode', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#D4AF37] font-mono font-bold"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Discount Percentage (%)</label>
              <input
                type="number"
                value={draftWebsiteContent.specialOffers.discountPercentage}
                onChange={(e) => updateDraftField('specialOffers', 'discountPercentage', Number(e.target.value) || 0)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Expiry Label</label>
              <input
                type="text"
                value={draftWebsiteContent.specialOffers.expiryDate}
                onChange={(e) => updateDraftField('specialOffers', 'expiryDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Button Call-to-Action Text</label>
              <input
                type="text"
                value={draftWebsiteContent.specialOffers.ctaText}
                onChange={(e) => updateDraftField('specialOffers', 'ctaText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Banner Background Image</label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={draftWebsiteContent.specialOffers.imageUrl}
                  onChange={(e) => updateDraftField('specialOffers', 'imageUrl', e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                />
                <label className="px-4 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#C29D26] text-[#0F0B08] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0">
                  <Upload className="w-4 h-4" />
                  Upload Image
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'specialOffers', 'imageUrl', 'promos')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 7: CUSTOMER REVIEWS & RATINGS
          ========================================================================= */}
      {activeCmsTab === 'reviews' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-[#FFFFFF]">Customer Reviews & Testimonials</h3>
              <p className="text-xs text-[#F7F2EB]/60">Approve, add, or remove verified customer reviews displayed on the website.</p>
            </div>
            <button
              onClick={() => {
                const newRev: WebsiteReviewItem = {
                  id: `rev-${Date.now()}`,
                  authorName: 'Guest Reviewer',
                  dishOrdered: 'Cassava Leaves & Oxtail',
                  rating: 5,
                  comment: 'Delicious authentic food and great customer service!',
                  isApproved: true,
                };
                updateDraftField('reviews', 'items', [newRev, ...draftWebsiteContent.reviews.items]);
                notify('success', 'Added new review.');
              }}
              className="px-4 py-2 rounded-xl bg-[#D4AF37] text-[#0F0B08] text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Review
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Reviews Section Title</label>
              <input
                type="text"
                value={draftWebsiteContent.reviews.sectionTitle}
                onChange={(e) => updateDraftField('reviews', 'sectionTitle', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#F7F2EB] block mb-1">Google Rating Badge</label>
              <input
                type="number"
                step="0.1"
                max="5"
                min="1"
                value={draftWebsiteContent.reviews.googleRating}
                onChange={(e) => updateDraftField('reviews', 'googleRating', parseFloat(e.target.value) || 5.0)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {draftWebsiteContent.reviews.items.map((rev, rIdx) => (
              <div key={rev.id} className="p-4 rounded-xl bg-black/35 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#D4AF37]">{rev.authorName}</span>
                    <span className="text-xs text-[#F7F2EB]/50">({rev.dishOrdered})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 text-xs text-[#F7F2EB] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rev.isApproved}
                        onChange={(e) => {
                          const updated = [...draftWebsiteContent.reviews.items];
                          updated[rIdx] = { ...updated[rIdx], isApproved: e.target.checked };
                          updateDraftField('reviews', 'items', updated);
                        }}
                        className="w-4 h-4 accent-[#D4AF37] rounded"
                      />
                      Approved (Live)
                    </label>
                    <button
                      onClick={() => {
                        const updated = draftWebsiteContent.reviews.items.filter((_, idx) => idx !== rIdx);
                        updateDraftField('reviews', 'items', updated);
                        notify('success', 'Review deleted.');
                      }}
                      className="p-1 rounded text-red-400 hover:bg-red-950/40 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Customer Name</label>
                    <input
                      type="text"
                      value={rev.authorName}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.reviews.items];
                        updated[rIdx] = { ...updated[rIdx], authorName: e.target.value };
                        updateDraftField('reviews', 'items', updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Dish Ordered</label>
                    <input
                      type="text"
                      value={rev.dishOrdered}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.reviews.items];
                        updated[rIdx] = { ...updated[rIdx], dishOrdered: e.target.value };
                        updateDraftField('reviews', 'items', updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Rating (1-5)</label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      value={rev.rating}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.reviews.items];
                        updated[rIdx] = { ...updated[rIdx], rating: parseInt(e.target.value, 10) || 5 };
                        updateDraftField('reviews', 'items', updated);
                      }}
                      className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#F7F2EB]/70 font-semibold block mb-1">Review Comment</label>
                  <textarea
                    rows={2}
                    value={rev.comment}
                    onChange={(e) => {
                      const updated = [...draftWebsiteContent.reviews.items];
                      updated[rIdx] = { ...updated[rIdx], comment: e.target.value };
                      updateDraftField('reviews', 'items', updated);
                    }}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 8: CONTACT US, OPENING HOURS & GOOGLE MAPS
          ========================================================================= */}
      {activeCmsTab === 'contact' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-[#FFFFFF]">Contact Details, Address & Opening Hours</h3>
            <p className="text-xs text-[#F7F2EB]/60">Update customer inquiry details, phone lines, Google Maps iframe and business schedules.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Physical Street Address</label>
              <input
                type="text"
                value={draftWebsiteContent.contact.address}
                onChange={(e) => updateDraftField('contact', 'address', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Direct Phone Number</label>
              <input
                type="text"
                value={draftWebsiteContent.contact.phone}
                onChange={(e) => updateDraftField('contact', 'phone', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">WhatsApp Order Line</label>
              <input
                type="text"
                value={draftWebsiteContent.contact.whatsappNumber}
                onChange={(e) => updateDraftField('contact', 'whatsappNumber', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Customer Support Email</label>
              <input
                type="email"
                value={draftWebsiteContent.contact.email}
                onChange={(e) => updateDraftField('contact', 'email', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            {/* Opening Hours */}
            <div className="p-4 rounded-xl bg-black/35 border border-white/10 md:col-span-2 space-y-3">
              <h4 className="text-xs font-bold text-[#D4AF37]">Opening Hours Schedule</h4>
              <div className="space-y-2">
                {draftWebsiteContent.contact.openingHours.map((oh, ohIdx) => (
                  <div key={ohIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={oh.days}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.contact.openingHours];
                        updated[ohIdx] = { ...updated[ohIdx], days: e.target.value };
                        updateDraftField('contact', 'openingHours', updated);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-[#F7F2EB]"
                      placeholder="e.g. Monday – Thursday"
                    />
                    <input
                      type="text"
                      value={oh.hours}
                      onChange={(e) => {
                        const updated = [...draftWebsiteContent.contact.openingHours];
                        updated[ohIdx] = { ...updated[ohIdx], hours: e.target.value };
                        updateDraftField('contact', 'openingHours', updated);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-black/50 border border-white/15 text-xs text-[#F7F2EB]"
                      placeholder="e.g. 11:00 AM – 10:00 PM"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Google Maps Embed URL</label>
              <input
                type="text"
                value={draftWebsiteContent.contact.googleMapsEmbedUrl}
                onChange={(e) => updateDraftField('contact', 'googleMapsEmbedUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 9: FOOTER & SOCIALS
          ========================================================================= */}
      {activeCmsTab === 'footer' && (
        <div className="p-6 rounded-2xl bg-[#1C140E] border border-white/10 space-y-6">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-[#FFFFFF]">Footer Text & Social Media Profiles</h3>
            <p className="text-xs text-[#F7F2EB]/60">Customize the footer description, copyright line, and links to official restaurant channels.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Footer About Text</label>
              <textarea
                rows={3}
                value={draftWebsiteContent.footer.aboutText}
                onChange={(e) => updateDraftField('footer', 'aboutText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Copyright Statement</label>
              <input
                type="text"
                value={draftWebsiteContent.footer.copyrightText}
                onChange={(e) => updateDraftField('footer', 'copyrightText', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Facebook URL</label>
              <input
                type="text"
                value={draftWebsiteContent.footer.facebookUrl}
                onChange={(e) => updateDraftField('footer', 'facebookUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">Instagram URL</label>
              <input
                type="text"
                value={draftWebsiteContent.footer.instagramUrl}
                onChange={(e) => updateDraftField('footer', 'instagramUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">TikTok URL</label>
              <input
                type="text"
                value={draftWebsiteContent.footer.tiktokUrl}
                onChange={(e) => updateDraftField('footer', 'tiktokUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#F7F2EB]">YouTube Channel URL</label>
              <input
                type="text"
                value={draftWebsiteContent.footer.youtubeUrl}
                onChange={(e) => updateDraftField('footer', 'youtubeUrl', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-white/15 text-xs text-[#F7F2EB]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
