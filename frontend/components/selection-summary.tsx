"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SeatWithSection } from "@/lib/types";
import { getSeatPrice } from "@/lib/seat-utils";

interface SelectionSummaryProps {
  selectedSeats: SeatWithSection[];
  maxSeats: number;
  onClearSelection: () => void;
}

export function SelectionSummary({
  selectedSeats,
  maxSeats,
  onClearSelection,
}: SelectionSummaryProps) {
  const subtotal = selectedSeats.reduce(
    (sum, seat) => sum + getSeatPrice(seat.priceTier),
    0
  );

  return (
    <Card className="sm:h-full">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center justify-between text-base sm:text-lg">
          <span>Selection</span>
          <span className="text-xs sm:text-sm font-normal text-muted-foreground">
            {selectedSeats.length} / {maxSeats}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {selectedSeats.length === 0 ? (
          <p className="text-sm text-muted-foreground">No seats selected</p>
        ) : (
          <>
            <div className="space-y-2 max-h-48 sm:max-h-60 overflow-y-auto">
              {selectedSeats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-border last:border-0"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="font-medium truncate">
                      {seat.sectionLabel} - Row {seat.rowIndex}, Seat {seat.col}
                    </p>
                  </div>
                  <p className="font-semibold shrink-0">
                    ${getSeatPrice(seat.priceTier)}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-3 sm:pt-4 border-t border-border">
              <div className="flex items-center justify-between mb-8 sm:mb-4">
                <p className="text-base sm:text-lg font-semibold">Subtotal</p>
                <p className="text-xl sm:text-2xl font-bold">${subtotal}</p>
              </div>

              <Button
                onClick={onClearSelection}
                variant="outline"
                className="w-full h-9 sm:h-10 text-sm bg-transparent"
                aria-label="Clear all selected seats"
              >
                Clear Selection
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
