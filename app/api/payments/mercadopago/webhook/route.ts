import { NextRequest, NextResponse } from "next/server";
import MercadoPago, { Payment } from "mercadopago";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getOrderById, updatePaymentStatus, updateOrderStatus } from "@/lib/orders";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";

async function verifyMpSignature(
  request: NextRequest,
  body: { data?: { id?: string } }
): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;
  // Si no está configurado, skip en desarrollo
  if (!secret) return true;

  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  if (!xSignature || !xRequestId) return false;

  // Parsear ts y v1 del header x-signature (formato: "ts=...,v1=...")
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [k, ...v] = part.split("=");
      return [k.trim(), v.join("=").trim()] as [string, string];
    })
  );
  const { ts, v1 } = parts;
  if (!ts || !v1) return false;

  // Construir el manifest según la doc de MercadoPago
  const dataId = body.data?.id ?? "";
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

  // HMAC-SHA256 con Web Crypto
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(manifest));
  const computed = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1;
}

export async function POST(request: NextRequest) {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken || accessToken === "TEST-your-access-token-here") {
    return NextResponse.json({ error: "MP not configured" }, { status: 503 });
  }

  let body: { type?: string; data?: { id?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  // Verificar firma del webhook antes de procesar
  const signatureValid = await verifyMpSignature(request, body);
  if (!signatureValid) {
    console.warn("[webhook/mp] Invalid signature — request rejected");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // MP envía varios tipos de notificación — solo procesamos "payment"
  if (body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ ok: true });
  }

  const paymentId = String(body.data.id);
  console.log("[webhook/mp] Notification received, paymentId:", paymentId);

  try {
    // Obtener detalle del pago desde la API de MP
    const client = new MercadoPago({ accessToken });
    const paymentClient = new Payment(client);
    const payment = await paymentClient.get({ id: paymentId });

    console.log("[webhook/mp] Payment status:", payment.status, "| orderId:", payment.external_reference);

    // Solo procesamos pagos aprobados
    if (payment.status !== "approved") {
      return NextResponse.json({ ok: true, status: payment.status });
    }

    const orderId = payment.external_reference;
    if (!orderId) {
      console.error("[webhook/mp] Missing external_reference for payment:", paymentId);
      return NextResponse.json({ error: "No orderId" }, { status: 400 });
    }

    // Cargar la orden con sus items
    const order = await getOrderById(orderId);
    if (!order) {
      console.error("[webhook/mp] Order not found:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Idempotencia: si ya está pagada, no procesar de nuevo
    if (order.payment_status === "paid") {
      console.log("[webhook/mp] Already processed, skipping:", orderId);
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Decrementar stock atómicamente por cada item
    const supabase = getSupabaseAdmin();

    for (const item of order.order_items) {
      if (!item.product_id) continue;

      // Leer stock actual
      const { data: product, error: fetchError } = await supabase
        .from("products")
        .select("id, stock")
        .eq("id", item.product_id)
        .single();

      if (fetchError || !product) {
        console.warn("[webhook/mp] Product not found:", item.product_id);
        continue;
      }

      if (product.stock === null || product.stock < item.quantity) {
        console.warn("[webhook/mp] Insufficient stock for product:", {
          productId: item.product_id,
          stock: product.stock,
          required: item.quantity,
        });
        // Poner en 0 si no hay suficiente stock (edge case: stock ya fue vendido)
        await supabase
          .from("products")
          .update({ stock: 0 })
          .eq("id", item.product_id);
        continue;
      }

      // Actualizar con condición atómica: solo si stock >= quantity
      const { data: updated, error: updateError } = await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.product_id)
        .gte("stock", item.quantity)
        .select("id, stock");

      if (updateError) {
        console.error("[webhook/mp] Error updating stock:", { productId: item.product_id, updateError });
      } else {
        console.log("[webhook/mp] Stock updated:", {
          productId: item.product_id,
          from: product.stock,
          to: updated?.[0]?.stock,
        });
      }
    }

    // Marcar orden como pagada y confirmada
    await updatePaymentStatus(orderId, "paid", paymentId);
    await updateOrderStatus(orderId, "confirmed");

    // Enviar emails post-pago (no bloquea el webhook si falla)
    try {
      // Buscar imágenes y slugs de los productos para el email
      const productIds = order.order_items
        .map((item) => item.product_id)
        .filter((id): id is string => id !== null);

      let productDetails: Record<string, { slug: string | null; image_url: string | null }> = {};

      if (productIds.length > 0) {
        const { data: products } = await supabase
          .from("products")
          .select("id, slug, product_images(url, sort_order)")
          .in("id", productIds);

        if (products) {
          for (const p of products) {
            const images = (p.product_images ?? []) as { url: string | null; sort_order: number | null }[];
            const sorted = images.sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
            productDetails[p.id] = {
              slug: p.slug,
              image_url: sorted[0]?.url ?? null,
            };
          }
        }
      }

      const emailItemsWithImages = order.order_items.map((item) => ({
        product_name: item.product_name_snapshot || "Producto",
        unit_price: item.unit_price,
        quantity: item.quantity,
        product_id: item.product_id,
        image_url: item.product_id ? productDetails[item.product_id]?.image_url ?? null : null,
        slug: item.product_id ? productDetails[item.product_id]?.slug ?? null : null,
      }));

      await sendOrderConfirmationEmail({
        to: order.customer_email,
        orderId: order.id,
        total: order.total_amount,
        items: emailItemsWithImages,
        customerName: order.customer_name,
      });
      console.log("[webhook/mp] Confirmation email sent to:", order.customer_email);
    } catch (emailErr) {
      console.error("[webhook/mp] Error sending confirmation email:", emailErr);
    }

    try {
      const emailItems = order.order_items.map((item) => ({
        product_id: item.product_id,
        product_name: item.product_name_snapshot || "Producto",
        unit_price: item.unit_price,
        quantity: item.quantity,
      }));
      await sendAdminOrderNotification({
        orderId: order.id,
        total: order.total_amount,
        customerEmail: order.customer_email,
        items: emailItems,
      });
      console.log("[webhook/mp] Admin notification sent for order:", order.id);
    } catch (emailErr) {
      console.error("[webhook/mp] Error sending admin notification:", emailErr);
    }

    console.log("[webhook/mp] Order confirmed:", orderId);
    return NextResponse.json({ ok: true, orderId });

  } catch (err) {
    console.error("[webhook/mp] Unhandled error:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
