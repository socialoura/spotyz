'use client';

import { Star } from 'lucide-react';

interface RatingBadgeProps {
  rating?: number;
  maxRating?: number;
  reviewCountLabel?: string;
  className?: string;
}

export default function RatingBadge({
  rating = 4.8,
  maxRating = 5,
  reviewCountLabel,
  className = '',
}: RatingBadgeProps) {
  const fullStars = Math.round(rating);

  return (
    <div
      className={
        `inline-flex items-center rounded-2xl border border-white/10 bg-gray-900/40 px-2 py-2 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-gray-900/30 dark:border-white/10 dark:bg-white/5 ${className}`
      }
    >
      <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-1.5">
        <span className="text-sm font-black tabular-nums text-white">{rating.toFixed(1)}</span>
        <span className="text-xs font-semibold text-white/60">/{maxRating}</span>
      </div>

      <div className="mx-2 h-6 w-px bg-white/10" />

      <div className="flex items-center gap-1 rounded-xl bg-[#1DB954] px-3 py-1.5">
        {Array.from({ length: maxRating }).map((_, i) => (
          <Star
            key={i}
            className={
              `h-4 w-4 ${i < fullStars ? 'fill-white text-white' : 'text-white/35'}`
            }
          />
        ))}
      </div>

      {reviewCountLabel ? (
        <div className="ml-3 hidden items-center gap-2 sm:inline-flex">
          <span className="text-xs font-semibold text-gray-900/60 dark:text-white/60">{reviewCountLabel}</span>
        </div>
      ) : null}
    </div>
  );
}
