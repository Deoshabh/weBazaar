'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import anime from 'animejs';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import {
  FiShoppingCart,
  FiHeart,
  FiUser,
  FiSearch,
  FiMenu,
  FiLogOut,
  FiPackage,
  FiX,
  FiChevronDown,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { productAPI, categoryAPI } from '@/utils/api';
import MobileDrawer from '@/components/MobileDrawer';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Products' },
  { href: '/categories', label: 'Categories', hasDropdown: true },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { settings } = useSiteSettings();

  const logoWidth = settings?.branding?.logo?.width || 120;
  const logoHeight = settings?.branding?.logo?.height || 40;

  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  const navRef = useRef(null);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const cartRef = useRef(null);
  const wishlistRef = useRef(null);
  const searchRequestIdRef = useRef(0);
  const prevCartCount = useRef(cartCount);
  const prevWishlistCount = useRef(wishlistCount);

  // Fetch categories
  useEffect(() => {
    categoryAPI
      .getNavbarCategories()
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  // Scroll – 60px threshold
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Cart bounce
  useEffect(() => {
    if (cartCount > prevCartCount.current && cartRef.current) {
      anime({ targets: cartRef.current, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, .5)' });
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // Wishlist bounce
  useEffect(() => {
    if (wishlistCount > prevWishlistCount.current && wishlistRef.current) {
      anime({ targets: wishlistRef.current, scale: [1, 1.3, 1], duration: 300, easing: 'easeOutElastic(1, .5)' });
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount]);

  // Navbar offset var
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const h = navRef.current?.offsetHeight || 64;
      root.style.setProperty('--navbar-offset', `${h}px`);
    };
    apply();
    if (typeof ResizeObserver !== 'undefined' && navRef.current) {
      const ro = new ResizeObserver(apply);
      ro.observe(navRef.current);
      return () => ro.disconnect();
    }
    window.addEventListener('resize', apply);
    return () => window.removeEventListener('resize', apply);
  }, []);

  // Search debounce
  useEffect(() => {
    if (searchQuery.length < 2) {
      searchRequestIdRef.current += 1;
      setSearchResults([]);
      return;
    }
    const id = ++searchRequestIdRef.current;
    const t = setTimeout(async () => {
      try {
        const r = await productAPI.getAllProducts({ search: searchQuery, limit: 6 });
        if (id !== searchRequestIdRef.current) return;
        const data = Array.isArray(r.data) ? r.data : r.data.products || [];
        setSearchResults(data);
      } catch { /* ignore */ }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = useCallback(async () => {
    await logout();
    setIsUserMenuOpen(false);
    router.push('/');
  }, [logout, router]);

  if (pathname?.startsWith('/admin')) return null;

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname?.startsWith(href));

  return (
    <>
      <nav
        ref={navRef}
        className={[
          'fixed top-0 left-0 right-0 z-50',
          'transition-all duration-normal ease-out-custom',
          isScrolled
            ? 'bg-cream shadow-sm border-b border-sand/50'
            : 'bg-cream/90 backdrop-blur-md',
        ].join(' ')}
      >
        <div className="container-custom h-16 lg:h-16">
          <div className="flex items-center justify-between h-full gap-4">

            {/* Logo */}
            <Link href="/" className="flex-shrink-0 z-20" aria-label="weBazaar Home">
              {settings?.branding?.logo?.url ? (
                <div className="relative" style={{ width: `${logoWidth}px`, height: `${logoHeight}px` }}>
                  <Image
                    src={settings.branding.logo.url}
                    alt={settings.branding.logo.alt || 'weBazaar'}
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              ) : (
                <span className="font-display text-2xl sm:text-[28px] font-semibold text-ink tracking-tight hover:text-walnut transition-colors duration-fast">
                  {settings?.branding?.siteName || 'weBazaar'}
                </span>
              )}
            </Link>

            {/* Center nav (desktop) */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.href}
                    className="relative"
                    onMouseEnter={() => setIsCategoriesOpen(true)}
                    onMouseLeave={() => setIsCategoriesOpen(false)}
                  >
                    <button
                      className={[
                        'relative px-4 py-2 text-body font-medium flex items-center gap-1',
                        'transition-colors duration-fast',
                        isActive(link.href) ? 'text-gold' : 'text-ink hover:text-walnut',
                      ].join(' ')}
                      aria-expanded={isCategoriesOpen}
                      aria-haspopup="true"
                    >
                      {link.label}
                      <FiChevronDown className={`w-4 h-4 transition-transform duration-fast ${isCategoriesOpen ? 'rotate-180' : ''}`} />
                      {isActive(link.href) && (
                        <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
                      )}
                    </button>
                    {isCategoriesOpen && (
                      <div className="absolute top-full left-0 pt-2 z-50">
                        <div className="w-72 bg-white rounded-lg shadow-lg border border-sand/40 overflow-hidden animate-slide-down">
                          <Link
                            href="/categories"
                            className="flex items-center gap-2 px-4 py-3 font-medium text-espresso hover:bg-linen border-b border-sand/40 transition-colors duration-fast"
                            onClick={() => setIsCategoriesOpen(false)}
                          >
                            All Categories
                          </Link>
                          <div className="max-h-80 overflow-y-auto">
                            {categories.map((cat) => (
                              <Link
                                key={cat._id}
                                href={`/products?category=${cat.slug}`}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-linen transition-colors duration-fast group/cat"
                                onClick={() => setIsCategoriesOpen(false)}
                              >
                                {cat.image?.url ? (
                                  <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 bg-linen">
                                    <Image
                                      src={cat.image.url}
                                      alt={cat.name}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover group-hover/cat:scale-110 transition-transform duration-normal"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-10 h-10 rounded-md bg-linen flex items-center justify-center flex-shrink-0">
                                    <span className="font-display font-semibold text-lg text-walnut">{cat.name.charAt(0)}</span>
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className="text-body-sm font-medium text-ink group-hover/cat:text-walnut transition-colors">{cat.name}</span>
                                  {cat.description && (
                                    <p className="text-caption text-caramel truncate normal-case tracking-normal">{cat.description}</p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={[
                      'relative px-4 py-2 text-body font-medium',
                      'transition-colors duration-fast',
                      isActive(link.href) ? 'text-gold' : 'text-ink hover:text-walnut',
                    ].join(' ')}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-gold rounded-full" />
                    )}
                  </Link>
                )
              )}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search toggle */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setIsSearchOpen((v) => !v)}
                  className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-linen text-ink transition-colors duration-fast"
                  aria-label="Search"
                >
                  {isSearchOpen ? <FiX className="w-5 h-5" /> : <FiSearch className="w-5 h-5" />}
                </button>
                {isSearchOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[min(400px,90vw)] bg-white rounded-lg shadow-lg border border-sand/40 overflow-hidden animate-slide-down z-50">
                    <form onSubmit={handleSearch} className="p-3 border-b border-sand/30">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search for shoes..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          autoFocus
                          className="w-full pl-9 pr-4 py-2.5 bg-linen border border-sand/40 rounded-md text-body-sm text-ink placeholder:text-caramel focus:outline-none focus:border-espresso focus:ring-2 focus:ring-espresso/12 transition-all duration-normal"
                          aria-label="Search products"
                        />
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-caramel w-4 h-4" />
                      </div>
                    </form>
                    {searchResults.length > 0 && (
                      <div className="max-h-72 overflow-y-auto">
                        {searchResults.map((product) => (
                          <Link
                            key={product._id}
                            href={`/products/${product.slug}`}
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
                            className="flex items-center gap-3 p-3 hover:bg-linen transition-colors duration-fast"
                          >
                            <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-linen">
                              <Image src={product.images?.[0]?.url || product.images?.[0] || '/placeholder.svg'} alt={product.name} fill sizes="48px" className="object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-body-sm font-medium text-ink truncate">{product.name}</p>
                              <p className="text-caption text-caramel normal-case tracking-normal">{product.category?.name}</p>
                            </div>
                            <span className="text-body-sm font-semibold text-espresso whitespace-nowrap">₹{product.price?.toLocaleString()}</span>
                          </Link>
                        ))}
                        <button
                          onClick={() => { router.push(`/products?search=${encodeURIComponent(searchQuery)}`); setIsSearchOpen(false); setSearchQuery(''); }}
                          className="w-full p-3 text-center text-body-sm font-medium text-gold-dark hover:bg-linen border-t border-sand/30 transition-colors duration-fast"
                        >
                          View all results
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-linen text-ink transition-colors duration-fast" aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount} items)` : ''}`}>
                <div ref={wishlistRef}><FiHeart className="w-5 h-5" /></div>
                {wishlistCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-gold text-white text-[10px] font-bold rounded-full px-1">{wishlistCount}</span>
                )}
              </Link>

              {/* Cart */}
              <Link href="/cart" id="cart-icon-container" className="relative w-9 h-9 flex items-center justify-center rounded-full hover:bg-linen text-ink transition-colors duration-fast" aria-label={`Cart${cartCount > 0 ? ` (${cartCount} items)` : ''}`}>
                <div ref={cartRef}><FiShoppingCart className="w-5 h-5" /></div>
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-espresso text-white text-[10px] font-bold rounded-full px-1">{cartCount}</span>
                )}
              </Link>

              {/* User menu */}
              {isAuthenticated ? (
                <div ref={userMenuRef} className="relative hidden sm:block">
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-espresso text-white flex items-center justify-center text-body-sm font-semibold hover:bg-ink transition-colors duration-fast"
                    aria-label="User menu"
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    {user?.name?.charAt(0).toUpperCase()}
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-sand/40 overflow-hidden animate-slide-down z-50">
                      <div className="p-3 border-b border-sand/30">
                        <p className="text-body-sm font-medium text-ink truncate">{user?.name}</p>
                        <p className="text-caption text-caramel normal-case tracking-normal truncate">{user?.email}</p>
                      </div>
                      <Link href="/profile" className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-ink hover:bg-linen transition-colors duration-fast" onClick={() => setIsUserMenuOpen(false)}>
                        <FiUser className="w-4 h-4 text-caramel" /> Profile
                      </Link>
                      <Link href="/orders" className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-ink hover:bg-linen transition-colors duration-fast" onClick={() => setIsUserMenuOpen(false)}>
                        <FiPackage className="w-4 h-4 text-caramel" /> Orders
                      </Link>
                      {user?.role === 'admin' && (
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-body-sm text-gold-dark bg-gold-light/10 hover:bg-gold-light/20 transition-colors duration-fast" onClick={() => setIsUserMenuOpen(false)}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Admin Panel
                        </Link>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2.5 text-body-sm text-error hover:bg-error-bg transition-colors duration-fast">
                        <FiLogOut className="w-4 h-4" /> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="hidden sm:inline-flex items-center justify-center px-5 py-2 bg-espresso text-white text-body-sm font-medium rounded-md hover:bg-ink hover:shadow-md transition-all duration-normal ease-out-custom">
                  Login
                </Link>
              )}

              {/* Hamburger */}
              <button
                onClick={() => setDrawerOpen(true)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-linen text-ink transition-colors duration-fast"
                aria-label="Open menu"
              >
                <FiMenu className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <MobileDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        user={user}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
      />
    </>
  );
}
