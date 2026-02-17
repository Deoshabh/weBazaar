import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Frequently Asked Questions — weBazaar Help Center',
  description: "Find answers to common questions about weBazaar's vegan leather shoes, shipping, returns, sizing, and more.",
  url: 'https://weBazaar.in/faq',
  keywords: ['weBazaar FAQ', 'shoe sizing guide', 'vegan shoe care', 'shipping policy'],
});

export default function FaqLayout({ children }) {
  return children;
}
