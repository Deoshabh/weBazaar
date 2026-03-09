'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * Safe drop-in wrapper around next/image.
 * Renders a letter-avatar fallback when the remote image fails to load.
 *
 * Props:
 *  - fallbackText  : string — first character shown in fallback (e.g. category name)
 *  - fallbackSrc   : string — alternate image src to try before showing letter
 *  - All standard Next.js <Image> props are forwarded
 */
export default function SafeImage({
  src,
  alt,
  fallbackText,
  fallbackSrc,
  className,
  ...props
}) {
  const [imgSrc, setImgSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  function handleError() {
    if (!failed) {
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc);
      } else {
        setFailed(true);
      }
    }
  }

  if (failed) {
    // Letter / icon fallback — inherits whatever container classes the parent provides
    return (
      <span
        className={`flex items-center justify-center w-full h-full bg-linen text-walnut font-display font-semibold select-none ${className || ''}`}
        aria-label={alt}
      >
        {fallbackText ? fallbackText.charAt(0).toUpperCase() : '?'}
      </span>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
