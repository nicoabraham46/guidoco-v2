"use client";

import { useState } from "react";
import Image from "next/image";

type PokemonCard = {
  id: string;
  name: string;
  number: string;
  set: { name: string; printedTotal?: number; total?: number };
  rarity?: string;
  images: { small: string; large?: string };
};

type ApiResponse = {
  data: PokemonCard[];
};

function sanitizeNumber(raw: string): { number: string; total?: string } {
  const parts = raw.trim().split("/");
  return { number: parts[0].trim(), total: parts[1]?.trim() };
}

function buildQuery(name: string, number: string): string {
  const parts: string[] = [];
  if (name.trim()) parts.push(`name:"${name.trim()}*"`);
  if (number.trim()) {
    const { number: num } = sanitizeNumber(number);
    parts.push(`number:${num}`);
  }
  return parts.join(" ");
}

export default function ValorarCartaPage() {
  const [nameInput, setNameInput] = useState("");
  const [numberInput, setNumberInput] = useState("");
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim() && !numberInput.trim()) return;

    setStatus("loading");
    setResults([]);

    try {
      const q = buildQuery(nameInput, numberInput);
      const res = await fetch(
        `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=12`
      );
      if (!res.ok) throw new Error("API error");
      const json: ApiResponse = await res.json();
      setResults(json.data ?? []);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  const tcgUrl = (name: string) =>
    `https://www.tcgplayer.com/search/pokemon/product?q=${encodeURIComponent(name)}`;
  const cmUrl = (name: string) =>
    `https://www.cardmarket.com/es/Pokemon/Products/Search?searchString=${encodeURIComponent(name)}`;

  return (
    <main style={{ backgroundColor: "#e8ecf0", minHeight: "100vh", padding: "40px 24px 80px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 8 }}>
          <div style={{ width: 4, height: 42, backgroundColor: "#C0392B", borderRadius: 2, flexShrink: 0, marginTop: 4 }} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Valorá tu carta Pokémon</h1>
            <p style={{ fontSize: 14, color: "#888", marginTop: 6 }}>
              Buscá tu carta y consultá su precio en el mercado internacional
            </p>
          </div>
        </div>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          style={{
            backgroundColor: "#fff",
            borderRadius: 12,
            border: "0.5px solid #e0e0e0",
            padding: 24,
            marginTop: 28,
            marginBottom: 32,
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="sm:grid-cols-2 grid-cols-1">
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6 }}>
                Nombre de la carta
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Ej: Charizard, Pikachu, Mewtwo..."
                style={{
                  width: "100%",
                  height: 48,
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: "0 14px",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6 }}>
                Número de carta
              </label>
              <input
                type="text"
                value={numberInput}
                onChange={(e) => setNumberInput(e.target.value)}
                placeholder="Ej: 025/102, 006/102..."
                style={{
                  width: "100%",
                  height: 48,
                  border: "1px solid #e0e0e0",
                  borderRadius: 8,
                  padding: "0 14px",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                  backgroundColor: "#fafafa",
                }}
              />
            </div>
          </div>

          <p style={{ fontSize: 12, color: "#bbb", marginTop: 10 }}>
            Podés buscar solo por nombre, solo por número, o por ambos.
          </p>

          <button
            type="submit"
            disabled={status === "loading" || (!nameInput.trim() && !numberInput.trim())}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 32px",
              backgroundColor: "#C0392B",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: status === "loading" || (!nameInput.trim() && !numberInput.trim()) ? 0.6 : 1,
            }}
          >
            {status === "loading" ? "Buscando..." : "Buscar"}
          </button>
        </form>

        {/* Estados */}
        {status === "error" && (
          <p style={{ textAlign: "center", color: "#C0392B", fontSize: 14 }}>
            Error al buscar. Intentá de nuevo.
          </p>
        )}

        {status === "done" && results.length === 0 && (
          <p style={{ textAlign: "center", color: "#888", fontSize: 14 }}>
            No encontramos cartas con ese nombre o número.
          </p>
        )}

        {/* Resultados */}
        {results.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {results.map((card) => {
              const setTotal = card.set.printedTotal ?? card.set.total;
              const cardNumber = setTotal ? `${card.number}/${setTotal}` : card.number;

              return (
                <div
                  key={card.id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: 12,
                    border: "0.5px solid #e0e0e0",
                    padding: 16,
                    display: "flex",
                    gap: 16,
                    alignItems: "flex-start",
                  }}
                >
                  {/* Imagen */}
                  <div style={{ flexShrink: 0 }}>
                    <Image
                      src={card.images.small}
                      alt={card.name}
                      width={80}
                      height={112}
                      style={{ borderRadius: 6, objectFit: "contain" }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", marginBottom: 4 }}>
                      {card.name}
                    </p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", marginBottom: 8 }}>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        <span style={{ color: "#aaa" }}>Número: </span>{cardNumber}
                      </span>
                      <span style={{ fontSize: 13, color: "#555" }}>
                        <span style={{ color: "#aaa" }}>Set: </span>{card.set.name}
                      </span>
                      {card.rarity && (
                        <span style={{ fontSize: 13, color: "#555" }}>
                          <span style={{ color: "#aaa" }}>Rareza: </span>
                          <span>⬦ {card.rarity}</span>
                        </span>
                      )}
                    </div>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      <a
                        href={tcgUrl(card.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          height: 36,
                          padding: "0 14px",
                          backgroundColor: "#1a1a1a",
                          color: "#fff",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        TCGPlayer →
                      </a>
                      <a
                        href={cmUrl(card.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          height: 36,
                          padding: "0 14px",
                          backgroundColor: "#fff",
                          color: "#1a1a1a",
                          border: "1px solid #e0e0e0",
                          borderRadius: 6,
                          fontSize: 12,
                          fontWeight: 600,
                          textDecoration: "none",
                        }}
                      >
                        CardMarket →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
