// Calendar View - displays the event calendar grid
import { useRef, useCallback } from "react";
import CalendarHeader from "./CalendarHeader";
import TimeSection from "./TimeSection";
import CalendarGrid from "./CalendarGrid";
import type { Venue, Event } from "../../types/event";

interface CalendarViewProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  venues: Venue[];
  events: Event[];
  onCellClick: (venueId: string, time: string) => void;
  onEventClick: (event: Event) => void;
  weekDays?: Date[];
}

const CalendarView = ({
  selectedDate,
  onDateSelect,
  venues,
  events,
  onCellClick,
  onEventClick,
  weekDays,
}: CalendarViewProps) => {
  // Refs for synchronized scrolling
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const venueBarScrollRef = useRef<HTMLDivElement>(null);
  const timeScrollRef = useRef<HTMLDivElement>(null);

  // Track which component is currently scrolling to prevent infinite loops
  const isScrollingRef = useRef({ grid: false, venue: false, time: false });

  // Handle synchronized scrolling from CalendarGrid
  const handleGridScroll = useCallback(
    (scrollLeft: number, scrollTop: number) => {
      if (isScrollingRef.current.grid) return;

      isScrollingRef.current.venue = true;
      isScrollingRef.current.time = true;

      // Sync horizontal scroll with VenueBar
      if (venueBarScrollRef.current) {
        venueBarScrollRef.current.scrollLeft = scrollLeft;
      }
      // Sync vertical scroll with TimeSection
      if (timeScrollRef.current) {
        timeScrollRef.current.scrollTop = scrollTop;
      }

      requestAnimationFrame(() => {
        isScrollingRef.current.venue = false;
        isScrollingRef.current.time = false;
      });
    },
    []
  );

  // Handle synchronized scrolling from VenueBar (horizontal only)
  const handleVenueBarScroll = useCallback((scrollLeft: number) => {
    if (isScrollingRef.current.venue) return;

    isScrollingRef.current.grid = true;

    // Sync horizontal scroll with CalendarGrid
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollLeft = scrollLeft;
    }

    requestAnimationFrame(() => {
      isScrollingRef.current.grid = false;
    });
  }, []);

  // Handle synchronized scrolling from TimeSection (vertical only)
  const handleTimeScroll = useCallback((scrollTop: number) => {
    if (isScrollingRef.current.time) return;

    isScrollingRef.current.grid = true;

    // Sync vertical scroll with CalendarGrid
    if (gridScrollRef.current) {
      gridScrollRef.current.scrollTop = scrollTop;
    }

    requestAnimationFrame(() => {
      isScrollingRef.current.grid = false;
    });
  }, []);

  return (
    <div className='flex flex-col h-full'>
      <CalendarHeader
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        venues={venues}
        selectedVenue={null}
        onVenueSelect={() => {}}
        venueBarScrollRef={venueBarScrollRef}
        onVenueBarScroll={handleVenueBarScroll}
        weekDays={weekDays}
      />

      {/* Main content area with TimeSection and Grid */}
      <div className='flex flex-1 overflow-hidden'>
        <TimeSection
          className='w-[124px]'
          scrollRef={timeScrollRef}
          onScroll={handleTimeScroll}
        />
        <CalendarGrid
          venues={venues}
          events={events}
          selectedDate={selectedDate}
          onCellClick={onCellClick}
          onEventClick={onEventClick}
          scrollRef={gridScrollRef}
          onScroll={handleGridScroll}
        />
      </div>
    </div>
  );
};

export default CalendarView;
