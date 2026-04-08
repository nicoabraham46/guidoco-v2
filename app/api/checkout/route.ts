import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createOrder, type ShippingAddress } from "@/lib/orders";
import { sendOrderConfirmationEmail, sendAdminOrderNotification } from "@/lib/email";

type CheckoutItem = {
  product_id: string;
  quantity: number;
};

type CheckoutRequest = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  items: CheckoutItem[];
};

type ProductFromDB = {
  id: string;
  name: string | null;
  title: string | null;
  price: number | null;
  stock: number | null;
};

export async function POST(request: NextRequest) {
  try {
    const body: CheckoutRequest = await request.json();

    // Validar campos requeridos
    if (!body.customer_name || !body.customer_email || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "Campos requeridos: customer_name, customer_email, items" },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.customer_email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // Validar que cada item tenga product_id y quantity válidos
    for (const item of body.items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return NextResponse.json(
          { error: "Cada item debe tener product_id y quantity > 0" },
          { status: 400 }
        );
      }
    }

    // Obtener todos los product_ids únicos (deduplicar)
    const productIds = Array.from(new Set(body.items.map((item) => item.product_id)));

    // Fetch productos desde DB (NO confiar en precios del cliente)
    // Usar supabaseAdmin para bypasear RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, title, price, stock")
      .in("id", productIds);

    if (productsError) {
      console.error("❌ Error fetching products:", {
        error: productsError,
        code: productsError.code,
        message: productsError.message,
        details: productsError.details,
        hint: productsError.hint,
      });
      return NextResponse.json(
        { error: "Error al obtener productos" },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: "No se encontraron productos válidos" },
        { status: 400 }
      );
    }

    // Validar que todos los productos existan
    const typedProducts = products as ProductFromDB[];
    if (typedProducts.length !== productIds.length) {
      const foundIds = typedProducts.map((p: ProductFromDB) => p.id);
      const missingIds = productIds.filter((id) => !foundIds.includes(id));
      return NextResponse.json(
        { error: `Productos no encontrados: ${missingIds.join(", ")}` },
        { status: 400 }
      );
    }

    // Crear un mapa de productos por ID para búsqueda rápida
    const productMap = new Map(typedProducts.map((p: ProductFromDB) => [p.id, p]));

    // Validar stock y precios
    const orderItems = [];
    for (const item of body.items) {
      const product = productMap.get(item.product_id);

      if (!product) {
        return NextResponse.json(
          { error: `Producto no encontrado: ${item.product_id}` },
          { status: 400 }
        );
      }

      // Validar precio existe
      if (product.price === null || product.price === undefined) {
        return NextResponse.json(
          { error: `Producto sin precio: ${product.name || product.title}` },
          { status: 400 }
        );
      }

      // Validar stock si existe
      if (product.stock !== null && product.stock !== undefined) {
        if (product.stock <= 0) {
          return NextResponse.json(
            { error: `Producto sin stock: ${product.name || product.title}` },
            { status: 400 }
          );
        }
        if (item.quantity > product.stock) {
          return NextResponse.json(
            { error: `Stock insuficiente para: ${product.name || product.title}. Disponible: ${product.stock}` },
            { status: 400 }
          );
        }
      }

      // Construir item con datos reales de DB
      orderItems.push({
        product_id: product.id,
        product_name: product.name || product.title || "Sin nombre",
        unit_price: product.price,
        quantity: item.quantity,
      });
    }

    // Crear pedido
    // El stock NO se decrementa aquí — se decrementa solo cuando el pago
    // se confirma via webhook de MercadoPago (payment_status → 'paid')
    console.log("📦 Creating order with:", {
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      items_count: orderItems.length,
      items: orderItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })),
    });

    const order = await createOrder({
      customer_name: body.customer_name,
      customer_email: body.customer_email,
      customer_phone: body.customer_phone,
      shipping_address: body.shipping_address,
      notes: body.notes,
      items: orderItems,
    });

    console.log("✅ Order created successfully:", {
      orderId: order.id,
      total_amount: order.total_amount,
    });

    // Enviar email de confirmación (no bloquea ni rompe la compra si falla)
    console.log("📧 Sending confirmation email to:", order.customer_email);
    await sendOrderConfirmationEmail({
      to: order.customer_email,
      orderId: order.id,
      total: order.total_amount,
    });
    console.log("📧 Email step completed for order:", order.id);

    // Notificar al admin (no bloquea ni rompe la compra si falla)
    await sendAdminOrderNotification({
      orderId: order.id,
      total: order.total_amount,
      customerEmail: order.customer_email,
      items: orderItems,
    });

    // Retornar orderId y total_amount
    return NextResponse.json(
      {
        orderId: order.id,
        total_amount: order.total_amount,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Checkout error:", error);
    console.error("Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: "Error al procesar el pedido" },
      { status: 500 }
    );
  }
}
