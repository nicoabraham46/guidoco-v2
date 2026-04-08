"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch("/admin/login/api", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      // Redirigir al admin
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Admin - Login</h1>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa la clave de administrador
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold"
              >
                Clave admin
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                autoFocus
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-black px-4 py-2 font-semibold text-white hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
