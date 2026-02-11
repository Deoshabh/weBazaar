import { notFound } from 'next/navigation';
import ProductClient from './ProductClient';

async function getProduct(slug) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
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
      title: 'Product Not Found | Radeo',
    };
  }

  return {
    title: `${product.name} | Radeo`,
    description: product.description?.substring(0, 160),
    openGraph: {
      images: product.images?.[0]?.url || [],
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
