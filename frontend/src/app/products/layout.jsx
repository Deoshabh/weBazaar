import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Shop All Shoes — Vegan Leather Collection',
  description: 'Browse our full range of premium vegan leather shoes. Oxfords, sneakers, loafers, boots and more — ethically made and delivered across India.',
  url: 'https://weBazaar.in/products',
  keywords: ['buy vegan shoes online', 'vegan leather collection', 'shop shoes India', 'cruelty-free shoes'],
});

export default function ProductsLayout({ children }) {
  return children;
}
