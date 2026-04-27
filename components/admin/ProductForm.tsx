"use client";

import Link from "next/link";
import CategorySelect from "./CategorySelect";
import RaritySelect from "./RaritySelect";
import PokemonTypeSelect from "./PokemonTypeSelect";

type DefaultValues = {
  id?: string;
  title?: string;
  slug?: string;
  price?: number | null;
  stock?: number | null;
  description?: string | null;
  category?: string | null;
  rarity?: string | null;
  set_name?: string | null;
  pokemon_type?: string | null;
  year?: number | null;
};

type Props = {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: DefaultValues;
  submitLabel: string;
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 44,
  border: "1px solid #e0e0e0",
  borderRadius: 8,
  padding: "0 12px",
  fontSize: 14,
  color: "#1a1a1a",
  backgroundColor: "#fff",
  outline: "none",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  color: "#555",
  marginBottom: 6,
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 12,
  border: "0.5px solid #e0e0e0",
  padding: 24,
  marginBottom: 16,
};

const cardTitleStyle: React.CSSProperties = {
  fontSize: 14,
  fontWeight: 500,
  color: "#333",
  marginBottom: 20,
};

function focusRed(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "#C0392B";
}
function blurGray(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.style.borderColor = "#e0e0e0";
}

export default function ProductForm({ action, defaultValues = {}, submitLabel }: Props) {
  return (
    <form action={action}>
      {defaultValues.id && (
        <input type="hidden" name="id" value={defaultValues.id} />
      )}

      {/* Card 1 — Información principal */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>📝 Información del producto</p>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="title" style={labelStyle}>Título *</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={defaultValues.title ?? ""}
            style={inputStyle}
            onFocus={focusRed}
            onBlur={blurGray}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="slug" style={labelStyle}>Slug *</label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={defaultValues.slug ?? ""}
            style={inputStyle}
            onFocus={focusRed}
            onBlur={blurGray}
          />
          <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>URL amigable (ej: mi-producto)</p>
        </div>

        <div>
          <label htmlFor="description" style={labelStyle}>Descripción</label>
          <textarea
            id="description"
            name="description"
            defaultValue={defaultValues.description ?? ""}
            style={{
              ...inputStyle,
              height: 120,
              padding: "10px 12px",
              resize: "vertical",
              lineHeight: 1.5,
            }}
            onFocus={focusRed}
            onBlur={blurGray}
          />
        </div>
      </div>

      {/* Card 2 — Precio y stock */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>💰 Precio y disponibilidad</p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div>
            <label htmlFor="price" style={labelStyle}>Precio *</label>
            <div style={{ position: "relative" }}>
              <span style={{
                position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                fontSize: 14, color: "#888", pointerEvents: "none",
              }}>$</span>
              <input
                type="number"
                id="price"
                name="price"
                step="0.01"
                required
                defaultValue={defaultValues.price ?? 0}
                style={{ ...inputStyle, paddingLeft: 24 }}
                onFocus={focusRed}
                onBlur={blurGray}
              />
            </div>
          </div>

          <div>
            <label htmlFor="stock" style={labelStyle}>Stock *</label>
            <input
              type="number"
              id="stock"
              name="stock"
              required
              defaultValue={defaultValues.stock ?? 0}
              style={inputStyle}
              onFocus={focusRed}
              onBlur={blurGray}
            />
          </div>
        </div>
      </div>

      {/* Card 3 — Categoría */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>🏷️ Categoría</p>
        <label htmlFor="category" style={labelStyle}>Categoría del producto</label>
        <CategorySelect defaultValue={defaultValues.category ?? ""} />
      </div>

      {/* Card 4 — Rareza (solo Pokémon) */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>⭐ Rareza de carta</p>
        <label style={labelStyle}>Rareza (solo para cartas Pokémon)</label>
        <RaritySelect defaultValue={defaultValues.rarity ?? ""} />
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
          Dejá vacío si no es una carta Pokémon
        </p>
      </div>

      {/* Card 5 — Set */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>🃏 Set de la carta</p>
        <label htmlFor="set_name" style={labelStyle}>Nombre del Set (solo para cartas Pokémon)</label>
        <input
          type="text"
          id="set_name"
          name="set_name"
          defaultValue={defaultValues.set_name ?? ""}
          placeholder='Ej: Ascended Heroes 2026'
          style={inputStyle}
          onFocus={focusRed}
          onBlur={blurGray}
        />
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
          Dejá vacío si no es una carta Pokémon
        </p>
      </div>

      {/* Card — Año */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>📅 Año de la carta</p>
        <label htmlFor="year" style={labelStyle}>Año (solo para cartas Pokémon)</label>
        <input
          type="number"
          id="year"
          name="year"
          defaultValue={defaultValues.year ?? ""}
          placeholder="Ej: 2025"
          min="1996"
          max="2030"
          style={inputStyle}
          onFocus={focusRed}
          onBlur={blurGray}
        />
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
          Dejá vacío si no es una carta Pokémon
        </p>
      </div>

      {/* Card 6 — Tipo de Pokémon */}
      <div style={cardStyle}>
        <p style={cardTitleStyle}>⚡ Tipo de Pokémon</p>
        <label style={labelStyle}>Tipo de energía (solo para cartas Pokémon)</label>
        <PokemonTypeSelect defaultValue={defaultValues.pokemon_type ?? ""} />
        <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>
          Dejá vacío si no es una carta Pokémon
        </p>
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
        <button
          type="submit"
          style={{
            flex: 1,
            height: 48,
            backgroundColor: "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          {submitLabel}
        </button>
        <Link
          href="/admin"
          style={{
            flex: 1,
            height: 48,
            backgroundColor: "#fff",
            color: "#333",
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textDecoration: "none",
          }}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
