'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiHeart, FiShoppingCart, FiStar, FiEye } from 'react-icons/fi';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { useSiteSettings } from '@/context/SiteSettingsContext';
import { toast } from 'react-hot-toast';
import anime from 'animejs';
import { getProductFallbackImage } from '@/constants/defaultImages';
import Badge from '@/components/ui/Badge';

const BLUR_DATA_URL = 'data:image/gray;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

export default function ProductCard({ product, priority = false }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { settings } = useSiteSettings();
  const [imgIndex, setImgIndex] = useState(0);

  const themeProducts = settings?.theme?.products || {};
  const showSaleBadge = themeProducts.showSaleBadge !== false;
  const showRating = themeProducts.showRating !== false;
  const showInstallment = themeProducts.showInstallmentText !== false;

  const rawAverageRating =
    product?.averageRating ?? product?.ratings?.average ?? product?.rating ?? 0;
  const averageRating = Number.isFinite(Number(rawAverageRating))
    ? Number(rawAverageRating)
    : 0;
  const rawReviewCount =
    product?.numReviews ?? product?.ratings?.count ?? product?.reviewCount ?? 0;
  const reviewCount = Number.isFinite(Number(rawReviewCount))
    ? Number(rawReviewCount)
    : 0;
  const shouldShowRating = showRating && averageRating > 0;

  const categoryLabel = typeof product.category === 'object'
    ? product.category?.name
    : product.category;

  const hasMultipleImages =
    product.images && product.images.length > 1;
  const primaryImage =
    product.images?.[0]?.url || product.images?.[0] || getProductFallbackImage(product);
  const secondaryImage = hasMultipleImages
    ? product.images[1]?.url || product.images[1]
    : null;

  const isOnSale = product.comparePrice && product.comparePrice > product.price;
  const discountPercent = isOnSale
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  // ── Fly-to-cart animation ──
  const flyToCart = (e) => {
    try {
      const card = e.currentTarget.closest('[data-product-card]');
      const img = card?.querySelector('img');
      const cartIcon = document.getElementById('cart-icon-container');

      if (!img || !cartIcon) return;

      const imgRect = img.getBoundingClientRect();
      const cartRect = cartIcon.getBoundingClientRect();

      const clone = img.cloneNode();
      clone.style.position = 'fixed';
      clone.style.left = `${imgRect.left}px`;
      clone.style.top = `${imgRect.top}px`;
      clone.style.width = `${imgRect.width}px`;
      clone.style.height = `${imgRect.height}px`;
      clone.style.zIndex = '9999';
      clone.style.borderRadius = '50%';
      clone.style.opacity = '0.8';
      clone.style.pointerEvents = 'none';
      document.body.appendChild(clone);

      anime({
        targets: clone,
        left: cartRect.left + cartRect.width / 2 - 20,
        top: cartRect.top + cartRect.height / 2 - 20,
        width: 40,
        height: 40,
        opacity: [0.8, 0],
        duration: 800,
        easing: 'cubicBezier(.5, .05, .1, .3)',
        complete: () => {
          clone.remove();
        }
      });
    } catch (error) {
      console.error("Animation error:", error);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      router.push('/auth/login');
      return false;
    }

    if (!product.sizes || product.sizes.length === 0) {
      toast.error('No sizes available');
      return false;
    }

    const firstSize =
      typeof product.sizes[0] === 'object' ? product.sizes[0].size : product.sizes[0];

    flyToCart(e);

    const result = await addToCart(product._id, firstSize);
    return result.success;
  };

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error('Please login to add items to wishlist');
      router.push('/auth/login');
      return;
    }

    await toggleWishlist(product._id);
  };

  const isProductInWishlist = isInWishlist(product._id);

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        data-product-card
        className="group relative bg-white rounded-lg shadow-card overflow-hidden h-full flex flex-col transition-all duration-normal ease-out-custom hover:shadow-card-hover hover:-translate-y-0.5"
      >
        {/* ── Image Container (4:5) ── */}
        <div
          className="relative aspect-[4/5] overflow-hidden bg-linen"
          onMouseEnter={() => hasMultipleImages && setImgIndex(1)}
          onMouseLeave={() => setImgIndex(0)}
        >
          {/* Primary image */}
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-opacity duration-slow ${
              imgIndex === 0 ? 'opacity-100' : 'opacity-0'
            }`}
            placeholder="blur"
            blurDataURL={BLUR_DATA_URL}
            priority={priority}
          />

          {/* Secondary image — crossfade on hover */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt={`${product.name} - alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-slow absolute inset-0 ${
                imgIndex === 1 ? 'opacity-100' : 'opacity-0'
              }`}
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          )}

          {/* ── Top-left badges ── */}
          <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5">
            {!product.inStock && (
              <Badge variant="error" size="sm">OUT OF STOCK</Badge>
            )}
            {showSaleBadge && isOnSale && product.inStock && (
              <Badge variant="gold" size="sm">SALE</Badge>
            )}
            {product.isNew && product.inStock && (
              <Badge variant="info" size="sm">NEW</Badge>
            )}
          </div>

          {/* ── Wishlist heart — top-right ── */}
          <button
            onClick={handleToggleWishlist}
            aria-label={isProductInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={[
              'absolute top-2.5 right-2.5 sm:top-3 sm:right-3',
              'w-9 h-9 flex items-center justify-center rounded-full',
              'transition-all duration-normal ease-out-custom shadow-sm',
              isProductInWishlist
                ? 'bg-error text-white scale-100'
                : 'bg-white/90 backdrop-blur-sm text-walnut hover:bg-white hover:text-error hover:scale-110 group-hover:text-error/70',
            ].join(' ')}
          >
            <FiHeart className={`w-4 h-4 ${isProductInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* ── Quick View button — fades in on hover (desktop) ── */}
          <div className="hidden sm:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-normal">
            <span className="bg-white/90 backdrop-blur-sm text-espresso text-body-sm font-medium px-4 py-2 rounded-full shadow-md flex items-center gap-1.5 hover:bg-white transition-colors">
              <FiEye className="w-4 h-4" />
              Quick View
            </span>
          </div>

          {/* ── Add to Cart bar — slides up from bottom on hover ── */}
          <div className="hidden sm:block absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-normal ease-out-custom">
            {product.inStock ? (
              <div className="flex gap-0">
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const result = await handleAddToCart(e);
                    if (result !== false) {
                      router.push('/cart');
                    }
                  }}
                  aria-label="Buy now"
                  className="flex-1 bg-espresso text-white text-body-sm font-medium py-3 flex items-center justify-center gap-1.5 hover:bg-ink transition-colors duration-fast"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Buy Now
                </button>
                <button
                  onClick={handleAddToCart}
                  aria-label="Add to cart"
                  className="flex-1 bg-white/95 backdrop-blur-sm text-espresso text-body-sm font-medium py-3 flex items-center justify-center gap-1.5 hover:bg-linen transition-colors duration-fast border-l border-sand/40"
                >
                  <FiShoppingCart className="w-4 h-4" />
                  Add to Cart
                </button>
              </div>
            ) : (
              <div className="bg-sand/80 text-walnut text-body-sm font-medium py-3 text-center">
                Out of Stock
              </div>
            )}
          </div>
        </div>

        {/* ── Product Info ── */}
        <div className="p-3 sm:p-4 md:p-5 flex-1 flex flex-col">
          {/* Category */}
          <p className="text-caption text-caramel mb-1">
            {categoryLabel || 'Uncategorized'}
          </p>

          {/* Name */}
          <h3 className="font-display text-sm sm:text-base md:text-lg font-semibold text-ink mb-1.5 group-hover:text-walnut transition-colors duration-fast line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {shouldShowRating && (
            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center text-gold">
                {Array.from({ length: 5 }).map((_, index) => {
                  const filled = index < Math.round(averageRating);
                  return (
                    <FiStar
                      key={`star-${product._id || product.slug || index}-${index}`}
                      className={`w-3.5 h-3.5 ${filled ? 'fill-current' : ''}`}
                    />
                  );
                })}
              </div>
              <span className="text-body-sm text-walnut">
                {averageRating.toFixed(1)}
                {reviewCount > 0 ? ` (${reviewCount})` : ''}
              </span>
            </div>
          )}

          {/* Description — desktop only */}
          {product.description && (
            <p className="hidden sm:block text-body-sm text-walnut mb-2 line-clamp-1">
              {product.description}
            </p>
          )}

          {/* Price */}
          <div className="mt-auto">
            {isOnSale ? (
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <span className="text-base sm:text-lg md:text-xl font-bold text-gold-dark">
                    ₹{(product.price ?? 0).toLocaleString('en-IN')}
                  </span>
                  <span className="text-body-sm text-sand line-through">
                    ₹{(product.comparePrice ?? 0).toLocaleString('en-IN')}
                  </span>
                  <Badge variant="error" size="sm">{discountPercent}% OFF</Badge>
                </div>
                {showInstallment && (
                  <p className="text-caption text-caramel normal-case tracking-normal mt-1">
                    Pay in 3 interest-free installments
                  </p>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-base sm:text-lg md:text-xl font-bold text-espresso">
                  ₹{(product.price ?? 0).toLocaleString('en-IN')}
                </p>
                {product.sizes && product.sizes.length > 0 && (
                  <p className="text-caption text-caramel normal-case tracking-normal">
                    {product.sizes.length} sizes
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
