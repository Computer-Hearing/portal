export function formatParams(value: number): string {
  return value >= 1_000_000
    ? `${(value / 1_000_000).toFixed(2)} M`
    : `${Math.round(value / 1000)} K`;
}

export function formatAccuracy(value: number): string {
  return value.toFixed(3);
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}
