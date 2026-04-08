import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

    if (error) {
      throw new Error(error.message);
    }

    redirect("/admin");
  }

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

      <h1 className="text-2xl font-bold">Crear producto</h1>

      <form action={createProduct} className="mt-6 space-y-4">

        <div>
          <label htmlFor="title" className="block text-sm font-semibold">
            Título *
          </label>
          <input
            type="text"
            id="title"
            name="title"
            required
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
            Crear producto
          </button>
          <Link
            href="/admin"
            className="rounded-lg border px-4 py-2 font-semibold hover:bg-gray-50"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </main>
  );
}
