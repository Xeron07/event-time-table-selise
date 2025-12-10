// Main layout component with left sidebar and header
import { useState, useMemo } from "react";
import { MapPin, ChevronDown, CalendarIcon, Calendar1Icon } from "lucide-react";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu";
import CalendarView from "./CalendarView";
import EventSheet from "./EventSheet";
import VenuesView from "./VenuesView";
import { DatePickerPopover } from "./DatePickerPopover";
import {
  generateWeekdaysForRange,
  getMonthStart,
  getMonthEnd,
} from "@/utils/dateUtils";
import { useVenueStore } from "@/store/venueStore";
import { useEventStore } from "@/store/eventStore";
import type { Event } from "@/types/event";
import DatePicker from "../DatePicker";

type SelectionMode = "month" | "range";

interface LayoutHeaderProps {
  onCreateEvent: () => void;
  onDateSelect?: (date: Date) => void;
  selectionMode: SelectionMode;
  onSelectionModeChange: (mode: SelectionMode) => void;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  rangeStart: Date;
  rangeEnd: Date;
  onRangeChange: (start: Date, end: Date) => void;
  yearList: number[];
  weekDays: Date[];
}

const LayoutHeader = ({
  onCreateEvent,
  onDateChange: _onDateSelect,
  selectionMode,
  onSelectionModeChange,
  selectedDate,
  rangeStart,
  rangeEnd,
  onRangeChange: _onRangeChange,
  yearList,
}: LayoutHeaderProps) => {
  const currentYear = selectedDate.getFullYear();

  const handleMonthChange = (month: string) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(parseInt(month));
    _onDateSelect?.(newDate);
  };

  const handleYearChange = (year: string) => {
    const newDate = new Date(selectedDate);
    newDate.setFullYear(parseInt(year));
    _onDateSelect?.(newDate);
  };

  const handleRangeStartChange = (newStart: Date) => {
    if (newStart <= rangeEnd) {
      _onRangeChange(newStart, rangeEnd);
    }
  };

  const handleRangeEndChange = (newEnd: Date) => {
    if (rangeStart <= newEnd) {
      _onRangeChange(rangeStart, newEnd);
    }
  };

  return (
    <div className='bg-white border-b border-gray-300 px-6 py-4 flex items-center justify-between'>
      {/* Left side - Title */}
      <div className='flex-1'>
        <span className='text-xl font-semibold text-gray-800 flex justify-start items-center gap-2'>
          {" "}
          <Calendar1Icon className='bg-orange-100 text-orange-500 p-2 w-10 h-10 rounded-lg' />{" "}
          Event Time Table
        </span>
      </div>

      <div className='flex justify-center items-center gap-6'>
        {/* Right side - Selection Mode Toggle and Create Event */}
        <div className='flex-1 flex justify-end items-center gap-3'>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='gap-2 rounded-md'>
                {selectionMode === "month" ? "Month" : "Range"}
                <ChevronDown className='w-4 h-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem
                onClick={() => onSelectionModeChange("month")}
                className={selectionMode === "month" ? "bg-gray-100" : ""}>
                Month
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onSelectionModeChange("range")}
                className={selectionMode === "range" ? "bg-gray-100" : ""}>
                Custom Range
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* Center - Date Selection */}
        <div className='flex-1 flex justify-center items-center gap-4'>
          {selectionMode === "month" ? (
            <div className='flex items-center gap-3'>
              <Select
                value={String(selectedDate.getMonth())}
                onValueChange={handleMonthChange}>
                <SelectTrigger className='w-[140px]'>
                  <SelectValue placeholder='Select month' />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {new Date(2024, i, 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={String(currentYear)}
                onValueChange={handleYearChange}>
                <SelectTrigger className='w-[120px]'>
                  <SelectValue placeholder='Select year' />
                </SelectTrigger>
                <SelectContent>
                  {yearList.map((year) => (
                    <SelectItem key={year} value={String(year)}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className='flex items-center gap-3'>
              <div className='flex flex-col gap-1'>
                <DatePicker
                  placeHolder='From'
                  value={rangeStart}
                  onChange={handleRangeStartChange}
                />
              </div>
              <div className='flex flex-col gap-1'>
                <DatePicker
                  placeHolder='To'
                  value={rangeEnd}
                  onChange={handleRangeEndChange}
                />
              </div>
            </div>
          )}
        </div>
        <DatePickerPopover
          onDateSelect={(date) => {
            _onDateSelect?.(date);
            onCreateEvent();
          }}
        />
      </div>
    </div>
  );
};

interface LayoutProps {
  onEventSheetChange?: (isOpen: boolean) => void;
}

const Layout = ({ onEventSheetChange }: LayoutProps) => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeLeftTab, setActiveLeftTab] = useState<"calendar" | "venue">(
    "calendar"
  );
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("month");
  const [rangeStart, setRangeStart] = useState(getMonthStart(selectedDate));
  const [rangeEnd, setRangeEnd] = useState(getMonthEnd(selectedDate));
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetData, setSheetData] = useState<{
    time?: string;
    venueId?: string;
    editingEvent?: Event;
  }>({});

  // Get events from Zustand store
  const { events, addEvent } = useEventStore();
  const { venues } = useVenueStore();

  // Generate list of years (current year - 5 to current year + 5)
  const yearList = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);
  }, []);

  // Generate weekdays based on selection mode
  const weekDays = useMemo(() => {
    if (selectionMode === "month") {
      return generateWeekdaysForRange(
        getMonthStart(selectedDate),
        getMonthEnd(selectedDate)
      );
    } else {
      return generateWeekdaysForRange(rangeStart, rangeEnd);
    }
  }, [selectionMode, selectedDate, rangeStart, rangeEnd]);

  // Initialize mock events
  useState(() => {
    if (events.length === 0) {
      const today = new Date();
      today.setHours(10, 0, 0, 0);

      const mockEvent1: Event = {
        id: "1",
        title: "Team Meeting",
        description: "Quarterly review meeting",
        start: new Date(today),
        end: new Date(today.getTime() + 90 * 60000),
        color: "#3b82f6",
        allDay: false,
        venueIds: ["1", "2"],
      };

      const event2Start = new Date(today);
      event2Start.setHours(14, 30, 0, 0);
      const mockEvent2: Event = {
        id: "2",
        title: "Training Session",
        description: "New employee onboarding",
        start: event2Start,
        end: new Date(event2Start.getTime() + 120 * 60000),
        color: "#10b981",
        allDay: false,
        venueIds: ["3"],
      };

      addEvent(mockEvent1);
      addEvent(mockEvent2);
    }
  });

  // Handlers
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDateChange = (date: Date) => {
    if (selectionMode === "month") {
      setSelectedDate(date);
      const newStart = getMonthStart(date);
      const newEnd = getMonthEnd(date);
      setRangeStart(newStart);
      setRangeEnd(newEnd);
    }
  };

  const handleRangeChange = (start: Date, end: Date) => {
    setRangeStart(start);
    setRangeEnd(end);
  };

  const handleSelectionModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    if (mode === "month") {
      const newStart = getMonthStart(selectedDate);
      const newEnd = getMonthEnd(selectedDate);
      setRangeStart(newStart);
      setRangeEnd(newEnd);
    }
  };

  const handleCellClick = (venueId: string, time: string) => {
    setSheetData({ time, venueId, editingEvent: undefined });
    setIsSheetOpen(true);
    onEventSheetChange?.(true);
  };

  const handleEventClick = (event: Event) => {
    setSheetData({ editingEvent: event });
    setIsSheetOpen(true);
    onEventSheetChange?.(true);
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setSheetData({});
    onEventSheetChange?.(false);
  };

  const handleCreateEvent = () => {
    setSheetData({});
    setIsSheetOpen(true);
    onEventSheetChange?.(true);
  };

  return (
    <div className='h-screen w-screen flex flex-col bg-gray-50'>
      {/* Header */}
      <LayoutHeader
        onCreateEvent={handleCreateEvent}
        selectionMode={selectionMode}
        onSelectionModeChange={handleSelectionModeChange}
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        onRangeChange={handleRangeChange}
        yearList={yearList}
        weekDays={weekDays}
      />

      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Left Sidebar */}
        <div className='w-24 bg-white border-r border-gray-300 flex flex-col items-center py-4 gap-4'>
          {/* Calendar Button */}
          <div className='group relative'>
            <button
              onClick={() => setActiveLeftTab("calendar")}
              className={`p-3 rounded-lg transition-colors ${
                activeLeftTab === "calendar"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title='Calendar'>
              <CalendarIcon className='w-6 h-6' />
            </button>
            <div className='absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'>
              Calendar
            </div>
          </div>

          {/* Venue Button */}
          <div className='group relative'>
            <button
              onClick={() => setActiveLeftTab("venue")}
              className={`p-3 rounded-lg transition-colors ${
                activeLeftTab === "venue"
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              title='Venue'>
              <MapPin className='w-6 h-6' />
            </button>
            <div className='absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap'>
              Venue
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className='flex-1 overflow-hidden'>
          {activeLeftTab === "calendar" ? (
            <CalendarView
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              venues={venues}
              events={events}
              onCellClick={handleCellClick}
              onEventClick={handleEventClick}
              weekDays={weekDays}
            />
          ) : (
            <VenuesView />
          )}
        </div>
      </div>

      {/* Event Sheet */}
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

export default Layout;
