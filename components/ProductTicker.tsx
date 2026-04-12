"use client";

import Link from "next/link";
import Image from "next/image";
import { sanitizeImageUrl, sortImages } from "@/lib/images";
import { formatARS } from "@/lib/format";

type TickerProduct = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  product_images?: { url: string | null; sort_order: number | null }[];
};

export default function ProductTicker({ products }: { products: TickerProduct[] }) {
  if (products.length === 0) return null;

  const track = [...products, ...products];

  return (
    <div className="overflow-hidden" style={{ paddingBlock: "20px" }}>
      <div className="product-ticker-track flex shrink-0 items-center whitespace-nowrap">
        {track.map((product, idx) => {
          const name = product.name ?? product.title ?? "Sin nombre";
          const sorted = sortImages(product.product_images ?? []);
          const cover = sanitizeImageUrl(sorted[0]?.url ?? null);

          return (
            <span key={`${product.id}-${idx}`} className="flex items-center">
              <Link
                href={`/p/${product.slug}`}
                className="flex items-center gap-3 rounded-lg px-4 py-2 transition-opacity hover:opacity-70"
                style={{ textDecoration: "none" }}
              >
                {cover ? (
                  <Image
                    src={cover}
                    alt={name}
                    width={60}
                    height={60}
                    style={{ borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                  />
                ) : (
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 8,
                      backgroundColor: "rgba(255,255,255,0.08)",
                      flexShrink: 0,
                    }}
                  />
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.3 }}>
                    {name}
                  </span>
                  <span style={{ color: "#aaa", fontSize: 12 }}>
                    ${formatARS(product.price)}
                  </span>
                </div>
              </Link>
              <span style={{ color: "#C0392B", fontSize: 18, paddingInline: 8, userSelect: "none" }}>
                ·
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
