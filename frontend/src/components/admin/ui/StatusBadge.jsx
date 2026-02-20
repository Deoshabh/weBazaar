/**
 * StatusBadge — coloured pill for order / entity statuses.
 *
 * Usage:
 *   import StatusBadge from '@/components/admin/ui/StatusBadge';
 *   <StatusBadge status="delivered" />
 *   <StatusBadge status="active" size="lg" />
 */
import {
  FiClock,
  FiPackage,
  FiTruck,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiPauseCircle,
} from 'react-icons/fi';

const STATUS_META = {
  // Order statuses
  pending:    { label: 'Pending',    color: 'bg-amber-100   text-amber-700',   icon: FiClock },
  processing: { label: 'Processing', color: 'bg-blue-100    text-blue-700',    icon: FiPackage },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100  text-indigo-700',  icon: FiTruck },
  delivered:  { label: 'Delivered',  color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100     text-red-700',     icon: FiXCircle },
  // Generic
  active:     { label: 'Active',     color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle },
  inactive:   { label: 'Inactive',   color: 'bg-zinc-100    text-zinc-600',    icon: FiPauseCircle },
  expired:    { label: 'Expired',    color: 'bg-red-100     text-red-600',     icon: FiAlertCircle },
  draft:      { label: 'Draft',      color: 'bg-zinc-100    text-zinc-600',    icon: FiClock },
  published:  { label: 'Published',  color: 'bg-emerald-100 text-emerald-700', icon: FiCheckCircle },
};

const SIZE_CLASSES = {
  sm: 'px-1.5 py-0.5 text-xs',
  md: 'px-2    py-0.5 text-xs',
  lg: 'px-3    py-1   text-sm',
};

/**
 * @param {{ status: string, size?: 'sm'|'md'|'lg', className?: string }} props
 */
export default function StatusBadge({ status = '', size = 'md', className = '' }) {
  const key = status.toLowerCase();
  const meta = STATUS_META[key] ?? {
    label: status,
    color: 'bg-zinc-100 text-zinc-600',
    icon: FiClock,
  };
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${SIZE_CLASSES[size]} ${meta.color} ${className}`}
    >
      <Icon className="w-3 h-3 flex-shrink-0" />
      {meta.label}
    </span>
  );
}
