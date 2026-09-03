const MICORREO_BASE_URL = "https://api.correoargentino.com.ar/micorreo/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

export async function getMiCorreoToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedToken.token;
  }

  const email = process.env.MICORREO_EMAIL?.trim();
  const password = process.env.MICORREO_PASSWORD?.trim();

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
    console.error("[micorreo] Token error:", res.status, text);
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

export const PACKAGING_OVERHEAD_GRAMS: Record<string, number> = {
  pokemon: 15,
  diecast: 170,
  especiales: 15,
};
export const DEFAULT_PACKAGING_OVERHEAD_GRAMS = 15;

export async function computeOrderPackageDimensions(
  items: { product_id: string | null; quantity: number }[]
) {
  const { getSupabaseAdmin } = await import("@/lib/supabase-admin");
  const supabase = getSupabaseAdmin();
  const productIds = items.map((i) => i.product_id).filter((id): id is string => id !== null);

  const { data: products } = await supabase
    .from("products")
    .select("id, weight_grams, height_cm, width_cm, length_cm, category")
    .in("id", productIds);

  const productMap = new Map(
    (products || []).map((p: any) => [p.id, p])
  );

  let totalWeight = 0;
  let maxHeight = 1;
  let maxWidth = 1;
  let maxLength = 1;
  let maxOverhead = DEFAULT_PACKAGING_OVERHEAD_GRAMS;
  let hadMissingProduct = false;

  for (const item of items) {
    const product = item.product_id ? productMap.get(item.product_id) : null;
    if (!product) {
      hadMissingProduct = true;
    }
    const weight = product?.weight_grams ?? 200;
    const height = product?.height_cm ?? 5;
    const width = product?.width_cm ?? 15;
    const length = product?.length_cm ?? 20;
    const overhead = product?.category
      ? PACKAGING_OVERHEAD_GRAMS[product.category] ?? DEFAULT_PACKAGING_OVERHEAD_GRAMS
      : DEFAULT_PACKAGING_OVERHEAD_GRAMS;

    totalWeight += weight * item.quantity;
    maxHeight = Math.max(maxHeight, height);
    maxWidth = Math.max(maxWidth, width);
    maxLength = Math.max(maxLength, length);
    maxOverhead = Math.max(maxOverhead, overhead);
  }

  totalWeight += maxOverhead;
  totalWeight = Math.min(Math.max(Math.round(totalWeight), 1), 25000);

  return {
    weight: totalWeight,
    height: Math.min(Math.round(maxHeight), 150),
    width: Math.min(Math.round(maxWidth), 150),
    length: Math.min(Math.round(maxLength), 150),
    hadMissingProduct,
  };
}

export function splitStreet(fullStreet: string | undefined): { streetName: string; streetNumber: string } {
  if (!fullStreet) return { streetName: "", streetNumber: "" };
  const match = fullStreet.trim().match(/^(.*?)(\d+)\s*$/);
  if (match) {
    return { streetName: match[1].trim(), streetNumber: match[2].trim() };
  }
  return { streetName: fullStreet.trim(), streetNumber: "" };
}

export const PROVINCE_CODES: { code: string; name: string }[] = [
  { code: "A", name: "Salta" },
  { code: "B", name: "Buenos Aires" },
  { code: "C", name: "Ciudad Autónoma de Buenos Aires" },
  { code: "D", name: "San Luis" },
  { code: "E", name: "Entre Ríos" },
  { code: "F", name: "La Rioja" },
  { code: "G", name: "Santiago del Estero" },
  { code: "H", name: "Chaco" },
  { code: "J", name: "San Juan" },
  { code: "K", name: "Catamarca" },
  { code: "L", name: "La Pampa" },
  { code: "M", name: "Mendoza" },
  { code: "N", name: "Misiones" },
  { code: "P", name: "Formosa" },
  { code: "Q", name: "Neuquén" },
  { code: "R", name: "Río Negro" },
  { code: "S", name: "Santa Fe" },
  { code: "T", name: "Tucumán" },
  { code: "U", name: "Chubut" },
  { code: "V", name: "Tierra del Fuego" },
  { code: "W", name: "Corrientes" },
  { code: "X", name: "Córdoba" },
  { code: "Y", name: "Jujuy" },
  { code: "Z", name: "Santa Cruz" },
];
