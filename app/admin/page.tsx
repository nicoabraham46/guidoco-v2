import Link from "next/link";
import { supabaseServer } from "@/lib/supabase-server";
import { formatARS } from "@/lib/format";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

type Product = {
  id: string;
  name: string | null;
  title: string | null;
  slug: string;
  price: number | null;
  stock: number | null;
};

export default async function AdminPage() {
  const { data: products, error } = await supabaseServer
    .from("products")
    .select("id, name, title, slug, price, stock")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Error</h1>
        <pre className="mt-4 rounded-lg bg-red-50 p-4 text-sm">
          {error.message}
        </pre>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin - Productos</h1>
          <Link
            href="/admin/orders"
            className="mt-1 text-sm text-blue-600 hover:underline"
          >
            Ver pedidos →
          </Link>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/new"
            className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            Nuevo producto
          </Link>
          <a
            href="/admin/logout"
            className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
          >
            Salir
          </a>
        </div>
      </div>

      {!products || products.length === 0 ? (
        <p className="mt-6 text-gray-600">No hay productos.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Nombre
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Precio
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((p: Product) => {
                const displayName = p.name ?? p.title ?? "Sin nombre";
                return (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {p.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-medium" style={{ color: "#1a1a1a" }}>
                      {displayName}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      /{p.slug}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#1a1a1a" }}>
                      $ {formatARS(p.price)}
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: "#1a1a1a" }}>{p.stock ?? 0}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/${p.id}`}
                          className="text-blue-600 hover:underline"
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
    </main>
  );
}
