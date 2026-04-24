import Link from "next/link";
import { redirect } from "next/navigation";
import {
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/orders";
import { formatARS } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <h1 className="text-2xl font-bold">Pedido no encontrado</h1>
        <Link
          href="/admin/orders"
          className="mt-4 inline-block text-blue-600 hover:underline"
        >
          ← Volver a pedidos
        </Link>
      </main>
    );
  }

  async function handleUpdateStatus(formData: FormData) {
    "use server";

    const orderId = formData.get("order_id") as string;
    const newStatus = formData.get("status") as OrderStatus;

    await updateOrderStatus(orderId, newStatus);
    redirect(`/admin/orders/${orderId}`);
  }

  async function handleUpdatePayment(formData: FormData) {
    "use server";

    const orderId = formData.get("order_id") as string;
    const newPaymentStatus = formData.get("payment_status") as PaymentStatus;
    const paymentRef = formData.get("payment_reference") as string;

    await updatePaymentStatus(
      orderId,
      newPaymentStatus,
      paymentRef || undefined
    );
    redirect(`/admin/orders/${orderId}`);
  }

  const date = new Date(order.created_at).toLocaleString("es-AR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <main className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Volver a pedidos
        </Link>
      </div>

      <h1 className="text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</h1>
      <p className="mt-1 text-sm text-gray-500">{date}</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Información del cliente */}
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Cliente</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-medium">Nombre:</span>{" "}
              {order.customer_name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {order.customer_email}
            </p>
            {order.customer_phone && (
              <p>
                <span className="font-medium">Teléfono:</span>{" "}
                {order.customer_phone}
              </p>
            )}
          </div>
        </div>

        {/* Dirección de envío */}
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Dirección de envío</h2>
          {order.shipping_address ? (
            <div className="mt-3 space-y-1 text-sm">
              <p>{order.shipping_address.street}</p>
              <p>
                {order.shipping_address.city}
                {order.shipping_address.state &&
                  `, ${order.shipping_address.state}`}
              </p>
              {order.shipping_address.zip && <p>{order.shipping_address.zip}</p>}
              <p>{order.shipping_address.country}</p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500">No especificada</p>
          )}
        </div>
      </div>

      {/* Items del pedido */}
      <div className="mt-6 rounded-lg border bg-white p-5">
        <h2 className="font-semibold">Productos</h2>
        <div className="mt-3 overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Producto
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold">
                  Precio
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold">
                  Cantidad
                </th>
                <th className="px-4 py-2 text-right text-sm font-semibold">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.order_items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-2 text-sm">
                    {item.product_name_snapshot}
                  </td>
                  <td className="px-4 py-2 text-right text-sm">
                    $ {formatARS(item.unit_price)}
                  </td>
                  <td className="px-4 py-2 text-right text-sm">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium">
                    $ {formatARS(item.line_total)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-2 text-right text-sm font-semibold"
                >
                  Total:
                </td>
                <td className="px-4 py-2 text-right text-sm font-bold">
                  $ {formatARS(order.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Notas */}
      {order.notes && (
        <div className="mt-6 rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Notas</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
            {order.notes}
          </p>
        </div>
      )}

      {/* Acciones */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Actualizar estado del pedido */}
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Estado del pedido</h2>
          <form action={handleUpdateStatus} className="mt-3 space-y-3">
            <input type="hidden" name="order_id" value={order.id} />
            <select
              name="status"
              defaultValue={order.status}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="pending">Pendiente</option>
              <option value="confirmed">Confirmado</option>
              <option value="processing">Procesando</option>
              <option value="shipped">Enviado</option>
              <option value="delivered">Entregado</option>
              <option value="cancelled">Cancelado</option>
              <option value="refunded">Reembolsado</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Actualizar estado
            </button>
          </form>
        </div>

        {/* Actualizar estado de pago */}
        <div className="rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Estado de pago</h2>
          <form action={handleUpdatePayment} className="mt-3 space-y-3">
            <input type="hidden" name="order_id" value={order.id} />
            <select
              name="payment_status"
              defaultValue={order.payment_status || "pending"}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="failed">Fallido</option>
              <option value="refunded">Reembolsado</option>
            </select>
            <input
              type="text"
              name="payment_reference"
              placeholder="Referencia de pago (opcional)"
              defaultValue={order.payment_reference || ""}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
            >
              Actualizar pago
            </button>
          </form>
        </div>
      </div>

      {/* Información de pago */}
      {order.payment_provider && (
        <div className="mt-6 rounded-lg border bg-white p-5">
          <h2 className="font-semibold">Información de pago</h2>
          <div className="mt-3 space-y-2 text-sm">
            <p>
              <span className="font-medium">Proveedor:</span>{" "}
              {order.payment_provider}
            </p>
            {order.payment_reference && (
              <p>
                <span className="font-medium">Referencia:</span>{" "}
                {order.payment_reference}
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
