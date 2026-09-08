import { NextRequest, NextResponse } from "next/server";

const POKEMONTCG_BASE_URL = "https://api.pokemontcg.io/v2";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "sets") {
      const res = await fetch(`${POKEMONTCG_BASE_URL}/sets?orderBy=releaseDate`);
      if (!res.ok) {
        return NextResponse.json({ error: "Error al obtener sets" }, { status: 502 });
      }
      const data = await res.json();
      return NextResponse.json(data);
    }

    if (type === "cards") {
      const q = searchParams.get("q");
      if (!q) {
        return NextResponse.json({ error: "Falta el parámetro q" }, { status: 400 });
      }
      const url = `${POKEMONTCG_BASE_URL}/cards?q=${encodeURIComponent(q)}&pageSize=20&orderBy=name`;
      const res = await fetch(url);
      if (!res.ok) {
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
