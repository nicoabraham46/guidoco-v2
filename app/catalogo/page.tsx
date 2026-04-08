import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { supabaseServer } from "@/lib/supabase-server";
import { formatARS } from "@/lib/format";
import { sortImages, sanitizeImageUrl } from "@/lib/images";
import { getUrgencyBadge, isNewProduct } from "@/lib/badges";
import CatalogoFilters from "@/components/CatalogoFilters";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catálogo | Guidoco",
  description: "Explorá coleccionables originales disponibles en Guidoco.",
  openGraph: {
    title: "Catálogo | Guidoco",
    description: "Explorá coleccionables originales disponibles en Guidoco.",
    url: "/catalogo",
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

const CATEGORY_LABELS: Record<string, string> = {
  diecast: "Diecast",
  pokemon: "Pokémon",
};

// ── Página ───────────────────────────────────────────────────────────────────

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; stock?: string }>;
}) {
  const { category, q, sort, stock } = await searchParams;

  const validCategory = category === "diecast" || category === "pokemon" ? category : null;
  const searchQuery = (q?.trim() ?? "").replace(/[%().,]/g, "");
  const sortKey = sort === "price_asc" || sort === "price_desc" ? sort : "newest";
  const stockFilter = stock === "in" ? "in" : null;

  // ── Query con filtros acumulativos ────────────────────────────────────────
  let dbQuery = supabaseServer
    .from("products")
    .select("id,name,title,slug,price,stock,category,created_at,product_images(url,sort_order)")
    .limit(80);

  if (validCategory) {
    dbQuery = dbQuery.eq("category", validCategory);
  }
  if (searchQuery) {
    dbQuery = dbQuery.or(`name.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
  }
  if (stockFilter === "in") {
    dbQuery = dbQuery.gt("stock", 0);
  }
  if (sortKey === "price_asc") {
    dbQuery = dbQuery.order("price", { ascending: true });
  } else if (sortKey === "price_desc") {
    dbQuery = dbQuery.order("price", { ascending: false });
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  const { data: products, error: dbError } = await dbQuery;

  if (dbError) {
    console.error("[catalogo] Supabase error:", dbError);
  }

  const allProducts = (products ?? []) as Product[];

  // ── Título de sección ─────────────────────────────────────────────────────
  const pageTitle = validCategory ? CATEGORY_LABELS[validCategory] : "Catálogo";

  return (
    <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
      <div className="mx-auto max-w-6xl px-6 py-12">

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="transition-colors hover:text-gray-700">
            Inicio
          </Link>
          <span>/</span>
          {validCategory ? (
            <>
              <Link href="/catalogo" className="transition-colors hover:text-gray-700">
                Catálogo
              </Link>
              <span>/</span>
              <span className="text-gray-600">{CATEGORY_LABELS[validCategory]}</span>
            </>
          ) : (
            <span className="text-gray-600">Catálogo</span>
          )}
        </nav>

        {/* Título con barra roja */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="h-6 w-1 rounded-full"
              style={{ backgroundColor: "#C0392B" }}
            />
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
              {pageTitle}
            </h1>
          </div>
          <p className="text-sm text-gray-400">
            {allProducts.length}{" "}
            {allProducts.length === 1 ? "producto encontrado" : "productos encontrados"}
          </p>
        </div>

        {/* Filtros */}
        <Suspense>
          <CatalogoFilters
            category={validCategory}
            q={searchQuery}
            sort={sortKey}
            stock={stockFilter}
            total={allProducts.length}
          />
        </Suspense>

        {/* Grid / Estado vacío */}
        {allProducts.length === 0 ? (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            {dbError ? (
              <>
                <p className="text-sm font-semibold text-red-500">
                  Error al cargar productos
                </p>
                <p className="font-mono text-xs text-gray-400">{dbError.message}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No encontramos productos con esos filtros.
              </p>
            )}
            <Link
              href="/catalogo"
              className="text-sm font-semibold transition-colors hover:text-gray-900"
              style={{ color: "#C0392B" }}
            >
              Limpiar filtros →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {allProducts.map((product) => {
              const displayName = product.name ?? product.title ?? "Sin nombre";
              const inStock = (product.stock ?? 0) > 0;
              const sortedImgs = sortImages(product.product_images ?? []);
              const cover = sanitizeImageUrl(sortedImgs[0]?.url ?? null);
              const urgencyBadge = getUrgencyBadge(product.stock);
              const showNew = inStock && !urgencyBadge && isNewProduct(product.created_at);

              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className={`group relative flex flex-col overflow-hidden rounded-xl border bg-white transition-transform duration-200 hover:-translate-y-1 ${
                    inStock ? "border-gray-200" : "border-gray-100 opacity-60"
                  }`}
                >
                  {/* Imagen */}
                  <div className="relative overflow-hidden bg-gray-50">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={displayName}
                        width={600}
                        height={600}
                        className={`aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] ${
                          !inStock ? "grayscale" : ""
                        }`}
                      />
                    ) : (
                      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                        <svg
                          className="h-10 w-10 text-gray-300"
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
                      <div className="absolute inset-0 flex items-center justify-center bg-white/60">
                        <span className="rounded-full border border-gray-300 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                          Sin stock
                        </span>
                      </div>
                    )}

                    {/* Badge: urgencia (rojo) o nuevo (negro) — arriba izquierda */}
                    {urgencyBadge && (
                      <span
                        className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: "#C0392B" }}
                      >
                        {urgencyBadge.label}
                      </span>
                    )}
                    {showNew && (
                      <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Nuevo
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-3.5">
                    {product.category && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </p>
                    )}
                    <p className="text-[13px] font-semibold leading-snug text-gray-900 line-clamp-2">
                      {displayName}
                    </p>
                    <p className="mt-2 text-[14px] font-medium text-gray-900">
                      ${formatARS(product.price)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
