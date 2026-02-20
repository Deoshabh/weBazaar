/**
 * AdminTable — reusable data table with sortable headers.
 *
 * Usage:
 *   import AdminTable from '@/components/admin/ui/AdminTable';
 *   import Skeleton from '@/components/admin/ui/Skeleton';
 *
 *   const COLUMNS = [
 *     { key: 'name',   label: 'Name',   sortable: true },
 *     { key: 'status', label: 'Status', sortable: false },
 *     { key: 'date',   label: 'Date',   sortable: true  },
 *   ];
 *
 *   <AdminTable
 *     columns={COLUMNS}
 *     loading={isLoading}
 *     empty="No records found"
 *     sortKey={sort}
 *     sortDir={dir}
 *     onSort={(key) => handleSort(key)}
 *   >
 *     {rows.map(r => (
 *       <tr key={r._id} className="hover:bg-zinc-50 transition-colors">
 *         <td className="px-4 py-3 text-sm">{r.name}</td>
 *         ...
 *       </tr>
 *     ))}
 *   </AdminTable>
 */

import { FiChevronUp, FiChevronDown, FiChevronsUpDown } from 'react-icons/fi';
import Skeleton from './Skeleton';

function SortIcon({ colKey, sortKey, sortDir }) {
  if (colKey !== sortKey) return <FiChevronsUpDown className="w-3.5 h-3.5 text-zinc-400" />;
  return sortDir === 'asc'
    ? <FiChevronUp className="w-3.5 h-3.5 text-amber-500" />
    : <FiChevronDown className="w-3.5 h-3.5 text-amber-500" />;
}

/**
 * @param {{
 *   columns: Array<{key:string, label:string, sortable?:boolean, className?:string}>,
 *   children: React.ReactNode,
 *   loading?: boolean,
 *   skeletonRows?: number,
 *   empty?: string,
 *   sortKey?: string,
 *   sortDir?: 'asc'|'desc',
 *   onSort?: (key:string) => void,
 *   className?: string,
 * }} props
 */
export default function AdminTable({
  columns = [],
  children,
  loading = false,
  skeletonRows = 5,
  empty = 'No records found.',
  sortKey,
  sortDir = 'asc',
  onSort,
  className = '',
}) {
  const hasRows = !loading && children && (Array.isArray(children) ? children.length > 0 : true);

  return (
    <div className={`bg-white rounded-xl border border-zinc-200 overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          {/* ── Head ── */}
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-500 whitespace-nowrap select-none ${
                    col.sortable ? 'cursor-pointer hover:text-zinc-800 hover:bg-zinc-100 transition-colors' : ''
                  } ${col.className || ''}`}
                  onClick={() => col.sortable && onSort?.(col.key)}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable && (
                      <SortIcon colKey={col.key} sortKey={sortKey} sortDir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody className="divide-y divide-zinc-100">
            {loading
              ? Array.from({ length: skeletonRows }).map((_, i) => (
                  <Skeleton.Row key={i} cols={columns.length} />
                ))
              : !hasRows
              ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-12 text-center text-sm text-zinc-400">
                      {empty}
                    </td>
                  </tr>
                )
              : children}
          </tbody>
        </table>
      </div>
    </div>
  );
}
