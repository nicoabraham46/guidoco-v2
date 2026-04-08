import { getSupabaseAdmin } from "./supabase-admin";

// =========================================
// TYPES
// =========================================

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Order = {
  id: string;
  created_at: string;
  status: OrderStatus;
  currency: string;
  total_amount: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string | null;
  shipping_address: ShippingAddress | null;
  notes: string | null;
  payment_provider: string | null;
  payment_status: PaymentStatus | null;
  payment_reference: string | null;
  metadata: Record<string, unknown> | null;
};

export type OrderItem = {
  id: string;
  created_at: string;
  order_id: string;
  product_id: string | null;
  product_name_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type ShippingAddress = {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
};

export type CreateOrderInput = {
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address?: ShippingAddress;
  notes?: string;
  payment_provider?: string;
  items: {
    product_id: string;
    product_name: string;
    unit_price: number;
    quantity: number;
  }[];
};

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

// =========================================
// FUNCTIONS
// =========================================

/**
 * Crear un nuevo pedido con sus items
 * Calcula automáticamente el total_amount sumando line_totals
 */
export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  // Calcular total_amount
  const total_amount = input.items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  // Crear order (usar supabaseAdmin para bypasear RLS)
  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: input.customer_name,
      customer_email: input.customer_email,
      customer_phone: input.customer_phone || null,
      shipping_address: input.shipping_address || null,
      notes: input.notes || null,
      payment_provider: input.payment_provider || null,
      total_amount,
      status: "pending",
      payment_status: "pending",
    })
    .select()
    .single();

  if (orderError || !order) {
    console.error("❌ Error creating order:", {
      error: orderError,
      code: orderError?.code,
      message: orderError?.message,
      details: orderError?.details,
      hint: orderError?.hint,
    });
    throw new Error(orderError?.message || "Error al crear el pedido");
  }

  // Crear order_items
  const orderItems = input.items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name,
    unit_price: item.unit_price,
    quantity: item.quantity,
    line_total: item.unit_price * item.quantity,
  }));

  const { data: insertedItems, error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems)
    .select();

  if (itemsError) {
    console.error("❌ Error creating order items:", {
      error: itemsError,
      code: itemsError.code,
      message: itemsError.message,
      details: itemsError.details,
      hint: itemsError.hint,
      orderId: order.id,
    });
    // Rollback: eliminar order si falló la creación de items
    await supabase.from("orders").delete().eq("id", order.id);
    throw new Error(itemsError.message || "Error al crear los items del pedido");
  }

  return {
    ...order,
    order_items: insertedItems || [],
  } as OrderWithItems;
}

/**
 * Obtener un pedido por ID con sus items
 */
export async function getOrderById(
  orderId: string
): Promise<OrderWithItems | null> {
  const supabase = getSupabaseAdmin();
  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    return null;
  }

  const { data: items, error: itemsError } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return {
    ...order,
    order_items: items || [],
  } as OrderWithItems;
}

/**
 * Listar todos los pedidos (admin)
 * Ordenados por fecha de creación (más recientes primero)
 */
export async function listOrders(options?: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<Order[]> {
  const limit = options?.limit ?? 50;
  const offset = options?.offset ?? 0;

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }

  query = query.range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as Order[];
}

/**
 * Actualizar el estado de un pedido
 */
export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Error al actualizar el pedido");
  }

  return data as Order;
}

/**
 * Actualizar el estado de pago de un pedido
 */
export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentReference?: string
): Promise<Order> {
  const updateData: {
    payment_status: PaymentStatus;
    payment_reference?: string;
  } = { payment_status: paymentStatus };

  if (paymentReference) {
    updateData.payment_reference = paymentReference;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Error al actualizar el estado de pago");
  }

  return data as Order;
}
