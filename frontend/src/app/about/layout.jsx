import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'About weBazaar — Our Story, Mission & Craftsmanship',
  description: "Learn about weBazaar's journey to create premium, cruelty-free shoes. Discover our values, craftsmanship, and commitment to sustainable fashion.",
  url: 'https://weBazaar.in/about',
  keywords: ['about weBazaar', 'vegan shoe brand India', 'cruelty-free fashion', 'sustainable footwear brand'],
});

export default function AboutLayout({ children }) {
  return children;
}
