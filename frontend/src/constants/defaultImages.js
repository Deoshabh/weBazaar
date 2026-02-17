/**
 * Open-source placeholder images for vegan leather shoes.
 * All images sourced from Unsplash (free license).
 * These are used as fallbacks when product images are not available.
 */

// Vegan leather shoe product images (Unsplash - free to use)
export const VEGAN_SHOE_IMAGES = [
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=600&fit=crop&q=80', // Red sneaker
  'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&h=600&fit=crop&q=80', // Orange/brown shoe
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&h=600&fit=crop&q=80', // White minimal shoe
  'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&h=600&fit=crop&q=80', // Tan leather-look shoe
  'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&h=600&fit=crop&q=80', // Colorful sneaker
  'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=600&h=600&fit=crop&q=80', // Multi-color shoe
  'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop&q=80', // Yellow Vans shoe
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=600&h=600&fit=crop&q=80', // Nike white shoe
];

// Hero banner images
export const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1920&h=800&fit=crop&q=80', // Shoe collection on shelf
  'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=1920&h=800&fit=crop&q=80', // Running shoes
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=1920&h=800&fit=crop&q=80', // Sneakers on display
];

/**
 * Get a deterministic shoe image based on an index or product ID
 */
export function getShoeImage(indexOrId = 0) {
  const idx = typeof indexOrId === 'string'
    ? Math.abs(indexOrId.split('').reduce((a, c) => a + c.charCodeAt(0), 0))
    : indexOrId;
  return VEGAN_SHOE_IMAGES[idx % VEGAN_SHOE_IMAGES.length];
}

/**
 * Get fallback image for a product (deterministic based on product ID)
 */
export function getProductFallbackImage(product) {
  if (!product) return '/placeholder.svg';
  const id = product._id || product.id || '';
  return getShoeImage(id);
}
