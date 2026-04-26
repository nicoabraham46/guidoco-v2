import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";

import { supabaseServer } from "@/lib/supabase-server";
import { formatARS } from "@/lib/format";
import { sortImages, sanitizeImageUrl } from "@/lib/images";
import { getUrgencyBadge, isNewProduct } from "@/lib/badges";
import CatalogoFilters from "@/components/CatalogoFilters";

const POKEMON_TYPES_KEYS = ["fire", "water", "grass", "electric", "psychic", "fighting", "colorless", "metal", "dark", "dragon", "fairy"];

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

type ProductImage = { url: string | null; sort_order: number | null };

type Product = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  category: string | null;
  pokemon_type?: string | null;
  created_at: string;
  product_images?: ProductImage[];
};

const CATEGORY_LABELS: Record<string, string> = {
  diecast: "Diecast",
  pokemon: "Pokémon TCG",
  especiales: "Especiales",
};

// ── Cards de categoría ────────────────────────────────────────────────────────

const categoryCards = [
  {
    key: "diecast",
    href: "/catalogo?category=diecast",
    bg: "#1a1a1a",
    border: "none",
    textColor: "#fff",
    decorativo: "1:64",
    decorativoColor: "rgba(255,255,255,0.06)",
  },
  {
    key: "pokemon",
    href: "/catalogo?category=pokemon",
    bg: "#FFDE00",
    border: "2px solid #CC0000",
    textColor: "#1a1a1a",
    decorativo: "TCG",
    decorativoColor: "rgba(204,0,0,0.1)",
  },
  {
    key: "especiales",
    href: "/catalogo?category=especiales",
    bg: "#1a1a1a",
    border: "2px solid #FFD700",
    textColor: "#fff",
    decorativo: "★",
    decorativoColor: "rgba(255,215,0,0.08)",
  },
];

// ── Página ───────────────────────────────────────────────────────────────────

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; stock?: string; type?: string }>;
}) {
  const { category, q, sort, stock, type: pokemonType } = await searchParams;

  const validCategory = category === "diecast" || category === "pokemon" || category === "especiales" ? category : null;
  const searchQuery = (q?.trim() ?? "").replace(/[%().,]/g, "");
  const sortKey = sort === "price_asc" || sort === "price_desc" ? sort : "newest";
  const stockFilter = stock === "in" ? "in" : null;

  // ── Query con filtros acumulativos ────────────────────────────────────────
  let dbQuery = supabaseServer
    .from("products")
    .select("id,name,title,slug,price,stock,category,pokemon_type,created_at,product_images(url,sort_order)")
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
  if (pokemonType && POKEMON_TYPES_KEYS.includes(pokemonType)) {
    dbQuery = dbQuery.eq("pokemon_type", pokemonType);
  }
  if (sortKey === "price_asc") {
    dbQuery = dbQuery.order("price", { ascending: true });
  } else if (sortKey === "price_desc") {
    dbQuery = dbQuery.order("price", { ascending: false });
  } else {
    dbQuery = dbQuery.order("created_at", { ascending: false });
  }

  const { data: products, error: dbError } = await dbQuery;
  if (dbError) console.error("[catalogo] Supabase error:", dbError);

  const fetched = (products ?? []) as Product[];
  // In-stock primero, agotados al final (respetando el orden interno de cada grupo)
  const allProducts = stockFilter === "in"
    ? fetched
    : [
        ...fetched.filter((p) => (p.stock ?? 0) > 0),
        ...fetched.filter((p) => (p.stock ?? 0) === 0),
      ];

  return (
    <main
      className="min-h-screen"
      style={{ position: "relative", backgroundColor: "#e8ecf0" }}
    >
      {/* Fondo con imagen */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage: "url(/catalogo-bg.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "grayscale(20%)",
          opacity: 0.18,
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* Contenido */}
      <div className="mx-auto max-w-6xl px-6 py-12" style={{ position: "relative", zIndex: 1 }}>

        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="transition-colors hover:text-gray-700">Inicio</Link>
          <span>/</span>
          {validCategory ? (
            <>
              <Link href="/catalogo" className="transition-colors hover:text-gray-700">Catálogo</Link>
              <span>/</span>
              <span className="text-gray-600">{CATEGORY_LABELS[validCategory]}</span>
            </>
          ) : (
            <span className="text-gray-600">Catálogo</span>
          )}
        </nav>

        {/* ── Sin categoría: mostrar cards + todos los productos ── */}
        {!validCategory && (
          <>
            {/* Cards de categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {categoryCards.map((card) => (
                <Link
                  key={card.key}
                  href={card.href}
                  className="category-card-hover relative overflow-hidden rounded-xl flex items-end justify-start"
                  style={{
                    backgroundColor: card.bg,
                    border: card.border,
                    height: 160,
                    padding: "1.5rem 2rem",
                    textDecoration: "none",
                    transition: "transform 0.25s ease, box-shadow 0.25s ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 14,
                      fontWeight: 600,
                      color: card.textColor,
                    }}
                  >
                    {CATEGORY_LABELS[card.key]}
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                  <span
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-[4.5rem] font-black leading-none select-none"
                    style={{ color: card.decorativoColor }}
                  >
                    {card.decorativo}
                  </span>
                </Link>
              ))}
            </div>

            {/* Todos los productos */}
            <div className="mb-8 flex items-center gap-3">
              <div className="h-6 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
              <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                Todos los productos
              </h1>
              <span className="text-sm text-gray-400 ml-auto">
                {allProducts.length} {allProducts.length === 1 ? "producto" : "productos"}
              </span>
            </div>
          </>
        )}

        {/* ── Con categoría: título + filtros ── */}
        {validCategory && (
          <>
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
                <h1 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  {CATEGORY_LABELS[validCategory]}
                </h1>
              </div>
            </div>

            <Suspense>
              <CatalogoFilters
                category={validCategory}
                q={searchQuery}
                sort={sortKey}
                total={allProducts.length}
                pokemonType={pokemonType ?? null}
              />
            </Suspense>
          </>
        )}

        {/* Grid / Estado vacío */}
        {allProducts.length === 0 ? (
          <div className="mt-20 flex flex-col items-center gap-4 text-center">
            {dbError ? (
              <>
                <p className="text-sm font-semibold text-red-500">Error al cargar productos</p>
                <p className="font-mono text-xs text-gray-400">{dbError.message}</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No encontramos productos con esos filtros.</p>
            )}
            <Link href="/catalogo" className="text-sm font-semibold transition-colors hover:text-gray-900" style={{ color: "#C0392B" }}>
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

              const cardContent = (
                <>
                  <div className="relative overflow-hidden bg-gray-50">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={displayName}
                        width={600}
                        height={600}
                        className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                        style={!inStock ? { filter: "grayscale(100%) opacity(0.6)" } : undefined}
                      />
                    ) : (
                      <div className="aspect-square w-full bg-gray-100 flex items-center justify-center">
                        <svg className="h-10 w-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      </div>
                    )}

                    {!inStock && (
                      <>
                        <div className="absolute inset-0" style={{ backgroundColor: "rgba(100,100,100,0.35)" }} />
                        <span className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "#4b5563" }}>
                          Agotado
                        </span>
                      </>
                    )}

                    {inStock && urgencyBadge && (
                      <span className="absolute left-2 top-2 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "#C0392B" }}>
                        {urgencyBadge.label}
                      </span>
                    )}
                    {showNew && (
                      <span className="absolute left-2 top-2 rounded-full bg-gray-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                        Nuevo
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-3.5">
                    {product.category && (
                      <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                        {CATEGORY_LABELS[product.category] ?? product.category}
                      </p>
                    )}
                    <p className={`text-[13px] font-semibold leading-snug line-clamp-2 ${inStock ? "text-gray-900" : "text-gray-400"}`}>
                      {displayName}
                    </p>
                    <p className={`mt-2 text-[14px] font-medium ${inStock ? "text-gray-900" : "text-gray-400 line-through"}`}>
                      ${formatARS(product.price)}
                    </p>
                  </div>
                </>
              );

              if (!inStock) {
                return (
                  <div
                    key={product.id}
                    className="relative flex flex-col overflow-hidden rounded-xl border bg-white border-gray-100"
                    style={{ cursor: "not-allowed" }}
                  >
                    {cardContent}
                  </div>
                );
              }

              return (
                <Link
                  key={product.id}
                  href={`/p/${product.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-xl border bg-white border-gray-200 transition-transform duration-200 hover:-translate-y-1"
                >
                  {cardContent}
                </Link>
              );
            })}
          </div>
        )}

        {/* Texto SEO - al final de la página */}
        {validCategory === "pokemon" && (
          <p className="mt-16 text-sm text-gray-400 leading-relaxed max-w-2xl">
            Cartas Pokémon TCG originales de varios sets. Illustration Rare, Special Illustration Rare, Ultra Rare y más. Todas nuevas y en perfecto estado, listas para coleccionar o gradear.
          </p>
        )}
        {validCategory === "diecast" && (
          <p className="mt-16 text-sm text-gray-400 leading-relaxed max-w-2xl">
            Diecast coleccionables escala 1/64 de las mejores marcas. Hot Wheels, Micro Turbo y más. Modelos importados, originales y en blister.
          </p>
        )}
        {validCategory === "especiales" && (
          <p className="mt-16 text-sm text-gray-400 leading-relaxed max-w-2xl">
            Productos especiales y ediciones limitadas. Piezas únicas para coleccionistas que buscan algo diferente.
          </p>
        )}

      </div>
    </main>
  );
}
