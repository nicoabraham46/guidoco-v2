const NEW_DAYS = 14;

export type UrgencyBadge = {
  label: string;
  className: string;
};

/** Returns urgency badge for stock === 1 or stock 2–3. Null otherwise. */
export function getUrgencyBadge(stock: number | null): UrgencyBadge | null {
  const s = stock ?? 0;
  if (s === 1)
    return {
      label: "Última unidad",
      className:
        "bg-amber-500/15 text-amber-400 border border-amber-500/30",
    };
  if (s > 1 && s <= 5)
    return {
      label: "Pocas unidades",
      className:
        "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    };
  return null;
}

/** True if created within the last NEW_DAYS days. */
export function isNewProduct(createdAt: string): boolean {
  const ms = Date.now() - new Date(createdAt).getTime();
  return ms < NEW_DAYS * 24 * 60 * 60 * 1000;
}
