'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiPercent,
  FiStar, FiSettings, FiSearch, FiChevronLeft, FiChevronRight,
  FiBell, FiLogOut, FiUser, FiExternalLink, FiMenu, FiX,
  FiLayers, FiBarChart2, FiMessageSquare,
} from 'react-icons/fi';
import { useAuth } from '@/context/AuthContext';
import { AdminProvider, useAdmin } from '@/context/AdminContext';
import AdminCommandPalette from '@/components/admin/AdminCommandPalette';

const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', icon: 'FiGrid', label: 'Dashboard', exact: true },
      { href: '/admin/stats', icon: 'FiBarChart2', label: 'Analytics' },
    ],
  },
  {
    label: 'Commerce',
    items: [
      { href: '/admin/products', icon: 'FiPackage', label: 'Products' },
      { href: '/admin/orders', icon: 'FiShoppingBag', label: 'Orders' },
      { href: '/admin/users', icon: 'FiUsers', label: 'Customers' },
      { href: '/admin/reviews', icon: 'FiStar', label: 'Reviews' },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/admin/categories', icon: 'FiTag', label: 'Categories' },
      { href: '/admin/coupons', icon: 'FiPercent', label: 'Coupons' },
      { href: '/admin/seo', icon: 'FiSearch', label: 'SEO' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/cms', icon: 'FiSettings', label: 'Site Settings' },
      { href: '/admin/storefront-builder', icon: 'FiLayers', label: 'Storefront' },
      { href: '/admin/content', icon: 'FiMessageSquare', label: 'Content' },
    ],
  },
];

const ICON_MAP = {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiTag, FiPercent,
  FiStar, FiSettings, FiSearch, FiBarChart2, FiLayers, FiMessageSquare,
};

function useBreadcrumbs(pathname) {
  const all = NAV_GROUPS.flatMap((g) => g.items);
  const found = all.find((item) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href),
  );
  const crumbs = [{ label: 'Admin', href: '/admin' }];
  if (found && found.href !== '/admin') {
    crumbs.push({ label: found.label, href: found.href });
  }
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 2 && found) {
    const last = segments[segments.length - 1];
    if (!['admin', found.href.split('/').pop()].includes(last)) {
      const readable = last.replace(/-/g, ' ').replace(/w/g, (c) => c.toUpperCase());
      crumbs.push({ label: readable, href: pathname });
    }
  }
  return crumbs;
}

function NavItem({ href, iconKey, label, active, collapsed, onClick }) {
  const { isFormDirty } = useAdmin();
  const router = useRouter();
  const Icon = ICON_MAP[iconKey] || FiGrid;

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
    if (isFormDirty) {
      if (window.confirm('You have unsaved changes. Leave anyway?')) router.push(href);
    } else {
      router.push(href);
    }
  };

  return (
    <a
      href={href}
      onClick={handleClick}
      title={collapsed ? label : undefined}
      className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 cursor-pointer select-none
        ${active ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'}
        ${collapsed ? 'justify-center' : ''}`}
    >
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-amber-400" />
      )}
      <Icon className={`shrink-0 w-[18px] h-[18px] ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`} />
      {!collapsed && <span className="truncate leading-none">{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-full ml-3 z-50 whitespace-nowrap rounded-md bg-zinc-800 px-2.5 py-1.5 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
          {label}
        </span>
      )}
    </a>
  );
}

function Sidebar({ collapsed, onToggle, pathname, onNavClick }) {
  const isActive = (href, exact = false) => {
    if (exact) return pathname === href;
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`flex flex-col bg-zinc-950 border-r border-zinc-800/60 transition-all duration-300 ease-in-out overflow-hidden h-full ${collapsed ? 'w-[60px]' : 'w-[220px]'}`}>
      {/* Logo */}
      <div className={`flex items-center h-14 shrink-0 px-3 border-b border-zinc-800/60 ${collapsed ? 'justify-center' : 'gap-2.5'}`}>
        {!collapsed && (
          <>
            <span className="font-bold text-sm tracking-wide text-white truncate">weBazaar</span>
            <span className="ml-auto text-[10px] font-semibold tracking-widest uppercase text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">Admin</span>
          </>
        )}
        {collapsed && <span className="font-bold text-base text-amber-400">W</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label} className="mb-4 px-2">
            {!collapsed && (
              <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600 select-none">
                {group.label}
              </p>
            )}
            {collapsed && <div className="my-2 mx-3 border-t border-zinc-800/40" />}
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <NavItem
                    href={item.href}
                    iconKey={item.icon}
                    label={item.label}
                    active={isActive(item.href, item.exact)}
                    collapsed={collapsed}
                    onClick={onNavClick}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Collapse toggle */}
      <div className="shrink-0 border-t border-zinc-800/60 p-2">
        <button
          onClick={onToggle}
          className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed
            ? <FiChevronRight className="w-4 h-4 shrink-0" />
            : <><FiChevronLeft className="w-4 h-4 shrink-0" /><span>Collapse</span></>
          }
        </button>
      </div>
    </aside>
  );
}

function Header({ onMobileMenuToggle, mobileOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const { isFormDirty } = useAdmin();
  const breadcrumbs = useBreadcrumbs(pathname);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBackToStore = () => {
    if (isFormDirty && !window.confirm('You have unsaved changes. Leave anyway?')) return;
    router.push('/');
  };

  const openCommandPalette = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  return (
    <header className="h-14 shrink-0 bg-white border-b border-zinc-200 flex items-center px-4 gap-3 z-30">
      <button className="lg:hidden p-1.5 rounded-md text-zinc-500 hover:bg-zinc-100 transition-colors" onClick={onMobileMenuToggle}>
        {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
      </button>

      {/* Breadcrumbs */}
      <nav className="hidden sm:flex items-center gap-1.5 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5 min-w-0">
            {i > 0 && <span className="text-zinc-300 select-none">/</span>}
            {i === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-zinc-800 truncate">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="text-zinc-500 hover:text-zinc-800 transition-colors truncate">{crumb.label}</Link>
            )}
          </span>
        ))}
      </nav>

      <div className="flex-1" />

      {/* Search hint */}
      <button
        onClick={openCommandPalette}
        className="hidden md:flex items-center gap-2 text-xs text-zinc-400 bg-zinc-100 hover:bg-zinc-200 rounded-lg px-3 py-1.5 transition-colors"
      >
        <FiSearch className="w-3.5 h-3.5" />
        <span>Quick search</span>
        <kbd className="ml-1 text-[10px] bg-zinc-200 rounded px-1 py-0.5">⌘K</kbd>
      </button>

      {/* Bell */}
      <button className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 transition-colors">
        <FiBell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-amber-500 rounded-full" />
      </button>

      {/* Store link */}
      <button
        onClick={handleBackToStore}
        className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors border border-zinc-200"
      >
        <FiExternalLink className="w-3.5 h-3.5" />
        <span>Store</span>
      </button>

      {/* User menu */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </div>
          <div className="hidden sm:block text-left min-w-0">
            <p className="text-xs font-semibold text-zinc-800 leading-none truncate max-w-[90px]">{user?.name || 'Admin'}</p>
            <p className="text-[10px] text-zinc-400 leading-none mt-0.5 capitalize">{user?.role || 'admin'}</p>
          </div>
        </button>
        {userMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-zinc-200 shadow-xl py-1 z-50">
            <div className="px-3 py-2 border-b border-zinc-100">
              <p className="text-xs font-semibold text-zinc-800 truncate">{user?.name}</p>
              <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
            </div>
            <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
              <FiUser className="w-4 h-4" />Profile
            </Link>
            <button onClick={handleBackToStore} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
              <FiExternalLink className="w-4 h-4" />Back to Store
            </button>
            <div className="border-t border-zinc-100 mt-1 pt-1">
              <button onClick={() => { setUserMenuOpen(false); router.push('/auth/logout'); }} className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                <FiLogOut className="w-4 h-4" />Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose, pathname }) {
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <div className={`lg:hidden fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`lg:hidden fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar collapsed={false} onToggle={() => {}} pathname={pathname} onNavClick={onClose} />
      </div>
    </>
  );
}

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminProvider>
  );
}

function AdminLayoutContent({ children }) {
  const pathname = usePathname();
  const STORAGE_KEY = 'admin_sidebar_collapsed';
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) setCollapsed(stored === 'true');
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const handleToggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div className="h-screen bg-zinc-50 flex flex-col overflow-hidden">
      <AdminCommandPalette />
      <Header onMobileMenuToggle={() => setMobileOpen(!mobileOpen)} mobileOpen={mobileOpen} />
      <div className="flex flex-1 min-h-0">
        <div className="hidden lg:flex shrink-0 h-full">
          <Sidebar collapsed={collapsed} onToggle={handleToggle} pathname={pathname} onNavClick={() => {}} />
        </div>
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} pathname={pathname} />
        <main className="flex-1 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
