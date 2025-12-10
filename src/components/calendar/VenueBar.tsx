// Venue bar - scrollable horizontal venue list
import { useEffect } from "react";
import type { Venue } from "../../types/event";
import { Button } from "../ui/button";

interface VenueBarProps {
  venues: Venue[];
  selectedVenue: string | null;
  onVenueSelect: (venueId: string) => void;
  scrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: (scrollLeft: number) => void;
}

const VenueBar = ({
  venues,
  selectedVenue,
  onVenueSelect,
  scrollRef,
  onScroll,
}: VenueBarProps) => {
  // Handle scroll event to sync with CalendarGrid
  useEffect(() => {
    const container = scrollRef?.current;
    if (!container || !onScroll) return;

    const handleScrollEvent = () => {
      onScroll(container.scrollLeft);
    };

    container.addEventListener("scroll", handleScrollEvent);
    return () => container.removeEventListener("scroll", handleScrollEvent);
  }, [scrollRef, onScroll]);

  return (
    <div className='relative'>
      <div
        ref={scrollRef}
        className='flex gap-0 max-w-[90vw] overflow-x-auto scrollbar-hide ml-[123px] border-l'
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        {venues.map((venue) => (
          <Button
            key={venue.id}
            onClick={() => onVenueSelect(venue.id)}
            className={`
              shrink-0 flex flex-col items-center justify-center 
              min-w-[250px] h-10 rounded-none border-r border-gray-300 transition-all
              ${
                selectedVenue === venue.id
                  ? "border-blue-500 shadow-md"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }
            `}
            style={{
              backgroundColor:
                selectedVenue === venue.id
                  ? venue.color || "#3b82f6"
                  : "#ffffff",
              color: selectedVenue === venue.id ? "#ffffff" : "#374151",
            }}>
            <span className='text-sm font-semibold px-0 text-center truncate max-w-full'>
              {venue.name}
            </span>
          </Button>
        ))}
      </div>

      {/* Hide scrollbar with CSS */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default VenueBar;
