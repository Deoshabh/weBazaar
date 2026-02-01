export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/checkout/",
          "/cart/",
          "/profile/",
          "/orders/",
          "/wishlist/",
          "/api/",
        ],
      },
    ],
    sitemap: "https://radeo.in/sitemap.xml",
  };
}
