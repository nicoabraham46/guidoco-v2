import type { ComponentType, JSX } from "react";
import { Flame, Droplet, Leaf, Zap, Eye, Shield, Moon, Asterisk, Sparkles } from "lucide-react";

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

// Ícono propio de guante de boxeo para el tipo Lucha (sin depender de ninguna librería).
function FightingIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={color} aria-hidden="true">
      <circle cx="6" cy="9" r="3" />
      <path d="M8 3a6 6 0 0 0-6 6v3a8 8 0 0 0 8 8h1a8 8 0 0 0 8-8V9a2 2 0 0 0-2-2h-1a4 4 0 0 0-4-4H8z" />
      <rect x="6" y="18" width="10" height="4" rx="1" />
    </svg>
  );
}

// Ícono de garra para el tipo Dragón, aplicado como máscara CSS para poder pintarlo del color del tipo.
// Claw icon by sbed (opengameart.org/content/95-game-icons), CC BY 3.0, via game-icons.net.
function DragonIcon({ size, color }: { size: number; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        backgroundColor: color,
        WebkitMaskImage: "url(/icons/claw.svg)",
        maskImage: "url(/icons/claw.svg)",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

const LUCIDE_ICONS: Record<string, ComponentType<{ size?: number; color?: string }>> = {
  fire: Flame,
  water: Droplet,
  grass: Leaf,
  electric: Zap,
  psychic: Eye,
  metal: Shield,
  dark: Moon,
  colorless: Asterisk,
  fairy: Sparkles,
};

export function PokemonTypeIcon({ typeKey, size = 20 }: { typeKey: string; size?: number }) {
  const type = getPokemonType(typeKey);
  if (!type) return null;

  const iconSize = size * 0.55;

  let icon: JSX.Element;
  if (typeKey === "fighting") {
    icon = <FightingIcon size={iconSize} color={type.color} />;
  } else if (typeKey === "dragon") {
    icon = <DragonIcon size={iconSize} color={type.color} />;
  } else {
    const LucideIcon = LUCIDE_ICONS[typeKey] ?? Asterisk;
    icon = <LucideIcon size={iconSize} color={type.color} />;
  }

  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: "50%",
      backgroundColor: type.bgColor,
      border: `1px solid ${type.color}30`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      {icon}
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
