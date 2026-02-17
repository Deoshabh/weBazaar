import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Shipping Policy — Free & Fast Delivery | weBazaar',
  description: "Learn about weBazaar's shipping options, delivery times, and free shipping offers across India. We ensure your shoes arrive safely.",
  url: 'https://weBazaar.in/shipping',
  keywords: ['weBazaar shipping', 'free delivery India', 'shoe delivery', 'shipping policy'],
});

export default function ShippingLayout({ children }) {
  return children;
}
