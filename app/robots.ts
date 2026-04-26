export default function robots() {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/gracias"],
    },
    sitemap: "https://guidoco.com.ar/sitemap.xml",
  };
}
