-- =========================================
-- EXTENSION NECESARIA
-- =========================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================
-- SCHEMA PARA PEDIDOS (ORDERS)
-- =========================================

-- 1) Tabla ORDERS
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Estado del pedido
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN (
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    )),

  -- Información monetaria
  currency TEXT NOT NULL DEFAULT 'ARS',
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,

  -- Información del cliente
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Dirección de envío (JSON)
  shipping_address JSONB,

  -- Notas
  notes TEXT,

  -- Información de pago
  payment_provider TEXT,
  payment_status TEXT NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_reference TEXT,

  -- Metadata adicional
  metadata JSONB
);

-- 2) Tabla ORDER_ITEMS
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,

  -- Relación con order
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,

  -- Relación con product (no cascada)
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,

  -- Snapshot del producto al momento de la compra
  product_name_snapshot TEXT NOT NULL,

  -- Precios y cantidad
  unit_price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  line_total NUMERIC(10, 2) NOT NULL
);

-- =========================================
-- ÍNDICES PARA PERFORMANCE
-- =========================================

CREATE INDEX IF NOT EXISTS idx_orders_created_at
  ON orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_status
  ON orders(status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id
  ON order_items(order_id);

CREATE INDEX IF NOT EXISTS idx_order_items_product_id
  ON order_items(product_id);

-- =========================================
-- ROW LEVEL SECURITY (RLS)
-- =========================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Sin policies públicas.
-- Acceso solo desde server usando service_role.

-- =========================================
-- COMENTARIOS
-- =========================================

COMMENT ON TABLE orders IS 'Tabla de pedidos del sistema';
COMMENT ON TABLE order_items IS 'Items/productos de cada pedido';

COMMENT ON COLUMN orders.status IS
  'Estado: pending, confirmed, processing, shipped, delivered, cancelled, refunded';

COMMENT ON COLUMN orders.shipping_address IS
  'JSON: {street, city, state, zip, country}';

COMMENT ON COLUMN orders.metadata IS
  'Datos adicionales en JSON (tracking, notas internas, etc)';

COMMENT ON COLUMN order_items.product_name_snapshot IS
  'Nombre del producto al momento de la compra';

COMMENT ON COLUMN order_items.line_total IS
  'Total de la línea (unit_price * quantity)';
