import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#e8ecf0" }}>
      <div className="text-center px-6">
        <h1 className="text-6xl font-bold text-gray-900">404</h1>
        <p className="mt-4 text-lg text-gray-600">La página que buscás no existe</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            Ir al inicio
          </Link>
          <Link
            href="/catalogo"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
