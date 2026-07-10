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

    const rates: any[] = [];

    // Entrega en mano gratis para zona Bernal
    const localCodes = ["1876", "1874", "1878", "1872", "1870"];
    if (localCodes.includes(postalCode)) {
      rates.push({
        id: "local_free",
        name: "Entrega en mano",
        description: "Coordinamos por WhatsApp · Zona Bernal",
        price: 0,
        deliveryTime: "A coordinar",
        type: "L",
      });
    }

    // TODO: Descomentar cuando MiCorreo habilite la API
    // if (customerId && email && password) { ... }

    // Para CPs que no son locales, opción de coordinar envío por WhatsApp
    if (!localCodes.includes(postalCode)) {
      rates.push({
        id: "whatsapp_shipping",
        name: "Envío por Correo Argentino",
        description: "Coordinamos el costo del envío por WhatsApp antes de despachar",
        price: -1, // -1 indica "a coordinar", no gratis
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
