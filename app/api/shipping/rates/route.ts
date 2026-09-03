import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

const MICORREO_BASE_URL = "https://api.correoargentino.com.ar/micorreo/v1";
const ORIGIN_POSTAL_CODE = "1876"; // Bernal Este

const PACKAGING_OVERHEAD_GRAMS: Record<string, number> = {
  pokemon: 15,
  diecast: 170,
  especiales: 15,
};
const DEFAULT_PACKAGING_OVERHEAD_GRAMS = 15;

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const email = process.env.MICORREO_EMAIL;
  const password = process.env.MICORREO_PASSWORD;

  if (!email || !password) {
    throw new Error("MiCorreo credentials not configured");
  }

  const credentials = Buffer.from(`${email}:${password}`).toString("base64");

  const res = await fetch(`${MICORREO_BASE_URL}/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[shipping] Token error:", res.status, text);
    throw new Error(`Failed to get MiCorreo token: ${res.status}`);
  }

  const data = await res.json();
  const token = data.token;

  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return token;
}

type CartItem = {
  product_id: string;
  quantity: number;
};

type ProductPackageInfo = {
  id: string;
  weight_grams: number | null;
  height_cm: number | null;
  width_cm: number | null;
  length_cm: number | null;
  category: string | null;
};

async function computePackageDimensions(items: CartItem[]) {
  const supabase = getSupabaseAdmin();
  const productIds = items.map((i) => i.product_id);

  const { data: products, error } = await supabase
    .from("products")
    .select("id, weight_grams, height_cm, width_cm, length_cm, category")
    .in("id", productIds);

  if (error || !products) {
    throw new Error("No se pudo obtener info de productos para calcular el envío");
  }

  const productMap = new Map<string, ProductPackageInfo>(
    (products as ProductPackageInfo[]).map((p) => [p.id, p])
  );

  let totalWeight = 0;
  let maxHeight = 1;
  let maxWidth = 1;
  let maxLength = 1;
  let maxOverhead = DEFAULT_PACKAGING_OVERHEAD_GRAMS;

  for (const item of items) {
    const product = productMap.get(item.product_id);
    if (!product) continue;

    const weight = product.weight_grams ?? 200;
    const height = product.height_cm ?? 5;
    const width = product.width_cm ?? 15;
    const length = product.length_cm ?? 20;
    const overhead = product.category
      ? PACKAGING_OVERHEAD_GRAMS[product.category] ?? DEFAULT_PACKAGING_OVERHEAD_GRAMS
      : DEFAULT_PACKAGING_OVERHEAD_GRAMS;

    totalWeight += weight * item.quantity;
    maxHeight = Math.max(maxHeight, height);
    maxWidth = Math.max(maxWidth, width);
    maxLength = Math.max(maxLength, length);
    maxOverhead = Math.max(maxOverhead, overhead);
  }

  totalWeight += maxOverhead;

  totalWeight = Math.min(Math.max(totalWeight, 1), 25000);
  maxHeight = Math.min(maxHeight, 150);
  maxWidth = Math.min(maxWidth, 150);
  maxLength = Math.min(maxLength, 150);

  return {
    weight: Math.round(totalWeight),
    height: Math.round(maxHeight),
    width: Math.round(maxWidth),
    length: Math.round(maxLength),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { postalCode, items } = await request.json();

    if (!postalCode || typeof postalCode !== "string" || postalCode.length < 4) {
      return NextResponse.json({ error: "Código postal inválido" }, { status: 400 });
    }

    const rates: any[] = [];

    const localCodes = ["1870", "1871", "1872", "1873", "1874", "1875", "1876", "1877", "1878", "1879"];
    if (localCodes.includes(postalCode)) {
      rates.push({
        id: "local_free",
        name: "Entrega en mano",
        description: "Coordinamos entrega por WhatsApp · Zona Quilmes",
        price: 0,
        deliveryTime: "A coordinar",
        type: "L",
      });
      return NextResponse.json({ rates, postalCode });
    }

    const customerId = process.env.MICORREO_CUSTOMER_ID;

    if (
      customerId &&
      process.env.MICORREO_EMAIL &&
      process.env.MICORREO_PASSWORD &&
      Array.isArray(items) &&
      items.length > 0
    ) {
      try {
        const dimensions = await computePackageDimensions(items);
        const token = await getToken();

        const res = await fetch(`${MICORREO_BASE_URL}/rates`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerId,
            postalCodeOrigin: ORIGIN_POSTAL_CODE,
            postalCodeDestination: postalCode,
            dimensions,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.rates) && data.rates.length > 0) {
            for (const r of data.rates) {
              rates.push({
                id: `correo_${r.deliveredType}`,
                name:
                  r.deliveredType === "D"
                    ? "Correo Argentino - A domicilio"
                    : "Correo Argentino - Retiro en sucursal",
                description: `${r.productName} · ${r.deliveryTimeMin}-${r.deliveryTimeMax} días hábiles`,
                price: r.price,
                deliveryTime: `${r.deliveryTimeMin}-${r.deliveryTimeMax} días hábiles`,
                type: r.deliveredType,
              });
            }
          }
        } else {
          const text = await res.text();
          console.error("[shipping] MiCorreo /rates error:", res.status, text);
        }
      } catch (err) {
        console.error("[shipping] Error cotizando con MiCorreo:", err);
      }
    }

    if (rates.length === 0) {
      rates.push({
        id: "whatsapp_shipping",
        name: "Envío por Correo Argentino",
        description: "Coordinamos el costo del envío por WhatsApp antes de despachar",
        price: -1,
        deliveryTime: "3-5 días hábiles",
        type: "W",
      });
    }

    return NextResponse.json({ rates, postalCode });
  } catch (err) {
    console.error("[shipping] Error:", err);
    return NextResponse.json({ error: "Error al cotizar envío" }, { status: 500 });
  }
}
