"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatARS } from "@/lib/format";
import { sanitizeImageUrl } from "@/lib/images";
import DeleteProductButton from "./DeleteProductButton";

type Product = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  category: string | null;
  cover_url: string | null;
};

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";
type StockFilter = "all" | "in_stock" | "out_of_stock";

const CATEGORY_LABELS: Record<string, string> = {
  diecast: "Diecast",
  pokemon: "Pokémon",
  especiales: "Especiales",
};

export default function ProductList({ products }: { products: Product[] }) {
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const filtered = useMemo(() => {
    let result = [...products];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => {
        const name = (p.name ?? p.title ?? "").toLowerCase();
        return name.includes(q) || p.slug.toLowerCase().includes(q);
      });
    }

    if (stockFilter === "in_stock") {
      result = result.filter((p) => (p.stock ?? 0) > 0);
    } else if (stockFilter === "out_of_stock") {
      result = result.filter((p) => (p.stock ?? 0) === 0);
    }

    result.sort((a, b) => {
      let cmp = 0;
      if (sortKey === "name") {
        const na = (a.name ?? a.title ?? "").toLowerCase();
        const nb = (b.name ?? b.title ?? "").toLowerCase();
        cmp = na.localeCompare(nb);
      } else if (sortKey === "price") {
        cmp = (a.price ?? 0) - (b.price ?? 0);
      } else if (sortKey === "stock") {
        cmp = (a.stock ?? 0) - (b.stock ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [products, search, stockFilter, sortKey, sortDir]);

  const totalProducts = products.length;
  const totalInStock = products.filter((p) => (p.stock ?? 0) > 0).length;
  const totalOutOfStock = totalProducts - totalInStock;
  const totalUnits = products.reduce((sum, p) => sum + (p.stock ?? 0), 0);
  const totalValue = products.reduce((sum, p) => sum + (p.price ?? 0) * (p.stock ?? 0), 0);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <span style={{ color: "#ccc", fontSize: 12 }}> ↕</span>;
    return <span style={{ fontSize: 12 }}> {sortDir === "asc" ? "↑" : "↓"}</span>;
  }

  return (
    <div>
      {/* Estadísticas */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
        gap: 12,
        marginBottom: 20,
      }}>
        {[
          { label: "Productos", value: totalProducts, color: "#1a1a1a" },
          { label: "Con stock", value: totalInStock, color: "#16a34a" },
          { label: "Sin stock", value: totalOutOfStock, color: "#C0392B" },
          { label: "Unidades", value: totalUnits, color: "#1a1a1a" },
          { label: "Valor inventario", value: `$${formatARS(totalValue)}`, color: "#1a1a1a" },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: "#f9fafb",
            borderRadius: 10,
            padding: "14px 16px",
          }}>
            <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: "4px 0 0" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
        marginBottom: 16,
        alignItems: "center",
      }}>
        <div style={{ flex: "1 1 200px", minWidth: 200 }}>
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              height: 40,
              border: "1px solid #e0e0e0",
              borderRadius: 8,
              padding: "0 12px",
              fontSize: 14,
              outline: "none",
            }}
          />
        </div>

        <select
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value as StockFilter)}
          style={{
            height: 40,
            border: "1px solid #e0e0e0",
            borderRadius: 8,
            padding: "0 12px",
            fontSize: 13,
            cursor: "pointer",
            backgroundColor: "#fff",
          }}
        >
          <option value="all">Todo el stock</option>
          <option value="in_stock">Con stock</option>
          <option value="out_of_stock">Sin stock</option>
        </select>

        <span style={{ fontSize: 13, color: "#888" }}>
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "40px 20px",
          color: "#888",
          backgroundColor: "#f9fafb",
          borderRadius: 10,
        }}>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No se encontraron productos</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Probá cambiando los filtros</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#666" }}>
                  Producto
                </th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#666" }}>
                  Categoría
                </th>
                <th
                  onClick={() => toggleSort("price")}
                  style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, color: "#666", cursor: "pointer", userSelect: "none" }}
                >
                  Precio<SortIcon column="price" />
                </th>
                <th
                  onClick={() => toggleSort("stock")}
                  style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: 12, color: "#666", cursor: "pointer", userSelect: "none" }}
                >
                  Stock<SortIcon column="stock" />
                </th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, color: "#666" }}>
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const displayName = p.name ?? p.title ?? "Sin nombre";
                const coverUrl = sanitizeImageUrl(p.cover_url);
                const outOfStock = (p.stock ?? 0) === 0;

                return (
                  <tr
                    key={p.id}
                    style={{
                      borderTop: "1px solid #f0f0f0",
                      opacity: outOfStock ? 0.5 : 1,
                      backgroundColor: outOfStock ? "#fafafa" : "#fff",
                    }}
                  >
                    {/* Producto con imagen */}
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 44,
                          height: 44,
                          borderRadius: 8,
                          overflow: "hidden",
                          backgroundColor: "#f3f4f6",
                          flexShrink: 0,
                        }}>
                          {coverUrl ? (
                            <Image
                              src={coverUrl}
                              alt={displayName}
                              width={44}
                              height={44}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#ccc",
                              fontSize: 18,
                            }}>
                              📷
                            </div>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: 13,
                            color: "#1a1a1a",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 220,
                          }}>
                            {displayName}
                          </p>
                          <p style={{ margin: 0, fontSize: 11, color: "#aaa" }}>
                            /{p.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td style={{ padding: "10px 12px" }}>
                      {p.category ? (
                        <span style={{
                          fontSize: 11,
                          fontWeight: 600,
                          color: "#666",
                          backgroundColor: "#f0f0f0",
                          padding: "3px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}>
                          {CATEGORY_LABELS[p.category] ?? p.category}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: "#ccc" }}>—</span>
                      )}
                    </td>

                    {/* Precio */}
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#1a1a1a" }}>
                      ${formatARS(p.price)}
                    </td>

                    {/* Stock */}
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{
                        display: "inline-block",
                        minWidth: 28,
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 13,
                        fontWeight: 700,
                        backgroundColor: outOfStock ? "#fef2f2" : "#f0fdf4",
                        color: outOfStock ? "#C0392B" : "#16a34a",
                      }}>
                        {p.stock ?? 0}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                        <Link
                          href={`/admin/${p.id}`}
                          style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}
                        >
                          Editar
                        </Link>
                        <DeleteProductButton productId={p.id} productName={displayName} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
