"use client";

import { useState, useEffect } from "react";

type PokemonCard = {
  id: string;
  name: string;
  number: string;
  set: { name: string; printedTotal?: number; total?: number };
  rarity?: string;
  images: { small: string };
};

type PokemonSet = {
  id: string;
  name: string;
  releaseDate: string;
};

export default function ValorarCartaPage() {
  const [input, setInput] = useState("");
  const [selectedSet, setSelectedSet] = useState("");
  const [sets, setSets] = useState<PokemonSet[]>([]);
  const [results, setResults] = useState<PokemonCard[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  // Cargar sets al montar
  useEffect(() => {
    fetch("https://api.pokemontcg.io/v2/sets?orderBy=releaseDate")
      .then((r) => r.json())
      .then((json) => {
        const sorted = (json.data ?? []) as PokemonSet[];
        setSets(sorted.reverse()); // más recientes primero
      })
      .catch(() => {});
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setStatus("loading");
    setResults([]);

    try {
      const parts: string[] = [`name:"*${input.trim()}*"`];
      if (selectedSet) parts.push(`set.id:${selectedSet}`);

      const q = parts.join(" ");
      const url = `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(q)}&pageSize=20&orderBy=name`;
      console.log("[valorar-carta] URL:", url);

      const res = await fetch(url);
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
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
          {/* Nombre */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6 }}>
              Nombre de la carta
            </label>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ej: Gengar, Charizard, Pikachu..."
              className="search-input"
              style={{
                width: "100%",
                height: 48,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "0 14px",
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
                backgroundColor: "#fff",
                color: "#1a1a1a",
              }}
            />
          </div>

          {/* Set */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, color: "#555", marginBottom: 6 }}>
              Expansión (opcional)
            </label>
            <select
              value={selectedSet}
              onChange={(e) => setSelectedSet(e.target.value)}
              style={{
                width: "100%",
                height: 48,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "0 14px",
                fontSize: 14,
                outline: "none",
                backgroundColor: "#fff",
                color: "#1a1a1a",
                cursor: "pointer",
              }}
            >
              <option value="">Todos los sets</option>
              {sets.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <p style={{ fontSize: 12, color: "#bbb", marginBottom: 14 }}>
            💡 Tip: buscá por nombre y filtrá por expansión para encontrar tu carta exacta
          </p>

          <button
            type="submit"
            disabled={status === "loading" || !input.trim()}
            style={{
              height: 48,
              padding: "0 32px",
              backgroundColor: "#C0392B",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              opacity: status === "loading" || !input.trim() ? 0.6 : 1,
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
            No encontramos cartas con ese nombre.
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
                  <img
                    src={card.images.small}
                    alt={card.name}
                    width={80}
                    height={112}
                    style={{ borderRadius: 6, objectFit: "contain", flexShrink: 0 }}
                  />

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
                          <span style={{ color: "#aaa" }}>Rareza: </span>⬦ {card.rarity}
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
