import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProductImagesManager from "@/components/admin/ProductImagesManager";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product, error } = await getSupabaseAdmin()
    .from("products")
    .select("id, title, name, slug, price, stock, description, category, rarity, set_name, pokemon_type, product_images(id, url, sort_order)")
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
    const rarity = formData.get("rarity") as string | null;
    const set_name = formData.get("set_name") as string | null;
    const pokemon_type = formData.get("pokemon_type") as string | null;
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
        rarity: rarity || null,
        set_name: set_name || null,
        pokemon_type: pokemon_type || null,
      })
      .eq("id", productId);

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
            <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Editar producto</h1>
            <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>ID: {product.id}</p>
          </div>
        </div>

        <ProductForm
          action={updateProduct}
          submitLabel="Guardar cambios"
          defaultValues={{
            id: product.id,
            title: product.title ?? product.name ?? "",
            slug: product.slug ?? "",
            price: product.price,
            stock: product.stock,
            description: product.description,
            category: product.category,
            rarity: product.rarity,
            set_name: product.set_name,
            pokemon_type: product.pokemon_type,
          }}
        />

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
