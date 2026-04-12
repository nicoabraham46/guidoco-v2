"use client";

import { useState } from "react";

const categories = [
  { value: "", label: "Sin categoría", badge: null },
  { value: "diecast", label: "Diecast", badge: { text: "Diecast", bg: "#1a1a1a", color: "#fff" } },
  { value: "pokemon", label: "Pokémon", badge: { text: "Pokémon", bg: "#f5c518", color: "#1a1a1a" } },
];

export default function CategorySelect({ defaultValue = "" }: { defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue);
  const current = categories.find((c) => c.value === value) ?? categories[0];

  return (
    <div className="flex items-center gap-4">
      <select
        id="category"
        name="category"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        style={{
          flex: 1,
          height: 44,
          border: "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "0 12px",
          fontSize: 14,
          color: "#1a1a1a",
          backgroundColor: "#fff",
          outline: "none",
          cursor: "pointer",
        }}
        onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
        onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
      >
        {categories.map((c) => (
          <option key={c.value} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {current.badge && (
        <span
          style={{
            backgroundColor: current.badge.bg,
            color: current.badge.color,
            borderRadius: 20,
            padding: "4px 14px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
          }}
        >
          {current.badge.text}
        </span>
      )}
    </div>
  );
}
