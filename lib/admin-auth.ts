/**
 * Genera el token de sesión admin como HMAC-SHA256(ADMIN_KEY, AUTH_SECRET).
 * Usa Web Crypto API para ser compatible con Edge Runtime (middleware) y Node.js.
 */
export async function getAdminSessionToken(): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(process.env.AUTH_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(process.env.ADMIN_KEY!)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
