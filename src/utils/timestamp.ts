/**
 * Normalize a timestamp to Unix epoch milliseconds (string) for API requests.
 * Accepts: number (seconds or ms), numeric string, or ISO 8601 date string.
 */
export function toEpochMs(value: string | number): string {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return String(value);
    // Assume seconds if value is in seconds range (< 1e12), else milliseconds
    const ms = value < 1e12 ? Math.round(value * 1000) : Math.round(value);
    return String(ms);
  }

  const s = String(value).trim();
  if (s === "") return s;

  const num = Number(s);
  if (!Number.isNaN(num) && s !== "") {
    const ms = num < 1e12 ? Math.round(num * 1000) : Math.round(num);
    return String(ms);
  }

  const parsed = Date.parse(s);
  if (!Number.isNaN(parsed)) return String(parsed);

  return s;
}
