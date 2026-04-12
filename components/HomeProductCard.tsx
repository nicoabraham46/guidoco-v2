"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/format";

const CATEGORY_LABELS: Record<string, string> = {
  diecast: "Diecast",
  pokemon: "Pokémon",
  especiales: "Especiales",
};

type Props = {
  slug: string;
  name: string;
  cover: string | null;
  price: number | null;
  category: string | null;
};

export default function HomeProductCard({ slug, name, cover, price, category }: Props) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/p/${slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        backgroundColor: "#243447",
        borderRadius: 12,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        border: hovered ? "1px solid #C0392B" : "1px solid transparent",
        transform: hovered ? "translateY(-8px)" : "translateY(0)",
        transition: "all 0.3s ease",
      }}
    >
      {/* Imagen */}
      <div style={{ position: "relative", height: 192, overflow: "hidden", flexShrink: 0 }}>
        {cover ? (
          <Image
            src={cover}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{
              objectFit: "cover",
              transform: hovered ? "scale(1.08)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", backgroundColor: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="40" height="40" style={{ color: "rgba(255,255,255,0.2)" }} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}

        {/* Overlay con "Ver producto" */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none",
        }}>
          <span style={{
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            padding: "8px 16px",
            border: "1px solid rgba(255,255,255,0.5)",
            borderRadius: 6,
          }}>
            Ver producto →
          </span>
        </div>

        {/* Badge de categoría */}
        {category && (
          <span style={{
            position: "absolute",
            top: 8,
            left: 8,
            backgroundColor: hovered ? "#C0392B" : "rgba(0,0,0,0.55)",
            backdropFilter: "blur(4px)",
            color: "#fff",
            fontSize: 10,
            fontWeight: 600,
            padding: "3px 8px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            transition: "background-color 0.3s ease",
          }}>
            {CATEGORY_LABELS[category] ?? category}
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: 12 }}>
        <p style={{ color: "#fff", fontSize: 13, fontWeight: 500, lineHeight: 1.3, marginBottom: 4, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {name}
        </p>
        <p style={{ color: "#aaa", fontSize: 12 }}>
          ${formatARS(price)}
        </p>
      </div>
    </Link>
  );
}
