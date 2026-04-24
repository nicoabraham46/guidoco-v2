"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductButton({ productId, productName }: { productId: string; productName: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm(`¿Estás seguro de que querés eliminar "${productName}"? Esta acción no se puede deshacer.`)) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/products/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Error al eliminar el producto");
        setLoading(false);
        return;
      }

      router.refresh();
    } catch {
      alert("Error de conexión");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:underline disabled:opacity-50"
      style={{ fontSize: 14 }}
    >
      {loading ? "..." : "Eliminar"}
    </button>
  );
}
