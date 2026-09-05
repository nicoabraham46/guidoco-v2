"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { formatARS } from "@/lib/format";

type Order = {
  id: string;
  created_at: string;
  status: string;
  payment_status: string | null;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  order_number?: number | null;
  tracking_code?: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  confirmed: "Confirmado",
  processing: "Procesando",
  shipped: "Enviado",
  delivered: "Entregado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef9c3", text: "#854d0e" },
  confirmed: { bg: "#dcfce7", text: "#166534" },
  processing: { bg: "#dbeafe", text: "#1e40af" },
  shipped: { bg: "#e0e7ff", text: "#3730a3" },
  delivered: { bg: "#d1fae5", text: "#065f46" },
  cancelled: { bg: "#fee2e2", text: "#991b1b" },
};

const PAYMENT_LABELS: Record<string, string> = {
  pending: "Pendiente",
  paid: "Pagado",
  refunded: "Reembolsado",
};

const PAYMENT_COLORS: Record<string, { bg: string; text: string }> = {
  pending: { bg: "#fef9c3", text: "#854d0e" },
  paid: { bg: "#dcfce7", text: "#166534" },
  refunded: { bg: "#fee2e2", text: "#991b1b" },
};

export default function OrderList({ orders }: { orders: Order[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const filtered = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.payment_status === paymentFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.customer_name.toLowerCase().includes(q) ||
          o.customer_email.toLowerCase().includes(q) ||
          o.id.includes(q) ||
          (o.order_number && String(o.order_number).includes(q))
      );
    }
    if (dateFrom) {
      result = result.filter((o) => o.created_at >= dateFrom);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setDate(to.getDate() + 1);
      result = result.filter((o) => o.created_at < to.toISOString());
    }

    return result;
  }, [orders, statusFilter, paymentFilter, search, dateFrom, dateTo]);

  // Estadísticas
  const totalRevenue = orders.filter((o) => o.payment_status === "paid").reduce((sum, o) => sum + o.total_amount, 0);
  const paidCount = orders.filter((o) => o.payment_status === "paid").length;
  const pendingCount = orders.filter((o) => o.status === "pending").length;
  const shippedCount = orders.filter((o) => o.status === "shipped").length;

  function exportToCSV() {
    const headers = ["N° Pedido", "Fecha", "Cliente", "Email", "Total", "Estado", "Pago", "Tracking"];
    const rows = filtered.map((o) => [
      o.order_number ? String(o.order_number).padStart(5, "0") : o.id.slice(0, 8),
      new Date(o.created_at).toLocaleDateString("es-AR"),
      o.customer_name,
      o.customer_email,
      o.total_amount,
      STATUS_LABELS[o.status] || o.status,
      PAYMENT_LABELS[o.payment_status || "pending"] || o.payment_status || "Pendiente",
      o.tracking_code || "",
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((v) => `"${v}"`).join(","))].join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pedidos-guidoco-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
          { label: "Total pedidos", value: orders.length, color: "#1a1a1a" },
          { label: "Pagados", value: paidCount, color: "#16a34a" },
          { label: "Pendientes", value: pendingCount, color: "#ca8a04" },
          { label: "Enviados", value: shippedCount, color: "#2563eb" },
          { label: "Facturado", value: `$${formatARS(totalRevenue)}`, color: "#16a34a" },
        ].map((stat) => (
          <div key={stat.label} style={{ backgroundColor: "#f9fafb", borderRadius: 10, padding: "14px 16px" }}>
            <p style={{ fontSize: 11, color: "#888", margin: 0, textTransform: "uppercase", letterSpacing: 0.5 }}>{stat.label}</p>
            <p style={{ fontSize: 20, fontWeight: 700, color: stat.color, margin: "4px 0 0" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Buscar por nombre, email o N°..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: "1 1 200px", minWidth: 180, height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 12px", fontSize: 13, color: "#1a1a1a", outline: "none" }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#1a1a1a" }}>
          <option value="all">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="confirmed">Confirmado</option>
          <option value="processing">Procesando</option>
          <option value="shipped">Enviado</option>
          <option value="delivered">Entregado</option>
          <option value="cancelled">Cancelado</option>
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#1a1a1a" }}>
          <option value="all">Todos los pagos</option>
          <option value="paid">Pagado</option>
          <option value="pending">Pendiente</option>
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#1a1a1a" }} />
        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} style={{ height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 10px", fontSize: 13, color: "#1a1a1a" }} />
        <button onClick={exportToCSV} style={{ height: 36, border: "1px solid #e0e0e0", borderRadius: 8, padding: "0 14px", fontSize: 13, fontWeight: 600, color: "#1a1a1a", background: "#fff", cursor: "pointer" }}>
          📥 Exportar CSV
        </button>
        <span style={{ fontSize: 13, color: "#888" }}>{filtered.length} pedido{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Tabla */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#888", backgroundColor: "#f9fafb", borderRadius: 10 }}>
          <p style={{ fontSize: 15, fontWeight: 500 }}>No se encontraron pedidos</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto", borderRadius: 10, border: "1px solid #e5e7eb" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#666" }}>N° Pedido</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#666" }}>Fecha</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 12, color: "#666" }}>Cliente</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, color: "#666" }}>Total</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: 12, color: "#666" }}>Estado</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontWeight: 600, fontSize: 12, color: "#666" }}>Pago</th>
                <th style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, color: "#666" }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const sc = STATUS_COLORS[o.status] || { bg: "#f3f4f6", text: "#374151" };
                const pc = PAYMENT_COLORS[o.payment_status || "pending"] || { bg: "#f3f4f6", text: "#374151" };
                return (
                  <tr key={o.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                    <td style={{ padding: "10px 12px", fontFamily: "monospace", fontWeight: 600, fontSize: 13, color: "#1a1a1a" }}>
                      #{o.order_number ? String(o.order_number).padStart(5, "0") : o.id.slice(0, 8)}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#555" }}>
                      {new Date(o.created_at).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit", timeZone: "America/Argentina/Buenos_Aires" })}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#1a1a1a" }}>{o.customer_name}</p>
                      <p style={{ margin: 0, fontSize: 11, color: "#888" }}>{o.customer_email}</p>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 600, color: "#1a1a1a" }}>${formatARS(o.total_amount)}</td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                        {STATUS_LABELS[o.status] || o.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, backgroundColor: pc.bg, color: pc.text }}>
                        {PAYMENT_LABELS[o.payment_status || "pending"] || o.payment_status || "Pendiente"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 12 }}>
                        <Link href={`/admin/orders/${o.id}`} style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", fontWeight: 500 }}>
                          Ver
                        </Link>
                        <button
                          onClick={async () => {
                            const orderNum = o.order_number ? `#${String(o.order_number).padStart(5, "0")}` : `#${o.id.slice(0, 8)}`;
                            if (!confirm(`¿Eliminar el pedido ${orderNum} de ${o.customer_name}?`)) return;
                            try {
                              const res = await fetch("/api/admin/orders/delete", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ orderId: o.id }),
                              });
                              if (res.ok) {
                                window.location.reload();
                              } else {
                                const data = await res.json();
                                alert(data.error || "Error al eliminar");
                              }
                            } catch {
                              alert("Error de conexión");
                            }
                          }}
                          style={{ fontSize: 13, color: "#ef4444", background: "none", border: "none", cursor: "pointer", fontWeight: 500 }}
                        >
                          Eliminar
                        </button>
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
