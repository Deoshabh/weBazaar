/**
 * Resolve the absolute API base URL for server-side fetch calls.
 *
 * Client-side requests can use relative paths like `/api/v1` because the
 * browser resolves them against the current origin and Next.js rewrites proxy
 * them to the backend.  Server Components / Route Handlers run in Node.js
 * where relative URLs are invalid — they need a fully-qualified URL.
 *
 * Resolution order:
 *  1. BACKEND_INTERNAL_URL  (e.g. https://api.webazaar.in — Docker / prod)
 *  2. NEXT_PUBLIC_API_URL   only if it is already absolute (starts with http)
 *  3. Fallback to http://127.0.0.1:5000
 *
 * The returned value always includes the `/api/v1` path prefix.
 */
export function getServerApiUrl() {
  if (process.env.BACKEND_INTERNAL_URL) {
    return `${process.env.BACKEND_INTERNAL_URL.replace(/\/+$/, '')}/api/v1`;
  }

  const pub = process.env.NEXT_PUBLIC_API_URL;
  if (pub && /^https?:\/\//i.test(pub)) {
    return pub;
  }

  return 'http://127.0.0.1:5000/api/v1';
}
