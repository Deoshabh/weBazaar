import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';
import { getServerApiUrl } from '@/utils/serverApi';

async function getProduct(slug) {
  try {
    const res = await fetch(`${getServerApiUrl()}/products/${slug}`, {
      next: { revalidate: 60 }, // Revalidate every 60 seconds (SSG/ISR)
    });

    if (!res.ok) {
      console.error(`[ProductSSR] Failed to fetch: ${res.status} ${res.statusText}`);
      const text = await res.text();
      console.error(`[ProductSSR] Response: ${text}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.error('[ProductSSR] Fetch Error:', error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found | weBazaar',
    };
  }

  const title = `${product.name} | weBazaar`;
  const description = product.description?.substring(0, 160) || `Buy ${product.name} — premium vegan leather shoes at weBazaar. Free shipping across India.`;
  const image = product.images?.[0]?.url || product.images?.[0] || 'https://weBazaar.in/og/webazaar-og-banner.jpg';
  const url = `https://weBazaar.in/products/${params.slug}`;

  return {
    title,
    description,
    keywords: [product.name, product.brand, product.category?.name, 'vegan shoes', 'buy online India'].filter(Boolean).join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: 'weBazaar',
      images: [{ url: image, width: 1200, height: 630, alt: product.name }],
      locale: 'en_IN',
      type: 'product',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
      site: '@weBazaar_in',
    },
    alternates: {
      canonical: url,
    },
  };
}

import ProductSchema from '@/components/ProductSchema';

export default async function ProductPage({ params }) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  return (
    <>
      <ProductSchema product={product} />
      <ProductClient product={product} />
    </>
  );
}
