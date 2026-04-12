import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { supabaseServer } from "@/lib/supabase-server";
import { formatARS } from "@/lib/format";
import { sortImages, sanitizeImageUrl } from "@/lib/images";
import { getUrgencyBadge, isNewProduct } from "@/lib/badges";
import ProductTicker from "@/components/ProductTicker";

export const metadata: Metadata = {
  title: "Guidoco | Coleccionables originales",
  description:
    "Diecast 1:64, cartas Pokémon y más. Stock real, compra simple y nuevos ingresos frecuentes.",
  openGraph: {
    title: "Guidoco | Coleccionables originales",
    description:
      "Diecast 1:64, cartas Pokémon y más. Stock real, compra simple y nuevos ingresos frecuentes.",
    url: "/",
    type: "website",
  },
};

// ── Tipos ────────────────────────────────────────────────────────────────────

type ProductImage = { url: string | null; sort_order: number | null };

type Product = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  category: string | null;
  created_at: string;
  product_images?: ProductImage[];
};

// ── Card de producto (light) ─────────────────────────────────────────────────

function ProductCard({ product, inverted = false }: { product: Product; inverted?: boolean }) {
  const displayName = product.name ?? product.title ?? "Sin nombre";
  const inStock = (product.stock ?? 0) > 0;
  const sortedImgs = sortImages(product.product_images ?? []);
  const cover = sanitizeImageUrl(sortedImgs[0]?.url ?? null);
  const urgencyBadge = getUrgencyBadge(product.stock);
  const showNew = inStock && !urgencyBadge && isNewProduct(product.created_at);

  const CATEGORY_LABELS: Record<string, string> = { diecast: "Diecast", pokemon: "Pokémon" };

  return (
    <Link
      href={`/p/${product.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
        inverted
          ? `bg-white/10 ${inStock ? "border-white/20" : "border-white/10 opacity-60"}`
          : `bg-white ${inStock ? "border-gray-200" : "border-gray-100 opacity-60"}`
      }`}
    >
      {/* Imagen */}
      <div className={`relative overflow-hidden ${inverted ? "bg-white/5" : "bg-gray-50"}`}>
        {cover ? (
          <Image
            src={cover}
            alt={displayName}
            width={600}
            height={450}
            className={`aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
              !inStock ? "grayscale" : ""
            }`}
          />
        ) : (
          <div className={`aspect-[4/3] w-full flex items-center justify-center ${inverted ? "bg-white/5" : "bg-gray-100"}`}>
            <svg
              className={`h-10 w-10 ${inverted ? "text-white/30" : "text-gray-300"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth={1}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          </div>
        )}

        {/* Sin stock overlay */}
        {!inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className={`rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-widest ${inverted ? "border-white/30 text-white/70" : "border-gray-300 bg-white text-gray-400"}`}>
              Sin stock
            </span>
          </div>
        )}

        {/* Badge urgencia — rojo */}
        {urgencyBadge && (
          <span
            className="absolute right-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
            style={{ backgroundColor: "#C0392B" }}
          >
            {urgencyBadge.label}
          </span>
        )}

        {/* Badge nuevo — negro */}
        {showNew && (
          <span className="absolute right-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
            Nuevo
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3.5">
        {product.category && (
          <p className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${inverted ? "text-white/60" : "text-gray-400"}`}>
            {CATEGORY_LABELS[product.category] ?? product.category}
          </p>
        )}
        <p className={`text-sm font-semibold leading-snug line-clamp-2 ${inverted ? "text-white" : "text-gray-900"}`}>
          {displayName}
        </p>
        <p className={`mt-2 text-base font-bold ${inverted ? "text-white" : "text-gray-900"}`}>
          ${formatARS(product.price)}
        </p>
      </div>
    </Link>
  );
}

// ── Sección header reutilizable ──────────────────────────────────────────────

function SectionHeader({
  title,
  href,
  linkLabel = "Ver todos →",
  inverted = false,
}: {
  title: string;
  href: string;
  linkLabel?: string;
  inverted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="h-6 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
        <h2 className={`text-xl font-bold ${inverted ? "text-white" : "text-gray-900"}`}>{title}</h2>
      </div>
      <Link
        href={href}
        className={`text-sm font-medium transition-colors ${inverted ? "text-white/70 hover:text-white" : "text-gray-500 hover:text-gray-900"}`}
      >
        {linkLabel}
      </Link>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default async function Home() {
  const [nuevosResult, tickerResult] = await Promise.all([
    // 4 más recientes
    supabaseServer
      .from("products")
      .select(
        "id,name,title,slug,price,stock,category,created_at,product_images(url,sort_order)"
      )
      .order("created_at", { ascending: false })
      .limit(4)
      .then((r) => r.data ?? [], () => [] as Product[]),
    // Todos los productos en stock para el carrusel
    supabaseServer
      .from("products")
      .select("id,name,title,slug,price,product_images(url,sort_order)")
      .gt("stock", 0)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? [], () => []),
  ]);

  const nuevosIngresos = nuevosResult as Product[];
  const tickerProducts = tickerResult as Product[];

  return (
    <main style={{ backgroundColor: "#e8ecf0", minHeight: "100vh" }}>


      {/* ── 2. Hero ─────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", height: "70vh", overflow: "hidden" }}>
        <Image
          src="/hero.jpg"
          alt="Guidoco - Tienda de coleccionables"
          fill
          priority
          style={{
            objectFit: "cover",
            objectPosition: "center 30%",
            animation: "kenBurns 20s ease-out forwards",
          }}
        />
        <div style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 40% 30%, rgba(255,180,60,0.15) 0%, transparent 60%)",
          animation: "warmPulse 4s ease-in-out infinite alternate",
          pointerEvents: "none",
        }} />
      </div>

      {/* ── 3. Nuevos ingresos ──────────────────────────────────────────────── */}
      {nuevosIngresos.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 py-14">
          <SectionHeader title="Nuevos ingresos" href="/catalogo" />
          <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
            {nuevosIngresos.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Carrusel de productos ─────────────────────────────────────────── */}
      {tickerProducts.length > 0 && (
        <section style={{ backgroundColor: "#1C2B3A" }}>
          <div className="mx-auto max-w-6xl px-6 pt-10 pb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-5 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
              <h2 className="text-base font-bold text-white">Nuestros productos</h2>
            </div>
          </div>
          <ProductTicker products={tickerProducts} />
        </section>
      )}

      {/* ── 5. Cards de categoría ───────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-4 sm:grid-cols-2">

          {/* Diecast */}
          <Link
            href="/catalogo?category=diecast"
            className="group relative overflow-hidden rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1a1a1a", display: "flex", alignItems: "flex-end", justifyContent: "flex-start", minHeight: "120px", padding: "1.5rem 2rem" }}
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 transition-colors group-hover:text-white">
              Explorar
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
            {/* Número decorativo */}
            <span
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[5rem] font-black leading-none select-none"
              style={{ color: "rgba(255,255,255,0.06)" }}
            >
              1:64
            </span>
          </Link>

          {/* Pokémon */}
          <Link
            href="/catalogo?category=pokemon"
            className="group relative overflow-hidden rounded-xl transition-shadow hover:shadow-md"
            style={{ backgroundColor: "#FFDE00", border: "2px solid #CC0000", display: "flex", alignItems: "flex-end", justifyContent: "flex-start", minHeight: "120px", padding: "1.5rem 2rem" }}
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:opacity-70" style={{ color: "#1a1a1a" }}>
              Explorar
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
            {/* Texto decorativo */}
            <span
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[5rem] font-black leading-none select-none"
              style={{ color: "rgba(204,0,0,0.1)" }}
            >
              TCG
            </span>
          </Link>

        </div>

        {/* Especiales — centrada, mitad del ancho */}
        <div className="mt-4 flex justify-center">
          <Link
            href="/catalogo?category=especiales"
            className="group relative overflow-hidden rounded-xl transition-opacity hover:opacity-90 w-full sm:w-1/2"
            style={{ backgroundColor: "#1a1a1a", border: "1.5px solid #FFD700", display: "flex", alignItems: "flex-end", justifyContent: "flex-start", minHeight: "120px", padding: "1.5rem 2rem" }}
          >
            <div className="flex items-center gap-1.5 text-sm font-semibold text-white transition-colors group-hover:opacity-80">
              Explorar
              <svg
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                />
              </svg>
            </div>
            {/* Texto decorativo */}
            <span
              className="absolute right-6 top-1/2 -translate-y-1/2 text-[5rem] font-black leading-none select-none"
              style={{ color: "rgba(255,215,0,0.08)" }}
            >
              ★
            </span>
          </Link>
        </div>

      </section>

      {/* ── 6. Barra de confianza ───────────────────────────────────────────── */}
      <section className="border-t border-b border-gray-200">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid divide-y sm:divide-y-0 sm:divide-x divide-gray-200 sm:grid-cols-3">

            <div className="flex flex-col items-center py-8 px-6 text-center gap-1">
              <svg
                className="h-5 w-5 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                />
              </svg>
              <p className="text-sm font-bold text-gray-900">100% originales</p>
              <p className="text-xs text-gray-500">Productos garantizados</p>
            </div>

            <div className="flex flex-col items-center py-8 px-6 text-center gap-1">
              <svg
                className="h-5 w-5 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
                />
              </svg>
              <p className="text-sm font-bold text-gray-900">Envíos a todo el país</p>
              <p className="text-xs text-gray-500">Correo y puerta a puerta</p>
            </div>

            <div className="flex flex-col items-center py-8 px-6 text-center gap-1">
              <svg
                className="h-5 w-5 text-gray-400 mb-2"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.8}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z"
                />
              </svg>
              <p className="text-sm font-bold text-gray-900">Pago seguro</p>
              <p className="text-xs text-gray-500">Mercado Pago</p>
            </div>

          </div>
        </div>
      </section>


    </main>
  );
}
