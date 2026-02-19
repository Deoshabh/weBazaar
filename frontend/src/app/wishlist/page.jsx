'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import ProductCard from '@/components/ProductCard';
import { FiHeart, FiChevronRight, FiShoppingBag } from 'react-icons/fi';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { wishlist, loading } = useWishlist();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-caption text-caramel mb-4">
          <Link href="/" className="hover:text-ink transition-colors">Home</Link>
          <FiChevronRight className="w-3 h-3" />
          <Link href="/products" className="hover:text-ink transition-colors">Products</Link>
          <FiChevronRight className="w-3 h-3" />
          <span className="text-ink">Wishlist</span>
        </nav>

        <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink mb-2">
          My Wishlist
        </h1>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <div className="w-10 h-10 border-2 border-sand border-t-espresso rounded-full animate-spin" />
            <p className="text-body-sm text-caramel">Loading wishlist...</p>
          </div>
        ) : !wishlist || wishlist.length === 0 ? (
          <div className="bg-white rounded-xl border border-sand/20 shadow-card p-12 text-center mt-6">
            <div className="w-16 h-16 mx-auto bg-linen rounded-full flex items-center justify-center mb-4">
              <FiHeart className="w-7 h-7 text-caramel" />
            </div>
            <h2 className="font-display text-xl font-semibold text-ink mb-2">Your wishlist is empty</h2>
            <p className="text-body-sm text-caramel mb-6 max-w-sm mx-auto">Save your favorite products here</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
            >
              <FiShoppingBag className="w-4 h-4" /> Browse Products
            </Link>
          </div>
        ) : (
          <>
            <p className="text-body-sm text-caramel mb-6">{wishlist.length} items saved</p>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
              {wishlist.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
