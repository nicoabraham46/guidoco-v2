"use client";

import { useEffect, useState } from "react";
import { PROVINCE_CODES, type AgencyOption } from "@/lib/micorreo";

type Props = {
  defaultPostalCode: string;
  defaultProvinceCode: string;
};

export default function SucursalPicker({ defaultPostalCode, defaultProvinceCode }: Props) {
  const [provinceCode, setProvinceCode] = useState(defaultProvinceCode);
  const [postalCode, setPostalCode] = useState(defaultPostalCode);
  const [results, setResults] = useState<AgencyOption[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCode, setSelectedCode] = useState("");

  async function search() {
    if (!provinceCode) {
      setError("Elegí una provincia para buscar sucursales");
      setResults(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ provinceCode });
      if (postalCode) params.set("postalCode", postalCode);
      const res = await fetch(`/api/admin/micorreo-agencies?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || "Error al buscar sucursales");
        setResults(null);
        return;
      }
      setResults(data.agencies as AgencyOption[]);
    } catch {
      setError("Error al conectar con el buscador de sucursales");
      setResults(null);
    } finally {
      setLoading(false);
    }
  }

  // Búsqueda automática inicial si ya tenemos provincia y código postal del pedido
  useEffect(() => {
    if (defaultProvinceCode && defaultPostalCode) {
      search();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = results?.find((a) => a.code === selectedCode) || null;

  return (
    <div>
      <input type="hidden" name="agency" value={selectedCode} />

      <div className="mt-1 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          className="rounded-lg border px-3 py-2 text-sm text-gray-900"
        >
          <option value="">Provincia...</option>
          {PROVINCE_CODES.map((p) => (
            <option key={p.code} value={p.code}>{p.name}</option>
          ))}
        </select>
        <input
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          onBlur={() => postalCode && search()}
          placeholder="Código postal"
          className="rounded-lg border px-3 py-2 text-sm text-gray-900"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="rounded-lg border bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
        >
          {loading ? "Buscando..." : "Buscar sucursales"}
        </button>
      </div>

      {error && <p className="mt-2 text-xs font-medium text-red-500">{error}</p>}

      {results && results.length === 0 && !error && (
        <p className="mt-2 text-xs font-medium text-amber-600">
          No se encontraron sucursales con ese código postal, probá con otro.
        </p>
      )}

      {results && results.length > 0 && (
        <div className="mt-2 max-h-56 space-y-1 overflow-y-auto rounded-lg border p-2">
          {results.map((a) => (
            <label
              key={a.code}
              className="flex items-start gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <input
                type="radio"
                name="_agencyChoice"
                checked={selectedCode === a.code}
                onChange={() => setSelectedCode(a.code)}
                className="mt-0.5"
              />
              <span className="text-gray-800">
                <span className="font-medium">{a.name}</span> — {a.streetName} {a.streetNumber}
                {a.locality ? `, ${a.locality}` : ""}{" "}
                <span className="text-gray-400">({a.code})</span>
              </span>
            </label>
          ))}
        </div>
      )}

      {selected && (
        <p className="mt-2 text-xs font-medium text-emerald-600">
          Sucursal seleccionada: {selected.name} ({selected.code})
        </p>
      )}

      <p className="mt-1 text-xs text-gray-400">
        Buscá por provincia y código postal, y elegí la sucursal donde el cliente retira el pedido.
      </p>
    </div>
  );
}
