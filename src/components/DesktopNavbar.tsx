import React, { useState, useRef, useEffect, useCallback } from 'react';
import type { PageRoute } from '../types/restaurant';

interface DesktopNavbarProps {
  currentPage: PageRoute;
  onNavigate: (page: PageRoute) => void;
}

const NAV_LINKS: { id: PageRoute; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'about', label: 'About Us' },
  { id: 'menu', label: 'Our Menu' },
  { id: 'ordering', label: 'Order Online' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'catering', label: 'Catering' },
  { id: 'contact', label: 'Contact Us' },
];

export const DesktopNavbar: React.FC<DesktopNavbarProps> = React.memo(({ currentPage, onNavigate }) => {
  const [hoveredKey, setHoveredKey] = useState<PageRoute | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const pillRef = useRef<HTMLSpanElement | null>(null);
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const activeKey = hoveredKey ?? currentPage;

  const updatePill = useCallback((key: string | null, smooth = true) => {
    const nav = navRef.current;
    const pill = pillRef.current;
    if (!nav || !pill) return;

    if (!key || !itemRefs.current[key]) {
      pill.style.opacity = '0';
      return;
    }

    const item = itemRefs.current[key];
    if (!item) return;

    const navRect = nav.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();

    const left = Math.round(itemRect.left - navRect.left);
    const width = Math.round(itemRect.width);

    if (!smooth) {
      pill.style.transition = 'none';
      pill.style.transform = `translate3d(${left}px, -50%, 0)`;
      pill.style.width = `${width}px`;
      pill.style.opacity = '1';
      // Force browser reflow to apply instantaneous position
      void pill.offsetHeight;
      pill.style.transition = '';
    } else {
      pill.style.transform = `translate3d(${left}px, -50%, 0)`;
      pill.style.width = `${width}px`;
      pill.style.opacity = '1';
    }
  }, []);

  // Synchronize pill when active page changes or initially mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      updatePill(currentPage, false);
    }, 40);
    return () => clearTimeout(timer);
  }, [currentPage, updatePill]);

  // Handle window resize smoothly
  useEffect(() => {
    const handleResize = () => {
      updatePill(hoveredKey ?? currentPage, false);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, [hoveredKey, currentPage, updatePill]);

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const target = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-nav-id]');
    if (target) {
      const id = target.getAttribute('data-nav-id') as PageRoute;
      if (id && id !== hoveredKey) {
        setHoveredKey(id);
        updatePill(id, true);
      }
    }
  };

  const handleMouseEnter = (id: PageRoute) => {
    if (hoveredKey !== id) {
      setHoveredKey(id);
      updatePill(id, true);
    }
  };

  const handleMouseLeave = () => {
    setHoveredKey(null);
    updatePill(currentPage, true);
  };

  return (
    <nav
      ref={navRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handleMouseLeave}
      onMouseLeave={handleMouseLeave}
      className="relative hidden lg:flex items-center gap-1 xl:gap-2 p-1.5 rounded-full bg-black/40 border border-[#C9A45C]/35 backdrop-blur-md"
      aria-label="Primary Navigation"
    >
      {/* Sliding Active & Cursor-Following Capsule */}
      <span
        ref={pillRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-0 h-[34px] rounded-full bg-gradient-to-r from-[#C9A45C]/35 via-[#254B37]/50 to-[#C9A45C]/35 border border-[#C9A45C]/85 shadow-[0_3px_14px_rgba(201,164,92,0.35),inset_0_1px_0_rgba(255,255,255,0.25)] transition-[transform,width,opacity] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] z-0 will-change-[transform,width] opacity-0"
      />

      {NAV_LINKS.map((navLink) => {
        const isHighlighted = activeKey === navLink.id;
        return (
          <button
            ref={(el) => {
              itemRefs.current[navLink.id] = el;
            }}
            key={navLink.id}
            data-nav-id={navLink.id}
            type="button"
            onPointerEnter={() => handleMouseEnter(navLink.id)}
            onMouseEnter={() => handleMouseEnter(navLink.id)}
            onFocus={() => handleMouseEnter(navLink.id)}
            onBlur={handleMouseLeave}
            onClick={() => onNavigate(navLink.id)}
            className={`relative z-10 px-3.5 xl:px-4 py-1.5 rounded-full text-xs xl:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer ${
              isHighlighted
                ? 'text-[#FFFFFF]'
                : 'text-[#F7F3EA]/75 hover:text-[#FFFFFF]'
            }`}
          >
            {navLink.label}
          </button>
        );
      })}
    </nav>
  );
});

DesktopNavbar.displayName = 'DesktopNavbar';
