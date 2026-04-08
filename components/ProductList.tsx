"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { formatARS } from "@/lib/format";
import { sortImages, sanitizeImageUrl } from "@/lib/images";

type ProductImage = {
  url: string | null;
  sort_order: number | null;
};

type Product = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  created_at: string;
  product_images?: ProductImage[];
};

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg("");

      const { data, error } = await supabase
        .from("products")
        .select("id,name,title,slug,price,stock,created_at,product_images(url,sort_order)")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) {
        setErrorMsg(error.message);
        setProducts([]);
      } else {
        setProducts((data as Product[]) ?? []);
      }

      setLoading(false);
    };

    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-zinc-800 bg-zinc-900"
          >
            <div className="aspect-[4/3] bg-zinc-800" />
            <div className="p-4 space-y-2">
              <div className="h-4 rounded bg-zinc-800" />
              <div className="h-4 w-1/2 rounded bg-zinc-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-4">
        <p className="font-medium text-zinc-300">Error cargando productos</p>
        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-zinc-800 p-3 text-sm text-zinc-400">
          {errorMsg}
        </pre>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <p className="mt-8 text-zinc-500">No hay productos todavía.</p>
    );
  }

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => {
        const displayName = p.name ?? p.title ?? "Sin nombre";
        const inStock = (p.stock ?? 0) > 0;
        const sortedImgs = sortImages(p.product_images ?? []);
        const cover = sanitizeImageUrl(sortedImgs[0]?.url ?? null);

        return (
          <Link
            key={p.id}
            href={`/p/${p.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 transition-all duration-300 hover:border-zinc-600 hover:shadow-xl hover:shadow-black/40"
          >
            {/* Imagen */}
            <div className="relative overflow-hidden bg-zinc-800">
              {cover ? (
                <Image
                  src={cover}
                  alt={displayName}
                  width={600}
                  height={450}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />
              ) : (
                <div className="aspect-[4/3] w-full bg-zinc-800 flex items-center justify-center">
                  <svg className="h-12 w-12 text-zinc-700" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                  </svg>
                </div>
              )}

              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70">
                  <span className="rounded-full border border-zinc-600 bg-zinc-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                    Sin stock
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col justify-between p-4">
              <p className="text-sm font-semibold leading-tight text-zinc-100">
                {displayName}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-base font-bold text-white">
                  ${formatARS(p.price)}
                </p>
                {inStock && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Stock
                  </span>
                )}
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
