"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { SeatWithSection } from "@/lib/types";
import { getAllSeats, isSeatSelectable } from "@/lib/seat-utils";
import { saveSelection, loadSelection } from "@/lib/storage";
import { Section } from "@/lib/types";

const MAX_SEATS = 8;

export function useSeatSelection(sections: Section[]) {
  const [selectedSeatIds, setSelectedSeatIds] = useState<Set<string>>(
    new Set()
  );
  const [focusedSeatId, setFocusedSeatId] = useState<string | null>(null);

  // Get all seats with section info
  const allSeats = useMemo(() => getAllSeats(sections), [sections]);

  // Get seat lookup map
  const seatMap = useMemo(() => {
    const map = new Map<string, SeatWithSection>();
    allSeats.forEach((seat) => map.set(seat.id, seat));
    return map;
  }, [allSeats]);

  // Load saved selection on mount
  useEffect(() => {
    const saved = loadSelection();
    if (saved.length > 0) {
      // Filter out invalid seats (not selectable or doesn't exist)
      const validSavedSeats = saved.filter((id) => {
        const seat = seatMap.get(id);
        return seat && isSeatSelectable(seat);
      });
      setSelectedSeatIds(new Set(validSavedSeats));
    }
  }, [seatMap]);

  // Save selection whenever it changes
  useEffect(() => {
    saveSelection(Array.from(selectedSeatIds));
  }, [selectedSeatIds]);

  const toggleSeat = useCallback(
    (seatId: string) => {
      setSelectedSeatIds((prev) => {
        const newSet = new Set(prev);

        if (newSet.has(seatId)) {
          // Deselect
          newSet.delete(seatId);
        } else {
          // Check if we can select more seats
          if (newSet.size >= MAX_SEATS) {
            console.log("Maximum seat selection reached");
            return prev;
          }

          // Check if seat is selectable
          const seat = seatMap.get(seatId);
          if (seat && isSeatSelectable(seat)) {
            newSet.add(seatId);
          }
        }

        return newSet;
      });
    },
    [seatMap]
  );

  const selectSeats = useCallback(
    (seatIds: string[]) => {
      const selectableIds = seatIds.filter((id) => {
        const seat = seatMap.get(id);
        return seat && isSeatSelectable(seat);
      });

      if (selectableIds.length > MAX_SEATS) {
        console.log("Cannot select more than maximum seats");
        return;
      }

      setSelectedSeatIds(new Set(selectableIds));
    },
    [seatMap]
  );

  const clearSelection = useCallback(() => {
    setSelectedSeatIds(new Set());
  }, []);

  const selectedSeats = useMemo(() => {
    return Array.from(selectedSeatIds)
      .map((id) => seatMap.get(id))
      .filter((seat): seat is SeatWithSection => seat !== undefined);
  }, [selectedSeatIds, seatMap]);

  const focusedSeat = useMemo(() => {
    return focusedSeatId ? seatMap.get(focusedSeatId) || null : null;
  }, [focusedSeatId, seatMap]);

  return {
    selectedSeatIds,
    selectedSeats,
    focusedSeatId,
    focusedSeat,
    maxSeats: MAX_SEATS,
    toggleSeat,
    selectSeats,
    clearSelection,
    setFocusedSeatId,
  };
}
