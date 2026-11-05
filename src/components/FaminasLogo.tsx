import React from 'react';

export const FAMINAS_LOGO_URL = '/assets/aistudio/image_39873bd8.png';

interface FaminasLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const FaminasLogo: React.FC<FaminasLogoProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses =
    size === 'sm'
      ? 'h-12 sm:h-13 w-auto'
      : size === 'lg'
      ? 'h-20 sm:h-24 w-auto'
      : size === 'xl'
      ? 'h-24 sm:h-32 w-auto'
      : 'h-14 sm:h-16 w-auto';

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 select-none bg-[#FFFFFF] rounded-xl px-2.5 py-1 border border-[#C9A45C]/80 shadow-sm ${className}`}
    >
      <img
        src={FAMINAS_LOGO_URL}
        alt="FAMINAS African and Americans Restaurant Official Logo"
        className={`${sizeClasses} object-contain block`}
      />
      <span className="sr-only">Faminas African and Americans Restaurant</span>
    </div>
  );
};

