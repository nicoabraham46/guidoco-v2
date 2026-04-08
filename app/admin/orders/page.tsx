import Link from "next/link";
import { listOrders } from "@/lib/orders";
import { formatARS } from "@/lib/format";

export default async function AdminOrdersPage() {
  const orders = await listOrders({ limit: 50, offset: 0 });

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin - Pedidos</h1>
          <Link
            href="/admin"
            className="mt-1 text-sm text-blue-600 hover:underline"
          >
            ← Volver a productos
          </Link>
        </div>
        <a
          href="/admin/logout"
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          Salir
        </a>
      </div>

      {!orders || orders.length === 0 ? (
        <p className="mt-6 text-gray-600">No hay pedidos todavía.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Fecha
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Cliente
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Estado
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Pago
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const date = new Date(order.created_at).toLocaleString("es-AR", {
                  dateStyle: "short",
                  timeStyle: "short",
                });

                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{date}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      {order.customer_name}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      $ {formatARS(order.total_amount)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getPaymentStatusColor(
                          order.payment_status
                        )}`}
                      >
                        {getPaymentStatusLabel(order.payment_status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Ver
                      </Link>
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

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "confirmed":
      return "bg-blue-100 text-blue-800";
    case "processing":
      return "bg-purple-100 text-purple-800";
    case "shipped":
      return "bg-indigo-100 text-indigo-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "confirmed":
      return "Confirmado";
    case "processing":
      return "Procesando";
    case "shipped":
      return "Enviado";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    case "refunded":
      return "Reembolsado";
    default:
      return status;
  }
}

function getPaymentStatusColor(status: string | null) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "paid":
      return "bg-green-100 text-green-800";
    case "failed":
      return "bg-red-100 text-red-800";
    case "refunded":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

function getPaymentStatusLabel(status: string | null) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    case "failed":
      return "Fallido";
    case "refunded":
      return "Reembolsado";
    default:
      return "N/A";
  }
}
