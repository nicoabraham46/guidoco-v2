import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Preference } from "mercadopago";
import { getOrderById } from "@/lib/orders";

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken === "TEST-your-access-token-here") {
    console.error("[mp] MERCADOPAGO_ACCESS_TOKEN not configured");
    return NextResponse.json(
      { error: "Pago online no disponible en este momento" },
      { status: 503 }
    );
  }

  let orderId: string;
  try {
    const body = await request.json();
    orderId = body.orderId;
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!orderId) {
    return NextResponse.json({ error: "orderId requerido" }, { status: 400 });
  }

  console.log("[mp] Creating preference for order:", orderId);

  const order = await getOrderById(orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const client = new MercadoPago({ accessToken });
  const preference = new Preference(client);

  try {
    const items =
      order.order_items.length > 0
        ? order.order_items.map((item) => ({
            id: item.id,
            title: item.product_name_snapshot || "Pedido Guidoco",
            quantity: item.quantity,
            unit_price: item.unit_price,
            currency_id: "ARS" as const,
          }))
        : [
            {
              id: orderId,
              title: "Pedido Guidoco",
              quantity: 1,
              unit_price: order.total_amount,
              currency_id: "ARS" as const,
            },
          ];

    const result = await preference.create({
      body: {
        items,
        external_reference: orderId,
        back_urls: {
          success: `${baseUrl}/gracias?orderId=${orderId}&payment=success`,
          failure: `${baseUrl}/gracias?orderId=${orderId}&payment=failure`,
          pending: `${baseUrl}/gracias?orderId=${orderId}&payment=pending`,
        },
        auto_return: "approved",
      },
    });

    console.log("[mp] Preference created →", {
      orderId,
      preferenceId: result.id,
    });

    return NextResponse.json({ init_point: result.init_point });
  } catch (err) {
    console.error("[mp] Error creating preference:", {
      orderId,
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json(
      { error: "Error al crear la preferencia de pago" },
      { status: 500 }
    );
  }
}
