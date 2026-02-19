'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FiX,
  FiSearch,
  FiChevronDown,
  FiChevronRight,
  FiUser,
  FiPackage,
  FiLogOut,
  FiHome,
  FiShoppingBag,
  FiGrid,
  FiInfo,
} from 'react-icons/fi';

/**
 * MobileDrawer — slide-in from left, full-height, 280px wide
 * Search at top, nav links, expandable categories, account at bottom
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  categories = [],
  searchQuery,
  setSearchQuery,
  handleSearch,
  user,
  isAuthenticated,
  handleLogout,
}) {
  const pathname = usePathname();
  const drawerRef = useRef(null);
  const [catOpen, setCatOpen] = useState(false);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Trap escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  const linkClass = (href) =>
    [
      'flex items-center gap-3 px-4 py-3 text-body font-medium rounded-md',
      'transition-colors duration-fast',
      isActive(href) ? 'bg-gold/10 text-gold-dark' : 'text-ink hover:bg-linen',
    ].join(' ');

  const navLinks = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/products', label: 'Shop', icon: FiShoppingBag },
    { href: '/about', label: 'About', icon: FiInfo },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        className={[
          'fixed inset-0 z-[60] bg-ink/50 backdrop-blur-sm',
          'transition-opacity duration-normal',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={[
          'fixed top-0 left-0 bottom-0 z-[70] w-[280px] bg-cream',
          'flex flex-col shadow-xl',
          'transition-transform duration-slow ease-out-custom',
          isOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-14 border-b border-sand/50 flex-shrink-0">
          <span className="font-display text-xl font-semibold text-ink">Menu</span>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-linen text-ink transition-colors duration-fast"
            aria-label="Close menu"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-4 pb-2 flex-shrink-0">
          <form onSubmit={(e) => { handleSearch(e); onClose(); }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search shoes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-linen border border-sand/40 rounded-md text-body-sm text-ink placeholder:text-caramel focus:outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/12 transition-all duration-normal"
                aria-label="Search products"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-caramel w-4 h-4" />
            </div>
          </form>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={linkClass(href)}
              onClick={onClose}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          ))}

          {/* Categories accordion */}
          <div>
            <button
              onClick={() => setCatOpen((v) => !v)}
              className={[
                'w-full flex items-center gap-3 px-4 py-3 text-body font-medium rounded-md',
                'transition-colors duration-fast',
                isActive('/categories') ? 'bg-gold/10 text-gold-dark' : 'text-ink hover:bg-linen',
              ].join(' ')}
              aria-expanded={catOpen}
            >
              <FiGrid className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1 text-left">Categories</span>
              <FiChevronDown
                className={`w-4 h-4 transition-transform duration-fast ${catOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {catOpen && (
              <div className="ml-4 pl-4 border-l border-sand/50 mt-1 space-y-0.5">
                <Link
                  href="/categories"
                  className="flex items-center gap-2 px-3 py-2 text-body-sm font-medium text-espresso hover:bg-linen rounded-md transition-colors duration-fast"
                  onClick={onClose}
                >
                  All Categories
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat._id}
                    href={`/products?category=${cat.slug}`}
                    className="flex items-center gap-3 px-3 py-2 text-body-sm text-ink hover:bg-linen rounded-md transition-colors duration-fast group/cat"
                    onClick={onClose}
                  >
                    {cat.image?.url ? (
                      <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0 bg-linen">
                        <Image
                          src={cat.image.url}
                          alt={cat.name}
                          width={32}
                          height={32}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-md bg-linen flex items-center justify-center flex-shrink-0">
                        <span className="font-display font-semibold text-sm text-walnut">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="flex-1 truncate">{cat.name}</span>
                    <FiChevronRight className="w-3.5 h-3.5 text-sand opacity-0 group-hover/cat:opacity-100 transition-opacity" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* Bottom: account */}
        <div className="flex-shrink-0 border-t border-sand/50 px-4 py-4 space-y-2">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-espresso text-white flex items-center justify-center text-body-sm font-semibold flex-shrink-0">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-body-sm font-medium text-ink truncate">{user?.name}</p>
                  <p className="text-caption text-caramel truncate normal-case tracking-normal">{user?.email}</p>
                </div>
              </div>
              <Link
                href="/profile"
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-ink hover:bg-linen rounded-md transition-colors duration-fast"
                onClick={onClose}
              >
                <FiUser className="w-4 h-4 text-caramel" /> Profile
              </Link>
              <Link
                href="/orders"
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-ink hover:bg-linen rounded-md transition-colors duration-fast"
                onClick={onClose}
              >
                <FiPackage className="w-4 h-4 text-caramel" /> Orders
              </Link>
              {user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-3 py-2 text-body-sm text-gold-dark bg-gold-light/10 hover:bg-gold-light/20 rounded-md transition-colors duration-fast"
                  onClick={onClose}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => { handleLogout(); onClose(); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-body-sm text-error hover:bg-error-bg rounded-md transition-colors duration-fast"
              >
                <FiLogOut className="w-4 h-4" /> Logout
              </button>
            </>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-espresso text-white text-body-sm font-medium rounded-md hover:bg-ink transition-colors duration-normal"
              onClick={onClose}
            >
              <FiUser className="w-4 h-4" /> Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
