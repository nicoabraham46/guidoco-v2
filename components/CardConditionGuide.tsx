"use client";

import { useState } from "react";

type Variant = "scroll" | "compact" | "text";

export default function CardConditionGuide({ variant = "scroll" }: { variant?: Variant }) {
  const [open, setOpen] = useState(false);

  const conditions = [
    { code: "NM", name: "Near Mint — Casi perfecta", desc: "Sin desgaste. Como recién sacada del sobre, prácticamente perfecta.", pips: 5, color: "#2a7a2a" },
    { code: "LP", name: "Lightly Played — Levemente jugada", desc: "Leve blanqueado en bordes o esquinas, rayones superficiales mínimos.", pips: 4, color: "#5a7a1e" },
    { code: "MP", name: "Moderately Played — Jugada", desc: "Desgaste visible, rayones notorios, desgaste moderado en bordes.", pips: 3, color: "#9a7a1a" },
    { code: "HP", name: "Heavily Played — Muy jugada", desc: "Desgaste importante, blanqueado significativo, rayones severos.", pips: 2, color: "#aa5a1a" },
    { code: "DMG", name: "Damaged — Dañada", desc: "Pliegues profundos, roturas, daño por agua. No apta para torneo.", pips: 1, color: "#9a2a1a" },
  ];

  // Variante texto simple para FAQ y Cómo comprar
  if (variant === "text") {
    return (
      <div style={{ fontSize: 14, color: "#555", lineHeight: 1.8 }}>
        <p style={{ fontWeight: 600, color: "#1a1a1a", marginBottom: 8 }}>Condiciones de las cartas (estándar internacional TCGPlayer):</p>
        {conditions.map((c) => (
          <p key={c.code} style={{ margin: "4px 0" }}>
            <strong style={{ color: c.color }}>{c.code}</strong> ({c.name}) — {c.desc}
          </p>
        ))}
      </div>
    );
  }

  // Variante compacta para página de producto
  if (variant === "compact") {
    return (
      <div>
        <button
          onClick={() => setOpen(!open)}
          style={{
            width: "100%",
            background: "#0a0a0a",
            border: "1px solid #1a1a1a",
            borderRadius: open ? "10px 10px 0 0" : 10,
            padding: "12px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transition: "border-radius 0.3s",
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 700, color: "#c9a84c", letterSpacing: 0.5 }}>
            Guía de condiciones
          </span>
          <span style={{ fontSize: 12, color: "#c9a84c", transition: "transform 0.3s", transform: open ? "rotate(180deg)" : "rotate(0)" }}>
            ▼
          </span>
        </button>
        <div style={{
          maxHeight: open ? 400 : 0,
          overflow: "hidden",
          transition: "max-height 0.6s cubic-bezier(0.4,0,0.2,1)",
          background: "#0a0a0a",
          border: open ? "1px solid #1a1a1a" : "none",
          borderTop: "none",
          borderRadius: "0 0 10px 10px",
        }}>
          <div style={{ padding: "8px 16px 14px" }}>
            {conditions.map((c, i) => (
              <div key={c.code} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < 4 ? "1px solid #151515" : "none" }}>
                <span style={{ fontSize: 12, fontWeight: 900, color: c.color, minWidth: 34, letterSpacing: 1 }}>{c.code}</span>
                <span style={{ fontSize: 10, color: "#888", flex: 1 }}>{c.name}</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map((n) => (
                    <div key={n} style={{
                      width: 6, height: 6, borderRadius: "50%",
                      background: n <= c.pips ? "#c9a84c" : "transparent",
                      border: n <= c.pips ? "none" : "1px solid #333",
                    }} />
                  ))}
                </div>
              </div>
            ))}
            <p style={{ fontSize: 8, color: "#444", textAlign: "center", marginTop: 8, letterSpacing: 1 }}>ESTÁNDAR TCGPLAYER · GUIDOCO</p>
          </div>
        </div>
      </div>
    );
  }

  // Variante scroll (pergamino) para Valorar carta
  return (
    <div style={{ maxWidth: 440, margin: "0 auto" }}>
      <div
        onClick={() => setOpen(!open)}
        style={{ background: "#050505", borderRadius: 6, padding: 16, cursor: "pointer", position: "relative", border: "1px solid #1a1a1a" }}
      >
        {/* Barra superior */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #8B6914, #DAA520, #FFD700, #DAA520, #8B6914)", borderRadius: 3 }} />

        {/* Papel */}
        <div style={{ background: "#f7f0e0", margin: "2px 0", padding: "18px 24px", textAlign: "center", position: "relative" }}>
          {/* Header cerrado */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14 }}>
            <div style={{ width: 34, height: 34, border: "2px solid #c44030", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
              <span style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 16, fontWeight: 900, color: "#c44030" }}>品</span>
            </div>
            <div>
              <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 16, fontWeight: 900, color: "#1a1008", margin: 0 }}>Card Condition Guide</p>
              <p style={{ fontSize: 10, color: "#9a8a6a", margin: "3px 0 0", letterSpacing: 0.5 }}>Guía de condiciones de cartas</p>
            </div>
          </div>
          <p style={{ fontSize: 9, color: "#b8a878", marginTop: 8, letterSpacing: 2 }}>{open ? "TOCA PARA ENROLLAR" : "TOCA PARA DESENROLLAR"}</p>

          {/* Contenido expandible */}
          <div style={{
            maxHeight: open ? 700 : 0,
            overflow: "hidden",
            transition: "max-height 0.8s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease 0.2s",
            opacity: open ? 1 : 0,
          }}>
            <div style={{ width: 60, height: 1, background: "#c4a870", margin: "14px auto" }} />
            <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 10, color: "#8a7a5a", letterSpacing: 4, margin: "0 0 14px" }}>品質ガイド</p>

            {conditions.map((c, i) => (
              <div key={c.code}>
                <div style={{ marginBottom: 16 }}>
                  <p style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, margin: 0, lineHeight: 1, color: c.color }}>{c.code}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#2a1e10", margin: "2px 0 0" }}>{c.name}</p>
                  <p style={{ fontSize: 10, color: "#7a6a4a", margin: "3px auto 0", lineHeight: 1.5, maxWidth: 300 }}>{c.desc}</p>
                  <div style={{ display: "flex", gap: 5, justifyContent: "center", marginTop: 6 }}>
                    {[1,2,3,4,5].map((n) => (
                      <div key={n} style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: n <= c.pips ? c.color : "transparent",
                        border: n > c.pips ? `1.5px solid ${c.color}` : "none",
                        opacity: n > c.pips ? 0.25 : 1,
                      }} />
                    ))}
                  </div>
                </div>
                {i < 4 && <div style={{ width: 30, height: 1, background: "#ddd0b0", margin: "12px auto" }} />}
              </div>
            ))}

            <div style={{ marginTop: 16, paddingTop: 10, borderTop: "1px solid #d4c4a0" }}>
              <p style={{ fontSize: 8, color: "#a09070", letterSpacing: 1, margin: 0 }}>ESTÁNDAR INTERNACIONAL TCGPLAYER</p>
              <p style={{ fontFamily: "'Noto Serif JP', serif", fontSize: 11, fontWeight: 900, color: "#8B6914", letterSpacing: 3, margin: "4px 0 0" }}>GUIDOCO</p>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div style={{ height: 6, background: "linear-gradient(90deg, #8B6914, #DAA520, #FFD700, #DAA520, #8B6914)", borderRadius: 3 }} />
      </div>
    </div>
  );
}
