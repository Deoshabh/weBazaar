'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { FiRefreshCw, FiHome, FiShoppingBag } from 'react-icons/fi';

export default function ProductsError({ error, reset }) {
  useEffect(() => {
    console.error('Products page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-full bg-linen flex items-center justify-center mx-auto mb-6">
          <FiShoppingBag className="w-7 h-7 text-caramel" />
        </div>
        <h1 className="font-display text-2xl font-semibold text-ink mb-3">
          Couldn&apos;t load products
        </h1>
        <p className="text-body-sm text-walnut mb-8">
          We had trouble loading this page. Please try again in a moment.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-espresso text-white text-body-sm font-medium rounded-lg hover:bg-ink transition-colors duration-fast"
          >
            <FiRefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-linen text-espresso text-body-sm font-medium rounded-lg hover:bg-sand/40 transition-colors duration-fast border border-sand/40"
          >
            <FiHome className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
