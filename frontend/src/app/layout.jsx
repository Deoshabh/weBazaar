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

const DEFAULT_OG_IMAGE = 'https://webazaar.in/og/webazaar-og-banner.jpg';

async function fetchBrandingImage() {
  try {
    const { getServerApiUrl } = require('@/utils/serverApi');
    const res = await fetch(
      `${getServerApiUrl()}/settings/public`,
      { next: { revalidate: 300 } } // cache 5 minutes
    );
    if (!res.ok) return DEFAULT_OG_IMAGE;
    const data = await res.json();
    return data?.settings?.branding?.logo?.url || DEFAULT_OG_IMAGE;
  } catch {
    return DEFAULT_OG_IMAGE;
  }
}

export async function generateMetadata() {
  const ogImage = await fetchBrandingImage();
  return generateSEOMetadata({
    title: 'weBazaar — Premium Leather & Vegan Shoes',
    description: 'Conscious style, delivered. Shop premium leather & vegan shoes at weBazaar — cruelty-free, sustainable, and designed for modern living.',
    image: ogImage,
    keywords: ['vegan shoes', 'vegan leather', 'cruelty-free', 'sustainable footwear', 'ethical shoes', 'oxford', 'sneakers', 'loafer', 'premium leather shoes'],
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
