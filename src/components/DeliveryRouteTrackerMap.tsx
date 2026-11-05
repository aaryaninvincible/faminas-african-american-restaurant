import React from 'react';
import { MapPin, Navigation, CheckCircle2, Clock, Truck, Utensils } from 'lucide-react';
import { OrderStatus } from '../types/restaurant';

interface DeliveryRouteTrackerMapProps {
  orderReference: string;
  status: OrderStatus;
  deliveryAddress: string;
  customerName?: string;
  estimatedMinutes?: number;
  isPreview?: boolean;
  onSelectPreviewStage?: (status: OrderStatus) => void;
}

interface RoutePoint {
  status: OrderStatus;
  label: string;
  sublabel: string;
  leftPercent: number;
  topPercent: number;
  progressPercent: number;
}

const DELIVERY_ROUTE_POINTS: RoutePoint[] = [
  {
    status: 'New Order',
    label: 'Order Received',
    sublabel: 'Faminas Kitchen · Lindenwold, NJ',
    leftPercent: 12,
    topPercent: 71,
    progressPercent: 12,
  },
  {
    status: 'Confirmed',
    label: 'Order Confirmed',
    sublabel: 'Chef Queue Verified',
    leftPercent: 25,
    topPercent: 61,
    progressPercent: 28,
  },
  {
    status: 'Preparing',
    label: 'Freshly Cooking',
    sublabel: 'Simmering & Plating',
    leftPercent: 41,
    topPercent: 50,
    progressPercent: 48,
  },
  {
    status: 'Ready for Pickup',
    label: 'Packed & Sealed',
    sublabel: 'Courier Dispatching',
    leftPercent: 58,
    topPercent: 45,
    progressPercent: 66,
  },
  {
    status: 'Out for Delivery',
    label: 'Out for Delivery',
    sublabel: 'Courier En Route to You',
    leftPercent: 74,
    topPercent: 35,
    progressPercent: 84,
  },
  {
    status: 'Completed',
    label: 'Delivered',
    sublabel: 'Arrived at Destination',
    leftPercent: 86.5,
    topPercent: 30,
    progressPercent: 100,
  },
];

export const DeliveryRouteTrackerMap: React.FC<DeliveryRouteTrackerMapProps> = ({
  orderReference,
  status,
  deliveryAddress,
  customerName,
  estimatedMinutes = 35,
  isPreview = false,
  onSelectPreviewStage,
}) => {
  const normalizedStatus: OrderStatus = status === 'Accepted' ? 'Confirmed' : status;
  const activePoint =
    DELIVERY_ROUTE_POINTS.find((pt) => pt.status === normalizedStatus) || DELIVERY_ROUTE_POINTS[0];
  const activeIdx = DELIVERY_ROUTE_POINTS.findIndex((pt) => pt.status === normalizedStatus);

  return (
    <div className="rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-[#0F0B08] shadow-xl">
      {/* Top Status Header Bar */}
      <div className="px-4 py-3 bg-[#16110D] border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-[#1E6B43]/30 border border-[#52B788]/40 text-[#52B788]">
            <Truck className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#D4AF37]">
                Delivery Route Progress Map
              </span>
              <span className="text-[11px] font-mono text-[#F7F2EB]/60">
                · {orderReference}
              </span>
            </div>
            <p className="text-xs text-[#F7F2EB]/75">
              {activePoint.label} — {activePoint.sublabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#0F0B08] border border-white/10 text-xs text-[#F7F2EB]/85">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>
              {status === 'Completed'
                ? 'Delivered'
                : status === 'Out for Delivery'
                ? 'Est. 10–15 mins away'
                : `Est. ~${estimatedMinutes} mins`}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-[#1E6B43]/25 border border-[#52B788]/40 text-xs font-mono font-semibold text-[#52B788]">
            {activePoint.progressPercent}%
          </span>
        </div>
      </div>

      {/* Visual Static Map Placeholder Canvas with Live Route Markers */}
      <div className="relative w-full h-60 sm:h-72 overflow-hidden bg-[#0E0A07] select-none">
        <img
          src="/assets/delivery_route_map.svg"
          alt="Faminas Restaurant to customer delivery route map"
          className="w-full h-full object-cover object-center"
        />

        {/* Subtle Vignette Overlay for Pin Contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0B08]/85 via-transparent to-[#0F0B08]/35 pointer-events-none" />

        {/* Origin Pin: Faminas Kitchen */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: '12%', top: '71%' }}
        >
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#16110D]/95 border border-[#D4AF37]/60 shadow-lg">
            <Utensils className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <div className="leading-tight">
              <span className="block text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                Origin
              </span>
              <span className="block text-[11px] font-semibold text-[#F7F2EB] whitespace-nowrap">
                Faminas Kitchen
              </span>
            </div>
          </div>
        </div>

        {/* Intermediate Checkpoint Nodes */}
        {DELIVERY_ROUTE_POINTS.slice(1, -1).map((pt, i) => {
          const stepIndex = i + 1;
          const isReached = activeIdx >= stepIndex;
          return (
            <div
              key={pt.status}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex flex-col items-center"
              style={{ left: `${pt.leftPercent}%`, top: `${pt.topPercent}%` }}
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                  isReached
                    ? 'bg-[#52B788] border-[#0F0B08] shadow-[0_0_10px_rgba(82,183,136,0.7)]'
                    : 'bg-[#16110D] border-white/30'
                }`}
              />
              <span
                className={`mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium whitespace-nowrap ${
                  isReached
                    ? 'bg-[#16110D]/90 text-[#F7F2EB] border border-[#52B788]/40'
                    : 'bg-[#0F0B08]/75 text-[#F7F2EB]/50'
                }`}
              >
                {pt.label}
              </span>
            </div>
          );
        })}

        {/* Active Courier / Delivery Progress Marker */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-700 ease-out"
          style={{
            left: `${activePoint.leftPercent}%`,
            top: `${activePoint.topPercent}%`,
          }}
        >
          <div className="relative flex flex-col items-center">
            <span className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0F0B08] border-2 border-[#0F0B08] shadow-[0_0_24px_rgba(212,175,55,0.85)] flex items-center justify-center">
              {status === 'Completed' ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <Navigation className="w-4 h-4 rotate-45" />
              )}
            </span>
            <span className="mt-1.5 px-2.5 py-0.5 rounded-md bg-[#D4AF37] text-[#0F0B08] text-[10px] font-bold uppercase tracking-wider shadow-lg whitespace-nowrap">
              {activePoint.label}
            </span>
          </div>
        </div>

        {/* Destination Pin: Customer Delivery Address */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: '86.5%', top: '30%' }}
        >
          <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#16110D]/95 border border-[#52B788]/60 shadow-lg">
            <MapPin className="w-3.5 h-3.5 text-[#52B788] shrink-0" />
            <div className="leading-tight max-w-[160px] sm:max-w-[210px]">
              <span className="block text-[10px] uppercase tracking-wider text-[#52B788] font-bold">
                Destination {customerName ? `· ${customerName}` : ''}
              </span>
              <span className="block text-[11px] font-semibold text-[#F7F2EB] truncate">
                {deliveryAddress || 'Customer Delivery Address'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Linear Progress Bar + Route Legend Footer */}
      <div className="p-4 bg-[#16110D] border-t border-white/10 space-y-3">
        <div className="w-full h-2 rounded-full bg-[#0F0B08] overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] via-[#52B788] to-[#D4AF37] transition-all duration-700 ease-out"
            style={{ width: `${activePoint.progressPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#F7F2EB]/75">
          <div>
            <span className="text-[#D4AF37] font-semibold">From:</span> 577 Blackwood-Clementon
            Rd, Lindenwold, NJ 08021
          </div>
          <div>
            <span className="text-[#52B788] font-semibold">To:</span>{' '}
            {deliveryAddress || 'Local Delivery Address'}
          </div>
        </div>

        {/* Optional Interactive Stage Preview Selector when in Preview Mode */}
        {isPreview && onSelectPreviewStage && (
          <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[#F7F2EB]/60">
              Preview delivery tracker stages:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {DELIVERY_ROUTE_POINTS.map((pt) => (
                <button
                  key={pt.status}
                  type="button"
                  onClick={() => onSelectPreviewStage(pt.status)}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    status === pt.status
                      ? 'bg-[#D4AF37] text-[#0F0B08] font-semibold'
                      : 'bg-[#0F0B08] text-[#F7F2EB]/70 hover:text-[#F7F2EB] border border-white/10'
                  }`}
                >
                  {pt.status}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
