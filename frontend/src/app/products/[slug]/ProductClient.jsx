'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';
import { getColorName } from '@/components/ColorPicker';
import { FiHeart, FiShoppingCart, FiAward, FiTruck, FiShield, FiCheck, FiChevronLeft, FiChevronRight, FiRotateCw } from 'react-icons/fi';
import toast from 'react-hot-toast';
import ProductMetadata from '@/components/ProductMetadata';
import ReviewSection from '@/components/ReviewSection';
import Product360Viewer from '@/components/products/Product360Viewer';

export default function ProductClient({ product }) {
    const router = useRouter();

    const { isAuthenticated } = useAuth();
    const { addToCart } = useCart();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [selectedSize, setSelectedSize] = useState(() => {
        if (product?.sizes?.length > 0) {
            return typeof product.sizes[0] === 'object' ? product.sizes[0].size : product.sizes[0];
        }
        return '';
    });

    const [selectedColor, setSelectedColor] = useState(() => {
        if (product?.colors?.length > 0) {
            return product.colors[0];
        }
        return '';
    });

    const [selectedImage, setSelectedImage] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    // Filter images based on selected color
    const filteredImages = useMemo(() => {
        if (!product?.images) return [];

        if (!selectedColor) return product.images;

        const normalize = (c) => c?.toLowerCase().trim();
        const targetColor = normalize(selectedColor);

        // Images specifically for this color
        const colorSpecific = product.images.filter(img => normalize(img.color) === targetColor);

        // Images with no color (common/neutral)
        const neutral = product.images.filter(img => !img.color);

        // If we have specific images for this color, prioritize them
        if (colorSpecific.length > 0) {
            return [...colorSpecific, ...neutral];
        }

        // Fallback to all images if no specific ones found
        return product.images;
    }, [product, selectedColor]);

    // Reset selected image when color changes
    useEffect(() => {
        setSelectedImage(0);
    }, [selectedColor]);

    if (!product) {
        return null;
    }

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to cart');
            router.push('/auth/login');
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }

        await addToCart(product._id, selectedSize, selectedColor || '');
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to continue');
            router.push('/auth/login');
            return;
        }

        if (!selectedSize) {
            toast.error('Please select a size');
            return;
        }

        const result = await addToCart(product._id, selectedSize, selectedColor || '');
        if (result.success) {
            router.push('/cart');
        }
    };

    const handleToggleWishlist = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to add items to wishlist');
            router.push('/auth/login');
            return;
        }

        await toggleWishlist(product._id);
    };

    const inWishlist = isInWishlist(product._id);

    const nextImage = () => {
        setSelectedImage((prev) => (prev + 1) % filteredImages.length);
    };

    const prevImage = () => {
        setSelectedImage((prev) => (prev - 1 + filteredImages.length) % filteredImages.length);
    };

    return (
        <>
            <ProductMetadata product={product} />
            <div className="min-h-screen bg-cream">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
                        {/* Image Gallery */}
                        <div className="space-y-3">
                            {/* Main Image */}
                            <div className="relative aspect-[4/5] sm:aspect-square bg-white rounded-xl overflow-hidden group shadow-card">
                                <Image
                                    src={filteredImages[selectedImage]?.url || filteredImages[selectedImage] || '/placeholder.svg'}
                                    alt={product.name}
                                    fill
                                    sizes="(max-width: 1024px) 100vw, 50vw"
                                    className="object-contain transition-transform duration-slow hover:scale-110 cursor-zoom-in"
                                    priority
                                />

                                {/* Navigation Arrows */}
                                {filteredImages.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ink w-10 h-10 sm:w-9 sm:h-9 rounded-full shadow-card flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-fast z-10"
                                            aria-label="Previous image"
                                        >
                                            <FiChevronLeft className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-ink w-10 h-10 sm:w-9 sm:h-9 rounded-full shadow-card flex items-center justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-fast z-10"
                                            aria-label="Next image"
                                        >
                                            <FiChevronRight className="w-5 h-5" />
                                        </button>
                                    </>
                                )}

                                {/* Image counter on mobile */}
                                {filteredImages.length > 1 && (
                                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink/60 text-white px-2.5 py-1 rounded-full text-caption tabular-nums sm:hidden">
                                        {selectedImage + 1} / {filteredImages.length}
                                    </div>
                                )}
                            </div>

                            {/* 360 View Toggle */}
                            {product.images360 && product.images360.length > 0 && (
                                <div className="bg-white rounded-xl p-4 shadow-card">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-display text-base font-semibold text-ink flex items-center gap-2">
                                            <FiRotateCw className="w-4 h-4 text-caramel" /> 360° View
                                        </h3>
                                        <span className="text-caption text-caramel">Drag to rotate</span>
                                    </div>
                                    <Product360Viewer
                                        images={product.images360.map(img => img.url)}
                                        hotspots={product.hotspots360 || []}
                                        aspectRatio="aspect-square"
                                    />
                                </div>
                            )}

                            {/* Thumbnail Images */}
                            {filteredImages.length > 1 && (
                                <div className="hidden sm:grid grid-cols-4 gap-2.5">
                                    {filteredImages.map((image, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(idx)}
                                            className={[
                                                'relative aspect-square bg-white rounded-lg overflow-hidden border-2 transition-all duration-fast',
                                                selectedImage === idx ? 'border-espresso ring-2 ring-espresso/20' : 'border-sand/30 hover:border-caramel',
                                            ].join(' ')}
                                        >
                                            <Image
                                                src={image?.url || image || '/placeholder.svg'}
                                                alt={`${product.name} ${idx + 1}`}
                                                fill
                                                sizes="(max-width: 1024px) 25vw, 12vw"
                                                className="object-contain"
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="space-y-4">
                            {/* Category & Name */}
                            <div>
                                <p className="text-caption uppercase tracking-wider text-caramel mb-1">
                                    {product.category?.name}
                                </p>
                                <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink mb-3">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                {product.comparePrice && product.comparePrice > product.price ? (
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <p className="font-display text-2xl font-semibold text-success">
                                            ₹{product.price?.toLocaleString('en-IN')}
                                        </p>
                                        <p className="text-lg text-caramel line-through tabular-nums">
                                            ₹{product.comparePrice?.toLocaleString('en-IN')}
                                        </p>
                                        <span className="bg-error text-white text-caption font-bold px-2.5 py-1 rounded-full">
                                            {Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF
                                        </span>
                                    </div>
                                ) : (
                                    <p className="font-display text-2xl font-semibold text-espresso tabular-nums">
                                        ₹{product.price?.toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <p className="text-body-sm text-walnut leading-relaxed">
                                {product.description}
                            </p>

                            {/* Color Selection */}
                            {product.colors && product.colors.length > 0 && (
                                <div>
                                    <label className="block text-body-sm font-medium text-ink mb-3">
                                        Select Color: <span className="text-espresso capitalize">{getColorName(selectedColor)}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-3">
                                        {product.colors.map((color, idx) => {
                                            const colorValue = color.startsWith('#') ? color : color.toLowerCase();
                                            const colorName = getColorName(color);
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={[
                                                        'relative w-11 h-11 rounded-full border-[3px] transition-all duration-fast',
                                                        selectedColor === color
                                                            ? 'border-espresso ring-2 ring-espresso/30 ring-offset-2 scale-110'
                                                            : 'border-sand hover:border-caramel hover:scale-105',
                                                    ].join(' ')}
                                                    style={{ backgroundColor: colorValue }}
                                                    title={colorName}
                                                >
                                                    {selectedColor === color && (
                                                        <FiCheck className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow-lg" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Size Selection */}
                            {product.sizes && product.sizes.length > 0 && (
                                <div>
                                    <label className="block text-body-sm font-medium text-ink mb-3">
                                        Select Size (UK)
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {product.sizes.map((sizeItem, idx) => {
                                            const sizeValue = typeof sizeItem === 'object' ? sizeItem.size : sizeItem;
                                            const stock = typeof sizeItem === 'object' ? sizeItem.stock : null;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedSize(sizeValue)}
                                                    disabled={stock !== null && stock === 0}
                                                    className={[
                                                        'min-w-[3rem] px-5 py-3 border-2 rounded-lg text-body-sm font-medium transition-all duration-fast',
                                                        selectedSize === sizeValue
                                                            ? 'border-espresso bg-espresso text-white'
                                                            : stock === 0
                                                                ? 'border-sand/30 bg-linen text-caramel cursor-not-allowed'
                                                                : 'border-sand/40 hover:border-espresso bg-white',
                                                    ].join(' ')}
                                                >
                                                    {sizeValue}
                                                    {stock !== null && stock === 0 && ' (Out)'}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Stock Status */}
                            <div className={`flex items-center gap-2 text-body-sm ${product.inStock ? 'text-success' : 'text-error'}`}>
                                {product.inStock ? (
                                    <>
                                        <FiCheck className="w-4 h-4" />
                                        <span className="font-medium">In Stock — Made to Order</span>
                                    </>
                                ) : (
                                    <span className="font-medium">Currently Unavailable</span>
                                )}
                            </div>

                            {/* Action Buttons — desktop */}
                            <div className="hidden sm:flex gap-3">
                                <button
                                    onClick={handleBuyNow}
                                    disabled={!product.inStock}
                                    className={[
                                        'flex-1 py-3.5 text-body font-medium rounded-lg transition-colors duration-fast',
                                        product.inStock
                                            ? 'bg-espresso text-white hover:bg-ink'
                                            : 'bg-sand/40 text-caramel cursor-not-allowed',
                                    ].join(' ')}
                                >
                                    {product.inStock ? 'Buy Now' : 'Out of Stock'}
                                </button>
                                <button
                                    onClick={handleAddToCart}
                                    disabled={!product.inStock}
                                    className={[
                                        'flex-1 py-3.5 text-body font-medium rounded-lg flex items-center justify-center gap-2 transition-colors duration-fast',
                                        product.inStock
                                            ? 'bg-white border-2 border-espresso text-espresso hover:bg-espresso/[0.04]'
                                            : 'bg-sand/40 text-caramel cursor-not-allowed border-2 border-sand/30',
                                    ].join(' ')}
                                >
                                    <FiShoppingCart className="w-4 h-4" />
                                    {product.inStock ? 'Add to Cart' : 'Unavailable'}
                                </button>
                                <button
                                    onClick={handleToggleWishlist}
                                    className={[
                                        'w-12 h-12 rounded-lg flex items-center justify-center transition-colors duration-fast',
                                        inWishlist
                                            ? 'bg-error text-white hover:bg-error/90'
                                            : 'bg-white border-2 border-sand/40 text-walnut hover:border-espresso hover:text-espresso',
                                    ].join(' ')}
                                >
                                    <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                                </button>
                            </div>

                            {/* Trust Badges */}
                            <div className="grid grid-cols-3 gap-3 pt-5 border-t border-sand/20">
                                {[
                                    { icon: FiAward, title: 'Handcrafted', subtitle: 'Premium Quality' },
                                    { icon: FiTruck, title: 'Free Delivery', subtitle: '7-10 Business Days' },
                                    { icon: FiShield, title: 'Premium Leather', subtitle: 'Finest Materials' },
                                ].map(({ icon: Icon, title, subtitle }) => (
                                    <div key={title} className="flex items-center gap-2.5">
                                        <div className="w-9 h-9 bg-linen rounded-full flex items-center justify-center flex-shrink-0">
                                            <Icon className="w-4 h-4 text-caramel" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-body-sm font-medium text-ink truncate">{title}</p>
                                            <p className="text-caption text-caramel truncate normal-case tracking-normal">{subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Made to Order Notice */}
                            <div className="bg-gold/5 rounded-lg p-4 border border-gold/20">
                                <p className="text-body-sm text-walnut">
                                    <strong className="text-ink">Made to Order:</strong> This product is custom-crafted upon order.
                                    Please allow 7-10 business days for production and delivery.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Product Details Tabs */}
                    <div className="mt-10 sm:mt-16">
                        <div className="border-b border-sand/30 mb-6 sm:mb-8">
                            <div className="flex gap-1 sm:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
                                {['description', 'specifications', 'care', 'reviews'].map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={[
                                            'pb-3 px-1 sm:px-0 text-body-sm whitespace-nowrap font-medium transition-colors duration-fast capitalize',
                                            activeTab === tab
                                                ? 'border-b-2 border-espresso text-espresso'
                                                : 'text-caramel hover:text-ink',
                                        ].join(' ')}
                                    >
                                        {tab === 'care' ? 'Care Instructions' : tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="max-w-3xl">
                            {activeTab === 'description' && (
                                <div>
                                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">Product Description</h3>
                                    <p className="text-body-sm text-walnut leading-relaxed">
                                        {product.description || 'Crafted with precision and attention to detail, this shoe embodies timeless elegance and superior craftsmanship.'}
                                    </p>
                                </div>
                            )}

                            {activeTab === 'specifications' && (
                                <div>
                                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">Specifications</h3>
                                    <ul className="space-y-2.5 text-body-sm text-walnut">
                                        {product.specifications?.material && (
                                            <li><strong className="text-ink">Material:</strong> {product.specifications.material}</li>
                                        )}
                                        {product.specifications?.sole && (
                                            <li><strong className="text-ink">Sole:</strong> {product.specifications.sole}</li>
                                        )}
                                        {product.specifications?.construction && (
                                            <li><strong className="text-ink">Construction:</strong> {product.specifications.construction}</li>
                                        )}
                                        {product.specifications?.madeIn && (
                                            <li><strong className="text-ink">Made in:</strong> {product.specifications.madeIn}</li>
                                        )}
                                        {product.category?.name && (
                                            <li><strong className="text-ink">Category:</strong> {product.category.name}</li>
                                        )}
                                        {product.sizes && product.sizes.length > 0 && (
                                            <li>
                                                <strong className="text-ink">Available Sizes:</strong> UK{' '}
                                                {product.sizes.map(s => typeof s === 'object' ? s.size : s).join(', ')}
                                            </li>
                                        )}
                                        {product.brand && (
                                            <li><strong className="text-ink">Brand:</strong> {product.brand}</li>
                                        )}
                                    </ul>
                                </div>
                            )}

                            {activeTab === 'care' && (
                                <div>
                                    <h3 className="font-display text-xl sm:text-2xl font-semibold text-ink mb-4">Care Instructions</h3>
                                    {product.careInstructions && product.careInstructions.length > 0 ? (
                                        <ul className="space-y-2 text-body-sm text-walnut">
                                            {product.careInstructions.map((instruction, index) => (
                                                <li key={index} className="flex gap-3">
                                                    <span className="text-espresso font-semibold">•</span>
                                                    <span>{instruction}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-body-sm text-caramel">No care instructions available for this product.</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'reviews' && (
                                <div>
                                    <ReviewSection productId={product._id} />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Sticky Mobile CTA Bar ── */}
                <div className="fixed bottom-[calc(var(--bottom-nav-height,64px)+env(safe-area-inset-bottom,0px))] left-0 right-0 bg-white border-t border-sand/30 px-4 py-3 flex items-center gap-3 shadow-lg z-30 sm:hidden">
                    <button
                        onClick={handleToggleWishlist}
                        className={[
                            'w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors duration-fast',
                            inWishlist
                                ? 'bg-error text-white'
                                : 'bg-linen text-walnut',
                        ].join(' ')}
                    >
                        <FiHeart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                    </button>
                    <button
                        onClick={handleAddToCart}
                        disabled={!product.inStock}
                        className="flex-1 py-3 bg-white border-2 border-espresso text-espresso text-body-sm font-medium rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
                    >
                        <FiShoppingCart className="w-4 h-4" />
                        Cart
                    </button>
                    <button
                        onClick={handleBuyNow}
                        disabled={!product.inStock}
                        className="flex-1 py-3 bg-espresso text-white text-body-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-fast"
                    >
                        Buy Now
                    </button>
                </div>
            </div>
        </>
    );
}
