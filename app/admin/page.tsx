import Link from "next/link";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProductList from "@/components/admin/ProductList";

export const dynamic = "force-dynamic";

type ProductRow = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
  category: string | null;
  product_images: { url: string | null; sort_order: number | null }[];
};

export default async function AdminPage() {
  // Traer total de ventas confirmadas
  const { data: paidOrders } = await getSupabaseAdmin()
    .from("orders")
    .select("total_amount")
    .eq("payment_status", "paid");

  const totalSales = (paidOrders ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
  const totalPaidOrders = (paidOrders ?? []).length;

  const { data, error } = await getSupabaseAdmin()
    .from("products")
    .select("id, name, title, slug, price, stock, category, product_images(url, sort_order)")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Error</h1>
        <pre style={{ marginTop: 16, padding: 16, backgroundColor: "#fef2f2", borderRadius: 8, fontSize: 14 }}>
          {error.message}
        </pre>
      </main>
    );
  }

  const products = ((data ?? []) as ProductRow[]).map((p) => {
    const sorted = [...(p.product_images ?? [])].sort(
      (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
    );
    return {
      id: p.id,
      name: p.name,
      title: p.title,
      slug: p.slug,
      price: p.price,
      stock: p.stock,
      category: p.category,
      cover_url: sorted[0]?.url ?? null,
    };
  });

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 24,
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            Admin — Productos
          </h1>
          <Link
            href="/admin/orders"
            style={{ fontSize: 13, color: "#2563eb", textDecoration: "none", marginTop: 4, display: "inline-block" }}
          >
            Ver pedidos →
          </Link>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <Link
            href="/admin/new"
            style={{
              backgroundColor: "#1a1a1a",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            + Nuevo producto
          </Link>
          <a
            href="/admin/logout"
            style={{
              border: "1px solid #e0e0e0",
              padding: "10px 20px",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
              color: "#666",
            }}
          >
            Salir
          </a>
        </div>
      </div>

      <ProductList products={products} totalSales={totalSales} totalPaidOrders={totalPaidOrders} />
    </main>
  );
}
