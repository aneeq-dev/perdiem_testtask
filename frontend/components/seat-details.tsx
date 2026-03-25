"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SeatWithSection } from "@/lib/types";
import { getSeatPrice } from "@/lib/seat-utils";

interface SeatDetailsProps {
  seat: SeatWithSection | null;
}

export function SeatDetails({ seat }: SeatDetailsProps) {
  if (!seat) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-0 sm:pb-6">
          <CardTitle className="text-base sm:text-lg">Seat Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Click or focus on a seat to view details
          </p>
        </CardContent>
      </Card>
    );
  }

  const price = getSeatPrice(seat.priceTier);

  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-base sm:text-lg">Seat Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:block sm:space-y-3">
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Section
            </p>
            <p className="text-base sm:text-lg font-semibold">
              {seat.sectionLabel}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Row
            </p>
            <p className="text-base sm:text-lg font-semibold">
              {seat.rowIndex}
            </p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Seat
            </p>
            <p className="text-base sm:text-lg font-semibold">{seat.col}</p>
          </div>
          <div>
            <p className="text-xs sm:text-sm font-medium text-muted-foreground">
              Price
            </p>
            <p className="text-base sm:text-lg font-semibold">${price}</p>
          </div>
        </div>
        <div className="pt-2 sm:pt-0 border-t sm:border-t-0">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground">
            Status
          </p>
          <p className="text-base sm:text-lg font-semibold capitalize">
            {seat.status}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
