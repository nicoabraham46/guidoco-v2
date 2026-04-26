"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

type Props = {
  category: string | null;
  q: string;
  sort: string;
  stock: string | null;
  total: number;
  pokemonType?: string | null;
};

export default function CatalogoFilters({ category, q, sort, total, pokemonType }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildUrl = useCallback(
    (overrides: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, val] of Object.entries(overrides)) {
        if (val === null || val === "") {
          params.delete(key);
        } else {
          params.set(key, val);
        }
      }
      const str = params.toString();
      return `/catalogo${str ? `?${str}` : ""}`;
    },
    [searchParams]
  );

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const url = buildUrl({ q: val || null });
    router.replace(url, { scroll: false });
  }

  function handleSort(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = buildUrl({ sort: e.target.value === "newest" ? null : e.target.value });
    router.replace(url, { scroll: false });
  }

  function handleType(e: React.ChangeEvent<HTMLSelectElement>) {
    const url = buildUrl({ type: e.target.value || null });
    router.replace(url, { scroll: false });
  }

  const catPills = [
    { label: "Todos", value: null },
    { label: "Diecast", value: "diecast" },
    { label: "Pokémon", value: "pokemon" },
    { label: "Especiales", value: "especiales" },
  ];

  const pillBase =
    "rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap";
  const pillActive = "text-white border-transparent";
  const pillInactive =
    "border-gray-200 bg-white text-gray-600 hover:border-gray-400 hover:text-gray-900";

  return (
    <div className="border-b border-gray-200 pb-5 mb-8">
      {/* Fila principal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">

        {/* Búsqueda */}
        <div className="relative sm:w-56 lg:w-64">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Buscar productos..."
            onChange={handleSearch}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          />
        </div>

        {/* Pills de categoría */}
        <div className="flex items-center gap-2">
          {catPills.map(({ label, value }) => {
            const active = category === value;
            return (
              <Link
                key={label}
                href={buildUrl({ category: active ? null : value, type: null })}
                className={`${pillBase} ${active ? pillActive : pillInactive}`}
                style={active ? { backgroundColor: "#C0392B" } : undefined}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* Ordenamiento + tipo pokémon + contador al final */}
        <div className="flex items-center gap-3 sm:ml-auto">
          {category === "pokemon" && (
            <select
              value={pokemonType || ""}
              onChange={handleType}
              style={{
                height: 40,
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                padding: "0 12px",
                fontSize: 13,
                cursor: "pointer",
                backgroundColor: "#fff",
                color: "#1a1a1a",
              }}
            >
              <option value="">Todos los tipos</option>
              <option value="fire">🔴 Fuego</option>
              <option value="water">🔵 Agua</option>
              <option value="grass">🟢 Planta</option>
              <option value="electric">🟡 Eléctrico</option>
              <option value="psychic">🟣 Psíquico</option>
              <option value="fighting">🟠 Lucha</option>
              <option value="colorless">⚪ Incoloro</option>
              <option value="metal">⚙️ Metal</option>
              <option value="dark">⚫ Oscuridad</option>
              <option value="dragon">🟤 Dragón</option>
              <option value="fairy">🩷 Hada</option>
            </select>
          )}

          <select
            name="sort"
            defaultValue={sort}
            onChange={handleSort}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-400 focus:ring-1 focus:ring-gray-400"
          >
            <option value="newest">Más recientes</option>
            <option value="price_asc">Precio: menor a mayor</option>
            <option value="price_desc">Precio: mayor a menor</option>
          </select>

          <p className="text-sm text-gray-400 whitespace-nowrap">
            {total} {total === 1 ? "producto" : "productos"}
          </p>
        </div>

      </div>
    </div>
  );
}
