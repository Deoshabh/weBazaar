import { Roboto, Cormorant_Garamond } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { SiteSettingsProvider } from '@/context/SiteSettingsContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import AnnouncementBar from '@/components/AnnouncementBar';
import MaintenanceModeGate from '@/components/MaintenanceModeGate';
import { generateMetadata as generateSEOMetadata } from '@/utils/seo';

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
});

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-display',
  display: 'swap',
});

const SITE_URL = 'https://webazaar.in';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/webazaar-og-banner.jpg`;
const DEFAULT_TITLE = 'WeBazaar — Premium Leather & Vegan Shoes';
const DEFAULT_DESCRIPTION =
  'Conscious style, delivered. Shop premium leather & vegan shoes at WeBazaar — cruelty-free, sustainable, and designed for modern living.';

/** Ensure a URL coming from the DB/CDN is absolute. */
function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  // Relative path stored in DB — prefix with site origin
  return `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

/** Fetch branding from the public settings endpoint with no-store so every
 *  deployment/request gets fresh data. Falls back gracefully on any error. */
async function fetchBranding() {
  try {
    const { getServerApiUrl } = require('@/utils/serverApi');
    const res = await fetch(`${getServerApiUrl()}/settings/public`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.settings?.branding ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata() {
  const branding = await fetchBranding();

  // Priority: ogImage.url → logo.url → static default
  const rawOgImage =
    branding?.ogImage?.url ||
    branding?.logo?.url ||
    DEFAULT_OG_IMAGE;
  const ogImageUrl = toAbsoluteUrl(rawOgImage) || DEFAULT_OG_IMAGE;

  const ogImageAlt =
    branding?.ogImage?.alt ||
    branding?.logo?.alt ||
    'WeBazaar — Premium Leather & Vegan Shoes';

  const siteName = branding?.siteName || 'WeBazaar';
  const title = `${siteName} — Premium Leather & Vegan Shoes`;
  const description = branding?.siteDescription || DEFAULT_DESCRIPTION;

  // Dynamic favicon (falls back to /favicon.ico if not set)
  const faviconUrl = toAbsoluteUrl(branding?.favicon?.url) || '/favicon.ico';

  return generateSEOMetadata({
    title,
    description,
    image: ogImageUrl,
    imageAlt: ogImageAlt,
    imageWidth: branding?.ogImage?.width || 1200,
    imageHeight: branding?.ogImage?.height || 630,
    keywords: [
      'vegan shoes', 'vegan leather', 'cruelty-free', 'sustainable footwear',
      'ethical shoes', 'oxford', 'sneakers', 'loafer', 'premium leather shoes',
    ],
    favicon: faviconUrl,
    siteName,
  });
}

import QueryProvider from '@/providers/QueryProvider';

// ...

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${roboto.variable} ${cormorant.variable}`}>
      <head>
        <link rel="preconnect" href="https://api.webazaar.in" />
        <script src={`https://www.google.com/recaptcha/enterprise.js?render=${process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}`} async defer></script>
      </head>
      <body className="antialiased">
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <SiteSettingsProvider>
                <CartProvider>
                  <WishlistProvider>
                    <AnnouncementBar />
                    <Navbar />
                    <main className="page-transition min-h-screen pb-20 lg:pb-0" style={{ paddingTop: 'var(--navbar-offset, 80px)' }}>
                      <MaintenanceModeGate>{children}</MaintenanceModeGate>
                    </main>
                    <Footer />
                    <BottomNav />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 3000,
                        style: {
                          background: '#363636',
                          color: '#fff',
                        },
                        success: {
                          duration: 3000,
                          iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                          },
                        },
                        error: {
                          duration: 4000,
                          iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                          },
                        },
                      }}
                    />
                  </WishlistProvider>
                </CartProvider>
              </SiteSettingsProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
