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
    sitemap: "https://weBazaar.in/sitemap.xml",
  };
}
