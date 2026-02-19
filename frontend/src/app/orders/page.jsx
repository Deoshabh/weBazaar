'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/utils/api';
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiX,
  FiEye,
  FiClock,
  FiChevronRight,
  FiMapPin,
  FiShoppingBag,
} from 'react-icons/fi';

/* ─── Status helpers ─── */
const statusMap = {
  delivered: {
    icon: FiCheck,
    bg: 'bg-success/10',
    text: 'text-success',
    ring: 'ring-success/20',
  },
  cancelled: {
    icon: FiX,
    bg: 'bg-error/10',
    text: 'text-error',
    ring: 'ring-error/20',
  },
  shipped: {
    icon: FiTruck,
    bg: 'bg-info/10',
    text: 'text-info',
    ring: 'ring-info/20',
  },
  processing: {
    icon: FiClock,
    bg: 'bg-warning/10',
    text: 'text-warning',
    ring: 'ring-warning/20',
  },
};

function StatusBadge({ status }) {
  const key = status?.toLowerCase();
  const s = statusMap[key] || {
    icon: FiPackage,
    bg: 'bg-espresso/10',
    text: 'text-espresso',
    ring: 'ring-espresso/20',
  };
  const Icon = s.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ring-1 ${s.bg} ${s.text} ${s.ring}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {status || 'Confirmed'}
    </span>
  );
}

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, loading, router]);

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const response = await orderAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === 'all') return true;
    return order.status?.toLowerCase() === filter;
  });

  const filters = ['all', 'delivered', 'cancelled'];

  /* ── Loading ── */
  if (loading || loadingOrders) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
        <p className="text-body-sm text-caramel">Loading orders...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-caption text-caramel mb-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink">My Orders</span>
        </nav>

        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink">My Orders</h1>
          <p className="text-body-sm text-caramel mt-1">Track and manage your orders</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {filters.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={[
                'px-4 py-2 rounded-full text-body-sm font-medium transition-all duration-fast capitalize',
                filter === s
                  ? 'bg-espresso text-white shadow-sm'
                  : 'bg-white text-walnut border border-sand/30 hover:border-caramel',
              ].join(' ')}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl border border-sand/20 shadow-card p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-linen rounded-full flex items-center justify-center mb-4">
              <FiPackage className="w-7 h-7 text-caramel" />
            </div>
            <h3 className="font-display text-xl font-semibold text-ink mb-2">No orders found</h3>
            <p className="text-body-sm text-caramel mb-6 max-w-sm mx-auto">
              {filter === 'all'
                ? "You haven't placed any orders yet."
                : `No ${filter} orders found.`}
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
            >
              <FiShoppingBag className="w-4 h-4" /> Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border border-sand/20 shadow-card overflow-hidden hover:shadow-card-hover transition-shadow duration-normal"
              >
                {/* Order Header */}
                <div className="bg-linen/50 px-5 py-4 border-b border-sand/20">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
                      <div>
                        <p className="text-caption text-caramel">Order ID</p>
                        <p className="text-body-sm font-semibold text-ink break-all font-mono">
                          {order.orderId}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-sand/40" />
                      <div>
                        <p className="text-caption text-caramel">Date</p>
                        <p className="text-body-sm font-medium text-ink">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="hidden sm:block w-px h-8 bg-sand/40" />
                      <div>
                        <p className="text-caption text-caramel">Total</p>
                        <p className="text-body-sm font-semibold text-ink tabular-nums">
                          ₹{(order.totalAmount || order.total || 0).toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={order.status} />
                      <Link
                        href={`/orders/${order._id}`}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-sand/30 text-body-sm font-medium text-espresso rounded-lg hover:border-espresso hover:bg-espresso/[0.03] transition-all duration-fast"
                      >
                        <FiEye className="w-3.5 h-3.5" /> View
                      </Link>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  {order.shipping?.awb_code && (
                    <div className="mt-3 pt-3 border-t border-sand/20">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
                        <span className="flex items-center gap-1.5 text-info font-medium">
                          <FiTruck className="w-3.5 h-3.5" />
                          {order.shipping.courier_name || order.shipping.courier}
                        </span>
                        <span className="w-px h-3 bg-sand/40 hidden sm:block" />
                        <span className="text-caramel">
                          AWB:{' '}
                          <span className="font-mono font-semibold text-ink">
                            {order.shipping.awb_code}
                          </span>
                        </span>
                        {order.shipping.current_status && (
                          <>
                            <span className="w-px h-3 bg-sand/40 hidden sm:block" />
                            <span className="text-success font-semibold">
                              {order.shipping.current_status}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="p-5">
                  <div className="space-y-3">
                    {order.items?.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="relative w-14 h-16 flex-shrink-0 rounded-md overflow-hidden bg-linen border border-sand/20">
                          <Image
                            src={
                              item.product?.images?.[0]?.url ||
                              item.product?.images?.[0] ||
                              '/placeholder.svg'
                            }
                            alt={item.product?.name || 'Product'}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-body-sm font-medium text-ink truncate">
                            {item.product?.name || 'Product'}
                          </h4>
                          <p className="text-caption text-caramel normal-case tracking-normal">
                            Size UK {item.size} · Qty {item.quantity}
                          </p>
                        </div>
                        <span className="text-body-sm font-medium text-ink tabular-nums">
                          ₹{item.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <p className="text-caption text-caramel text-center">
                        +{order.items.length - 3} more item{order.items.length - 3 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  {/* Shipping address */}
                  <div className="mt-4 pt-4 border-t border-sand/20">
                    <div className="flex items-start gap-2">
                      <FiMapPin className="w-3.5 h-3.5 text-caramel mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-body-sm font-medium text-ink">
                          {order.shippingAddress?.fullName}
                        </p>
                        <p className="text-caption text-walnut normal-case tracking-normal">
                          {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{' '}
                          {order.shippingAddress?.state} — {order.shippingAddress?.postalCode}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
