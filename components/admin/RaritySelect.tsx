"use client";

import { useState, useRef, useEffect } from "react";
import { RARITIES, RaritySymbol, getRarityInfo } from "@/components/RarityBadge";

export default function RaritySelect({ defaultValue = "" }: { defaultValue?: string }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const info = getRarityInfo(selected);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input type="hidden" name="rarity" value={selected} />

      {/* Botón que abre el selector */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          height: 44,
          border: open ? "1px solid #C0392B" : "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "0 12px",
          fontSize: 14,
          color: "#1a1a1a",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxSizing: "border-box" as const,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {info ? (
            <>
              <RaritySymbol rarityKey={info.key} size={18} />
              <span style={{ fontWeight: 600 }}>{info.key}</span>
              <span style={{ color: "#888", fontSize: 13 }}>— {info.name}</span>
            </>
          ) : (
            <span style={{ color: "#aaa" }}>Sin rareza</span>
          )}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Dropdown con opciones */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            border: "1px solid #e0e0e0",
            borderRadius: 10,
            boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
            zIndex: 50,
            maxHeight: 340,
            overflowY: "auto",
            padding: 6,
          }}
        >
          {/* Opción sin rareza */}
          <button
            type="button"
            onClick={() => { setSelected(""); setOpen(false); }}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: selected === "" ? "1.5px solid #C0392B" : "1.5px solid transparent",
              borderRadius: 8,
              backgroundColor: selected === "" ? "#fef2f2" : "transparent",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 14,
              color: "#888",
              marginBottom: 2,
            }}
          >
            Sin rareza
          </button>

          {RARITIES.map((r) => (
            <button
              type="button"
              key={r.key}
              onClick={() => { setSelected(r.key); setOpen(false); }}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: selected === r.key ? "1.5px solid #C0392B" : "1.5px solid transparent",
                borderRadius: 8,
                backgroundColor: selected === r.key ? "#fef2f2" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                color: "#1a1a1a",
                marginBottom: 2,
                transition: "background-color 0.1s",
              }}
              onMouseEnter={(e) => {
                if (selected !== r.key) e.currentTarget.style.backgroundColor = "#f9f9f9";
              }}
              onMouseLeave={(e) => {
                if (selected !== r.key) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <span style={{ display: "flex", alignItems: "center", minWidth: 40, justifyContent: "center" }}>
                <RaritySymbol rarityKey={r.key} size={20} />
              </span>
              <span style={{ fontWeight: 600, minWidth: 36 }}>{r.key}</span>
              <span style={{ color: "#666", fontSize: 13 }}>{r.name}</span>
              <span style={{ color: "#aaa", fontSize: 11, marginLeft: "auto" }}>{r.nameEs}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
