// Calendar grid - displays time slots for each venue, scrollable vertical and horizontal
import { useEffect } from "react";
import type { Venue, Event } from "../../types/event";
import EventCard from "./EventCard";
import generateTimeSlots from "@/utils/generateTimeSlot";

interface CalendarGridProps {
  venues: Venue[];
  events: Event[];
  selectedDate: Date;
  onCellClick?: (venueId: string, time: string) => void;
  onEventClick?: (event: Event) => void;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (scrollLeft: number, scrollTop: number) => void;
}

const CalendarGrid = ({
  venues,
  events,
  selectedDate,
  onCellClick,
  onEventClick,
  scrollRef,
  onScroll,
}: CalendarGridProps) => {
  const timeSlots = generateTimeSlots();

  const handleCellClick = (venueId: string, time: string) => {
    if (onCellClick) {
      onCellClick(venueId, time);
    }
  };

  // Filter events for the selected date
  const filteredEvents = events.filter((event) => {
    const eventDate = new Date(event.start);
    return (
      eventDate.getDate() === selectedDate.getDate() &&
      eventDate.getMonth() === selectedDate.getMonth() &&
      eventDate.getFullYear() === selectedDate.getFullYear()
    );
  });

  // Handle scroll event to sync with other components
  useEffect(() => {
    const container = scrollRef?.current;
    if (!container || !onScroll) return;

    const handleScrollEvent = () => {
      onScroll(container.scrollLeft, container.scrollTop);
    };

    container.addEventListener("scroll", handleScrollEvent);
    return () => container.removeEventListener("scroll", handleScrollEvent);
  }, [scrollRef, onScroll]);

  return (
    <div className='relative flex-1 overflow-hidden'>
      <div
        ref={scrollRef}
        className='h-full w-full bg-gray-100 overflow-auto scrollbar-hide'
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        {/* Grid container with relative positioning for absolute event cards */}
        <div className='flex relative'>
          {venues.map((venue, index) => (
            <div key={index} className='shrink-0 w-[250px]'>
              {timeSlots.map((time) => (
                <div
                  key={`${venue.id}-${time}`}
                  onClick={() => handleCellClick(venue.id, time)}
                  className='h-20 cursor-pointer hover:bg-blue-50 transition-colors relative border-b border-r border-gray-300'
                  style={{
                    backgroundColor: "transparent",
                  }}>
                  {/* Cell is clickable for event creation */}
                </div>
              ))}
            </div>
          ))}

          {/* Render events as absolutely positioned cards */}
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              venues={venues}
              onClick={() => onEventClick?.(event)}
            />
          ))}
        </div>
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

export default CalendarGrid;
