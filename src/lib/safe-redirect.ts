/** N'accepte qu'un chemin interne (« /… »), jamais une URL externe ni « // ». */
export function safeRedirect(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return undefined;
  return value;
}
