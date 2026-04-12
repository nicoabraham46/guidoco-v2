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
  return (
    <Link
      href={`/p/${slug}`}
      className="group block rounded-xl overflow-hidden"
      style={{ backgroundColor: "#243447" }}
    >
      {/* Imagen */}
      <div className="relative overflow-hidden">
        {cover ? (
          <Image
            src={cover}
            alt={name}
            width={600}
            height={600}
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="w-full h-48 flex items-center justify-center" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            <svg width="40" height="40" style={{ color: "rgba(255,255,255,0.2)" }} fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
            </svg>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
          <span className="text-white text-sm font-medium border border-white/70 px-4 py-2 rounded-lg">
            Ver producto →
          </span>
        </div>

        {/* Badge de categoría */}
        {category && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full"
            style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
          >
            {CATEGORY_LABELS[category] ?? category}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3 transition-transform duration-300 group-hover:-translate-y-1">
        <p className="text-white text-[13px] font-medium leading-snug line-clamp-2 mb-1">
          {name}
        </p>
        <p className="text-[12px]" style={{ color: "#aaa" }}>
          ${formatARS(price)}
        </p>
      </div>
    </Link>
  );
}
