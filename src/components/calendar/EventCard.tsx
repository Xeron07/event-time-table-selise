// Event card component - displays individual event in calendar
// Groups consecutive venues into single cards, renders separate cards for non-consecutive venues
import type { Event, Venue } from '../../types/event';

interface EventCardProps {
  event: Event;
  venues: Venue[];
  onClick?: () => void;
}

const EventCard = ({ event, venues, onClick }: EventCardProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  // Calculate height based on duration (80px per 15 minutes)
  const calculateHeight = () => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const slots = durationInMinutes / 15; // Number of 15-minute slots
    return slots * 80; // 80px per slot (h-20)
  };

  // Calculate top position based on start time
  const calculateTop = () => {
    const start = new Date(event.start);
    const hours = start.getHours();
    const minutes = start.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const slots = totalMinutes / 15; // Number of 15-minute slots from midnight
    return slots * 80; // 80px per slot
  };

  // Get venue index
  const getVenueIndex = (venueId: string) => {
    return venues.findIndex(v => v.id === venueId);
  };

  // Group consecutive venue IDs into ranges
  const groupConsecutiveVenues = () => {
    // Get venue indices and sort them
    const venueIndices = event.venueIds
      .map(id => getVenueIndex(id))
      .filter(index => index !== -1)
      .sort((a, b) => a - b);

    if (venueIndices.length === 0) return [];

    const groups: number[][] = [];
    let currentGroup: number[] = [venueIndices[0]];

    for (let i = 1; i < venueIndices.length; i++) {
      // Check if current venue is consecutive to the last venue in current group
      if (venueIndices[i] === currentGroup[currentGroup.length - 1] + 1) {
        currentGroup.push(venueIndices[i]);
      } else {
        // Start a new group
        groups.push(currentGroup);
        currentGroup = [venueIndices[i]];
      }
    }
    groups.push(currentGroup);

    return groups;
  };

  const height = calculateHeight();
  const top = calculateTop();
  const venueGroups = groupConsecutiveVenues();

  // Render one card per group of consecutive venues
  return (
    <>
      {venueGroups.map((group, groupIndex) => {
        const firstVenueIndex = group[0];
        const venueCount = group.length;
        const width = venueCount * 250; // 250px per venue
        const left = firstVenueIndex * 250;

        return (
          <div
            key={`${event.id}-group-${groupIndex}`}
            onClick={onClick}
            className="absolute rounded cursor-pointer hover:opacity-90 transition-opacity border-2 border-white overflow-hidden"
            style={{
              backgroundColor: event.color || '#3b82f6',
              height: `${height}px`,
              width: `${width}px`,
              top: `${top}px`,
              left: `${left}px`,
              zIndex: 10,
            }}
          >
            <div className="p-2 h-full flex flex-col">
              <div className="font-semibold text-white text-sm truncate">
                {event.title}
              </div>
              {!event.allDay && (
                <div className="text-white text-xs opacity-90 mt-1">
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              )}
              {event.description && (
                <div className="text-white text-xs opacity-80 mt-1 line-clamp-2">
                  {event.description}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default EventCard;
