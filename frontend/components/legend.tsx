"use client";

interface LegendProps {
  heatMapEnabled: boolean;
}

export function Legend({ heatMapEnabled }: LegendProps) {
  if (heatMapEnabled) {
    return (
      <div
        className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm"
        role="legend"
        aria-label="Price tier legend"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#ef4444] shrink-0"
            aria-hidden="true"
          />
          <span className="text-foreground whitespace-nowrap">
            Tier 1 - $150
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#f59e0b] shrink-0"
            aria-hidden="true"
          />
          <span className="text-foreground whitespace-nowrap">
            Tier 2 - $100
          </span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#22c55e] shrink-0"
            aria-hidden="true"
          />
          <span className="text-foreground whitespace-nowrap">
            Tier 3 - $75
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-2 sm:gap-4 flex-wrap text-xs sm:text-sm"
      role="legend"
      aria-label="Seat status legend"
    >
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#10b981] shrink-0"
          aria-hidden="true"
        />
        <span className="text-foreground whitespace-nowrap">Available</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#3b82f6] shrink-0"
          aria-hidden="true"
        />
        <span className="text-foreground whitespace-nowrap">Selected</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#f59e0b] shrink-0"
          aria-hidden="true"
        />
        <span className="text-foreground whitespace-nowrap">Reserved</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#ef4444] shrink-0"
          aria-hidden="true"
        />
        <span className="text-foreground whitespace-nowrap">Sold</span>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <div
          className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-[#8b5cf6] shrink-0"
          aria-hidden="true"
        />
        <span className="text-foreground whitespace-nowrap">Held</span>
      </div>
    </div>
  );
}
