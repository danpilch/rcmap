// Minimal inline icon set (stroke-based, inherits currentColor).
import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const SearchIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const PinIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6.5-5.7-6.5-10.5A6.5 6.5 0 0 1 12 4a6.5 6.5 0 0 1 6.5 6.5C18.5 15.3 12 21 12 21Z" />
    <circle cx="12" cy="10.5" r="2.2" />
  </svg>
);

export const SpaIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 22c0-5 0-8 0-11" />
    <path d="M12 11c0-4 2.5-7 7-7-.2 4.5-2.8 7-7 7Z" />
    <path d="M12 14c0-3-2-5.5-5.5-5.5C6.7 12 9 14 12 14Z" />
  </svg>
);

export const PoolIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
    <path d="M7 16V6a2 2 0 0 1 4 0v10M11 11h0" />
    <path d="M13 16V6a2 2 0 0 1 4 0v10" />
  </svg>
);

export const StarIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 3.2l2.5 5.6 6.1.6-4.6 4 1.4 6L12 16.9 6.6 19.4l1.4-6-4.6-4 6.1-.6L12 3.2Z" />
  </svg>
);

export const GolfIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M11 21V5l7 3-7 3" />
    <circle cx="11" cy="21" r="0.6" fill="currentColor" />
    <path d="M7 21h8" />
  </svg>
);

export const GardenIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M12 22v-7" />
    <path d="M12 15c-3.5 0-5-2.2-5-5.5C7 6 9 4 12 4s5 2 5 5.5C17 12.8 15.5 15 12 15Z" />
    <path d="M12 9v6" />
  </svg>
);

export const BedIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M3 18v-8h13a4 4 0 0 1 4 4v4" />
    <path d="M3 14h17M3 18v2M20 18v2" />
    <path d="M6 10V8h6v2" />
  </svg>
);

export const ForkKnifeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M6 3v7a2 2 0 0 0 4 0V3M8 10v11" />
    <path d="M16 3c-1.5 0-2.5 1.5-2.5 4S15 11 16 11v10" />
  </svg>
);

export const PlaneIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M21 14.5 13 12V5.5a1.5 1.5 0 0 0-3 0V12l-8 2.5V16l8-1.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-4.5L21 16Z" />
  </svg>
);

export const TrainIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <rect x="6" y="3" width="12" height="14" rx="2" />
    <path d="M6 11h12M9 21l-2 1M15 21l2 1M9.5 17v4h5v-4" />
    <circle cx="9.5" cy="7.5" r="0.6" fill="currentColor" />
    <circle cx="14.5" cy="7.5" r="0.6" fill="currentColor" />
  </svg>
);

export const CrownIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base} {...p}>
    <path d="M4 18h16M4 18l-1.5-9 5 4L12 6l4.5 7 5-4L20 18" />
  </svg>
);
