export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/gracias"],
    },
    sitemap: "https://www.guidoco.com.ar/sitemap.xml",
  };
}
