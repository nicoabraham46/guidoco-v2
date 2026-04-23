"use client";

import { useEffect, useState } from "react";

const STATIC_ITEMS = [
  "📦 Envíos a todo el país",
  "🚗 Diecast escala 1/64 · Importados",
  "🎴 Pokémon TCG · Cartas originales",
  "🚗 Hot Wheels",
  "⚙️ Micro Turbo",
  "💳 Pagá con Mercado Pago",
];

const SEPARATOR = "·";

export default function AnnouncementTicker() {
  const [usdArs, setUsdArs] = useState<string | null>(null);

  useEffect(() => {
    const fetchDolar = async () => {
      try {
        const res = await fetch(`https://dolarapi.com/v1/dolares/blue?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        if (data?.venta) setUsdArs(String(data.venta));
      } catch {
        // silently ignore fetch errors
      }
    };

    fetchDolar();

    const interval = setInterval(fetchDolar, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const usdItem = `💵 USD/ARS: ${usdArs ? `$${usdArs}` : "cargando..."}`;

  const items = [...STATIC_ITEMS, usdItem];

  // Construir la tira de texto como un array de spans para separar con ·
  // La tira se duplica para que el loop sea continuo sin saltos
  const track = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{ backgroundColor: "#C0392B", height: "40px" }}
      aria-label="Anuncios"
    >
      <div className="flex h-full items-center">
        <div className="ticker-track flex shrink-0 items-center whitespace-nowrap">
          {track.map((item, idx) => (
            <span
              key={idx}
              className="flex items-center text-white"
              style={{ fontSize: "13px", letterSpacing: "0.05em" }}
              aria-hidden="true"
            >
              <span className="px-5">{item}</span>
              <span className="text-white/50">{SEPARATOR}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
