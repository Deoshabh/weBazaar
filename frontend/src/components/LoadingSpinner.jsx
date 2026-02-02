'use client';

import { FiLoader } from 'react-icons/fi';

/**
 * Loading Spinner Component
 * Reusable loading indicator with different sizes
 */
export default function LoadingSpinner({ size = 'md', fullScreen = false, text = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <FiLoader
        className={`${sizeClasses[size]} text-primary-600 animate-spin`}
      />
      {text && (
        <p className="text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Skeleton Loader Component
 * Loading placeholder for content
 */
export function SkeletonLoader({ className = '', count = 1 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={`animate-pulse bg-gray-200 rounded ${className}`}
        />
      ))}
    </>
  );
}

/**
 * Product Card Skeleton
 */
export function ProductCardSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse"
        >
          <div className="h-64 bg-gray-200" />
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="flex justify-between items-center pt-2">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-9 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

/**
 * Button Loading State
 */
export function ButtonLoader({ text = 'Loading...', className = '' }) {
  return (
    <button
      disabled
      className={`btn btn-primary opacity-75 cursor-not-allowed ${className}`}
    >
      <FiLoader className="w-4 h-4 animate-spin" />
      {text}
    </button>
  );
}

/**
 * Page Loading State
 */
export function PageLoader({ text = 'Loading...' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}
