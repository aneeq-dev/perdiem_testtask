const STORAGE_KEY = "seating-map-selection";

export function saveSelection(seatIds: string[]): void {
  if (typeof window === "undefined") return;
  if (seatIds.length === 0) {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seatIds));
  } catch (error) {
    console.error("Failed to save selection to localStorage:", error);
  }
}

export function loadSelection(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("Failed to load selection from localStorage:", error);
    return [];
  }
}

export function clearSelection(): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear selection from localStorage:", error);
  }
}
