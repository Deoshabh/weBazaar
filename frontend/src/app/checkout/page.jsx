'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { orderAPI, addressAPI, couponAPI } from '@/utils/api';
import toast from 'react-hot-toast';
import {
  FiMapPin,
  FiPlus,
  FiTag,
  FiCreditCard,
  FiDollarSign,
  FiChevronRight,
  FiCheck,
  FiShield,
  FiTruck,
  FiX,
  FiLock,
  FiChevronLeft,
  FiPackage,
} from 'react-icons/fi';

/* ─── Step indicator ─── */
function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        return (
          <div key={step.label} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={[
                  'w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-body-sm font-semibold transition-all duration-normal',
                  isCompleted
                    ? 'bg-espresso text-white'
                    : isCurrent
                      ? 'bg-gold text-white ring-4 ring-gold/20'
                      : 'bg-linen text-caramel',
                ].join(' ')}
              >
                {isCompleted ? <FiCheck className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={[
                  'text-[10px] sm:text-caption mt-1.5 whitespace-nowrap',
                  isCurrent ? 'text-ink font-medium' : isCompleted ? 'text-espresso' : 'text-caramel',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={[
                  'w-10 sm:w-16 h-0.5 mx-1 sm:mx-2 mb-5 rounded-full transition-colors duration-normal',
                  isCompleted ? 'bg-espresso' : 'bg-sand/40',
                ].join(' ')}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── Section card wrapper ─── */
function SectionCard({ icon: Icon, title, badge, action, children }) {
  return (
    <div className="bg-white rounded-xl border border-sand/20 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-sand/20">
        <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-ink">
          {Icon && <Icon className="w-5 h-5 text-caramel" />}
          {title}
          {badge && (
            <span className="ml-1 w-5 h-5 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {badge}
            </span>
          )}
        </h2>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();
  const { cart, loading: cartLoading, fetchCart, cartCount, cartTotal } = useCart();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, loading, router]);

  const fetchAddresses = async () => {
    try {
      const response = await addressAPI.getAll();
      const addressList = Array.isArray(response.data)
        ? response.data
        : response.data.addresses || [];
      setAddresses(addressList);
      const defaultAddr = addressList.find((addr) => addr.isDefault);
      setSelectedAddress(defaultAddr || addressList[0]);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && !cartLoading) {
      fetchAddresses();
      if (cartCount === 0) {
        toast.error('Your cart is empty');
        router.push('/cart');
      }
    }
  }, [isAuthenticated, cartLoading, cartCount, router]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      await addressAPI.create(addressForm);
      toast.success('Address added!');
      fetchAddresses();
      setShowAddressForm(false);
      setAddressForm({
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        isDefault: false,
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add address');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    try {
      const response = await couponAPI.validate(couponCode);
      const coupon = response.data.coupon;
      let discountAmount = 0;
      if (coupon.type === 'percent') {
        discountAmount = (cart.subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discountAmount = Math.min(discountAmount, coupon.maxDiscount);
      } else {
        discountAmount = coupon.value;
      }
      setAppliedCoupon(coupon);
      setDiscount(discountAmount);
      toast.success(`Coupon applied! You saved ₹${discountAmount.toLocaleString('en-IN')}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscount(0);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a shipping address');
      return;
    }
    setIsProcessing(true);
    try {
      const orderData = {
        shippingAddress: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          addressLine1: selectedAddress.addressLine1,
          addressLine2: selectedAddress.addressLine2 || '',
          city: selectedAddress.city,
          state: selectedAddress.state,
          postalCode: selectedAddress.postalCode,
        },
        paymentMethod,
        couponCode: appliedCoupon?.code,
      };

      const response = await orderAPI.create(orderData);
      const order = response.data.order;

      if (paymentMethod === 'razorpay') {
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
          toast.error('Failed to load payment gateway');
          setIsProcessing(false);
          return;
        }
        const rzpResponse = await orderAPI.createRazorpayOrder(order._id);
        const { razorpayOrderId, amount, currency, key } = rzpResponse.data;
        if (!key) {
          toast.error('Payment system not configured. Please contact support.');
          setIsProcessing(false);
          return;
        }
        const options = {
          key,
          amount,
          currency,
          name: 'weBazaar',
          description: `Order ${order.orderId}`,
          order_id: razorpayOrderId,
          handler: async (res) => {
            try {
              await orderAPI.verifyRazorpayPayment(order._id, {
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              });
              toast.success('Payment successful!');
              fetchCart();
              router.push(`/orders/${order._id}`);
            } catch {
              toast.error('Payment verification failed');
              setIsProcessing(false);
            }
          },
          prefill: { name: user?.name, email: user?.email, contact: selectedAddress.phone },
          theme: {
            color:
              typeof document !== 'undefined'
                ? getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-espresso')
                    .trim() || '#2D1F16'
                : '#2D1F16',
          },
          modal: {
            ondismiss: () => {
              setIsProcessing(false);
              toast.error('Payment cancelled');
            },
          },
        };
        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } else {
        toast.success('Order placed successfully!');
        fetchCart();
        router.push(`/orders/${order._id}`);
      }
    } catch (error) {
      console.error('Order creation error:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || 'Failed to place order';
      const errorField = error.response?.data?.field;
      toast.error(errorField ? `${errorMessage} (Field: ${errorField})` : errorMessage);
      setIsProcessing(false);
    }
  };

  const subtotal = cartTotal || 0;
  const shippingCost = subtotal > 1000 ? 0 : 50;
  const total = subtotal + shippingCost - discount;

  const steps = [
    { label: 'Address' },
    { label: 'Payment' },
    { label: 'Review' },
  ];
  // Determine active step based on state
  const currentStep = selectedAddress ? (paymentMethod ? 2 : 1) : 0;

  if (loading || !cart) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
        <p className="text-body-sm text-caramel">Preparing checkout...</p>
      </div>
    );
  }

  const inputClass =
    'w-full px-4 py-2.5 bg-cream border border-sand/40 rounded-lg text-body-sm text-ink placeholder:text-caramel/60 focus:outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/12 transition-all duration-normal';

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-caption text-caramel mb-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/cart" className="hover:text-ink transition-colors">Cart</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink">Checkout</span>
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl font-semibold text-ink mb-2">Checkout</h1>
        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* ── Shipping Address ── */}
            <SectionCard
              icon={FiMapPin}
              title="Shipping Address"
              badge={addresses.length || undefined}
              action={
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1 text-body-sm font-medium text-espresso hover:text-ink transition-colors"
                >
                  <FiPlus className="w-4 h-4" /> Add New
                </button>
              }
            >
              {/* Address form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-5 p-4 bg-linen rounded-lg border border-sand/20">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={addressForm.fullName}
                      onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                      className={inputClass}
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone"
                      value={addressForm.phone}
                      onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                      className={inputClass}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 1"
                      value={addressForm.addressLine1}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                      className={`sm:col-span-2 ${inputClass}`}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Address Line 2 (Optional)"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      className={`sm:col-span-2 ${inputClass}`}
                    />
                    <input
                      type="text"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                      className={inputClass}
                      required
                    />
                    <input
                      type="text"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                      className={inputClass}
                      required
                    />
                    <input
                      type="text"
                      placeholder="PIN Code"
                      value={addressForm.postalCode}
                      onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                      className={inputClass}
                      required
                      maxLength="6"
                      pattern="[0-9]{6}"
                      title="Please enter a valid 6-digit PIN code"
                    />
                  </div>
                  <div className="flex gap-3 mt-4">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-5 py-2 bg-linen text-ink text-body-sm font-medium rounded-lg border border-sand/40 hover:bg-sand/20 transition-colors duration-fast"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 ? (
                <p className="text-center text-caramel py-8 text-body-sm">
                  No saved addresses. Please add one above.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {addresses.map((address) => {
                    const isSelected = selectedAddress?._id === address._id;
                    return (
                      <div
                        key={address._id}
                        onClick={() => setSelectedAddress(address)}
                        className={[
                          'relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-fast',
                          isSelected
                            ? 'border-espresso bg-espresso/[0.03]'
                            : 'border-sand/30 hover:border-caramel',
                        ].join(' ')}
                      >
                        {/* Selection indicator */}
                        <div
                          className={[
                            'absolute top-4 right-4 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-fast',
                            isSelected ? 'border-espresso bg-espresso' : 'border-sand',
                          ].join(' ')}
                        >
                          {isSelected && <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />}
                        </div>

                        <div className="pr-8">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-display text-base font-semibold text-ink">
                              {address.fullName}
                            </span>
                            {address.isDefault && (
                              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-gold/10 text-gold-dark rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-body-sm text-walnut">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-body-sm text-walnut">{address.addressLine2}</p>
                          )}
                          <p className="text-body-sm text-walnut">
                            {address.city}, {address.state} — {address.postalCode}
                          </p>
                          <p className="text-caption text-caramel mt-1.5">
                            Phone: {address.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* ── Payment Method ── */}
            <SectionCard icon={FiCreditCard} title="Payment Method">
              <div className="space-y-2.5">
                {/* Razorpay */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={[
                    'p-4 rounded-lg border-2 cursor-pointer transition-all duration-fast',
                    paymentMethod === 'razorpay'
                      ? 'border-espresso bg-espresso/[0.03]'
                      : 'border-sand/30 hover:border-caramel',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linen flex items-center justify-center">
                        <FiCreditCard className="w-5 h-5 text-espresso" />
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-ink">
                          Card / UPI / Net Banking
                        </p>
                        <p className="text-caption text-caramel normal-case tracking-normal">
                          Secured via Razorpay
                        </p>
                      </div>
                    </div>
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-fast',
                        paymentMethod === 'razorpay'
                          ? 'border-espresso bg-espresso'
                          : 'border-sand',
                      ].join(' ')}
                    >
                      {paymentMethod === 'razorpay' && (
                        <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>

                {/* COD */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={[
                    'p-4 rounded-lg border-2 cursor-pointer transition-all duration-fast',
                    paymentMethod === 'cod'
                      ? 'border-espresso bg-espresso/[0.03]'
                      : 'border-sand/30 hover:border-caramel',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-linen flex items-center justify-center">
                        <FiDollarSign className="w-5 h-5 text-espresso" />
                      </div>
                      <div>
                        <p className="text-body-sm font-semibold text-ink">Cash on Delivery</p>
                        <p className="text-caption text-caramel normal-case tracking-normal">
                          Pay when you receive
                        </p>
                      </div>
                    </div>
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-fast',
                        paymentMethod === 'cod'
                          ? 'border-espresso bg-espresso'
                          : 'border-sand',
                      ].join(' ')}
                    >
                      {paymentMethod === 'cod' && (
                        <FiCheck className="w-3 h-3 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Order Summary Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-sand/20 shadow-card overflow-hidden sticky top-[calc(var(--navbar-offset,80px)+1rem)]">
              <div className="px-5 py-4 border-b border-sand/20">
                <h2 className="font-display text-lg font-semibold text-ink">Order Summary</h2>
              </div>

              <div className="p-5">
                {/* Item thumbnails */}
                <div className="space-y-3 mb-5 pb-5 border-b border-sand/20">
                  {cart?.items?.slice(0, 3).map((item) => (
                    <div key={`${item.product._id}-${item.size}`} className="flex items-center gap-3">
                      <div className="relative w-12 h-14 flex-shrink-0 rounded-md overflow-hidden bg-linen">
                        <Image
                          src={item.product.images?.[0]?.url || item.product.images?.[0] || '/placeholder.svg'}
                          alt={item.product.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-espresso text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-body-sm text-ink font-medium truncate">{item.product.name}</p>
                        <p className="text-caption text-caramel normal-case tracking-normal">Size UK {item.size}</p>
                      </div>
                      <span className="text-body-sm font-medium text-ink tabular-nums">
                        ₹{((item.product.price || 0) * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                  {cart?.items?.length > 3 && (
                    <p className="text-caption text-caramel text-center">
                      +{cart.items.length - 3} more item{cart.items.length - 3 !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Coupon */}
                <div className="mb-5 pb-5 border-b border-sand/20">
                  <label className="flex items-center gap-1.5 text-body-sm font-medium text-ink mb-2">
                    <FiTag className="w-3.5 h-3.5 text-caramel" />
                    Coupon Code
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code"
                      disabled={!!appliedCoupon}
                      className={`flex-1 ${inputClass} disabled:bg-linen disabled:text-caramel`}
                    />
                    {appliedCoupon ? (
                      <button
                        onClick={handleRemoveCoupon}
                        className="px-3 py-2 bg-error/10 text-error text-body-sm font-medium rounded-lg hover:bg-error/20 transition-colors duration-fast flex-shrink-0"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={handleApplyCoupon}
                        className="px-4 py-2 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast flex-shrink-0"
                      >
                        Apply
                      </button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-caption text-success mt-1.5 normal-case tracking-normal">
                      {appliedCoupon.code} applied — saving ₹{discount.toLocaleString('en-IN')}
                    </p>
                  )}
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 mb-5">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-walnut">Subtotal ({cartCount} items)</span>
                    <span className="text-ink font-medium tabular-nums">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-walnut">Shipping</span>
                    <span className={shippingCost === 0 ? 'text-success font-medium' : 'text-ink tabular-nums'}>
                      {shippingCost === 0 ? 'Free' : `₹${shippingCost}`}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-body-sm">
                      <span className="text-success">Discount</span>
                      <span className="text-success font-medium tabular-nums">
                        −₹{discount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}
                  {subtotal < 1000 && shippingCost > 0 && (
                    <p className="text-caption text-caramel normal-case tracking-normal">
                      Add ₹{(1000 - subtotal).toLocaleString('en-IN')} more for free shipping
                    </p>
                  )}
                </div>

                {/* Total */}
                <div className="border-t border-sand/30 pt-4 mb-5">
                  <div className="flex justify-between">
                    <span className="font-display text-xl font-semibold text-ink">Total</span>
                    <span className="font-display text-xl font-semibold text-ink tabular-nums">
                      ₹{total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Place order */}
                <button
                  onClick={handlePlaceOrder}
                  disabled={!selectedAddress || isProcessing}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-espresso text-white text-body font-medium rounded-lg hover:bg-ink disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiLock className="w-4 h-4" />
                      Place Order — ₹{total.toLocaleString('en-IN')}
                    </>
                  )}
                </button>

                <Link
                  href="/cart"
                  className="flex items-center justify-center gap-1.5 mt-3 text-body-sm text-espresso hover:text-ink transition-colors"
                >
                  <FiChevronLeft className="w-3.5 h-3.5" />
                  Back to Cart
                </Link>

                {/* Trust strip */}
                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-sand/20">
                  <div className="flex items-center gap-1 text-caption text-caramel">
                    <FiShield className="w-3 h-3" />
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1 text-caption text-caramel">
                    <FiTruck className="w-3 h-3" />
                    <span>Free Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
