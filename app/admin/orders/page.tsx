import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import OrderList from "@/components/admin/OrderList";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const { data, error } = await getSupabaseAdmin()
    .from("orders")
    .select("id, created_at, status, payment_status, total_amount, customer_name, customer_email, order_number, tracking_code")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return (
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Error</h1>
        <pre style={{ marginTop: 16, padding: 16, backgroundColor: "#fef2f2", borderRadius: 8 }}>{error.message}</pre>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>Admin — Pedidos</h1>
          <Link href="/admin" style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", marginTop: 4, display: "inline-block" }}>
            ← Volver a productos
          </Link>
        </div>
        <a href="/admin/logout" style={{ border: "1px solid #e0e0e0", padding: "10px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none", color: "#666" }}>
          Salir
        </a>
      </div>

      <OrderList orders={(data || []) as any} />
    </main>
  );
}
