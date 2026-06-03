// Tiny localStorage cache for offline mode on the live map.
const KEY = "salvapasti:food_boxes_cache";
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

export type CachedFoodBoxes<T> = { savedAt: number; rows: T[] };

export function saveFoodBoxesCache<T>(rows: T[]) {
  try {
    const payload: CachedFoodBoxes<T> = { savedAt: Date.now(), rows };
    localStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // quota or unavailable — ignore
  }
}

export function readFoodBoxesCache<T>(): CachedFoodBoxes<T> | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedFoodBoxes<T>;
    if (!parsed?.savedAt || !Array.isArray(parsed.rows)) return null;
    if (Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}
