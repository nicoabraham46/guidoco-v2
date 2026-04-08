type Img = { url: string | null; sort_order: number | null };

export function sortImages<T extends Img>(images: T[]) {
  return (images ?? [])
    .filter((img) => !!img.url)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}

/**
 * Sanitiza una URL de imagen antes de pasarla a next/image.
 * - Elimina espacios al inicio/fin
 * - Re-codifica los segmentos del pathname (maneja espacios y caracteres no seguros)
 * - Retorna null si la URL es inválida o vacía
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    parsed.pathname = parsed.pathname
      .split("/")
      .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
      .join("/");
    return parsed.toString();
  } catch {
    return null;
  }
}
