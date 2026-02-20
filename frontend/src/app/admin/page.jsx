'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import SalesCategoryPieChart from '@/components/admin/charts/SalesCategoryPieChart';
import { useAuth } from '@/context/AuthContext';
import { adminAPI } from '@/utils/api';
import {
  FiDollarSign, FiShoppingBag, FiUsers, FiBox,
  FiTrendingUp, FiTrendingDown, FiAlertTriangle,
  FiArrowRight, FiRefreshCw, FiClock, FiCheckCircle,
  FiXCircle, FiTruck, FiPackage,
} from 'react-icons/fi';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(n || 0);

const fmtNum = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

const PERIODS = [
  { label: 'Today', value: 'today' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
];

const ORDER_STATUS_META = {
  pending:    { label: 'Pending',    color: 'bg-amber-100 text-amber-700',   icon: FiClock },
  processing: { label: 'Processing', color: 'bg-blue-100 text-blue-700',     icon: FiPackage },
  shipped:    { label: 'Shipped',    color: 'bg-indigo-100 text-indigo-700', icon: FiTruck },
  delivered:  { label: 'Delivered',  color: 'bg-green-100 text-green-700',   icon: FiCheckCircle },
  cancelled:  { label: 'Cancelled',  color: 'bg-red-100 text-red-700',       icon: FiXCircle },
};

// ─────────────────────────────────────────────
// StatusBadge
// ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const meta = ORDER_STATUS_META[status] || { label: status, color: 'bg-zinc-100 text-zinc-600', icon: FiClock };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${meta.color}`}>
      <Icon className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

// ─────────────────────────────────────────────
// Skeleton loader
// ─────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-zinc-200 rounded ${className}`} />;
}

// ─────────────────────────────────────────────
// KPI Card
// ─────────────────────────────────────────────
function KpiCard({ title, value, delta, icon: Icon, iconBg, loading, href }) {
  const positive = delta >= 0;
  return (
    <Link href={href} className="group bg-white rounded-xl border border-zinc-200 p-5 hover:shadow-md hover:border-zinc-300 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1.5">{title}</p>
          {loading ? (
            <Skeleton className="h-8 w-28 mb-2" />
          ) : (
            <p className="text-2xl font-bold text-zinc-900 truncate">{value}</p>
          )}
          {loading ? (
            <Skeleton className="h-4 w-20" />
          ) : delta !== null && delta !== undefined ? (
            <div className={`flex items-center gap-1 text-xs font-medium mt-1.5 ${positive ? 'text-emerald-600' : 'text-red-500'}`}>
              {positive ? <FiTrendingUp className="w-3.5 h-3.5" /> : <FiTrendingDown className="w-3.5 h-3.5" />}
              <span>{Math.abs(delta).toFixed(1)}% vs prev period</span>
            </div>
          ) : null}
        </div>
        <div className={`shrink-0 p-2.5 rounded-lg ${iconBg}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Recent Orders table
// ─────────────────────────────────────────────
function RecentOrdersTable({ orders, loading }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <h2 className="text-sm font-semibold text-zinc-800">Recent Orders</h2>
        <Link href="/admin/orders" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          View all <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-100">
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Order</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden sm:table-cell">Customer</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Amount</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-zinc-50">
                  <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-3 hidden sm:table-cell"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-5 py-3 hidden md:table-cell"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-5 w-20 rounded-full" /></td>
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-sm text-zinc-400">No orders yet</td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order._id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs text-zinc-600">
                    <Link href="/admin/orders" className="hover:text-amber-600 transition-colors">
                      #{(order.orderId || order._id || '').toString().slice(-6).toUpperCase()}
                    </Link>
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell text-zinc-700 max-w-[140px] truncate">
                    {order.shippingAddress?.fullName || order.user?.name || '—'}
                  </td>
                  <td className="px-5 py-3 font-semibold text-zinc-900">{fmt(order.totalAmount)}</td>
                  <td className="px-5 py-3 hidden md:table-cell text-zinc-500 text-xs">
                    {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={order.orderStatus || order.status || 'pending'} /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Low stock alerts
// ─────────────────────────────────────────────
function LowStockPanel({ products, loading }) {
  return (
    <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <FiAlertTriangle className="w-4 h-4 text-amber-500" />
          <h2 className="text-sm font-semibold text-zinc-800">Low Stock</h2>
        </div>
        <Link href="/admin/products" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
          Manage <FiArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <ul className="divide-y divide-zinc-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="flex items-center gap-3 px-5 py-3">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="flex-1"><Skeleton className="h-3.5 w-32 mb-1.5" /><Skeleton className="h-3 w-16" /></div>
              <Skeleton className="h-5 w-10 rounded-full" />
            </li>
          ))
        ) : products.length === 0 ? (
          <li className="px-5 py-8 text-center text-sm text-zinc-400">All products well-stocked</li>
        ) : (
          products.slice(0, 6).map((p) => (
            <li key={p._id} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50/50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 overflow-hidden">
                {p.images?.[0]?.url ? (
                  <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <FiBox className="w-4 h-4 text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-zinc-800 truncate">{p.name}</p>
                <p className="text-[11px] text-zinc-400">{p.category?.name || 'Uncategorized'}</p>
              </div>
              <span className={`shrink-0 text-xs font-bold px-2 py-0.5 rounded-full ${p.stock === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                {p.stock} left
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

// ─────────────────────────────────────────────
// Quick actions
// ─────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: 'Add Product',   desc: 'Create new listing',   href: '/admin/products/new',         color: 'bg-violet-500',  icon: FiBox },
  { label: 'View Orders',   desc: 'Manage fulfillment',   href: '/admin/orders',                color: 'bg-blue-500',    icon: FiShoppingBag },
  { label: 'Add Coupon',    desc: 'New discount code',    href: '/admin/coupons',               color: 'bg-emerald-500', icon: FiTrendingDown },
  { label: 'Edit Homepage', desc: 'Storefront layout',    href: '/admin/storefront-builder',    color: 'bg-amber-500',   icon: FiTrendingUp },
  { label: 'Customers',     desc: 'User management',      href: '/admin/users',                 color: 'bg-pink-500',    icon: FiUsers },
  { label: 'Analytics',     desc: 'Revenue trends',       href: '/admin/stats',                 color: 'bg-indigo-500',  icon: FiTrendingUp },
];

// ─────────────────────────────────────────────
// Main Dashboard
// ─────────────────────────────────────────────
export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('30d');

  const fetchData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);
    try {
      const [statsRes, ordersRes, productsRes] = await Promise.allSettled([
        adminAPI.getAdminStats(),
        adminAPI.getOrders({ limit: 8, sort: '-createdAt' }),
        adminAPI.getProducts({ limit: 20, sort: 'stock' }),
      ]);
      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (ordersRes.status === 'fulfilled') {
        const d = ordersRes.value.data;
        setRecentOrders(Array.isArray(d?.orders) ? d.orders : Array.isArray(d) ? d : []);
      }
      if (productsRes.status === 'fulfilled') {
        const d = productsRes.value.data;
        const all = Array.isArray(d?.products) ? d.products : Array.isArray(d) ? d : [];
        setLowStock(all.filter((p) => (p.stock ?? Infinity) <= 5).slice(0, 6));
      }
    } catch {
      // errors handled per-request
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const kpiCards = [
    { title: 'Total Revenue',  value: fmt(stats?.revenue?.total),       delta: stats?.revenue?.deltaPercent ?? null,  icon: FiDollarSign, iconBg: 'bg-emerald-500', href: '/admin/stats' },
    { title: 'Total Orders',   value: fmtNum(stats?.orders?.total),     delta: stats?.orders?.deltaPercent ?? null,   icon: FiShoppingBag, iconBg: 'bg-blue-500',    href: '/admin/orders' },
    { title: 'Products',       value: fmtNum(stats?.products?.total),   delta: null,                                   icon: FiBox,         iconBg: 'bg-violet-500',  href: '/admin/products' },
    { title: 'Customers',      value: fmtNum(stats?.users?.customers),  delta: stats?.users?.deltaPercent ?? null,    icon: FiUsers,       iconBg: 'bg-amber-500',   href: '/admin/users' },
  ];

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-screen-2xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-zinc-900">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-0.5">
              Good {greeting}, <strong>{user?.name?.split(' ')[0] || 'Admin'}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 gap-0.5">
              {PERIODS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${period === p.value ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500 hover:text-zinc-700'}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpiCards.map((card) => (
            <KpiCard key={card.title} {...card} loading={loading} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RevenueChart data={stats?.revenue_history} />
          </div>
          <div>
            <SalesCategoryPieChart data={stats?.category_sales} />
          </div>
        </div>

        {/* Recent Orders + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <RecentOrdersTable orders={recentOrders} loading={loading} />
          </div>
          <LowStockPanel products={lowStock} loading={loading} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-zinc-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const ActionIcon = action.icon;
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center"
                >
                  <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center`}>
                    <ActionIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-zinc-800 leading-tight">{action.label}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">{action.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
