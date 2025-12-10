import type { Event, Venue } from "../../types/event";

interface EventCardProps {
  event: Event;
  venues: Venue[];
  onClick?: () => void;
}

const EventCard = ({ event, venues, onClick }: EventCardProps) => {
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const calculateHeight = () => {
    const start = new Date(event.start);
    const end = new Date(event.end);
    const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    const slots = durationInMinutes / 15;
    return slots * 80;
  };

  const calculateTop = () => {
    const start = new Date(event.start);
    const hours = start.getHours();
    const minutes = start.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    const slots = totalMinutes / 15;
    return slots * 80;
  };

  const getVenueIndex = (venueId: string) => {
    return venues.findIndex((v) => v.id === venueId);
  };

  const groupConsecutiveVenues = () => {
    const venueIndices = event.venueIds
      .map((id) => getVenueIndex(id))
      .filter((index) => index !== -1)
      .sort((a, b) => a - b);

    if (venueIndices.length === 0) return [];

    const groups: number[][] = [];
    let currentGroup: number[] = [venueIndices[0]];

    for (let i = 1; i < venueIndices.length; i++) {
      if (venueIndices[i] === currentGroup[currentGroup.length - 1] + 1) {
        currentGroup.push(venueIndices[i]);
      } else {
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

  return (
    <>
      {venueGroups.map((group, groupIndex) => {
        const firstVenueIndex = group[0];
        const venueCount = group.length;
        const width = venueCount * 250;
        const left = firstVenueIndex * 250;

        return (
          <div
            key={`${event.id}-group-${groupIndex}`}
            onClick={onClick}
            className='absolute flex justify-center items-center rounded cursor-pointer hover:opacity-90 transition-opacity border-2 border-white overflow-hidden'
            style={{
              backgroundColor: event.color || "#3b82f6",
              height: `${height}px`,
              width: `${width}px`,
              top: `${top}px`,
              left: `${left}px`,
              zIndex: 10,
            }}>
            <div className='p-2 h-full flex flex-col justify-center items-center'>
              {!event.allDay && (
                <div className='text-white text-sm opacity-90 mt-1'>
                  {formatTime(event.start)} - {formatTime(event.end)}
                </div>
              )}
              <div className='font-semibold text-white text-sm truncate'>
                {event.title}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default EventCard;
