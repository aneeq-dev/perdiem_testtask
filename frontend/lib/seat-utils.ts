import { Seat, Section, SeatWithSection } from './types';

// Price tier pricing (in dollars)
export const PRICE_TIERS: Record<number, number> = {
  1: 150,
  2: 100,
  3: 75,
};

export function getSeatPrice(priceTier: number): number {
  return PRICE_TIERS[priceTier] || 0;
}

export function isSeatSelectable(seat: Seat): boolean {
  return seat.status === 'available';
}

export function getAllSeats(sections: Section[]): SeatWithSection[] {
  const allSeats: SeatWithSection[] = [];
  
  sections.forEach((section) => {
    section.rows.forEach((row) => {
      row.seats.forEach((seat) => {
        allSeats.push({
          ...seat,
          sectionId: section.id,
          sectionLabel: section.label,
          rowIndex: row.index,
        });
      });
    });
  });
  
  return allSeats;
}

export function findAdjacentSeats(
  sections: Section[],
  count: number
): SeatWithSection[] | null {
  for (const section of sections) {
    for (const row of section.rows) {
      const availableSeats = row.seats.filter(isSeatSelectable);
      
      // Find consecutive available seats
      for (let i = 0; i <= availableSeats.length - count; i++) {
        const consecutive = availableSeats.slice(i, i + count);
        const isConsecutive = consecutive.every((seat, idx) => {
          if (idx === 0) return true;
          return seat.col === consecutive[idx - 1].col + 1;
        });
        
        if (isConsecutive && consecutive.length === count) {
          return consecutive.map((seat) => ({
            ...seat,
            sectionId: section.id,
            sectionLabel: section.label,
            rowIndex: row.index,
          }));
        }
      }
    }
  }
  
  return null;
}

// Heat map colors for price tiers
export const HEAT_MAP_COLORS: Record<number, string> = {
  1: '#ef4444', // red-500 - most expensive
  2: '#f59e0b', // amber-500 - medium
  3: '#22c55e', // green-500 - least expensive
};
