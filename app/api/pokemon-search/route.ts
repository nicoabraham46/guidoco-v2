import { NextRequest, NextResponse } from "next/server";

const TCGDEX_BASE_URL = "https://api.tcgdex.net/v2/en";

type TcgdexSet = {
  id: string;
  name: string;
  logo?: string;
  symbol?: string;
  cardCount?: { total?: number; official?: number };
};

type TcgdexCardSummary = {
  id: string;
  localId: string;
  name: string;
  image?: string;
};

type TcgdexCardDetail = {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  set?: TcgdexSet;
};

// Compara localIds tolerando ceros a la izquierda (ej. "4" === "004") y
// mayúsculas/minúsculas en ids alfanuméricos (ej. "sm247" === "SM247").
function normalizeLocalId(id: string): string {
  const trimmed = id.trim();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed.toUpperCase();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");

  try {
    if (type === "sets") {
      const MAX_ATTEMPTS = 3;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const res = await fetch(`${TCGDEX_BASE_URL}/sets?sort:field=name`, {
          next: { revalidate: 86400 }, // cachear 24hs — los sets casi no cambian
        });
        if (res.ok) {
          const data = (await res.json()) as TcgdexSet[];
          return NextResponse.json({ data });
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
      const rawNumber = searchParams.get("number");
      const setId = searchParams.get("setId");

      // Si el usuario escribió "4/102", separamos localId ("4") de total ("102").
      const localId = rawNumber ? rawNumber.split("/")[0].trim() : "";
      const totalFilter = rawNumber && rawNumber.includes("/") ? rawNumber.split("/")[1].trim() : "";

      const searchUrl =
        `${TCGDEX_BASE_URL}/cards?name=${encodeURIComponent(q)}` +
        (localId ? `&localId=${encodeURIComponent(localId)}` : "") +
        (setId ? `&set.id=${encodeURIComponent(setId)}` : "") +
        `&pagination:itemsPerPage=20`;

      const res = await fetch(searchUrl);
      if (!res.ok) {
        const body = await res.text();
        console.error("[pokemon-search] Error al buscar cartas:", res.status, body);
        return NextResponse.json({ error: "Error al buscar cartas" }, { status: 502 });
      }
      const candidates = (await res.json()) as TcgdexCardSummary[];

      if (candidates.length === 0) {
        return NextResponse.json({ data: [] });
      }

      // localId en la búsqueda es un filtro por substring (no exacto), así que
      // pedimos el detalle de cada candidata y filtramos por igualdad exacta abajo.
      const detailResults = await Promise.all(
        candidates.map(async (card) => {
          try {
            const detailRes = await fetch(`${TCGDEX_BASE_URL}/cards/${card.id}`);
            if (!detailRes.ok) {
              throw new Error(`status ${detailRes.status}`);
            }
            return (await detailRes.json()) as TcgdexCardDetail;
          } catch (err) {
            console.error(`[pokemon-search] Error al obtener detalle de carta ${card.id}:`, err);
            return null;
          }
        })
      );

      let cards = detailResults.filter((c): c is TcgdexCardDetail => c !== null);

      const failedCount = detailResults.length - cards.length;
      if (failedCount > 0) {
        console.error(
          `[pokemon-search] ${failedCount}/${candidates.length} cartas fallaron al obtener el detalle`
        );
      }

      if (localId) {
        const normalized = normalizeLocalId(localId);
        cards = cards.filter((c) => normalizeLocalId(c.localId) === normalized);
      }

      if (totalFilter) {
        const totalNum = Number(totalFilter);
        cards = cards.filter((c) => {
          const total = c.set?.cardCount?.official ?? c.set?.cardCount?.total;
          return total === totalNum;
        });
      }

      const data = cards.map((c) => ({
        id: c.id,
        name: c.name,
        number: c.localId,
        set: {
          name: c.set?.name ?? "",
          total: c.set?.cardCount?.official ?? c.set?.cardCount?.total,
        },
        rarity: c.rarity,
        images: { small: c.image ? `${c.image}/low.webp` : "" },
      }));

      return NextResponse.json({ data });
    }

    return NextResponse.json({ error: "Parámetro type inválido" }, { status: 400 });
  } catch (err) {
    console.error("[pokemon-search] Error:", err);
    return NextResponse.json({ error: "Error al conectar con la API de Pokémon TCG" }, { status: 500 });
  }
}
