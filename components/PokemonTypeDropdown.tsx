"use client";

import { useState, useRef, useEffect, useId } from "react";
import { POKEMON_TYPES, getPokemonType, PokemonTypeIcon } from "@/components/PokemonTypes";

type Props = {
  value: string;
  onChange: (key: string) => void;
  placeholder: string;
  height?: number;
};

// Lista de opciones: null representa "sin tipo" / "todos los tipos" (equivalente al value="").
const OPTIONS: (typeof POKEMON_TYPES[number] | null)[] = [null, ...POKEMON_TYPES];

export default function PokemonTypeDropdown({ value, onChange, placeholder, height = 44 }: Props) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const instanceId = useId();
  const listboxId = `${instanceId}-listbox`;
  const optionId = (index: number) => `${instanceId}-option-${index}`;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) {
      const idx = OPTIONS.findIndex((o) => (o?.key ?? "") === value);
      setActiveIndex(idx >= 0 ? idx : 0);
    }
  }, [open, value]);

  useEffect(() => {
    if (open) {
      optionRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [open, activeIndex]);

  function closeAndFocusTrigger() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  function selectOption(key: string) {
    onChange(key);
    closeAndFocusTrigger();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, OPTIONS.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        selectOption(OPTIONS[activeIndex]?.key ?? "");
        break;
      case "Escape":
        e.preventDefault();
        closeAndFocusTrigger();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const info = getPokemonType(value);
  const iconSize = height >= 44 ? 22 : 18;
  const fontSize = height >= 44 ? 14 : 13;

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-activedescendant={open ? optionId(activeIndex) : undefined}
        onClick={() => setOpen((o) => !o)}
        onKeyDown={handleTriggerKeyDown}
        style={{
          width: "100%",
          height,
          border: open ? "1px solid #C0392B" : "1px solid #e0e0e0",
          borderRadius: 8,
          padding: "0 12px",
          fontSize,
          color: "#1a1a1a",
          backgroundColor: "#fff",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          boxSizing: "border-box" as const,
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
          {info ? (
            <>
              <PokemonTypeIcon typeKey={info.key} size={iconSize} />
              <span style={{ fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {info.nameEs}
              </span>
              {height >= 44 && <span style={{ color: "#888", fontSize: 13 }}>({info.name})</span>}
            </>
          ) : (
            <span style={{ color: "#aaa", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {placeholder}
            </span>
          )}
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" style={{ flexShrink: 0 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          id={listboxId}
          role="listbox"
          style={{
            position: "absolute",
            top: height + 4,
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
          {OPTIONS.map((opt, index) => {
            const key = opt?.key ?? "";
            const selected = value === key;
            const highlighted = activeIndex === index;
            return (
              <button
                key={key || "none"}
                id={optionId(index)}
                ref={(el) => { optionRefs.current[index] = el; }}
                type="button"
                role="option"
                aria-selected={highlighted}
                tabIndex={-1}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(key)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: selected ? "1.5px solid #C0392B" : highlighted ? "1.5px solid #ddd" : "1.5px solid transparent",
                  borderRadius: 8,
                  backgroundColor: selected ? "#fef2f2" : highlighted ? "#f9f9f9" : "transparent",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: opt ? 10 : 8,
                  fontSize: 14,
                  color: opt ? "#1a1a1a" : "#888",
                  marginBottom: 2,
                }}
              >
                {opt ? (
                  <>
                    <PokemonTypeIcon typeKey={opt.key} size={24} />
                    <span style={{ fontWeight: 600 }}>{opt.nameEs}</span>
                  </>
                ) : (
                  placeholder
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
