// components/RarityBadge.tsx
type RarityInfo = {
  key: string;
  name: string;
  nameEs: string;
  stars: number;
  starColor: string;
  symbol: "circle" | "diamond" | "star" | "promo" | "ultra_rare" | "mega_attack" | "mega_hyper" | "square_empty" | "square_foil" | "square_parallel";
};

export const RARITIES: RarityInfo[] = [
  { key: "C", name: "Common", nameEs: "Común", stars: 0, starColor: "#1a1a1a", symbol: "circle" },
  { key: "U", name: "Uncommon", nameEs: "Poco Común", stars: 0, starColor: "#1a1a1a", symbol: "diamond" },
  { key: "R", name: "Rare", nameEs: "Rara", stars: 1, starColor: "#1a1a1a", symbol: "star" },
  { key: "RR", name: "Double Rare", nameEs: "Doble Rara", stars: 2, starColor: "#1a1a1a", symbol: "star" },
  { key: "UR", name: "Ultra Rare", nameEs: "Ultra Rara", stars: 0, starColor: "#1a1a1a", symbol: "ultra_rare" },
  { key: "IR", name: "Illustration Rare", nameEs: "Ilustración Rara", stars: 1, starColor: "#DAA520", symbol: "star" },
  { key: "SIR", name: "Special Illustration Rare", nameEs: "Ilustración Especial Rara", stars: 2, starColor: "#DAA520", symbol: "star" },
  { key: "MAR", name: "Mega Attack Rare", nameEs: "Mega Ataque Rara", stars: 0, starColor: "#1a1a1a", symbol: "mega_attack" },
  { key: "MHR", name: "Mega Hyper Rare", nameEs: "Mega Hiper Rara", stars: 0, starColor: "#1a1a1a", symbol: "mega_hyper" },
  { key: "SS", name: "Standard Set", nameEs: "Set Estándar", stars: 0, starColor: "#1a1a1a", symbol: "square_empty" },
  { key: "SSF", name: "Standard Set Foil", nameEs: "Set Estándar Foil", stars: 0, starColor: "#1a1a1a", symbol: "square_foil" },
  { key: "PS", name: "Parallel Set", nameEs: "Set Paralelo", stars: 0, starColor: "#1a1a1a", symbol: "square_parallel" },
  { key: "PROMO", name: "Promo", nameEs: "Promocional", stars: 0, starColor: "#1a1a1a", symbol: "promo" },
];

export function getRarityInfo(key: string | null | undefined): RarityInfo | null {
  if (!key) return null;
  return RARITIES.find((r) => r.key === key) ?? null;
}

export function RaritySymbol({ rarityKey, size = 16 }: { rarityKey: string; size?: number }) {
  const rarity = getRarityInfo(rarityKey);
  if (!rarity) return null;

  // ● Common
  if (rarity.symbol === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="7" fill="#1a1a1a" />
      </svg>
    );
  }

  // ◆ Uncommon
  if (rarity.symbol === "diamond") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <path d="M10 2L18 10L10 18L2 10Z" fill="#1a1a1a" />
      </svg>
    );
  }

  // □ Standard Set (cuadrado vacío negro)
  if (rarity.symbol === "square_empty") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" fill="none" stroke="#1a1a1a" strokeWidth="2" />
      </svg>
    );
  }

  // □ Standard Set Foil (cuadrado vacío rojo/rosa)
  if (rarity.symbol === "square_foil") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" fill="none" stroke="#C0392B" strokeWidth="2" />
      </svg>
    );
  }

  // □ Parallel Set (cuadrado vacío gris)
  if (rarity.symbol === "square_parallel") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <rect x="3" y="3" width="14" height="14" fill="none" stroke="#888" strokeWidth="2" />
      </svg>
    );
  }

  // ★☆ Ultra Rare (una estrella negra + una estrella gris outline)
  if (rarity.symbol === "ultra_rare") {
    return (
      <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#1a1a1a" stroke="#111" strokeWidth="0.5" />
        </svg>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#C0C0C0" stroke="#999" strokeWidth="0.5" />
          <path d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z" fill="#E8E8E8" opacity="0.45" />
        </svg>
      </span>
    );
  }

  // ★☆ Mega Attack Rare (estrella rosa + estrella verde)
  if (rarity.symbol === "mega_attack") {
    return (
      <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#E891B9" stroke="#D4789F" strokeWidth="0.5" />
          <path d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z" fill="#F5B8D0" opacity="0.4" />
        </svg>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#7DC47D" stroke="#5EA65E" strokeWidth="0.5" />
          <path d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z" fill="#A8D8A8" opacity="0.4" />
        </svg>
      </span>
    );
  }

  // ◇ Mega Hyper Rare (rombo dorado con brillo)
  if (rarity.symbol === "mega_hyper") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <path d="M10 1L19 10L10 19L1 10Z" fill="#DAA520" stroke="#B8860B" strokeWidth="0.8" />
        <path d="M10 4L16 10L10 16L4 10Z" fill="#FFD700" opacity="0.4" />
        <path d="M10 7L13 10L10 13L7 10Z" fill="#FFF8DC" opacity="0.5" />
      </svg>
    );
  }

  // PROMO
  if (rarity.symbol === "promo") {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
        <svg width={size} height={size} viewBox="0 0 24 24">
          <path d="M12 2L14.5 8L21 8.7L16 13.2L17.4 20L12 16.8L6.6 20L8 13.2L3 8.7L9.5 8L12 2Z" fill="#1a1a1a" />
        </svg>
        <span style={{ fontSize: size * 0.55, fontWeight: 800, color: "#1a1a1a", letterSpacing: 0.5 }}>PROMO</span>
      </span>
    );
  }

  // Star symbols (R, RR, IR, SIR) — render N stars con el color correspondiente
  const stars = [];
  for (let i = 0; i < rarity.stars; i++) {
    const isGold = rarity.starColor === "#DAA520";
    stars.push(
      <svg key={i} width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
          fill={rarity.starColor}
          stroke={isGold ? "#B8860B" : "#111"}
          strokeWidth="0.5"
        />
        {isGold && (
          <path
            d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z"
            fill="#FFD700"
            opacity="0.45"
          />
        )}
      </svg>
    );
  }
  return <span style={{ display: "inline-flex", gap: 1, alignItems: "center" }}>{stars}</span>;
}

export default function RarityBadge({
  rarityKey,
  size = 16,
}: {
  rarityKey: string | null | undefined;
  size?: number;
}) {
  const rarity = getRarityInfo(rarityKey);
  if (!rarity) return null;

  const bgColors: Record<string, string> = {
    C: "#f0f0f0", U: "#e8f0e8", R: "#f5f0e0",
    RR: "#f5ede0", UR: "#f0f0f8", IR: "#fff8e0",
    SIR: "#fff5d0", MAR: "#fdf0f5", MHR: "#fff8e0",
    SS: "#f5f5f5", SSF: "#fef2f2", PS: "#f5f5f5",
    PROMO: "#f0f0f0",
  };

  const borderColors: Record<string, string> = {
    C: "#ccc", U: "#9c9", R: "#c9a",
    RR: "#c9a", UR: "#aaa", IR: "#DAA520",
    SIR: "#DAA520", MAR: "#E891B9", MHR: "#DAA520",
    SS: "#ccc", SSF: "#C0392B", PS: "#aaa",
    PROMO: "#999",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "4px 10px",
        borderRadius: 6,
        background: bgColors[rarity.key] || "#f5f5f5",
        border: `1.5px solid ${borderColors[rarity.key] || "#ddd"}`,
        fontSize: 13,
        fontWeight: 600,
        color: "#1a1a1a",
        lineHeight: 1,
      }}
    >
      <RaritySymbol rarityKey={rarity.key} size={size} />
      <span style={{ letterSpacing: 0.5 }}>{rarity.key}</span>
    </span>
  );
}
