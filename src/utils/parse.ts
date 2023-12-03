export function toArray(raw: unknown) {
  if (raw == undefined) return [];
  if (!Array.isArray(raw)) return [raw];
  return raw;
}
