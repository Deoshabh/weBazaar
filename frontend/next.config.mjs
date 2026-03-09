import { setupHoneybadger } from '@honeybadger-io/nextjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "backend",
        port: "5000",
        pathname: "/api/media/**",
      },
      {
        // MinIO / RustFS / S3 served at minio.webazaar.in
        protocol: "https",
        hostname: "minio.webazaar.in",
        pathname: "/**",
      },
      {
        // CDN / proxy in front of object storage
        protocol: "https",
        hostname: "cdn.webazaar.in",
        pathname: "/**",
      },
      {
        // Direct S3-compatible endpoint
        protocol: "https",
        hostname: "s3.webazaar.in",
        pathname: "/**",
      },
      {
        // API-served media (e.g. through Next.js rewrite)
        protocol: "https",
        hostname: "api.webazaar.in",
        pathname: "/**",
      },
      {
        // Local MinIO for development (http)
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        // Local MinIO for development (https)
        protocol: "https",
        hostname: "localhost",
        port: "9000",
        pathname: "/**",
      },
      {
        // Docker-internal MinIO (used when building inside containers)
        protocol: "http",
        hostname: "minio",
        port: "9000",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
        pathname: "/**",
      },
    ],
    // Image optimization settings
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:5000"}/api/:path*`,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

export default setupHoneybadger(nextConfig, {
  reportData: true,
  silent: false,
  apiKey: process.env.HONEYBADGER_API_KEY,
  assetsUrl: process.env.NEXT_PUBLIC_ASSETS_URL || 'https://weBazaar.in',
  revision: process.env.GIT_COMMIT_SHA,
});
