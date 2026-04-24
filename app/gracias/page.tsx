import Link from "next/link";
import { getOrderById, type OrderStatus } from "@/lib/orders";
import { formatARS } from "@/lib/format";
import PayButton from "./PayButton";

type SearchParams = {
  orderId?: string;
  payment?: "success" | "failure" | "pending";
};

function getStatusBadge(status: OrderStatus) {
  const styles: Record<OrderStatus, string> = {
    pending: "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
    confirmed: "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
    processing: "bg-purple-100 text-purple-800 ring-1 ring-purple-200",
    shipped: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
    delivered: "bg-green-100 text-green-800 ring-1 ring-green-200",
    cancelled: "bg-red-100 text-red-800 ring-1 ring-red-200",
    refunded: "bg-gray-100 text-gray-800 ring-1 ring-gray-200",
  };

  const labels: Record<OrderStatus, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    processing: "En proceso",
    shipped: "Enviado",
    delivered: "Entregado",
    cancelled: "Cancelado",
    refunded: "Reembolsado",
  };

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default async function GraciasPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { orderId, payment } = await searchParams;

  // Validar que existe orderId
  if (!orderId) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">Pedido inválido</h1>
            <p className="mt-4 text-gray-600">
              No se proporcionó un ID de pedido válido.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Obtener pedido desde DB
  const order = await getOrderById(orderId);

  // Validar que el pedido existe
  if (!order) {
    return (
      <main className="min-h-screen" style={{ backgroundColor: "#e8ecf0" }}>
        <div className="mx-auto max-w-2xl px-6 py-16 text-center">
          <div className="rounded-3xl border bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900">Pedido no encontrado</h1>
            <p className="mt-4 text-gray-600">
              No se encontró un pedido con el ID proporcionado.
            </p>
            <p className="mt-2 text-sm font-mono text-gray-500">
              {orderId}
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:opacity-90"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-12">
        {/* Header con checkmark */}
        <div className="rounded-3xl border bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="mt-6 text-3xl font-bold text-gray-900">
              {payment === "success" ? "¡Gracias por tu compra!" : "Pedido registrado"}
            </h1>
            <p className="mt-3 text-gray-600">
              {payment === "success"
                ? "Tu pago fue procesado correctamente. ¡Gracias por elegirnos!"
                : "Tu pedido fue registrado. Completá el pago para confirmarlo."}
            </p>
          </div>

          {/* Información del pedido */}
          <div className="mt-8 rounded-2xl bg-gray-50 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">ID del pedido:</span>
                <span className="font-mono text-sm text-gray-900">
                  {orderId.slice(0, 8)}...
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600">Estado:</span>
                {getStatusBadge(order.status)}
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium text-gray-600">Email:</span>
                <span className="text-sm text-gray-900">{order.customer_email}</span>
              </div>
            </div>
          </div>

          {/* Lista de productos */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900">Productos</h2>
            <div className="mt-4 space-y-3">
              {(order.order_items ?? []).map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border bg-white p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.product_name_snapshot}
                    </p>
                    <p className="mt-1 text-sm text-gray-600">
                      ${formatARS(item.unit_price)} × {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${formatARS(item.line_total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="mt-6 rounded-2xl bg-gray-900 p-6 text-white">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold">
                ${formatARS(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Feedback del pago si vuelve desde MP */}
          {payment === "success" && (
            <div className="mt-6 rounded-xl bg-green-50 p-4 text-sm text-green-900">
              <p className="font-medium">¡Pago recibido!</p>
              <p className="mt-1">Tu pago fue procesado correctamente.</p>
            </div>
          )}
          {payment === "failure" && (
            <div className="mt-6 rounded-xl bg-red-50 p-4 text-sm text-red-900">
              <p className="font-medium">El pago no se completó.</p>
              <p className="mt-1">Podés intentarlo de nuevo cuando quieras.</p>
            </div>
          )}
          {payment === "pending" && (
            <div className="mt-6 rounded-xl bg-yellow-50 p-4 text-sm text-yellow-900">
              <p className="font-medium">Pago pendiente de acreditación.</p>
              <p className="mt-1">Te avisaremos cuando se confirme.</p>
            </div>
          )}

          {/* Mensaje de seguimiento (solo si aún no pagó) */}
          {!payment && (
            <div className="mt-6 rounded-xl bg-blue-50 p-4 text-sm text-blue-900">
              <p className="font-medium">Próximos pasos:</p>
              <p className="mt-2">
                Podés pagar ahora online o nos pondremos en contacto a{" "}
                <strong>{order.customer_email}</strong> para coordinar.
              </p>
            </div>
          )}

          {/* Botones */}
          <div className="mt-8 space-y-3">
            {payment !== "success" && (
              <PayButton orderId={orderId} />
            )}
            <Link
              href="/"
              className="block w-full rounded-xl bg-black px-6 py-3 text-center font-semibold text-white hover:opacity-90"
            >
              Volver al catálogo
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
