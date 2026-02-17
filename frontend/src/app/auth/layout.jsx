import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

export const metadata = generateSEOMetadata({
  title: 'Login or Register | weBazaar',
  description: 'Sign in to your weBazaar account to track orders, manage your wishlist, and shop faster. New here? Create an account today.',
  url: 'https://weBazaar.in/auth/login',
  keywords: ['weBazaar login', 'sign in', 'create account', 'register'],
  noindex: true,
});

export default function AuthLayout({ children }) {
  return children;
}
