import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/lib/supabase-server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import ProductImagesManager from "@/components/admin/ProductImagesManager";

export default async function AdminEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: product, error } = await supabaseServer
    .from("products")
    .select("id, title, name, slug, price, stock, description, category, product_images(id, url, sort_order)")
    .eq("id", id)
    .single();

  if (error || !product) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold">Producto no encontrado</h1>
        <Link
          href="/admin"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Volver a admin
        </Link>
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

  return (
    <main className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/admin"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a admin
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Editar producto</h1>
      <p className="mt-1 text-sm text-gray-500">ID: {product.id}</p>

      <form action={updateProduct} className="mt-6 space-y-4">
        <input type="hidden" name="id" value={product.id} />

        <div>
          <label htmlFor="title" className="block text-sm font-semibold">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
            defaultValue={displayTitle}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-semibold">
            Slug *
          </label>
          <input
            type="text"
            id="slug"
            name="slug"
            required
            defaultValue={product.slug}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
          <p className="mt-1 text-xs text-gray-500">
            URL amigable (ej: mi-producto)
          </p>
        </div>

        <div>
          <label htmlFor="price" className="block text-sm font-semibold">
            Precio *
          </label>
          <input
            type="number"
            id="price"
            name="price"
            step="0.01"
            required
            defaultValue={product.price ?? 0}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="stock" className="block text-sm font-semibold">
            Stock *
          </label>
          <input
            type="number"
            id="stock"
            name="stock"
            required
            defaultValue={product.stock ?? 0}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product.description ?? ""}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-semibold">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue={product.category ?? ""}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="">Sin categoría</option>
            <option value="diecast">Diecast</option>
            <option value="pokemon">Pokémon</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-lg bg-black px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            Guardar cambios
          </button>
          <Link
            href="/admin"
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>

      <ProductImagesManager
        productId={product.id}
        initialImages={product.product_images ?? []}
      />
    </main>
  );
}
