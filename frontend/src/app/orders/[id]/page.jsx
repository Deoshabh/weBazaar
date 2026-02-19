'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { orderAPI } from '@/utils/api';
import {
  FiPackage,
  FiTruck,
  FiCheck,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMapPin,
  FiClock,
  FiDollarSign,
  FiAlertTriangle,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import OrderTracker from '@/components/OrderTracker';

/* ─── Status helpers ─── */
const statusConfig = {
  delivered: { icon: FiCheck, bg: 'bg-success/10', text: 'text-success', ring: 'ring-success/20' },
  cancelled: { icon: FiX, bg: 'bg-error/10', text: 'text-error', ring: 'ring-error/20' },
  shipped: { icon: FiTruck, bg: 'bg-info/10', text: 'text-info', ring: 'ring-info/20' },
  processing: { icon: FiClock, bg: 'bg-warning/10', text: 'text-warning', ring: 'ring-warning/20' },
};

function StatusBadge({ status, size = 'sm' }) {
  const key = status?.toLowerCase();
  const s = statusConfig[key] || {
    icon: FiPackage,
    bg: 'bg-espresso/10',
    text: 'text-espresso',
    ring: 'ring-espresso/20',
  };
  const Icon = s.icon;
  const sizeClasses =
    size === 'lg'
      ? 'px-3.5 py-1.5 text-xs gap-2'
      : 'px-2.5 py-1 text-[11px] gap-1.5';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold uppercase tracking-wider ring-1 ${sizeClasses} ${s.bg} ${s.text} ${s.ring}`}
    >
      <Icon className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
      {status || 'Confirmed'}
    </span>
  );
}

/* ─── Info card for the summary grid ─── */
function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-4 bg-linen rounded-lg">
      <Icon className="w-4.5 h-4.5 text-caramel mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-caption text-caramel">{label}</p>
        <p className="text-body-sm font-semibold text-ink">{value}</p>
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, loading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, loading, router]);

  const fetchOrder = useCallback(async () => {
    try {
      setLoadingOrder(true);
      const response = await orderAPI.getById(params.id);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoadingOrder(false);
    }
  }, [params.id]);

  useEffect(() => {
    if (isAuthenticated && params.id) fetchOrder();
  }, [isAuthenticated, params.id, fetchOrder]);

  const handleCancelOrder = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancelling(true);
      await orderAPI.cancel(params.id);
      toast.success('Order cancelled successfully');
      fetchOrder();
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  /* ── Tracking steps ── */
  const orderSteps = [
    { status: 'confirmed', label: 'Order Placed', icon: FiCheck },
    { status: 'processing', label: 'Processing', icon: FiClock },
    { status: 'shipped', label: 'Shipped', icon: FiTruck },
    { status: 'delivered', label: 'Delivered', icon: FiCheck },
  ];

  const getCurrentStepIndex = (status) => {
    const map = { confirmed: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
    return map[status?.toLowerCase()] ?? 0;
  };

  /* ── Loading ── */
  if (loading || loadingOrder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
        <p className="text-body-sm text-caramel">Loading order details...</p>
      </div>
    );
  }

  if (!isAuthenticated || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <div className="w-14 h-14 bg-linen rounded-full flex items-center justify-center mb-2">
          <FiPackage className="w-6 h-6 text-caramel" />
        </div>
        <p className="text-body text-walnut mb-4">Order not found</p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
        >
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex(order.status);
  const isCancelled = order.status?.toLowerCase() === 'cancelled';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-caption text-caramel mb-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/orders" className="hover:text-ink transition-colors">Orders</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink">{order.orderId}</span>
        </nav>

        {/* Header card */}
        <div className="bg-white rounded-xl border border-sand/20 shadow-card p-5 sm:p-6 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-1">
                Order Details
              </h1>
              <p className="text-body-sm text-caramel font-mono">{order.orderId}</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={order.status} size="lg" />
              {['pending', 'processing', 'confirmed'].includes(order.status?.toLowerCase()) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="flex items-center gap-1.5 px-4 py-2 bg-error/10 text-error text-body-sm font-medium rounded-lg hover:bg-error/20 transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiX className="w-4 h-4" />
                  {cancelling ? 'Cancelling...' : 'Cancel'}
                </button>
              )}
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <InfoTile
              icon={FiClock}
              label="Order Date"
              value={new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            />
            <InfoTile
              icon={FiDollarSign}
              label="Total Amount"
              value={`₹${(order.totalAmount || order.total || 0).toLocaleString('en-IN')}`}
            />
            <InfoTile
              icon={FiPackage}
              label="Payment Method"
              value={(order.payment?.method || 'COD').toUpperCase()}
            />
          </div>

          {/* Live Shipment Tracking */}
          {order.shipping?.awb_code && !isCancelled && (
            <div className="pt-5 border-t border-sand/20">
              <h3 className="font-display text-base font-semibold text-ink mb-4">
                Live Shipment Tracking
              </h3>
              <OrderTracker orderId={order._id} order={order} showTimeline={true} />
            </div>
          )}

          {/* Order Tracking Steps */}
          {!isCancelled && (
            <div className="pt-5 border-t border-sand/20">
              <h3 className="font-display text-base font-semibold text-ink mb-6">
                Order Tracking
              </h3>
              <div className="relative">
                {/* Progress bar */}
                <div className="absolute top-5 left-0 w-full h-0.5 bg-sand/30">
                  <div
                    className="h-full bg-espresso rounded-full transition-all duration-slow"
                    style={{
                      width: `${(currentStep / (orderSteps.length - 1)) * 100}%`,
                    }}
                  />
                </div>

                {/* Steps */}
                <div className="relative flex justify-between">
                  {orderSteps.map((step, index) => {
                    const Icon = step.icon;
                    const isComplete = index <= currentStep;
                    return (
                      <div key={step.status} className="flex flex-col items-center">
                        <div
                          className={[
                            'w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-normal',
                            isComplete
                              ? 'bg-espresso border-espresso text-white'
                              : 'bg-white border-sand/40 text-caramel',
                          ].join(' ')}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <p
                          className={[
                            'mt-2 text-caption font-medium whitespace-nowrap',
                            isComplete ? 'text-ink' : 'text-caramel',
                          ].join(' ')}
                        >
                          {step.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="pt-5 border-t border-sand/20">
              <div className="flex items-center gap-3 p-4 bg-error/5 border border-error/20 rounded-lg">
                <FiAlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
                <div>
                  <p className="text-body-sm font-semibold text-error">Order Cancelled</p>
                  <p className="text-caption text-error/70 normal-case tracking-normal">
                    This order has been cancelled.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-sand/20 shadow-card overflow-hidden">
              <div className="px-5 py-4 border-b border-sand/20">
                <h2 className="font-display text-lg font-semibold text-ink">Order Items</h2>
              </div>
              <div className="p-5 space-y-3">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 rounded-lg border border-sand/20 bg-cream/50"
                  >
                    <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden bg-linen">
                      <Image
                        src={
                          item.product?.images?.[0]?.url ||
                          item.product?.images?.[0] ||
                          '/placeholder.svg'
                        }
                        alt={item.product?.name || 'Product'}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-body-sm font-semibold text-ink mb-0.5">
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className="text-caption text-caramel normal-case tracking-normal mb-0.5">
                        Brand: {item.product?.brand || 'N/A'}
                      </p>
                      <p className="text-caption text-caramel normal-case tracking-normal">
                        Size UK {item.size} · Qty {item.quantity}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-body-sm font-semibold text-ink tabular-nums">
                        ₹{item.price?.toLocaleString('en-IN')}
                      </p>
                      {item.quantity > 1 && (
                        <p className="text-caption text-caramel tabular-nums normal-case tracking-normal">
                          ₹{(item.price / item.quantity).toLocaleString('en-IN')} each
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Price summary */}
              <div className="px-5 pb-5">
                <div className="border-t border-sand/20 pt-4 space-y-2">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-walnut">Subtotal</span>
                    <span className="text-ink tabular-nums">
                      ₹{order.subtotal?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-body-sm">
                      <span className="text-success">Discount</span>
                      <span className="text-success font-medium tabular-nums">
                        −₹{order.discount?.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between font-display text-lg font-semibold text-ink pt-2 border-t border-sand/20">
                    <span>Total</span>
                    <span className="tabular-nums">₹{order.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Shipping Address */}
            <div className="bg-white rounded-xl border border-sand/20 shadow-card overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-sand/20">
                <FiMapPin className="w-4.5 h-4.5 text-caramel" />
                <h3 className="font-display text-base font-semibold text-ink">Shipping Address</h3>
              </div>
              <div className="p-5">
                <p className="text-body-sm font-semibold text-ink mb-1.5">
                  {order.shippingAddress?.fullName}
                </p>
                <p className="text-body-sm text-walnut">{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && (
                  <p className="text-body-sm text-walnut">{order.shippingAddress?.addressLine2}</p>
                )}
                <p className="text-body-sm text-walnut">
                  {order.shippingAddress?.city}, {order.shippingAddress?.state}
                </p>
                <p className="text-body-sm text-walnut mb-2">
                  PIN: {order.shippingAddress?.postalCode}
                </p>
                <p className="text-caption text-caramel">
                  Phone: {order.shippingAddress?.phone}
                </p>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-linen rounded-xl border border-sand/20 p-5">
              <h3 className="font-display text-base font-semibold text-ink mb-2">Need Help?</h3>
              <p className="text-body-sm text-walnut mb-4">
                If you have any questions about your order, feel free to contact us.
              </p>
              <Link
                href="/contact"
                className="block w-full text-center py-2.5 bg-white border border-sand/30 text-body-sm font-medium text-espresso rounded-lg hover:border-espresso hover:bg-espresso/[0.03] transition-all duration-fast"
              >
                Contact Support
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
