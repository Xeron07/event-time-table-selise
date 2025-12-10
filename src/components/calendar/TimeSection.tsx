// Time section - fixed position with 15-minute intervals, vertically scrollable
import generateTimeSlots from "@/utils/generateTimeSlot";
import { useEffect } from "react";

interface TimeSectionProps {
  className?: string;
  scrollRef?: React.RefObject<HTMLDivElement>;
  onScroll?: (scrollTop: number) => void;
}

const TimeSection = ({
  className = "",
  scrollRef,
  onScroll,
}: TimeSectionProps) => {
  const timeSlots = generateTimeSlots();

  // Auto-scroll to current time on mount
  useEffect(() => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = Math.floor(now.getMinutes() / 15) * 15;
    const currentTimeIndex = currentHour * 4 + currentMinute / 15;

    if (scrollRef?.current) {
      const slotHeight = 80; // Height of each time slot (h-20)
      const scrollPosition = currentTimeIndex * slotHeight - 100; // Offset for better visibility
      scrollRef.current.scrollTop = Math.max(0, scrollPosition);
    }
  }, [scrollRef]);

  // Handle scroll event to sync with CalendarGrid
  useEffect(() => {
    const container = scrollRef?.current;
    if (!container || !onScroll) return;

    const handleScrollEvent = () => {
      onScroll(container.scrollTop);
    };

    container.addEventListener("scroll", handleScrollEvent);
    return () => container.removeEventListener("scroll", handleScrollEvent);
  }, [scrollRef, onScroll]);

  const isCurrentTime = (timeSlot: string) => {
    const now = new Date();
    const currentHour = now.getHours().toString().padStart(2, "0");
    const currentMinute = Math.floor(now.getMinutes() / 15) * 15;
    const formattedCurrentMinute = currentMinute.toString().padStart(2, "0");
    return timeSlot === `${currentHour}:${formattedCurrentMinute}`;
  };

  return (
    <div className={`relative h-full ${className}`}>
      <div
        ref={scrollRef}
        className='h-full overflow-y-auto scrollbar-hide bg-white'
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        <div className='flex flex-col'>
          {timeSlots.map((time, index) => (
            <div
              key={index}
              className={`
                flex items-center justify-center px-3 border-b border-r border-gray-200
                h-20  text-xs font-medium
                ${
                  isCurrentTime(time)
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600"
                }
              `}>
              {time}
            </div>
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

export default TimeSection;
