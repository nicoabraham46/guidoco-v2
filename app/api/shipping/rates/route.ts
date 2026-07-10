import { NextRequest, NextResponse } from "next/server";

const MICORREO_BASE_URL = "https://api.correoargentino.com.ar/micorreo/v1";

// Default package dimensions for cards
const DEFAULT_DIMENSIONS = {
  weight: 200, // gramos
  height: 5,   // cm
  width: 15,   // cm
  length: 20,  // cm
};

const ORIGIN_POSTAL_CODE = "1876"; // Bernal Este

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  // Return cached token if still valid (with 5 min buffer)
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

  // Cache token for 50 minutes (tokens usually last 1 hour)
  cachedToken = {
    token,
    expiresAt: Date.now() + 50 * 60 * 1000,
  };

  return token;
}

export async function POST(request: NextRequest) {
  try {
    const { postalCode } = await request.json();

    if (!postalCode || typeof postalCode !== "string" || postalCode.length < 4) {
      return NextResponse.json({ error: "Código postal inválido" }, { status: 400 });
    }

    const customerId = process.env.MICORREO_CUSTOMER_ID;
    if (!customerId) {
      return NextResponse.json({ error: "Shipping not configured" }, { status: 500 });
    }

    // Check if it's local (same postal code = free hand delivery)
    const isLocal = postalCode === ORIGIN_POSTAL_CODE;

    let rates: any[] = [];

    try {
      const token = await getToken();

      const ratesRes = await fetch(`${MICORREO_BASE_URL}/rates`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId,
          postalCodeOrigin: ORIGIN_POSTAL_CODE,
          postalCodeDestination: postalCode,
          dimensions: DEFAULT_DIMENSIONS,
        }),
      });

      if (ratesRes.ok) {
        const ratesData = await ratesRes.json();
        rates = (ratesData.rates || []).map((r: any) => ({
          id: `${r.productType}_${r.deliveredType}`,
          name: r.deliveredType === "D" ? "Envío a domicilio" : "Retiro en sucursal",
          description: `${r.productName} (${r.deliveryTimeMin}-${r.deliveryTimeMax} días hábiles)`,
          price: Math.round(r.price),
          deliveryTime: `${r.deliveryTimeMin}-${r.deliveryTimeMax} días hábiles`,
          type: r.deliveredType, // D = domicilio, S = sucursal
        }));
      } else {
        console.error("[shipping] Rates error:", ratesRes.status, await ratesRes.text());
      }
    } catch (err) {
      console.error("[shipping] API error:", err);
    }

    // Always add free local delivery option if same zone
    if (isLocal) {
      rates.unshift({
        id: "local_free",
        name: "Entrega en mano",
        description: "Coordinamos por WhatsApp (zona Bernal)",
        price: 0,
        deliveryTime: "A coordinar",
        type: "L",
      });
    }

    // If no rates from API, add WhatsApp coordination as fallback
    if (rates.length === 0) {
      rates.push({
        id: "whatsapp",
        name: "Envío a coordinar",
        description: "Te contactamos por WhatsApp para cotizar el envío",
        price: 0,
        deliveryTime: "A coordinar",
        type: "W",
      });
    }

    return NextResponse.json({ rates, postalCode });
  } catch (err) {
    console.error("[shipping] Error:", err);
    return NextResponse.json({ error: "Error al cotizar envío" }, { status: 500 });
  }
}
