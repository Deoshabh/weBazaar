/**
 * Skeleton — animated placeholder while content loads.
 *
 * Usage:
 *   import Skeleton from '@/components/admin/ui/Skeleton';
 *   <Skeleton className="h-8 w-32" />        // single block
 *   <Skeleton.Text lines={3} />               // text paragraph
 *   <Skeleton.Avatar />                       // circular avatar
 *   <Skeleton.Card />                         // full card block
 */

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />;
}

Skeleton.Text = function SkeletonText({ lines = 2, className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className={`animate-pulse bg-zinc-200 rounded h-4 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </div>
  );
};

Skeleton.Avatar = function SkeletonAvatar({ size = 10 }) {
  return (
    <div
      className={`animate-pulse bg-zinc-200 rounded-full`}
      style={{ width: `${size * 4}px`, height: `${size * 4}px` }}
    />
  );
};

Skeleton.Card = function SkeletonCard({ className = '' }) {
  return (
    <div className={`animate-pulse bg-white rounded-xl border border-zinc-200 p-5 space-y-3 ${className}`}>
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-zinc-200 rounded w-24" />
          <div className="h-8 bg-zinc-200 rounded w-32" />
          <div className="h-3 bg-zinc-200 rounded w-20" />
        </div>
        <div className="h-10 w-10 bg-zinc-200 rounded-lg" />
      </div>
    </div>
  );
};

Skeleton.Row = function SkeletonRow({ cols = 5, className = '' }) {
  return (
    <tr className={className}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="animate-pulse bg-zinc-200 rounded h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

export default Skeleton;
