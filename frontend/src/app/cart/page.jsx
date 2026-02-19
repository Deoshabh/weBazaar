'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import {
  FiTrash2,
  FiShoppingBag,
  FiArrowLeft,
  FiMinus,
  FiPlus,
  FiTruck,
  FiShield,
  FiRefreshCw,
  FiChevronRight,
  FiLock,
} from 'react-icons/fi';

export default function CartPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateItemQuantity, cartTotal, loading } = useCart();
  const [updatingItems, setUpdatingItems] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const handleCheckout = () => router.push('/checkout');
  const freeShippingThreshold = 1000;
  const shippingProgress = Math.min(100, Math.round((cartTotal / freeShippingThreshold) * 100));

  const handleUpdateQuantity = async (productId, size, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;
    const key = `${productId}-${size}`;
    setUpdatingItems((prev) => ({ ...prev, [key]: true }));
    await updateItemQuantity(productId, size, newQty);
    setUpdatingItems((prev) => ({ ...prev, [key]: false }));
  };

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-caption text-caramel mb-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-ink transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink">Cart</span>
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink mb-6 sm:mb-8">
          Shopping Cart
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
            <p className="text-body-sm text-caramel">Loading your cart...</p>
          </div>
        ) : !cart || !cart.items || cart.items.length === 0 ? (
          /* Empty state */
          <div className="flex flex-col items-center justify-center py-20 lg:py-28">
            <div className="w-20 h-20 rounded-full bg-linen flex items-center justify-center mb-5">
              <FiShoppingBag className="w-8 h-8 text-caramel" />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink mb-2">Your cart is empty</h2>
            <p className="text-body-sm text-caramel mb-6 text-center max-w-sm">
              Looks like you haven&apos;t added anything yet. Start exploring our collection.
            </p>
            <Link
              href="/products"
              className="px-6 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Item count */}
              <p className="text-body-sm text-caramel mb-1">
                {cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart
              </p>

              {cart.items.map((item) => {
                const isUpdating = updatingItems[`${item.product._id}-${item.size}`];
                const itemTotal = (item.product.price || 0) * item.quantity;
                return (
                  <div
                    key={`${item.product._id}-${item.size}`}
                    className="bg-white rounded-xl border border-sand/20 p-4 sm:p-5 flex gap-4 sm:gap-5 shadow-card hover:shadow-card-hover transition-shadow duration-normal"
                  >
                    {/* Image */}
                    <Link
                      href={`/products/${item.product.slug}`}
                      className="relative w-20 h-24 sm:w-24 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden bg-linen"
                    >
                      <Image
                        src={item.product.images?.[0]?.url || item.product.images?.[0] || '/placeholder.svg'}
                        alt={item.product.name}
                        fill
                        sizes="(max-width: 640px) 80px, 96px"
                        className="object-cover"
                      />
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <Link
                          href={`/products/${item.product.slug}`}
                          className="font-display text-base sm:text-lg font-semibold text-ink hover:text-espresso transition-colors line-clamp-1"
                        >
                          {item.product.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.product.category?.name && (
                            <span className="text-caption text-caramel">{item.product.category.name}</span>
                          )}
                          <span className="text-caption text-sand">•</span>
                          <span className="text-caption text-caramel">Size UK {item.size}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center border border-sand/40 rounded-lg overflow-hidden">
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.size, item.quantity, -1)}
                            disabled={item.quantity <= 1 || isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-walnut hover:bg-linen disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-fast"
                            aria-label="Decrease quantity"
                          >
                            <FiMinus className="w-3.5 h-3.5" />
                          </button>
                          <span className={`w-8 h-8 flex items-center justify-center text-body-sm font-medium text-ink tabular-nums ${isUpdating ? 'opacity-40' : ''}`}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.product._id, item.size, item.quantity, 1)}
                            disabled={isUpdating}
                            className="w-8 h-8 flex items-center justify-center text-walnut hover:bg-linen disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-fast"
                            aria-label="Increase quantity"
                          >
                            <FiPlus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price + Remove */}
                        <div className="flex items-center gap-3">
                          <span className="font-display text-lg font-semibold text-ink tabular-nums">
                            ₹{itemTotal.toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product._id, item.size)}
                            className="w-8 h-8 flex items-center justify-center rounded-full text-caramel hover:text-error hover:bg-error-bg transition-colors duration-fast"
                            title="Remove item"
                            aria-label="Remove item"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Continue shopping */}
              <Link
                href="/products"
                className="inline-flex items-center gap-2 text-body-sm text-espresso hover:text-ink font-medium mt-2 transition-colors"
              >
                <FiArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-sand/20 shadow-card p-5 sm:p-6 sticky top-[calc(var(--navbar-offset,80px)+1rem)]">
                <h2 className="font-display text-lg font-semibold text-ink mb-5">Order Summary</h2>

                {/* Free shipping progress */}
                <div className="bg-linen rounded-lg p-3.5 mb-5">
                  {cartTotal >= freeShippingThreshold ? (
                    <div className="flex items-center gap-2 text-success text-body-sm font-medium">
                      <FiTruck className="w-4 h-4" />
                      Free shipping unlocked!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-body-sm">
                        <span className="text-walnut">
                          Add <strong className="text-ink">₹{(freeShippingThreshold - cartTotal).toLocaleString('en-IN')}</strong> for free shipping
                        </span>
                      </div>
                      <div className="h-1.5 bg-sand/40 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-espresso rounded-full transition-all duration-slow ease-out"
                          style={{ width: `${shippingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-body-sm text-walnut">
                    <span>Subtotal</span>
                    <span className="text-ink font-medium tabular-nums">₹{cartTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-body-sm text-walnut">
                    <span>Shipping</span>
                    <span className={cartTotal >= freeShippingThreshold ? 'text-success font-medium' : 'text-caramel'}>
                      {cartTotal >= freeShippingThreshold ? 'Free' : 'Calculated at checkout'}
                    </span>
                  </div>
                </div>

                <div className="border-t border-sand/30 pt-4 mb-5">
                  <div className="flex justify-between">
                    <span className="font-display text-lg font-semibold text-ink">Total</span>
                    <span className="font-display text-lg font-semibold text-ink tabular-nums">
                      ₹{cartTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-espresso text-white text-body font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
                >
                  <FiLock className="w-4 h-4" />
                  Proceed to Checkout
                </button>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-sand/20">
                  <div className="flex items-center gap-1 text-caption text-caramel">
                    <FiShield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1 text-caption text-caramel">
                    <FiTruck className="w-3 h-3" />
                    <span>Free Delivery</span>
                  </div>
                  <div className="flex items-center gap-1 text-caption text-caramel">
                    <FiRefreshCw className="w-3 h-3" />
                    <span>Easy Returns</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
