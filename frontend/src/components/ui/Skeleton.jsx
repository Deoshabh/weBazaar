'use client';

/**
 * Skeleton — weBazaar Design System
 *
 * Variants: text | card | image | product-card | avatar
 * Shimmer animation: left-to-right, bg-sand/50
 */

const shimmerClass =
  'relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/40 before:to-transparent before:animate-shimmer';

function SkeletonBase({ className = '', style }) {
  return (
    <div
      className={`bg-sand/30 rounded-md ${shimmerClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

/* ─── Text variant ─── */
export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className="h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

/* ─── Image variant ─── */
export function SkeletonImage({ aspectRatio = '4/5', className = '' }) {
  return (
    <SkeletonBase
      className={`w-full rounded-lg ${className}`}
      style={{ aspectRatio }}
    />
  );
}

/* ─── Avatar variant ─── */
export function SkeletonAvatar({ size = 40, className = '' }) {
  return (
    <SkeletonBase
      className={`rounded-full flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

/* ─── Card variant ─── */
export function SkeletonCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-card overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <SkeletonBase className="w-full" style={{ aspectRatio: '16/10' }} />
      <div className="p-5 space-y-3">
        <SkeletonBase className="h-5 w-3/4" />
        <SkeletonBase className="h-4 w-full" />
        <SkeletonBase className="h-4 w-2/3" />
      </div>
    </div>
  );
}

/* ─── Product Card variant (matches exact ProductCard dimensions) ─── */
export function SkeletonProductCard({ className = '' }) {
  return (
    <div
      className={`bg-white rounded-lg shadow-card overflow-hidden flex flex-col ${className}`}
      aria-hidden="true"
    >
      {/* Image placeholder – 4:5 aspect */}
      <SkeletonBase className="w-full" style={{ aspectRatio: '4/5' }} />

      {/* Info area */}
      <div className="p-3 sm:p-4 md:p-6 flex-1 flex flex-col gap-2">
        {/* Category */}
        <SkeletonBase className="h-3 w-20" />
        {/* Name */}
        <SkeletonBase className="h-5 w-3/4" />
        {/* Rating */}
        <SkeletonBase className="h-3.5 w-24" />
        {/* Description */}
        <SkeletonBase className="hidden sm:block h-3 w-full" />
        {/* Price */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <SkeletonBase className="h-6 w-20" />
          <SkeletonBase className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

/* ─── Default export — generic Skeleton ─── */
export default function Skeleton({
  variant = 'text',
  count = 1,
  className = '',
  ...props
}) {
  const components = {
    text: SkeletonText,
    card: SkeletonCard,
    image: SkeletonImage,
    avatar: SkeletonAvatar,
    'product-card': SkeletonProductCard,
  };

  const Component = components[variant] || SkeletonText;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} className={className} {...props} />
      ))}
    </>
  );
}
