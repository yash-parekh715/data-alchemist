export const toStringArray = (v: unknown): string[] => {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === "string") {
    return v
      .split(/[,\|;]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
};

export const toNumberArray = (v: unknown): number[] => {
  if (Array.isArray(v))
    return v.map((x) => Number(x)).filter((n) => Number.isFinite(n));
  if (typeof v === "string") {
    // supports "[1,3]" or "1,3" or "1|3"
    const s = v.replace(/[\[\]]/g, "");
    return s
      .split(/[,\|;]/)
      .map((x) => Number(x.trim()))
      .filter((n) => Number.isFinite(n));
  }
  return [];
};

export const parsePhaseListOrRange = (v: unknown): number[] => {
  if (typeof v !== "string") return toNumberArray(v);
  const s = v.trim();
  const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const a = Number(range[1]);
    const b = Number(range[2]);
    if (Number.isFinite(a) && Number.isFinite(b) && a <= b) {
      return Array.from({ length: b - a + 1 }, (_, i) => a + i);
    }
  }
  return toNumberArray(s);
};

export const safeParseJSON = (
  v: unknown
): Record<string, unknown> | undefined => {
  if (typeof v !== "string" || !v.trim()) return undefined;
  try {
    return JSON.parse(v);
  } catch {
    return undefined;
  }
};
