// components/RarityBadge.tsx
type RarityInfo = {
  key: string;
  name: string;
  nameEs: string;
  stars: number;
  starColor: string;
  symbol: "circle" | "diamond" | "star" | "shiny" | "promo" | "ace";
};

export const RARITIES: RarityInfo[] = [
  { key: "C", name: "Common", nameEs: "Común", stars: 0, starColor: "#1a1a1a", symbol: "circle" },
  { key: "U", name: "Uncommon", nameEs: "Poco Común", stars: 0, starColor: "#1a1a1a", symbol: "diamond" },
  { key: "R", name: "Rare", nameEs: "Rara", stars: 1, starColor: "#1a1a1a", symbol: "star" },
  { key: "RR", name: "Double Rare", nameEs: "Doble Rara", stars: 2, starColor: "#1a1a1a", symbol: "star" },
  { key: "AR", name: "Illustration Rare", nameEs: "Ilustración Rara", stars: 1, starColor: "#DAA520", symbol: "star" },
  { key: "SR", name: "Ultra Rare", nameEs: "Ultra Rara", stars: 2, starColor: "#C0C0C0", symbol: "star" },
  { key: "SIR", name: "Special Illustration Rare", nameEs: "Ilustración Especial Rara", stars: 2, starColor: "#DAA520", symbol: "star" },
  { key: "UR", name: "Hyper Rare", nameEs: "Hiper Rara", stars: 3, starColor: "#DAA520", symbol: "star" },
  { key: "SAR", name: "Special Art Rare", nameEs: "Arte Especial Rara", stars: 2, starColor: "#DAA520", symbol: "star" },
  { key: "S", name: "Shiny Rare", nameEs: "Shiny Rara", stars: 1, starColor: "#1a1a1a", symbol: "shiny" },
  { key: "PROMO", name: "Promo", nameEs: "Promocional", stars: 0, starColor: "#1a1a1a", symbol: "promo" },
  { key: "ACE", name: "Ace Spec", nameEs: "Ace Spec", stars: 0, starColor: "#1a1a1a", symbol: "ace" },
];

export function getRarityInfo(key: string | null | undefined): RarityInfo | null {
  if (!key) return null;
  return RARITIES.find((r) => r.key === key) ?? null;
}

function StarIcon({ color, size = 16 }: { color: string; size?: number }) {
  const isGold = color === "#DAA520";
  const isSilver = color === "#C0C0C0";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z"
        fill={color}
        stroke={isGold ? "#B8860B" : isSilver ? "#999" : "#111"}
        strokeWidth="0.5"
      />
      {isGold && (
        <path
          d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z"
          fill="#FFD700"
          opacity="0.45"
        />
      )}
      {isSilver && (
        <path
          d="M12 5L13.8 9.2L18.4 9.7L15 12.8L15.9 17.3L12 15L8.1 17.3L9 12.8L5.6 9.7L10.2 9.2L12 5Z"
          fill="#E8E8E8"
          opacity="0.45"
        />
      )}
    </svg>
  );
}

export function RaritySymbol({ rarityKey, size = 16 }: { rarityKey: string; size?: number }) {
  const rarity = getRarityInfo(rarityKey);
  if (!rarity) return null;

  if (rarity.symbol === "circle") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="7" fill="#1a1a1a" />
      </svg>
    );
  }

  if (rarity.symbol === "diamond") {
    return (
      <svg width={size} height={size} viewBox="0 0 20 20">
        <path d="M10 2L18 10L10 18L2 10Z" fill="#1a1a1a" />
      </svg>
    );
  }

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

  if (rarity.symbol === "ace") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <polygon points="12,1 15,9 23,9 17,14 19,22 12,17 5,22 7,14 1,9 9,9" fill="none" stroke="#1a1a1a" strokeWidth="2" />
        <text x="12" y="15" textAnchor="middle" fontFamily="Arial, sans-serif" fontSize="7" fontWeight="bold" fill="#1a1a1a">A</text>
      </svg>
    );
  }

  if (rarity.symbol === "shiny") {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24">
        <path d="M12 2L14.9 8.6L22 9.3L16.8 14L18.2 21L12 17.3L5.8 21L7.2 14L2 9.3L9.1 8.6L12 2Z" fill="#1a1a1a" />
        <circle cx="17" cy="5" r="2.5" fill="#FFD700" stroke="#B8860B" strokeWidth="0.5" />
        <path d="M15.5 5L17 3.5L18.5 5L17 6.5Z" fill="white" opacity="0.6" />
      </svg>
    );
  }

  // star symbol — render N stars
  const stars = [];
  for (let i = 0; i < rarity.stars; i++) {
    stars.push(<StarIcon key={i} color={rarity.starColor} size={size} />);
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
    RR: "#f5ede0", AR: "#fff8e0", SR: "#f0f0f8",
    SIR: "#fff5d0", UR: "#fff0c0", SAR: "#fff5d0",
    S: "#f0f5ff", PROMO: "#f0f0f0", ACE: "#f8f0f8",
  };

  const borderColors: Record<string, string> = {
    C: "#ccc", U: "#9c9", R: "#c9a",
    RR: "#c9a", AR: "#DAA520", SR: "#aaa",
    SIR: "#DAA520", UR: "#DAA520", SAR: "#DAA520",
    S: "#99b", PROMO: "#999", ACE: "#a9a",
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
