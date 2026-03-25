"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Section, SeatWithSection } from "@/lib/types";
import { findAdjacentSeats } from "@/lib/seat-utils";
import { useToast } from "@/hooks/use-toast";

interface ControlsProps {
  heatMapEnabled: boolean;
  isDark: boolean;
  onToggleHeatMap: () => void;
  onToggleTheme: () => void;
  onFindAdjacent: (seats: SeatWithSection[]) => void;
  sections: Section[];
}

export function Controls({
  heatMapEnabled,
  isDark,
  onToggleHeatMap,
  onToggleTheme,
  onFindAdjacent,
  sections,
}: ControlsProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const handleFindAdjacent = (count: number) => {
    const adjacentSeats = findAdjacentSeats(sections, count);

    if (adjacentSeats) {
      onFindAdjacent(adjacentSeats);
      toast({
        title: "Adjacent seats found",
        description: `Selected ${count} adjacent seats`,
      });
    } else {
      toast({
        title: "No adjacent seats available",
        description: `Could not find ${count} adjacent available seats`,
        variant: "destructive",
      });
    }
  };

  return (
    <>
      {/* Mobile Menu */}
      <div className="flex items-center gap-1 sm:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="h-9 w-9 p-0 bg-transparent"
        >
          {isDark ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
        </Button>
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Menu"
              className="h-9 w-9 p-0 bg-transparent"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Controls</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onToggleHeatMap}>
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              {heatMapEnabled ? "Disable" : "Enable"} Heat Map
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Find Adjacent Seats</DropdownMenuLabel>
            {[2, 3, 4, 5, 6, 7, 8].map((count) => (
              <DropdownMenuItem
                key={count}
                onClick={() => {
                  handleFindAdjacent(count);
                  setIsOpen(false);
                }}
              >
                {count} seats
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Desktop Controls */}
      <div className="hidden sm:flex items-center gap-2">
        <Button
          variant={heatMapEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggleHeatMap}
          aria-label={heatMapEnabled ? "Disable heat map" : "Enable heat map"}
          aria-pressed={heatMapEnabled}
        >
          <svg
            className="w-4 h-4 sm:mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          <span className="hidden md:inline">Heat Map</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              aria-label="Find adjacent seats"
            >
              <svg
                className="w-4 h-4 sm:mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden md:inline">Find Adjacent</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Select number of seats</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[2, 3, 4, 5, 6, 7, 8].map((count) => (
              <DropdownMenuItem
                key={count}
                onClick={() => handleFindAdjacent(count)}
              >
                {count} seats
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          variant="outline"
          size="sm"
          onClick={onToggleTheme}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="hidden sm:flex bg-transparent"
        >
          {isDark ? (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          ) : (
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          )}
          <span className="sr-only">
            {isDark ? "Switch to light mode" : "Switch to dark mode"}
          </span>
        </Button>
      </div>
    </>
  );
}
