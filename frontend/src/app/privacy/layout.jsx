import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Privacy Policy | weBazaar',
  description: "Read weBazaar's privacy policy. Learn how we protect your personal information and ensure secure shopping.",
  url: 'https://weBazaar.in/privacy',
  keywords: ['weBazaar privacy', 'data protection', 'privacy policy India'],
  noindex: true,
});

export default function PrivacyLayout({ children }) {
  return children;
}
