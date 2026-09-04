import { NextRequest, NextResponse } from "next/server";
import { getMiCorreoToken, computeOrderPackageDimensions, PACKAGING_OVERHEAD_GRAMS, DEFAULT_PACKAGING_OVERHEAD_GRAMS } from "@/lib/micorreo";

const MICORREO_BASE_URL = "https://api.correoargentino.com.ar/micorreo/v1";
const ORIGIN_POSTAL_CODE = "1876"; // Bernal Este

type CartItem = {
  product_id: string;
  quantity: number;
};

async function computePackageDimensions(items: CartItem[]) {
  const { hadMissingProduct: _hadMissingProduct, ...dimensions } = await computeOrderPackageDimensions(items);
  return dimensions;
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
        const token = await getMiCorreoToken();

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
          console.log("[shipping] Respuesta cruda de MiCorreo /rates:", JSON.stringify(data));
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
