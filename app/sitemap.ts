import { supabaseServer } from "@/lib/supabase-server";

export default async function sitemap() {
  const baseUrl = "https://guidoco.com.ar";

  const { data: products } = await supabaseServer
    .from("products")
    .select("slug, created_at")
    .gt("stock", 0);

  const productUrls = (products ?? []).map((p) => ({
    url: `${baseUrl}/p/${p.slug}`,
    lastModified: p.created_at,
  }));

  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/catalogo`, lastModified: new Date() },
    { url: `${baseUrl}/contacto`, lastModified: new Date() },
    { url: `${baseUrl}/como-comprar`, lastModified: new Date() },
    { url: `${baseUrl}/faq`, lastModified: new Date() },
    { url: `${baseUrl}/valorar-carta`, lastModified: new Date() },
    { url: `${baseUrl}/politica-de-devolucion`, lastModified: new Date() },
    ...productUrls,
  ];
}
