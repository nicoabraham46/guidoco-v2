export function formatARS(value: number | null | undefined) {
  const n = Number(value ?? 0);
  return n.toLocaleString("es-AR");
}
