import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Shop by Category — Vegan Leather Shoes | weBazaar',
  description: 'Browse weBazaar shoes by category. Find the perfect pair of vegan leather oxfords, sneakers, loafers, boots and more.',
  url: 'https://weBazaar.in/categories',
  keywords: ['shoe categories', 'vegan shoe types', 'oxford shoes', 'sneakers', 'loafers', 'boots'],
});

export default function CategoriesLayout({ children }) {
  return children;
}
