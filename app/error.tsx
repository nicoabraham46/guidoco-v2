"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("App error:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#e8ecf0" }}>
      <div className="text-center px-6">
        <h1 className="text-4xl font-bold text-gray-900">Algo salió mal</h1>
        <p className="mt-4 text-gray-600">Ocurrió un error inesperado. Por favor intentá de nuevo.</p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-lg px-6 py-3 text-sm font-semibold text-white"
            style={{ backgroundColor: "#C0392B" }}
          >
            Intentar de nuevo
          </button>
          <a
            href="/"
            className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-white"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    </main>
  );
}
