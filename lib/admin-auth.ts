const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 horas

async function hmacHex(message: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.AUTH_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Comparación de tiempo constante para evitar timing attacks al comparar
 * tokens, firmas o contraseñas.
 */
export function timingSafeEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) {
    let dummy = 0;
    for (let i = 0; i < a.length; i++) dummy |= a.charCodeAt(i);
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Genera un nuevo token de sesión admin con timestamp de emisión embebido.
 * Formato: `${issuedAt}.${firma}`
 */
export async function createAdminSessionToken(): Promise<string> {
  const issuedAt = Date.now().toString();
  const signature = await hmacHex(`${process.env.ADMIN_KEY}:${issuedAt}`);
  return `${issuedAt}.${signature}`;
}

/**
 * Verifica un token de sesión admin: chequea firma Y que no haya vencido
 * (24 horas desde la emisión).
 */
export async function verifyAdminSessionToken(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [issuedAt, signature] = parts;

  const issuedAtNum = Number(issuedAt);
  if (!Number.isFinite(issuedAtNum)) return false;

  const age = Date.now() - issuedAtNum;
  if (age < 0 || age > SESSION_MAX_AGE_MS) return false;

  const expectedSignature = await hmacHex(`${process.env.ADMIN_KEY}:${issuedAt}`);
  return timingSafeEqual(signature, expectedSignature);
}
