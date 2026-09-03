import Link from "next/link";
import { redirect } from "next/navigation";
import { getOrderById } from "@/lib/orders";
import { getMiCorreoToken, computeOrderPackageDimensions, splitStreet, PROVINCE_CODES } from "@/lib/micorreo";

export const dynamic = "force-dynamic";

export default async function GenerarEnvioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-bold text-gray-900">Pedido no encontrado</h1>
        <Link href="/admin/orders" className="mt-4 inline-block text-blue-600 hover:underline">
          ← Volver a pedidos
        </Link>
      </main>
    );
  }

  const dimensions = await computeOrderPackageDimensions(
    order.order_items.map((item) => ({ product_id: item.product_id, quantity: item.quantity }))
  );

  const { streetName, streetNumber } = splitStreet(order.shipping_address?.street);

  const shippingMethodName =
    (order.metadata as { shipping_method?: string } | null)?.shipping_method ?? "";
  const isSucursal = shippingMethodName.toLowerCase().includes("sucursal");

  const itemsTotal = order.order_items.reduce((sum, item) => sum + item.line_total, 0);

  async function generarEnvio(formData: FormData) {
    "use server";

    if (!order) {
      throw new Error("Pedido no encontrado");
    }

    const orderId = formData.get("order_id") as string;
    const deliveryType = formData.get("deliveryType") as string;
    const agency = (formData.get("agency") as string) || null;
    const recipientName = formData.get("recipientName") as string;
    const recipientPhone = (formData.get("recipientPhone") as string) || "";
    const recipientEmail = formData.get("recipientEmail") as string;
    const streetNameInput = (formData.get("streetName") as string) || "";
    const streetNumberInput = (formData.get("streetNumber") as string) || "";
    const city = (formData.get("city") as string) || "";
    const provinceCode = (formData.get("provinceCode") as string) || "";
    const postalCode = (formData.get("postalCode") as string) || "";
    const weight = parseInt(formData.get("weight") as string, 10);
    const height = parseInt(formData.get("height") as string, 10);
    const width = parseInt(formData.get("width") as string, 10);
    const length = parseInt(formData.get("length") as string, 10);
    const declaredValue = parseFloat(formData.get("declaredValue") as string);

    const customerId = process.env.MICORREO_CUSTOMER_ID?.trim();
    if (!customerId) {
      throw new Error("MICORREO_CUSTOMER_ID no configurado");
    }

    if (deliveryType === "D" && (!streetNameInput || !streetNumberInput || !city || !provinceCode || !postalCode)) {
      throw new Error("Para envío a domicilio, completá calle, número, ciudad, provincia y código postal");
    }
    if (deliveryType === "S" && !agency) {
      throw new Error("Para retiro en sucursal, completá el código de la sucursal");
    }

    const token = await getMiCorreoToken();

    const body: any = {
      customerId,
      extOrderId: orderId,
      orderNumber: String(order.order_number || orderId.slice(0, 8)),
      recipient: {
        name: recipientName,
        phone: recipientPhone,
        cellPhone: recipientPhone,
        email: recipientEmail,
      },
      shipping: {
        deliveryType,
        agency: deliveryType === "S" ? agency : null,
        productType: "CP",
        weight,
        declaredValue,
        height,
        length,
        width,
      },
    };

    if (deliveryType === "D") {
      body.shipping.address = {
        streetName: streetNameInput,
        streetNumber: streetNumberInput,
        floor: "",
        apartment: "",
        city,
        provinceCode,
        postalCode,
      };
    }

    const res = await fetch("https://api.correoargentino.com.ar/micorreo/v1/shipping/import", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("[generar-envio] Error de MiCorreo:", res.status, data);
      const msg = data?.message || "Error desconocido al generar el envío";
      redirect(`/admin/orders/${orderId}/enviar?error=${encodeURIComponent(msg)}`);
    }

    redirect(`/admin/orders/${orderId}?envio=generado`);
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <Link href={`/admin/orders/${order.id}`} className="text-sm text-blue-600 hover:underline">
        ← Volver al pedido
      </Link>

      <h1 className="mt-3 text-2xl font-bold text-gray-900">Generar envío — Pedido #{order.id.slice(0, 8)}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Revisá y completá los datos antes de confirmar. Esto crea el envío real en Correo Argentino.
      </p>

      {dimensions.hadMissingProduct && (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Uno o más productos de este pedido ya no existen en el catálogo — se usó un peso/dimensión por defecto. Revisá los valores antes de confirmar.
        </p>
      )}

      <form action={generarEnvio} className="mt-6 space-y-6">
        <input type="hidden" name="order_id" value={order.id} />

        <section className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold text-gray-800">Destinatario</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600">Nombre completo</label>
              <input name="recipientName" defaultValue={order.customer_name} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Teléfono</label>
              <input name="recipientPhone" defaultValue={order.customer_phone || ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-600">Email</label>
              <input name="recipientEmail" type="email" defaultValue={order.customer_email} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold text-gray-800">Método de envío</h2>
          <p className="mt-1 text-xs text-gray-400">Detectado del pedido: "{shippingMethodName || "no especificado"}" — confirmá que sea correcto.</p>
          <div className="mt-3 flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="deliveryType" value="D" defaultChecked={!isSucursal} />
              A domicilio
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="deliveryType" value="S" defaultChecked={isSucursal} />
              Retiro en sucursal
            </label>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600">Código de sucursal (solo si es retiro en sucursal)</label>
            <input name="agency" placeholder="Ej: B0107" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            <p className="mt-1 text-xs text-gray-400">Buscalo en el portal de MiCorreo si no lo tenés a mano.</p>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold text-gray-800">Dirección (para envío a domicilio)</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-600">Calle</label>
              <input name="streetName" defaultValue={streetName} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Número</label>
              <input name="streetNumber" defaultValue={streetNumber} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Ciudad</label>
              <input name="city" defaultValue={order.shipping_address?.city || ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Provincia</label>
              <select name="provinceCode" defaultValue="" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
                <option value="">Seleccionar...</option>
                {PROVINCE_CODES.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Código postal</label>
              <input name="postalCode" defaultValue={order.shipping_address?.zip || ""} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
        </section>

        <section className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold text-gray-800">Paquete</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-600">Peso (g)</label>
              <input name="weight" type="number" defaultValue={dimensions.weight} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Alto (cm)</label>
              <input name="height" type="number" defaultValue={dimensions.height} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Ancho (cm)</label>
              <input name="width" type="number" defaultValue={dimensions.width} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600">Largo (cm)</label>
              <input name="length" type="number" defaultValue={dimensions.length} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="mt-3">
            <label className="block text-xs font-medium text-gray-600">Valor declarado ($)</label>
            <input name="declaredValue" type="number" step="0.01" defaultValue={itemsTotal} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
        </section>

        <button type="submit" className="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white hover:opacity-90">
          Confirmar y generar envío real en Correo Argentino
        </button>
      </form>
    </main>
  );
}
