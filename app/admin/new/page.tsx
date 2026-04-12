import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProductForm from "@/components/admin/ProductForm";

export default async function AdminNewPage() {
  async function createProduct(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const description = formData.get("description") as string;
    const category = formData.get("category") as string | null;

    const { error } = await getSupabaseAdmin().from("products").insert({
      title,
      slug,
      price,
      stock,
      description: description || null,
      category: category || null,
    });

    if (error) throw new Error(error.message);

    redirect("/admin");
  }

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        <Link
          href="/admin"
          style={{ fontSize: 13, color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}
        >
          ← Volver a admin
        </Link>

        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 4, height: 42, backgroundColor: "#C0392B", borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Crear producto</h1>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>Completá los datos para agregar un nuevo producto</p>
          </div>
        </div>

        <ProductForm action={createProduct} submitLabel="Crear producto" />

      </div>
    </main>
  );
}
