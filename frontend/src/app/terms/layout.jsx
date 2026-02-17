import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Terms & Conditions | weBazaar',
  description: "Read weBazaar's terms and conditions for using our website and purchasing vegan leather shoes.",
  url: 'https://weBazaar.in/terms',
  keywords: ['weBazaar terms', 'terms of service', 'terms and conditions'],
  noindex: true,
});

export default function TermsLayout({ children }) {
  return children;
}
