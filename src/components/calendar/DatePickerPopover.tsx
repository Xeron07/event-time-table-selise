// Date picker popover component for event creation
import { useState } from "react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Plus } from "lucide-react";
import { format } from "date-fns";

interface DatePickerPopoverProps {
  onDateSelect: (date: Date) => void;
}

export const DatePickerPopover = ({ onDateSelect }: DatePickerPopoverProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [isOpen, setIsOpen] = useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      onDateSelect(date);
      setIsOpen(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button className='gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md'>
          <Plus className='w-4 h-4' />
          Create Event
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='end'>
        <div className='p-4'>
          <p className='text-sm font-semibold text-gray-700 mb-3'>
            Select Date
          </p>
          <Calendar
            mode='single'
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date("1900-01-01")}
            initialFocus
          />
          {selectedDate && (
            <div className='mt-4 pt-4 border-t border-gray-200'>
              <p className='text-sm text-gray-600'>
                Selected:{" "}
                <span className='font-semibold'>
                  {format(selectedDate, "PPP")}
                </span>
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
