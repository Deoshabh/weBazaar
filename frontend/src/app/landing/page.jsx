/**
 * /landing — Webazaar Immersive Landing Page
 *
 * An Awwwards-level experience featuring:
 * - Three.js 3D hero with floating shoe model
 * - GSAP ScrollTrigger scrollytelling animations
 * - Anime.js micro-interactions and page transitions
 * - Glassmorphism navbar with organic UI
 * - "Organic Levitation" design concept
 */
import LandingPageClient from './LandingPageClient';

export const metadata = {
  title: 'Webazaar — Walk in Stillness | Meditative Vegan Leather Shoes',
  description:
    'Chemical-free, vegan leather shoes designed for meditative walking and foot health. Every step, a moment of presence.',
  keywords: [
    'vegan leather shoes',
    'meditative walking',
    'chemical-free shoes',
    'sustainable footwear',
    'foot health',
    'organic shoes',
  ],
};

export default function LandingRoute() {
  return <LandingPageClient />;
}
