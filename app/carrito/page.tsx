"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/contexts/CartContext";
import { sanitizeImageUrl } from "@/lib/images";
import { formatARS } from "@/lib/format";

type CustomerData = {
  name: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  notes: string;
};

const CUSTOMER_STORAGE_KEY = "customer_data";

// ── Estilos reutilizables ─────────────────────────────────────────────────────

const inputClass =
  "mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-[#1a1a1a]";

const labelClass = "block text-[13px] font-medium text-gray-600";

// ── QuantityControl ───────────────────────────────────────────────────────────

function QuantityControl({
  quantity,
  max,
  onChange,
  onRemove,
}: {
  quantity: number;
  max: number;
  onChange: (q: number) => void;
  onRemove: () => void;
}) {
  const atMax = quantity >= max;
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => (quantity === 1 ? onRemove() : onChange(quantity - 1))}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800"
        aria-label="Disminuir cantidad"
      >
        −
      </button>
      <span className="w-7 text-center text-sm font-semibold text-gray-900">
        {quantity}
      </span>
      <button
        onClick={() => !atMax && onChange(quantity + 1)}
        disabled={atMax}
        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 text-sm text-gray-500 transition-colors hover:border-gray-400 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-gray-200 disabled:hover:text-gray-500"
        aria-label="Aumentar cantidad"
        title={atMax ? "No hay más unidades disponibles" : undefined}
      >
        +
      </button>
    </div>
  );
}

// ── SectionTitle ──────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="h-5 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
      <h2 className="text-base font-semibold text-gray-900">{children}</h2>
    </div>
  );
}

// ── Página ────────────────────────────────────────────────────────────────────

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, syncStock, clearCart, totalPrice } = useCart();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerData>({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    notes: "",
  });

  const [postalCode, setPostalCode] = useState("");
  const [shippingRates, setShippingRates] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<any>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingError, setShippingError] = useState("");

  const [liveStock, setLiveStock] = useState<Record<string, number>>({});
  const [stockAdjusted, setStockAdjusted] = useState(false);

  // Re-consultar el stock actual: puede haber cambiado desde que se agregó al carrito
  useEffect(() => {
    if (items.length === 0) return;
    const productIds = items.map((i) => i.product_id);
    fetch("/api/products/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.stock) return;
        setLiveStock(data.stock);
        let adjusted = false;
        for (const item of items) {
          const current = data.stock[item.product_id] ?? 0;
          if (item.quantity > current) {
            adjusted = true;
          }
          if (current !== item.stock) {
            syncStock(item.product_id, current);
          }
        }
        if (adjusted) setStockAdjusted(true);
      })
      .catch(() => {
        // Si falla, seguimos con el stock que ya tenía cada item en el carrito
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CUSTOMER_STORAGE_KEY);
      if (saved) setFormData(JSON.parse(saved));
    } catch {
      // ignorar
    }
  }, []);

  function handleInputChange(field: keyof CustomerData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function validateEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function fetchShippingRates(cp: string) {
    if (cp.length < 4) {
      setShippingRates([]);
      setSelectedShipping(null);
      return;
    }
    setLoadingShipping(true);
    setShippingError("");
    try {
      const res = await fetch("/api/shipping/rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postalCode: cp }),
      });
      const data = await res.json();
      if (res.ok && data.rates) {
        setShippingRates(data.rates);
        setSelectedShipping(data.rates.length === 1 ? data.rates[0] : null);
      } else {
        setShippingError("No pudimos cotizar el envío. Coordinamos por WhatsApp.");
        setShippingRates([]);
      }
    } catch {
      setShippingError("Error al consultar envío. Coordinamos por WhatsApp.");
      setShippingRates([]);
    }
    setLoadingShipping(false);
  }

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) { setError("El nombre es requerido"); return; }
    if (!formData.email.trim()) { setError("El email es requerido"); return; }
    if (!validateEmail(formData.email)) { setError("Email inválido"); return; }
    if (postalCode.length === 4 && shippingRates.length > 0 && !selectedShipping) {
      setError("Seleccioná un método de envío");
      return;
    }

    setLoading(true);
    try {
      localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(formData));

      const shippingAddress = formData.street || formData.city || postalCode
        ? {
            ...(formData.street && { street: formData.street }),
            ...(formData.city && { city: formData.city }),
            ...(postalCode && { zip: postalCode }),
            country: "Argentina",
          }
        : undefined;

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone || undefined,
          shipping_address: shippingAddress,
          notes: formData.notes || undefined,
          shipping_cost: selectedShipping?.price > 0 ? selectedShipping.price : 0,
          shipping_method: selectedShipping?.name || undefined,
          items: items.map((item) => ({ product_id: item.product_id, quantity: item.quantity })),
        }),
      });

      const data = await response.json();

      if (response.status === 201) {
        clearCart();
        // Crear preferencia de pago y redirigir a Mercado Pago
        try {
          const mpRes = await fetch("/api/payments/mercadopago", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderId: data.orderId }),
          });
          const mpData = await mpRes.json();

          if (mpRes.ok && mpData.init_point) {
            // Redirigir a Mercado Pago
            window.location.href = mpData.init_point;
          } else {
            // Si MP falla, ir a la página de gracias con botón de pago
            window.location.href = `/gracias?orderId=${data.orderId}`;
          }
        } catch {
          // Si hay error de conexión, ir a gracias como fallback
          window.location.href = `/gracias?orderId=${data.orderId}`;
        }
      } else {
        setError(data.error || "Error al procesar la compra");
        setLoading(false);
      }
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
      setLoading(false);
    }
  }

  // ── Vista: carrito vacío ──────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
        <div className="mx-auto max-w-md px-6 py-28 text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-200"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
          <h1 className="mt-6 text-xl font-medium text-gray-900">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm text-gray-500">Agregá productos desde el catálogo.</p>
          <Link
            href="/catalogo"
            className="mt-8 inline-block rounded-lg px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#1a1a1a" }}
          >
            Ver catálogo
          </Link>
        </div>
      </main>
    );
  }

  // ── Vista: lista de items ─────────────────────────────────────────────────
  if (!checkoutOpen) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
        <div className="mx-auto max-w-2xl px-6 py-10">

          {/* Header */}
          <Link href="/catalogo" className="text-sm text-gray-400 transition-colors hover:text-gray-700">
            ← Seguir comprando
          </Link>

          <div className="mt-6 mb-8 flex items-center gap-3">
            <div className="h-6 w-1 rounded-full" style={{ backgroundColor: "#C0392B" }} />
            <h1 className="text-xl font-semibold text-gray-900">Carrito</h1>
          </div>

          {stockAdjusted && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
              Ajustamos la cantidad de algún producto porque su stock disponible cambió.
            </p>
          )}

          {/* Items */}
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const imageUrl = sanitizeImageUrl(item.image_url);
              const maxQty = liveStock[item.product_id] ?? item.stock;
              return (
                <div
                  key={item.product_id}
                  className="flex items-center gap-4 rounded-lg bg-gray-50 px-3 py-3"
                >
                  {/* Imagen */}
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <svg className="h-6 w-6 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Nombre */}
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-[14px] font-medium text-gray-900">{item.name}</p>
                    <p className="mt-0.5 text-xs text-gray-400">${formatARS(item.price)} c/u</p>
                  </div>

                  {/* Cantidad */}
                  <QuantityControl
                    quantity={item.quantity}
                    max={maxQty}
                    onChange={(q) => updateQuantity(item.product_id, q)}
                    onRemove={() => removeItem(item.product_id)}
                  />

                  {/* Subtotal */}
                  <p className="w-24 text-right text-[14px] font-medium text-gray-900">
                    ${formatARS(item.price * item.quantity)}
                  </p>

                  {/* Eliminar */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="ml-1 text-gray-300 transition-colors hover:text-red-500"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Total + CTA */}
          <div className="mt-6 border-t border-gray-100 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-[22px] font-medium text-gray-900">${formatARS(totalPrice)}</span>
            </div>
            <div style={{
              marginTop: 16,
              padding: "10px 14px",
              backgroundColor: "rgba(192, 57, 43, 0.06)",
              border: "1px solid rgba(192, 57, 43, 0.25)",
              borderRadius: 10,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
            }}>
              <span style={{ fontSize: 16, lineHeight: 1.3 }}>💳</span>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: "#8a3428" }}>
                Vas a ver el nombre <strong>"Luciana"</strong> al pagar con Mercado Pago — es la cuenta autorizada de Guidoco para recibir pagos.
              </p>
            </div>
            <button
              onClick={() => setCheckoutOpen(true)}
              className="mt-4 w-full rounded-lg text-[15px] font-bold text-white transition-colors hover:bg-[#333]"
              style={{ backgroundColor: "#1a1a1a", height: "52px" }}
            >
              Finalizar compra →
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">🔒 Compra segura · Mercado Pago</p>
          </div>

        </div>
      </main>
    );
  }

  // ── Vista: checkout ───────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-5xl px-6 py-10">

        {/* Volver */}
        <button
          onClick={() => { setCheckoutOpen(false); setError(null); }}
          className="mb-8 flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-gray-700"
        >
          ← Volver al carrito
        </button>

        <div className="grid gap-10 lg:grid-cols-[1fr_360px]">

          {/* ── Formulario ── */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Datos de contacto */}
            <section>
              <SectionTitle>Datos de contacto</SectionTitle>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Nombre completo <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Juan Pérez"
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="juan@ejemplo.com"
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="phone" className={labelClass}>
                    Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+54 11 1234-5678"
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>
              </div>
            </section>

            {/* Dirección */}
            <section>
              <div className="mb-4">
                <p className="text-[14px] font-medium text-gray-700">
                  Dirección de envío{" "}
                  <span className="text-[13px] font-normal text-gray-400">
                    (calle y ciudad opcionales, código postal requerido para cotizar envío)
                  </span>
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="street" className={labelClass}>Calle y número</label>
                  <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={(e) => handleInputChange("street", e.target.value)}
                    placeholder="Av. Corrientes 1234"
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>

                <div>
                  <label htmlFor="city" className={labelClass}>Ciudad</label>
                  <input
                    type="text"
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder="Buenos Aires"
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>

                <div>
                  <label htmlFor="postalCode" className={labelClass}>
                    Código postal <span style={{ color: "#C0392B" }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={postalCode}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                      setPostalCode(v);
                      if (v.length === 4) fetchShippingRates(v);
                      else {
                        setShippingRates([]);
                        setSelectedShipping(null);
                        setShippingError("");
                      }
                    }}
                    placeholder="Ej: 1876"
                    maxLength={4}
                    required
                    className={inputClass}
                    style={{ height: "44px" }}
                  />
                </div>

                <div>
                  <label className={labelClass}>País</label>
                  <input
                    type="text"
                    value="Argentina"
                    readOnly
                    className={`${inputClass} cursor-default text-gray-400`}
                    style={{ height: "44px" }}
                  />
                </div>
              </div>

              {/* Opciones de envío */}
              {postalCode.length === 4 && (
                <div className="mt-4">
                  <label className={labelClass}>Método de envío *</label>
                  {loadingShipping && (
                    <p className="mt-1 text-sm text-gray-400">Cotizando envío...</p>
                  )}
                  {shippingError && (
                    <p className="mt-1 text-sm text-amber-600">{shippingError}</p>
                  )}
                  {!loadingShipping && shippingRates.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {shippingRates.map((rate: any) => (
                        <label
                          key={rate.id}
                          className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors"
                          style={{
                            borderColor: selectedShipping?.id === rate.id ? "#C0392B" : "#e5e7eb",
                            backgroundColor: selectedShipping?.id === rate.id ? "#fef2f2" : "#fff",
                          }}
                        >
                          <input
                            type="radio"
                            name="shippingMethod"
                            value={rate.id}
                            checked={selectedShipping?.id === rate.id}
                            onChange={() => setSelectedShipping(rate)}
                            className="accent-red-600"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">{rate.name}</p>
                            <p className="text-xs text-gray-500">{rate.description}</p>
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{ color: rate.price === 0 ? "#16a34a" : "#1a1a1a" }}
                          >
                            {rate.price === 0 ? "Gratis" : rate.price < 0 ? "A coordinar" : `$${formatARS(rate.price)}`}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Notas */}
            <section>
              <div className="mb-4">
                <p className="text-[14px] font-medium text-gray-700">
                  Notas{" "}
                  <span className="text-[13px] font-normal text-gray-400">(opcional)</span>
                </p>
              </div>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                placeholder="Instrucciones especiales, horario de entrega, etc."
                className={`${inputClass} py-2.5`}
                style={{ height: "80px", resize: "none" }}
              />
            </section>

            {/* Error mobile */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 lg:hidden">
                {error}
              </div>
            )}

            {/* Botón mobile */}
            <button
              type="submit"
              disabled={loading || (postalCode.length === 4 && shippingRates.length > 0 && !selectedShipping)}
              className="w-full rounded-lg text-sm font-bold text-white transition-colors hover:bg-[#333] disabled:opacity-50 lg:hidden"
              style={{ backgroundColor: "#1a1a1a", height: "52px" }}
            >
              {loading ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
            </button>
          </form>

          {/* ── Resumen ── */}
          <aside>
            <div className="rounded-xl border border-gray-200 p-5" style={{ backgroundColor: "#fafafa" }}>
              <h2 className="mb-5 text-[15px] font-medium text-gray-900">Resumen del pedido</h2>

              {/* Items compactos */}
              <div className="space-y-3">
                {items.map((item) => {
                  const imageUrl = sanitizeImageUrl(item.image_url);
                  return (
                    <div key={item.product_id} className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-50">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={item.name}
                            width={40}
                            height={40}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-100" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-medium text-gray-800">{item.name}</p>
                        <p className="text-[12px] text-gray-400">×{item.quantity}</p>
                      </div>
                      <p className="text-[13px] font-medium text-gray-900">
                        ${formatARS(item.price * item.quantity)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Separador + totales */}
              <div className="my-4 border-t border-gray-100" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>${formatARS(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Envío</span>
                  {selectedShipping ? (
                    <span className="font-medium text-gray-900">
                      {selectedShipping.price === 0
                        ? "Gratis"
                        : selectedShipping.price < 0
                        ? "A coordinar"
                        : `$${formatARS(selectedShipping.price)}`}
                    </span>
                  ) : (
                    <span className="italic text-gray-400">
                      {postalCode.length === 4 ? "Seleccioná un método" : "Ingresá tu código postal"}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-[15px] font-medium text-gray-900">Total</span>
                <span className="text-[18px] font-medium text-gray-900">
                  ${formatARS(totalPrice + (selectedShipping?.price > 0 ? selectedShipping.price : 0))}
                </span>
              </div>

              {/* Error desktop */}
              {error && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Botón desktop */}
              <button
                onClick={handleSubmit}
                disabled={loading || (postalCode.length === 4 && shippingRates.length > 0 && !selectedShipping)}
                className="mt-5 hidden w-full rounded-lg text-sm font-bold text-white transition-colors hover:bg-[#333] disabled:opacity-50 lg:block"
                style={{ backgroundColor: "#1a1a1a", height: "52px" }}
              >
                {loading ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
              </button>

              <p className="mt-2 text-center text-[12px] text-gray-400">
                🔒 Pago procesado por Mercado Pago
              </p>
            </div>
          </aside>

        </div>
      </div>
    </main>
  );
}
