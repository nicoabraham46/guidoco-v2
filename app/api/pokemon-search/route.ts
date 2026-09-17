import { NextRequest, NextResponse } from "next/server";

const POKEMONTCG_BASE_URL = "https://api.pokemontcg.io/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "sets") {
      const MAX_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const res = await fetch(`${POKEMONTCG_BASE_URL}/sets?orderBy=releaseDate`, {
          next: { revalidate: 86400 }, // cachear 24hs — los sets casi no cambian
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data);
        }
        const body = await res.text();
        console.error(
          `[pokemon-search] Error al obtener sets (intento ${attempt}/${MAX_ATTEMPTS}):`,
          res.status,
          body
        );
        if (attempt < MAX_ATTEMPTS) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }
      return NextResponse.json({ error: "Error al obtener sets" }, { status: 502 });
    }

    if (type === "cards") {
      const q = searchParams.get("q");
      if (!q) {
        return NextResponse.json({ error: "Falta el parámetro q" }, { status: 400 });
      }
      const url = `${POKEMONTCG_BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=20&orderBy=name`;
      const res = await fetch(url);
      if (!res.ok) {
        const body = await res.text();
        console.error("[pokemon-search] Error al buscar cartas:", res.status, body);
        return NextResponse.json({ error: "Error al buscar cartas" }, { status: 502 });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    return NextResponse.json({ error: "Parámetro type inválido" }, { status: 400 });
  } catch (err) {
    console.error("[pokemon-search] Error:", err);
    return NextResponse.json({ error: "Error al conectar con la API de Pokémon TCG" }, { status: 500 });
  }
}
