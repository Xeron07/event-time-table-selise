// Calendar header component with WeekTabBar and VenueBar
import WeekTabBar from "./WeekTabBar";
import VenueBar from "./VenueBar";
import type { Venue } from "../../types/event";

interface CalendarHeaderProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  venues: Venue[];
  selectedVenue: string | null;
  onVenueSelect: (venueId: string) => void;
  venueBarScrollRef?: React.RefObject<HTMLDivElement>;
  onVenueBarScroll?: (scrollLeft: number) => void;
  weekDays?: Date[];
}

const CalendarHeader = ({
  selectedDate,
  onDateSelect,
  venues,
  selectedVenue,
  onVenueSelect,
  venueBarScrollRef,
  onVenueBarScroll,
  weekDays,
}: CalendarHeaderProps) => {
  return (
    <div className='sticky top-0 bg-white z-10 border-b border-gray-300 w-full'>
      {/* Week Tab Bar - First Line */}
      <WeekTabBar
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        weekDays={weekDays}
      />

      {/* Venue Bar - Second Line */}
      <VenueBar
        venues={venues}
        selectedVenue={selectedVenue}
        onVenueSelect={onVenueSelect}
        scrollRef={venueBarScrollRef}
        onScroll={onVenueBarScroll}
      />
    </div>
  );
};

export default CalendarHeader;
