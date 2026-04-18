import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { supabaseServer } from "@/lib/supabase-server";
import { WHATSAPP_NUMBER } from "@/app/layout";
import { formatARS } from "@/lib/format";
import { sortImages, sanitizeImageUrl } from "@/lib/images";
import { getUrgencyBadge, isNewProduct } from "@/lib/badges";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";

// ── SEO ──────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const { data: product } = await supabaseServer
    .from("products")
    .select("name,title,description,price,stock,product_images(url,sort_order)")
    .eq("slug", slug)
    .maybeSingle();

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const displayName = product.name ?? product.title ?? "Producto";
  const sortedImages = sortImages(product.product_images ?? []);
  const imageUrl = sanitizeImageUrl(sortedImages[0]?.url ?? null);

  const description =
    product.description?.trim() ||
    `${displayName} · $${formatARS(product.price)} ARS · ${
      (product.stock ?? 0) > 0 ? "En stock" : "Sin stock"
    } en Guidoco.`;

  const ogImages = imageUrl
    ? [{ url: imageUrl, width: 1200, height: 900, alt: displayName }]
    : [];

  return {
    title: `${displayName} | Guidoco`,
    description,
    openGraph: {
      title: `${displayName} | Guidoco`,
      description,
      url: `/p/${slug}`,
      type: "website",
      ...(ogImages.length > 0 && { images: ogImages }),
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: `${displayName} | Guidoco`,
      description,
      ...(imageUrl && { images: [imageUrl] }),
    },
  };
}

// ── Tipos ────────────────────────────────────────────────────────────────────

type RelatedProduct = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  category: string | null;
  created_at: string;
  product_images?: { url: string | null; sort_order: number | null }[];
};

const CATEGORY_LABELS: Record<string, string> = {
  diecast: "Diecast",
  pokemon: "Pokémon",
};

// ── Página ───────────────────────────────────────────────────────────────────

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const { data: product, error } = await supabaseServer
    .from("products")
    .select(
      "id,name,title,slug,description,price,stock,category,created_at,product_images(url,sort_order)"
    )
    .eq("slug", slug)
    .maybeSingle();

  // ── Not Found ─────────────────────────────────────────────────────────────
  if (error || !product) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
        <div className="mx-auto max-w-6xl px-6 py-12">
          <Link href="/catalogo" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
            ← Volver al catálogo
          </Link>
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Producto no encontrado</h1>
            <p className="mt-2 text-sm text-gray-500">slug buscado: {slug}</p>
            {error?.message && (
              <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-gray-100 p-3 text-sm text-gray-600">
                {error.message}
              </pre>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Productos relacionados ────────────────────────────────────────────────
  let relatedQuery = supabaseServer
    .from("products")
    .select("id,name,title,slug,price,stock,category,created_at,product_images(url,sort_order)")
    .neq("id", product.id)
    .gt("stock", 0)
    .order("created_at", { ascending: false })
    .limit(4);

  if (product.category) {
    relatedQuery = relatedQuery.eq("category", product.category);
  }

  const { data: relatedData } = await relatedQuery;
  const relatedProducts = (relatedData ?? []) as RelatedProduct[];

  // ── Datos calculados ──────────────────────────────────────────────────────
  const displayName = product.name ?? product.title ?? "Sin nombre";
  const inStock = (product.stock ?? 0) > 0;
  const sortedImages = sortImages(product.product_images ?? []);
  const firstImage = sanitizeImageUrl(sortedImages[0]?.url ?? null);
  const urgencyBadge = getUrgencyBadge(product.stock);
  const showNew = inStock && !urgencyBadge && isNewProduct(product.created_at);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://guidoco.com.ar";
  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa este producto: *${displayName}*\n${baseUrl}/p/${product.slug}`
  );
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="transition-colors hover:text-gray-700">Inicio</Link>
          <span>/</span>
          <Link href="/catalogo" className="transition-colors hover:text-gray-700">Catálogo</Link>
          <span>/</span>
          <span className="text-gray-600 line-clamp-1">{displayName}</span>
        </nav>

        {/* Grid 2 columnas */}
        <div className="grid gap-12 lg:grid-cols-[1fr_400px]">

          {/* ── Galería ── */}
          <div>
            <ProductGallery
              images={product.product_images ?? []}
              alt={displayName}
            />
          </div>

          {/* ── Buybox ── */}
          <div className="lg:sticky lg:top-24 lg:self-start">

            {/* Badge de categoría */}
            {product.category && (
              <span className="inline-block rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
                {CATEGORY_LABELS[product.category] ?? product.category}
              </span>
            )}

            {/* Badge "Nuevo" */}
            {showNew && (
              <span className="ml-2 inline-block rounded-full bg-gray-900 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white">
                Nuevo
              </span>
            )}

            {/* Título */}
            <h1 className="mt-3 text-[28px] font-medium leading-tight tracking-tight text-gray-900">
              {displayName}
            </h1>

            {/* Separador */}
            <div className="my-4 h-px bg-gray-100" />

            {/* Condición */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                Condición: Nuevo
              </span>
            </div>

            {/* Precio + badge urgencia */}
            <div className="mt-5 flex items-center gap-3">
              <p className="text-[36px] font-medium leading-none text-gray-900">
                ${formatARS(product.price)}
              </p>
              {urgencyBadge && (
                <span
                  className="rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white"
                  style={{ backgroundColor: "#C0392B" }}
                >
                  {urgencyBadge.label}
                </span>
              )}
              {!urgencyBadge && (
                <span
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    inStock
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-gray-400"}`} />
                  {inStock
                    ? `En stock${product.stock != null ? ` · ${product.stock} u.` : ""}`
                    : "Sin stock"}
                </span>
              )}
            </div>

            {/* Separador */}
            <div className="my-5 h-px bg-gray-100" />

            {/* CTA principal */}
            {inStock ? (
              <AddToCartButton
                productId={product.id}
                name={displayName}
                price={product.price}
                imageUrl={firstImage}
              />
            ) : (
              <button
                disabled
                className="w-full cursor-not-allowed rounded-lg bg-gray-100 py-3 text-sm font-semibold text-gray-400"
                style={{ height: "48px" }}
              >
                Sin stock
              </button>
            )}

            {/* WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-green-500 py-3 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50"
              style={{ height: "48px" }}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
              </svg>
              Consultar por WhatsApp
            </a>

            {/* Info de stock urgente */}
            {inStock && product.stock != null && product.stock <= 5 && (
              <p className="mt-3 text-xs font-medium text-amber-600">
                ⚠ Quedan {product.stock} {product.stock === 1 ? "unidad disponible" : "unidades disponibles"}
              </p>
            )}

            {/* Garantías */}
            <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
                <span className="text-sm text-gray-600">Envíos a todo el país</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                <span className="text-sm text-gray-600">Despacho en 24–48hs</span>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <svg className="h-4 w-4 shrink-0 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
                <span className="text-sm text-gray-600">Coordinación por WhatsApp</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── Detalles del producto ─────────────────────────────────────── */}
        <section className="mt-16 border-t border-gray-100 pt-12">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-5 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
            <h2 className="text-base font-semibold text-gray-900">Detalles del producto</h2>
          </div>

          <div className="grid gap-10 lg:grid-cols-2">
            {/* Tabla */}
            <div>
              <DetailRow
                label="Disponibilidad"
                value={inStock ? "En stock" : "Sin stock"}
                highlight={inStock}
              />
              {product.stock != null && (
                <DetailRow label="Unidades" value={String(product.stock)} />
              )}
              <DetailRow label="Precio" value={`$${formatARS(product.price)} ARS`} />
            </div>

            {/* Descripción completa */}
            {product.description && (
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Descripción
                </p>
                <p className="whitespace-pre-wrap text-sm leading-7 text-gray-600">
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* ── Banner Especiales ─────────────────────────────────────────── */}
        <section className="mt-16">
          <Link
            href="/catalogo?category=especiales"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              padding: "20px 24px",
              textDecoration: "none",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ color: "#fff", fontSize: 16, fontWeight: 500, margin: 0 }}>
                ✦ Mirá nuestras Especiales
              </p>
              <p style={{ color: "#aaa", fontSize: 13, marginTop: 4 }}>
                Productos hechos a mano, únicos
              </p>
            </div>
            <span style={{
              backgroundColor: "#FFD700",
              color: "#1a1a1a",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}>
              Ver Especiales →
            </span>
          </Link>
        </section>

        {/* ── Productos relacionados ────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16 border-t border-gray-100 pt-12">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-5 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
              <h2 className="text-base font-semibold text-gray-900">También te puede interesar</h2>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {relatedProducts.map((rel) => {
                const relName = rel.name ?? rel.title ?? "Sin nombre";
                const relSorted = sortImages(rel.product_images ?? []);
                const relCover = sanitizeImageUrl(relSorted[0]?.url ?? null);
                const relUrgency = getUrgencyBadge(rel.stock);
                const relInStock = (rel.stock ?? 0) > 0;
                const relNew = relInStock && !relUrgency && isNewProduct(rel.created_at);

                return (
                  <Link
                    key={rel.id}
                    href={`/p/${rel.slug}`}
                    className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition-transform duration-200 hover:-translate-y-1"
                  >
                    <div className="relative overflow-hidden bg-gray-50">
                      {relCover ? (
                        <Image
                          src={relCover}
                          alt={relName}
                          width={600}
                          height={600}
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                          <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                          </svg>
                        </div>
                      )}
                      {relUrgency && (
                        <span
                          className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                          style={{ backgroundColor: "#C0392B" }}
                        >
                          {relUrgency.label}
                        </span>
                      )}
                      {relNew && (
                        <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                          Nuevo
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-3.5">
                      {rel.category && (
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                          {CATEGORY_LABELS[rel.category] ?? rel.category}
                        </p>
                      )}
                      <p className="text-[13px] font-semibold leading-snug text-gray-900 line-clamp-2">
                        {relName}
                      </p>
                      <p className="mt-2 text-[14px] font-medium text-gray-900">
                        ${formatARS(rel.price)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Footer de página ──────────────────────────────────────────── */}
        <div className="mt-16 flex items-center justify-between border-t border-gray-100 pt-8">
          <Link
            href="/catalogo"
            className="text-sm text-gray-500 transition-colors hover:text-gray-900"
          >
            ← Ver más productos
          </Link>
          <Link
            href="/carrito"
            className="text-sm font-semibold text-gray-700 transition-colors hover:text-gray-900"
          >
            Ir al carrito →
          </Link>
        </div>

      </div>
    </main>
  );
}

// ── DetailRow ────────────────────────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-3">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm font-medium ${highlight ? "text-emerald-600" : "text-gray-900"}`}>
        {value}
      </span>
    </div>
  );
}
