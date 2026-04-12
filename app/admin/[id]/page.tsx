import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProductImagesManager from "@/components/admin/ProductImagesManager";
import CategorySelect from "@/components/admin/CategorySelect";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product, error } = await getSupabaseAdmin()
    .from("products")
    .select("id, title, name, slug, price, stock, description, category, product_images(id, url, sort_order)")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "40px 24px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Producto no encontrado</h1>
          <Link href="/admin" style={{ marginTop: 16, display: "inline-block", color: "#C0392B", fontSize: 14 }}>
            ← Volver a admin
          </Link>
        </div>
      </main>
    );
  }

  async function updateProduct(formData: FormData) {
    "use server";

    const title = formData.get("title") as string;
    const slug = formData.get("slug") as string;
    const price = parseFloat(formData.get("price") as string);
    const stock = parseInt(formData.get("stock") as string, 10);
    const description = formData.get("description") as string;
    const category = formData.get("category") as string | null;
    const productId = formData.get("id") as string;

    const { error } = await getSupabaseAdmin()
      .from("products")
      .update({
        title,
        slug,
        price,
        stock,
        description: description || null,
        category: category || null,
      })
      .eq("id", productId);

    if (error) {
      throw new Error(error.message);
    }

    redirect("/admin");
  }

  const displayTitle = product.title ?? product.name ?? "Sin título";

  const inputStyle = {
    width: "100%",
    height: 44,
    border: "1px solid #e0e0e0",
    borderRadius: 8,
    padding: "0 12px",
    fontSize: 14,
    color: "#1a1a1a",
    backgroundColor: "#fff",
    outline: "none",
    boxSizing: "border-box" as const,
  };

  const labelStyle = {
    display: "block",
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
  };

  const cardStyle = {
    backgroundColor: "#fff",
    borderRadius: 12,
    border: "0.5px solid #e0e0e0",
    padding: 24,
    marginBottom: 16,
  };

  const cardTitleStyle = {
    fontSize: 14,
    fontWeight: 500,
    color: "#333",
    marginBottom: 20,
  };

  return (
    <main style={{ backgroundColor: "#f5f5f5", minHeight: "100vh", padding: "40px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Back link */}
        <Link
          href="/admin"
          style={{ fontSize: 13, color: "#888", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 24 }}
        >
          ← Volver a admin
        </Link>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 32 }}>
          <div style={{ width: 4, height: 42, backgroundColor: "#C0392B", borderRadius: 2, flexShrink: 0, marginTop: 2 }} />
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Editar producto</h1>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>ID: {product.id}</p>
          </div>
        </div>

        <form action={updateProduct}>
          <input type="hidden" name="id" value={product.id} />

          {/* Card 1 — Información principal */}
          <div style={cardStyle}>
            <p style={cardTitleStyle}>📝 Información del producto</p>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="title" style={labelStyle}>Título *</label>
              <input
                type="text"
                id="title"
                name="title"
                required
                defaultValue={displayTitle}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label htmlFor="slug" style={labelStyle}>Slug *</label>
              <input
                type="text"
                id="slug"
                name="slug"
                required
                defaultValue={product.slug ?? ""}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
              <p style={{ fontSize: 11, color: "#aaa", marginTop: 4 }}>URL amigable (ej: mi-producto)</p>
            </div>

            <div>
              <label htmlFor="description" style={labelStyle}>Descripción</label>
              <textarea
                id="description"
                name="description"
                defaultValue={product.description ?? ""}
                style={{
                  ...inputStyle,
                  height: 120,
                  padding: "10px 12px",
                  resize: "vertical",
                  lineHeight: 1.5,
                }}
                onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
              />
            </div>
          </div>

          {/* Card 2 — Precio y stock */}
          <div style={cardStyle}>
            <p style={cardTitleStyle}>💰 Precio y disponibilidad</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label htmlFor="price" style={labelStyle}>Precio *</label>
                <div style={{ position: "relative" }}>
                  <span style={{
                    position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                    fontSize: 14, color: "#888", pointerEvents: "none",
                  }}>$</span>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    step="0.01"
                    required
                    defaultValue={product.price ?? 0}
                    style={{ ...inputStyle, paddingLeft: 24 }}
                    onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                    onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="stock" style={labelStyle}>Stock *</label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  required
                  defaultValue={product.stock ?? 0}
                  style={inputStyle}
                  onFocus={(e) => (e.target.style.borderColor = "#C0392B")}
                  onBlur={(e) => (e.target.style.borderColor = "#e0e0e0")}
                />
              </div>
            </div>
          </div>

          {/* Card 3 — Categoría */}
          <div style={cardStyle}>
            <p style={cardTitleStyle}>🏷️ Categoría</p>
            <label htmlFor="category" style={labelStyle}>Categoría del producto</label>
            <CategorySelect defaultValue={product.category ?? ""} />
          </div>

          {/* Botones */}
          <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
            <button
              type="submit"
              style={{
                flex: 1,
                height: 48,
                backgroundColor: "#1a1a1a",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Guardar cambios
            </button>
            <Link
              href="/admin"
              style={{
                flex: 1,
                height: 48,
                backgroundColor: "#fff",
                color: "#333",
                border: "1px solid #e0e0e0",
                borderRadius: 8,
                fontSize: 15,
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
              }}
            >
              Cancelar
            </Link>
          </div>
        </form>

        {/* Gestor de imágenes */}
        <div style={{ marginTop: 24 }}>
          <ProductImagesManager
            productId={product.id}
            initialImages={product.product_images ?? []}
          />
        </div>

      </div>
    </main>
  );
}
