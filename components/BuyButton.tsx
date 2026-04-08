"use client";

import { useState, useEffect } from "react";

type BuyButtonProps = {
  productId: string;
  productName: string;
};

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  notes: string;
};

export default function BuyButton({ productId, productName }: BuyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    notes: "",
  });

  // Cargar datos guardados de localStorage al montar
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("customer_data");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFormData(parsed);
        } catch (e) {
          // Ignorar errores de parsing
        }
      }
    }
  }, []);

  function handleInputChange(field: keyof CustomerData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  async function handleSubmit(e: { preventDefault: () => void }) {
    e.preventDefault();
    setError(null);

    // Validaciones
    if (!formData.name.trim()) {
      setError("El nombre es requerido");
      return;
    }

    if (!formData.email.trim()) {
      setError("El email es requerido");
      return;
    }

    if (!validateEmail(formData.email)) {
      setError("Email inválido");
      return;
    }

    setLoading(true);

    try {
      // Guardar datos en localStorage para próximas compras
      localStorage.setItem("customer_data", JSON.stringify(formData));

      // Preparar shipping_address solo si hay datos
      const shippingAddress =
        formData.street || formData.city
          ? {
              street: formData.street,
              city: formData.city,
              state: "",
              zip: "",
              country: "Argentina",
            }
          : undefined;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || undefined,
          shipping_address: shippingAddress,
          notes: formData.notes || undefined,
          items: [
            {
              product_id: productId,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        // Redirigir a página de gracias
        window.location.href = `/gracias?orderId=${data.orderId}`;
      } else {
        setError(data.error || "Error al procesar la compra");
        setLoading(false);
      }
    } catch (err) {
      console.error("Error en compra:", err);
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <>
      {/* Botón principal */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="w-full rounded-2xl bg-black px-4 py-3 font-semibold text-white hover:opacity-90"
      >
        Comprar
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Completar compra
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {productName}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nombre */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700"
                >
                  Nombre completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Juan Pérez"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="juan@ejemplo.com"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="+54 11 1234-5678"
                />
              </div>

              {/* Dirección */}
              <div className="space-y-3 rounded-xl bg-gray-50 p-4">
                <p className="text-sm font-medium text-gray-700">
                  Dirección de envío (opcional)
                </p>

                <div>
                  <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Calle y número"
                  />
                </div>

                <div>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                    placeholder="Ciudad"
                  />
                </div>
              </div>

              {/* Notas */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Notas adicionales (opcional)
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => handleInputChange("notes", e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                  placeholder="Instrucciones especiales, preferencias de entrega, etc."
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setError(null);
                  }}
                  disabled={loading}
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-black px-4 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? "Procesando..." : "Confirmar compra"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
