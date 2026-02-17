import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Returns & Exchange Policy | weBazaar',
  description: 'Easy returns and exchanges at weBazaar. Read our hassle-free return policy for vegan leather shoes.',
  url: 'https://weBazaar.in/returns',
  keywords: ['weBazaar returns', 'shoe exchange policy', 'return shoes online', 'refund policy'],
});

export default function ReturnsLayout({ children }) {
  return children;
}
