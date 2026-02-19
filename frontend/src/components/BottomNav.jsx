'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { FiHome, FiShoppingBag, FiHeart, FiUser } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

/**
 * BottomNav — fixed bottom bar, mobile only (below lg:)
 * 5 items: Home | Shop | Cart (center, raised circle) | Wishlist | Account
 */
export default function BottomNav() {
  const pathname = usePathname();
  const { cart } = useCart();
  const { wishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const cartCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const wishlistCount = wishlist?.length || 0;

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  // Don't render on admin/checkout paths
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) return null;

  const items = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/products', label: 'Shop', icon: FiShoppingBag },
    { href: '/cart', label: 'Cart', icon: null, isCenter: true },
    { href: '/wishlist', label: 'Wishlist', icon: FiHeart, badge: wishlistCount },
    { href: isAuthenticated ? '/profile' : '/auth/login', label: 'Account', icon: FiUser },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-cream/95 backdrop-blur-md border-t border-sand/40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-end justify-around h-16 max-w-md mx-auto px-4">
        {items.map(({ href, label, icon: Icon, badge, isCenter }) => {
          const active = isActive(href);

          if (isCenter) {
            return (
              <Link
                key={href}
                href={href}
                className="relative -mt-4 flex flex-col items-center group/center"
                aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
              >
                {/* Raised circle */}
                <div
                  className={[
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'shadow-lg border-4 border-cream',
                    'transition-all duration-normal',
                    active
                      ? 'bg-gold text-white'
                      : 'bg-espresso text-white group-hover/center:bg-ink',
                  ].join(' ')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gold text-espresso text-[11px] font-bold rounded-full flex items-center justify-center leading-none border-2 border-cream">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={[
                    'text-[10px] mt-0.5 font-medium tracking-wide',
                    active ? 'text-gold-dark' : 'text-caramel',
                  ].join(' ')}
                >
                  {label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center justify-center pt-1 pb-0.5 min-w-[48px] group/item"
              aria-label={badge > 0 ? `${label}, ${badge} items` : label}
            >
              {/* Active indicator */}
              <div
                className={[
                  'absolute top-0 w-6 h-0.5 rounded-full transition-all duration-fast',
                  active ? 'bg-gold' : 'bg-transparent',
                ].join(' ')}
              />

              <div className="relative">
                <Icon
                  className={[
                    'w-5 h-5 transition-colors duration-fast',
                    active ? 'text-gold-dark' : 'text-walnut group-hover/item:text-ink',
                  ].join(' ')}
                />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gold text-espresso text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>

              <span
                className={[
                  'text-[10px] mt-1 font-medium tracking-wide',
                  active ? 'text-gold-dark' : 'text-caramel',
                ].join(' ')}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
