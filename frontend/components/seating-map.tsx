"use client";

import type React from "react";

import { useCallback, useRef, useState, useEffect } from "react";
import type { Venue } from "@/lib/types";
import { Seat } from "./seat";

interface SeatingMapProps {
  venue: Venue;
  selectedSeats: Set<string>;
  focusedSeatId: string | null;
  heatMapEnabled: boolean;
  onSeatClick: (seatId: string) => void;
  onSeatFocus: (seatId: string) => void;
}

export function SeatingMap({
  venue,
  selectedSeats,
  focusedSeatId,
  heatMapEnabled,
  onSeatClick,
  onSeatFocus,
}: SeatingMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState(
    `0 0 ${venue.map.width} ${venue.map.height}`
  );

  // Handle keyboard navigation between seats
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, seatId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSeatClick(seatId);
      }
    },
    [onSeatClick]
  );

  // Responsive viewBox adjustment
  useEffect(() => {
    const updateViewBox = () => {
      if (svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          const aspectRatio = venue.map.width / venue.map.height;
          const containerAspect =
            container.clientWidth / container.clientHeight;

          if (containerAspect > aspectRatio) {
            // Container is wider
            const newWidth = venue.map.height * containerAspect;
            const offset = (newWidth - venue.map.width) / 2;
            setViewBox(`${-offset} 0 ${newWidth} ${venue.map.height}`);
          } else {
            // Container is taller
            const newHeight = venue.map.width / containerAspect;
            const offset = (newHeight - venue.map.height) / 2;
            setViewBox(`0 ${-offset} ${venue.map.width} ${newHeight}`);
          }
        }
      }
    };

    updateViewBox();
    window.addEventListener("resize", updateViewBox);
    return () => window.removeEventListener("resize", updateViewBox);
  }, [venue.map.width, venue.map.height]);

  return (
    <svg
      ref={svgRef}
      viewBox={viewBox}
      className="w-full h-full touch-manipulation"
      style={{ touchAction: "manipulation" }}
      role="application"
      aria-label={`${venue.name} seating map`}
    >
      {venue.sections.map((section) => (
        <g
          key={section.id}
          transform={`translate(${section.transform.x}, ${section.transform.y}) scale(${section.transform.scale})`}
        >
          {/* Section label */}
          <text
            x={100}
            y={20}
            className="fill-foreground font-semibold pointer-events-none select-none"
            style={{ fontSize: "14px" }}
            textAnchor="middle"
          >
            {section.label}
          </text>

          {/* Seats */}
          {section.rows.map((row) =>
            row.seats.map((seat) => (
              <Seat
                key={seat.id}
                seat={seat}
                sectionId={section.id}
                sectionLabel={section.label}
                rowIndex={row.index}
                isSelected={selectedSeats.has(seat.id)}
                isFocused={focusedSeatId === seat.id}
                heatMapEnabled={heatMapEnabled}
                onClick={() => onSeatClick(seat.id)}
                onFocus={() => onSeatFocus(seat.id)}
                onKeyDown={(e) => handleKeyDown(e, seat.id)}
                tabIndex={0}
              />
            ))
          )}
        </g>
      ))}
    </svg>
  );
}
