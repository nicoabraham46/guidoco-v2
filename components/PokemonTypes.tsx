import type { JSX } from "react";

export const POKEMON_TYPES = [
  { key: "fire", name: "Fire", nameEs: "Fuego", color: "#E74C3C", bgColor: "#FDEDEC" },
  { key: "water", name: "Water", nameEs: "Agua", color: "#2E86C1", bgColor: "#EBF5FB" },
  { key: "grass", name: "Grass", nameEs: "Planta", color: "#27AE60", bgColor: "#EAFAF1" },
  { key: "electric", name: "Electric", nameEs: "Eléctrico", color: "#C8A415", bgColor: "#FEF9E7" },
  { key: "psychic", name: "Psychic", nameEs: "Psíquico", color: "#8E44AD", bgColor: "#F5EEF8" },
  { key: "fighting", name: "Fighting", nameEs: "Lucha", color: "#BA4A00", bgColor: "#F6DDCC" },
  { key: "colorless", name: "Colorless", nameEs: "Incoloro", color: "#888888", bgColor: "#F2F3F4" },
  { key: "metal", name: "Metal", nameEs: "Metal", color: "#717D7E", bgColor: "#EAEDED" },
  { key: "dark", name: "Dark", nameEs: "Oscuridad", color: "#2C3E50", bgColor: "#EAECEE" },
  { key: "dragon", name: "Dragon", nameEs: "Dragón", color: "#B8860B", bgColor: "#FEF5E7" },
  { key: "fairy", name: "Fairy", nameEs: "Hada", color: "#E91E8C", bgColor: "#FDECF4" },
];

export function getPokemonType(key: string | null | undefined) {
  if (!key) return null;
  return POKEMON_TYPES.find((t) => t.key === key) ?? null;
}

export function PokemonTypeIcon({ typeKey, size = 20 }: { typeKey: string; size?: number }) {
  const type = getPokemonType(typeKey);
  if (!type) return null;

  const iconSize = size * 0.55;

  const icons: Record<string, JSX.Element> = {
    fire: (
      <path d="M12 2c0 4-3 6-3 9a3 3 0 006 0c0-1-.5-2-1-3 1 2 2 3 2 5a5 5 0 01-10 0c0-4 3-7 4-9 0-1 1-2 2-2z" fill="#fff" />
    ),
    water: (
      <path d="M12 3C9 8 6 11 6 14a6 6 0 0012 0c0-3-3-6-6-11z" fill="#fff" />
    ),
    grass: (
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66C7.72 17.14 9 13 17 12V15l5-5-5-5v3z" fill="#fff" />
    ),
    electric: (
      <path d="M13 2L3 14h7l-2 8 10-12h-7l2-8z" fill="#fff" />
    ),
    psychic: (
      <circle cx="12" cy="12" r="5" fill="none" stroke="#fff" strokeWidth="2" />
    ),
    fighting: (
      <path d="M7 20h4V4H7v16zm6 0h4V8h-4v12z" fill="#fff" />
    ),
    colorless: (
      <circle cx="12" cy="12" r="4" fill="none" stroke="#fff" strokeWidth="2" />
    ),
    metal: (
      <path d="M12 2L2 12l10 10 10-10L12 2zm0 4l6 6-6 6-6-6 6-6z" fill="#fff" />
    ),
    dark: (
      <path d="M12 2A10 10 0 002 12a10 10 0 0010 10 10 10 0 000-20zm0 18a8 8 0 01-3-15.4A10 10 0 0012 20z" fill="#fff" />
    ),
    dragon: (
      <path d="M12 2L8 8l-6 2 4 4-2 6 6-2 6 2-2-6 4-4-6-2-4-6z" fill="#fff" />
    ),
    fairy: (
      <path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8L12 2z" fill="#fff" />
    ),
  };

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: type.color,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
        {icons[typeKey] ?? <circle cx="12" cy="12" r="4" fill="#fff" />}
      </svg>
    </div>
  );
}

export function PokemonTypeBadge({ typeKey, size = 18 }: { typeKey: string; size?: number }) {
  const type = getPokemonType(typeKey);
  if (!type) return null;

  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      padding: "3px 10px",
      borderRadius: 20,
      backgroundColor: type.bgColor,
      border: `1px solid ${type.color}30`,
      fontSize: 12,
      fontWeight: 600,
      color: type.color,
    }}>
      <PokemonTypeIcon typeKey={typeKey} size={size} />
      {type.nameEs}
    </span>
  );
}
