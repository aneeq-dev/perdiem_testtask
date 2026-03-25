"use client";

import type React from "react";

import { memo } from "react";
import type { Seat as SeatType } from "@/lib/types";
import { isSeatSelectable, HEAT_MAP_COLORS } from "@/lib/seat-utils";

interface SeatProps {
  seat: SeatType;
  sectionId: string;
  sectionLabel: string;
  rowIndex: number;
  isSelected: boolean;
  isFocused: boolean;
  heatMapEnabled: boolean;
  onClick: () => void;
  onFocus: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  tabIndex: number;
}

function SeatComponent({
  seat,
  sectionId,
  sectionLabel,
  rowIndex,
  isSelected,
  isFocused,
  heatMapEnabled,
  onClick,
  onFocus,
  onKeyDown,
  tabIndex,
}: SeatProps) {
  const selectable = isSeatSelectable(seat);

  // Determine seat color based on status or heat map
  let fillColor = "#94a3b8"; // slate-400 - default

  if (heatMapEnabled && seat.status === "available") {
    fillColor = HEAT_MAP_COLORS[seat.priceTier] || fillColor;
  } else if (isSelected) {
    fillColor = "#3b82f6"; // blue-500 - selected
  } else {
    switch (seat.status) {
      case "available":
        fillColor = "#10b981"; // green-500
        break;
      case "reserved":
        fillColor = "#f59e0b"; // amber-500
        break;
      case "sold":
        fillColor = "#ef4444"; // red-500
        break;
      case "held":
        fillColor = "#8b5cf6"; // violet-500
        break;
    }
  }

  const strokeColor = isFocused ? "#1e40af" : "#475569"; // blue-800 or slate-600
  const strokeWidth = isFocused ? 2 : 1;

  const ariaLabel = `Section ${sectionLabel}, Row ${rowIndex}, Seat ${seat.col}, ${seat.status}, Price tier ${seat.priceTier}`;

  return (
    <circle
      cx={seat.x}
      cy={seat.y}
      r={12}
      fill={fillColor}
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      className={
        selectable
          ? "cursor-pointer transition-all touch-manipulation"
          : "cursor-not-allowed"
      }
      style={{ touchAction: "manipulation" }}
      onClick={selectable ? onClick : undefined}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      tabIndex={selectable ? tabIndex : -1}
      role="button"
      aria-label={ariaLabel}
      aria-pressed={isSelected}
      aria-disabled={!selectable}
    />
  );
}

export const Seat = memo(SeatComponent);
