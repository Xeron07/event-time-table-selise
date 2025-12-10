// Week tab bar - scrollable 7 days of week with dates
import { useRef } from "react";
import { Button } from "../ui/button";

interface WeekTabBarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const WeekTabBar = ({ selectedDate, onDateSelect }: WeekTabBarProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 7 days array starting from today or selected week
  const getWeekDays = () => {
    const days: Date[] = [];
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays();

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const formatDay = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const formatDate = (date: Date) => {
    return `Date: ${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  };

  return (
    <div className='relative'>
      <div
        ref={scrollContainerRef}
        className='flex gap-0 max-w-[98vw] overflow-x-auto scrollbar-hide pb-0'
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}>
        {weekDays.map((day, index) => (
          <Button
            key={index}
            onClick={() => onDateSelect(day)}
            className={`
              flex flex-col items-center justify-center
              w-[250px] h-[70px] rounded-none border border-gray-300 transition-all
              ${
                isSelected(day)
                  ? "bg-blue-500 text-white border-blue-500"
                  : isToday(day)
                  ? "bg-blue-50 border-blue-300 text-blue-600"
                  : "bg-white border-gray-200 hover:border-gray-300 text-gray-700"
              }
            `}>
            <span className='text-xs font-medium '>{formatDay(day)}</span>
            <span className='text-sm font-medium mt-0.5'>
              {formatDate(day)}
            </span>
          </Button>
        ))}
      </div>
    </div>
  );
};

export default WeekTabBar;
