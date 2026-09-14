/** Short, URL-safe, collision-resistant-enough ids for a single-browser demo. */
export function shortId(prefix = "r"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  const time = Date.now().toString(36).slice(-5);
  return `${prefix}_${time}${rand}`;
}

/** Customer-facing reference numbers look deliberate, not random. */
export function referenceNumber(seed: number): string {
  return `KSD-${String(seed).padStart(4, "0")}`;
}
