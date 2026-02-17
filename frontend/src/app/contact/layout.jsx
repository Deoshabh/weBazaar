import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Contact weBazaar — Get in Touch With Us',
  description: 'Have questions? Contact weBazaar for support, feedback or wholesale inquiries. We are happy to help you find the perfect pair of vegan shoes.',
  url: 'https://weBazaar.in/contact',
  keywords: ['contact weBazaar', 'customer support', 'shoe store contact', 'vegan shoes help'],
});

export default function ContactLayout({ children }) {
  return children;
}
