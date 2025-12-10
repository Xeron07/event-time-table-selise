// Main Calendar component - container for the calendar view
import { useState, useEffect, useRef, useCallback } from "react";
import CalendarHeader from "./CalendarHeader";
import type { Venue, Event } from "../../types/event";
import TimeSection from "./TimeSection";
import CalendarGrid from "./CalendarGrid";
import EventSheet from "./EventSheet";
import { mockVenues } from "@/utils/mockData";
import { useEventStore } from "../../store/eventStore";

const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedVenue, setSelectedVenue] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<{
    time?: string;
    venueId?: string;
    editingEvent?: Event;
  }>({});

  // Refs for synchronized scrolling
  const gridScrollRef = useRef<HTMLDivElement>(null);
  const venueBarScrollRef = useRef<HTMLDivElement>(null);
  const timeScrollRef = useRef<HTMLDivElement>(null);

  // Track which component is currently scrolling to prevent infinite loops
  const isScrollingRef = useRef({ grid: false, venue: false, time: false });

  // Get events from Zustand store
  const { events, addEvent } = useEventStore();

  // Mock venues data - will be moved to Zustand store later
  const venues: Venue[] = mockVenues;

  // Add some mock events for demonstration
  useEffect(() => {
    // Only add mock events if store is empty
    if (events.length === 0) {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockEvent1: Event = {
        id: "1",
        title: "Team Meeting",
        description: "Quarterly review meeting",
        start: new Date(today),
        end: new Date(today.getTime() + 90 * 60000), // 90 minutes
        color: "#3b82f6",
        allDay: false,
        venueIds: ["1", "2"], // Spans Conference Room A and B
      };

      const event2Start = new Date(today);
      event2Start.setHours(14, 30, 0, 0);
      const mockEvent2: Event = {
        id: "2",
        title: "Training Session",
        description: "New employee onboarding",
        start: event2Start,
        end: new Date(event2Start.getTime() + 120 * 60000), // 120 minutes
        color: "#10b981",
        allDay: false,
        venueIds: ["3"], // Meeting Room 1
      };

      addEvent(mockEvent1);
      addEvent(mockEvent2);
    }
  }, [events.length, addEvent]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleVenueSelect = (venueId: string) => {
    setSelectedVenue(venueId);
  };

  const handleCellClick = (venueId: string, time: string) => {
    setSheetData({ time, venueId, editingEvent: undefined });
    setIsSheetOpen(true);
  };

  const handleEventClick = (event: Event) => {
    setSheetData({ editingEvent: event });
    setIsSheetOpen(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSheetData({});
  };

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
    <div className='h-screen flex flex-col '>
      <CalendarHeader
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueSelect={handleVenueSelect}
        venueBarScrollRef={venueBarScrollRef}
        onVenueBarScroll={handleVenueBarScroll}
      />

      {/* Main content area with TimeSection and Grid */}
      <div className='flex flex-1 overflow-hidden'>
        <TimeSection
          className='w-[120px]'
          scrollRef={timeScrollRef}
          onScroll={handleTimeScroll}
        />
        <CalendarGrid
          venues={venues}
          events={events}
          selectedDate={selectedDate}
          onCellClick={handleCellClick}
          onEventClick={handleEventClick}
          scrollRef={gridScrollRef}
          onScroll={handleGridScroll}
        />
      </div>

      {/* Event Sheet for creating/editing events */}
      <EventSheet
        isOpen={isSheetOpen}
        onClose={handleCloseSheet}
        selectedDate={selectedDate}
        selectedTime={sheetData.time}
        selectedVenueId={sheetData.venueId}
        venues={venues}
        editingEvent={sheetData.editingEvent}
      />
    </div>
  );
};

export default Calendar;
