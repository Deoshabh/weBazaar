/**
 * AdminPageHeader — consistent top-of-page header used by all admin pages.
 *
 * Usage:
 *   import AdminPageHeader from '@/components/admin/ui/AdminPageHeader';
 *
 *   <AdminPageHeader
 *     title="Products"
 *     subtitle="Manage your store's catalogue"
 *     actions={<button className="btn-primary">Add Product</button>}
 *   />
 */

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  className = '',
}) {
  return (
    <div
      className={`flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8 ${className}`}
    >
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{actions}</div>
      )}
    </div>
  );
}
